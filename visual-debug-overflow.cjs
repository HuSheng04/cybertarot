/* eslint-disable @typescript-eslint/no-require-imports */
/* 375px about 页横向溢出元素定位 */
const { chromium } = require('playwright');

/* 从本机 ms-playwright 目录解析最新 chromium（不写死个人路径） */
function resolveChromium() {
  try {
    const path = require('path');
    const dir = path.join(require('os').homedir(), 'AppData/Local/ms-playwright');
    const hit = require('fs').readdirSync(dir).filter((d) => d.startsWith('chromium_headless_shell-')).sort().pop();
    if (hit) return path.join(dir, hit, 'chrome-headless-shell-win64/chrome-headless-shell.exe');
  } catch {}
  return undefined;
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: resolveChromium() });
  const ctx = await browser.newContext({ viewport: { width: 375, height: 700 } });
  const page = await ctx.newPage();
  await page.goto('http://localhost:3102/about', { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.setItem('cybertarot_visited', 'true'));
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);

  const offenders = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const list = [];
    document.querySelectorAll('*').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.right > vw + 1 || r.left < -1) {
        list.push({
          tag: el.tagName.toLowerCase(),
          cls: (el.className || '').toString().slice(0, 80),
          left: Math.round(r.left),
          right: Math.round(r.right),
          text: (el.textContent || '').trim().slice(0, 40),
        });
      }
    });
    return list.sort((a, b) => b.right - a.right).slice(0, 12);
  });
  console.log(JSON.stringify(offenders, null, 2));
  await browser.close();
})();
