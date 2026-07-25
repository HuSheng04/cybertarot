/* eslint-disable @typescript-eslint/no-require-imports */
/* 美化方案 Z 阶段 · 三断点截图验证 (375/768/1440) */
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

const OUT = 'C:/Temp/claude/visual-beautify';
fs.mkdirSync(OUT, { recursive: true });

const BREAKPOINTS = [
  { name: '375', width: 375, height: 700 },
  { name: '768', width: 768, height: 900 },
  { name: '1440', width: 1440, height: 900 },
];

const PAGES = [
  { name: 'home', path: '/' },
  { name: 'cards', path: '/cards' },
  { name: 'about', path: '/about' },
];

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: resolveChromium() });

  for (const bp of BREAKPOINTS) {
    const context = await browser.newContext({
      viewport: { width: bp.width, height: bp.height },
      deviceScaleFactor: 1,
    });
    for (const pg of PAGES) {
      const page = await context.newPage();
      await page.goto(`http://localhost:3103${pg.path}`, { waitUntil: 'networkidle' });
      // 跳过开场动画: 标记已访问
      await page.evaluate(() => localStorage.setItem('cybertarot_visited', 'true'));
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForTimeout(1200);

      // 横向滚动检测
      const overflowX = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      console.log(`[${bp.name}/${pg.name}] 横向溢出: ${overflowX}px ${overflowX > 1 ? '❌' : '✓'}`);

      await page.screenshot({ path: `${OUT}/${bp.name}-${pg.name}.png`, fullPage: false });
      await page.close();
    }
    await context.close();
  }

  // Demo 流程: 洗牌仪式 + 解读区 (1440)
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto('http://localhost:3103/?demo', { waitUntil: 'networkidle' });
  console.log('[demo] 等待洗牌仪式阶段…');
  await page.waitForTimeout(9000); // demo 流程推进到 shuffling 附近
  await page.screenshot({ path: `${OUT}/demo-shuffle.png` });
  await page.waitForTimeout(8000);
  await page.screenshot({ path: `${OUT}/demo-reading.png` });
  await page.close();
  await ctx.close();

  await browser.close();
  console.log(`\n截图输出: ${OUT}`);
})();
