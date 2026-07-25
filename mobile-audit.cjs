/* eslint-disable @typescript-eslint/no-require-imports */
/* ===== CyberTarot 移动端全面审计 =====
 * 覆盖: 5 机型 × 3 页面 × (溢出/触控目标/字号/遮挡) + demo 流程 + 性能采集
 */
const { chromium } = require('playwright');
const fs = require('fs');

/* 从本机 ms-playwright 目录解析最新 chromium（不写死个人路径） */
function resolveChromium() {
  try {
    const path = require('path');
    const dir = path.join(require('os').homedir(), 'AppData/Local/ms-playwright');
    const hit = fs.readdirSync(dir).filter((d) => d.startsWith('chromium_headless_shell-')).sort().pop();
    if (hit) return path.join(dir, hit, 'chrome-headless-shell-win64/chrome-headless-shell.exe');
  } catch {}
  return undefined;
}

const OUT = 'C:/Temp/claude/mobile-audit';
fs.mkdirSync(OUT, { recursive: true });
const BASE = 'http://localhost:3103';

const DEVICES = [
  { name: 'iphone-se', w: 375, h: 667, dsf: 2, ua: 'iPhone' },
  { name: 'iphone-14pro', w: 393, h: 852, dsf: 3, ua: 'iPhone' },
  { name: 'pixel-7', w: 412, h: 915, dsf: 2.625, ua: 'Android' },
  { name: 'galaxy-s20', w: 360, h: 800, dsf: 3, ua: 'Android' },
  { name: 'ipad-mini', w: 768, h: 1024, dsf: 2, ua: 'iPad' },
];

const PAGES = [
  { name: 'home', path: '/' },
  { name: 'cards', path: '/cards' },
  { name: 'about', path: '/about' },
];

