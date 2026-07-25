/* eslint-disable @typescript-eslint/no-require-imports */
/* 发牌→揭示 时序验证: 关键时刻截图
 * demo 模式 ~1s 自动提交 → 仪式 0-2.05s → 揭示 2.05-4.45s → 解读 4.75s
 * 断言: 2.0s 时只能看到牌背/仪式牌; 牌面只能在 2.05s 之后开始出现
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

const OUT = 'C:/Temp/claude/visual-timing';
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: resolveChromium() });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const t0 = Date.now();
  await page.goto('http://localhost:3103/?demo', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => localStorage.setItem('cybertarot_visited', 'true'));

  const shots = [
    { at: 2600, name: 't1-ritual-fly' },      // 提交后 ~1.6s: 飞位阶段, 应只见牌背
    { at: 3200, name: 't2-reveal-start' },    // 提交后 ~2.2s: 揭示刚开始(过去牌扫描中)
    { at: 4400, name: 't3-reveal-mid' },      // 提交后 ~3.4s: 现在牌揭示中
    { at: 6000, name: 't4-reading' },         // 提交后 ~5.0s: 已进入解读
  ];
  for (const s of shots) {
    const wait = s.at - (Date.now() - t0);
    if (wait > 0) await page.waitForTimeout(wait);
    await page.screenshot({ path: `${OUT}/${s.name}.png` });
    console.log(`[${s.name}] captured at +${Date.now() - t0}ms`);
  }
  await browser.close();
})();
