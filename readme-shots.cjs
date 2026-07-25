/* eslint-disable @typescript-eslint/no-require-imports */
/* README 用功能截图: 桌面 1440 + 移动 375，覆盖主要功能页 */
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

const OUT = 'C:/Temp/claude/readme-shots';
fs.mkdirSync(OUT, { recursive: true });
const BASE = 'http://localhost:3103';

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: resolveChromium() });

  /* ---- 桌面 1440: 首页 Hero / 牌库 / 关于 ---- */
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.setItem('cybertarot_visited', 'true'));
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${OUT}/01-hero.png` });

  await page.goto(`${BASE}/cards`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${OUT}/04-cards.png` });

  await page.goto(`${BASE}/about`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.evaluate(async () => {
    const h = document.body.scrollHeight;
    for (let y = 0; y <= h; y += 350) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 100));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/05-about.png` });
  await page.close();
  await ctx.close();

  /* ---- demo 流程: 揭示瞬间 + 解读区（桌面 1440） ---- */
  const ctx2 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p2 = await ctx2.newPage();
  const t0 = Date.now();
  await p2.goto(`${BASE}/?demo`, { waitUntil: 'domcontentloaded' });
  await p2.evaluate(() => localStorage.setItem('cybertarot_visited', 'true'));
  // ~提交后 3.2s: 扫描溶解揭示中(上一局实测提交约在 goto 后 3.5-4s)
  await p2.waitForTimeout(Math.max(0, 7200 - (Date.now() - t0)));
  await p2.screenshot({ path: `${OUT}/02-reveal.png` });
  await p2.waitForTimeout(6000);
  await p2.screenshot({ path: `${OUT}/03-reading.png` });
  await p2.close();
  await ctx2.close();

  /* ---- 移动 375: 解读页(响应式相机+紧凑Sheet) ---- */
  const ctx3 = await browser.newContext({
    viewport: { width: 375, height: 667 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const p3 = await ctx3.newPage();
  await p3.goto(`${BASE}/?demo`, { waitUntil: 'networkidle' });
  await p3.evaluate(() => localStorage.setItem('cybertarot_visited', 'true'));
  await p3.waitForTimeout(14000);
  await p3.screenshot({ path: `${OUT}/06-mobile-reading.png` });
  await p3.close();
  await ctx3.close();

  await browser.close();
  console.log('shots done');
})();