const UA_STR =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: resolveChromium() });

  const report = { layout: [], touch: [], fonts: [], perf: [], demo: [] };

  for (const dev of DEVICES) {
    const context = await browser.newContext({
      viewport: { width: dev.w, height: dev.h },
      deviceScaleFactor: dev.dsf,
      isMobile: true,
      hasTouch: true,
      userAgent: UA_STR,
    });

    for (const pg of PAGES) {
      const page = await context.newPage();
      const t0 = Date.now();
      await page.goto(`${BASE}${pg.path}`, { waitUntil: 'domcontentloaded' });
      await page.evaluate(() => localStorage.setItem('cybertarot_visited', 'true'));
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForTimeout(1200);

      /* ---- 性能采集（仅 iphone-se/pixel-7 代表） ---- */
      if (dev.name === 'iphone-se' || dev.name === 'pixel-7') {
        const perf = await page.evaluate(() => {
          const nav = performance.getEntriesByType('navigation')[0] || {};
          const paints = performance.getEntriesByType('paint');
          const fcp = (paints.find((p) => p.name === 'first-contentful-paint') || {}).startTime;
          const res = performance.getEntriesByType('resource');
          const bytes = res.reduce((s, r) => s + (r.transferSize || 0), 0);
          return {
            dcl: Math.round(nav.domContentLoadedEventEnd || 0),
            load: Math.round(nav.loadEventEnd || 0),
            fcp: Math.round(fcp || 0),
            requests: res.length,
            kb: Math.round(bytes / 1024),
          };
        });
        report.perf.push({ device: dev.name, page: pg.name, ...perf });
      }

      /* ---- 布局: 横向溢出 + 滚动触发后复测 ---- */
      const audit = await page.evaluate(async () => {
        const vw = document.documentElement.clientWidth;
        // 滚动触发懒动画后回到顶部
        const h = document.body.scrollHeight;
        for (let y = 0; y <= h; y += 400) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 60));
        }
        window.scrollTo(0, 0);
        await new Promise((r) => setTimeout(r, 300));

        const overflowX = document.documentElement.scrollWidth - vw;

        /* 触控目标: 所有 a/button/[role=button]/input/textarea */
        const tSel = 'a, button, [role="button"], input, textarea, select, [tabindex]';
        const small = [];
        document.querySelectorAll(tSel).forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) return;
          const cs = getComputedStyle(el);
          if (cs.display === 'none' || cs.visibility === 'hidden') return;
          if (r.width < 40 || r.height < 40) {
            small.push({
              tag: el.tagName.toLowerCase(),
              text: (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 18),
              w: Math.round(r.width),
              h: Math.round(r.height),
            });
          }
        });

        /* 字号: 可见文本元素 < 12px */
        const tinyText = [];
        document.querySelectorAll('p, span, li, a, button, h1, h2, h3, h4, label, div').forEach((el) => {
          const cs = getComputedStyle(el);
          const fs = parseFloat(cs.fontSize);
          if (fs > 0 && fs < 12 && (el.textContent || '').trim().length > 1) {
            const r = el.getBoundingClientRect();
            if (r.width > 0 && r.height > 0 && cs.visibility !== 'hidden') {
              tinyText.push({
                cls: (el.className || '').toString().slice(0, 40),
                text: (el.textContent || '').trim().slice(0, 14),
                fs,
              });
            }
          }
        });

        /* 图片自适应: 任何 img 渲染宽度超过容器 */
        const imgOverflow = [];
        document.querySelectorAll('img').forEach((img) => {
          const r = img.getBoundingClientRect();
          if (r.width > vw + 1) imgOverflow.push({ src: (img.src || '').split('/').pop(), w: Math.round(r.width) });
        });

        /* 固定元素遮挡: navbar 是否与内容重叠导致首屏内容被遮 */
        const fixed = [];
        document.querySelectorAll('*').forEach((el) => {
          const cs = getComputedStyle(el);
          if (cs.position === 'fixed') {
            const r = el.getBoundingClientRect();
            if (r.width > 0) fixed.push({ cls: (el.className || '').toString().slice(0, 50), top: Math.round(r.top), h: Math.round(r.height) });
          }
        });

        return { overflowX, small: small.slice(0, 10), tinyText: tinyText.slice(0, 10), imgOverflow: imgOverflow.slice(0, 5), fixedCount: fixed.length, fixed: fixed.slice(0, 4), pageH: h };
      });

      report.layout.push({ device: dev.name, page: pg.name, overflowX: audit.overflowX, pageH: audit.pageH, fixed: audit.fixed });
      if (audit.small.length) report.touch.push({ device: dev.name, page: pg.name, small: audit.small });
      if (audit.tinyText.length) report.fonts.push({ device: dev.name, page: pg.name, tinyText: audit.tinyText });
      if (audit.imgOverflow.length) report.fonts.push({ device: dev.name, page: pg.name, imgOverflow: audit.imgOverflow });

      // 每个组合一张截图（仅 iphone-se 与 galaxy-s20 全拍，其余只拍首屏 home）
      if (dev.name === 'iphone-se' || dev.name === 'galaxy-s20' || pg.name === 'home') {
        await page.screenshot({ path: `${OUT}/${dev.name}-${pg.name}.png` });
      }
      await page.close();
    }
    await context.close();
    console.log(`[${dev.name}] 完成`);
  }

  /* ---- demo 流程移动端实测（iphone-se 375） ---- */
  const ctx = await browser.newContext({
    viewport: { width: 375, height: 667 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    userAgent: UA_STR,
  });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/?demo`, { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.setItem('cybertarot_visited', 'true'));
  await page.waitForTimeout(14000); // 发牌+揭示 ~5s + 解读流
  // ReadingSheet 紧凑态高度与迷你牌横滑
  const sheetAudit = await page.evaluate(() => {
    const sheet = document.querySelector('[class*="sheet"], [class*="Sheet"]');
    const vh = window.innerHeight;
    const all = document.querySelectorAll('main, [class*="reading"], [class*="Reading"]');
    let sheetInfo = null;
    all.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.height > 0 && r.top < vh && r.bottom > vh * 0.5) {
        sheetInfo = { cls: (el.className || '').toString().slice(0, 60), h: Math.round(r.height), vhRatio: (r.height / vh).toFixed(2) };
      }
    });
    return { sheetInfo, scrollY: window.scrollY };
  });
  await page.screenshot({ path: `${OUT}/demo-reading-375.png` });
  report.demo.push(sheetAudit);
  await page.close();
  await ctx.close();

  await browser.close();
  fs.writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
})();
