/* eslint-disable @typescript-eslint/no-require-imports */
/* about 页改版验收: 375/1440 全页截图 + 横向溢出检测 */
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

const OUT = 'C:/Temp/claude/visual-about-v2';
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: resolveChromium() });
  for (const bp of [{ n: '375', w: 375, h: 700 }, { n: '1440', w: 1440, h: 900 }]) {
    const ctx = await browser.newContext({ viewport: { width: bp.w, height: bp.h } });
    const page = await ctx.newPage();
    await page.goto('http://localhost:3103/about', { waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.setItem('cybertarot_visited', 'true'));
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    // 逐步滚动触发 whileInView 动画
    await page.evaluate(async () => {
      const h = document.body.scrollHeight;
      for (let y = 0; y <= h; y += 400) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 120));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(1000);
    const overflowX = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    console.log(`[${bp.n}/about] 横向溢出: ${overflowX}px ${overflowX > 1 ? '❌' : '✓'}`);
    // 分段视口截图(上/中/下)
    const totalH = await page.evaluate(() => document.body.scrollHeight);
    const seg = Math.max(1, Math.ceil(totalH / bp.h));
    for (let s = 0; s < seg; s++) {
      await page.evaluate((y) => window.scrollTo(0, y), s * bp.h);
      await page.waitForTimeout(400);
      await page.screenshot({ path: `${OUT}/${bp.n}-about-seg${s}.png`, fullPage: false });
    }
    await page.close();
    await ctx.close();
  }
  await browser.close();
  console.log('done');
})();
