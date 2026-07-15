/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unused-vars */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SCREENSHOT_DIR = 'C:/Temp/claude/visual-checks';
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

(async () => {
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});

console.log('=== CyberTarot Phase 0-2 视觉检查 ===\n');

// ========== TEST 1: 首次访问 — 开场动画 ==========
console.log('=== TEST 1: 首次访问 Hero 开场动画 ===');
const page1 = await context.newPage();
await page1.goto('http://localhost:3000');
await page1.evaluate(() => localStorage.removeItem('cybertarot_visited'));
await page1.reload();
await page1.waitForTimeout(500);

const hasHeroOpening = await page1.locator('[aria-label="开场动画，点击跳过"]').count();
console.log(`[1.1] HeroOpening 组件存在: ${hasHeroOpening > 0}`);

const hasTitle = await page1.locator('text=CYBERTAROT').count();
console.log(`[1.2] CYBERTAROT 标题存在: ${hasTitle > 0}`);

const hasSkipTip = await page1.locator('text=点击任意处跳过').count();
console.log(`[1.3] 跳过提示存在: ${hasSkipTip > 0}`);

await page1.screenshot({ path: `${SCREENSHOT_DIR}/01-hero-init.png` });
console.log('  截图: 01-hero-init.png');

await page1.waitForTimeout(2000);
await page1.screenshot({ path: `${SCREENSHOT_DIR}/02-hero-title-subtitle.png` });
console.log('  截图: 02-hero-title-subtitle.png (标题+副标题阶段)');

await page1.waitForTimeout(2000);
await page1.screenshot({ path: `${SCREENSHOT_DIR}/03-hero-intro-complete.png` });
console.log('  截图: 03-hero-intro-complete.png');

const hasBraindance = await page1.locator('button, [role="button"]').filter({ hasText: /服务端|记忆芯片|接入/ }).count();
console.log(`[1.4] 开场后 Braindance 可交互: ${hasBraindance > 0}`);

// ========== TEST 2: 点击跳过 ==========
console.log('\n=== TEST 2: 点击跳过开场 ===');
const page2 = await context.newPage();
await page2.goto('http://localhost:3000');
await page2.evaluate(() => localStorage.removeItem('cybertarot_visited'));
await page2.reload();
await page2.waitForTimeout(800);
const heroEl = page2.locator('[aria-label="开场动画，点击跳过"]');
if (await heroEl.count() > 0) await heroEl.click();
await page2.waitForTimeout(500);
const mainContent = await page2.locator('h1:has-text("赛博占卜师")').or(page2.locator('text=接入脑波同步')).count();
console.log(`[2.1] 跳过后主内容出现: ${mainContent > 0}`);
await page2.screenshot({ path: `${SCREENSHOT_DIR}/04-skip-to-braindance.png` });
console.log('  截图: 04-skip-to-braindance.png');

// ========== TEST 3: 第二次访问 ==========
console.log('\n=== TEST 3: 第二次访问 ===');
const page3 = await context.newPage();
await page3.goto('http://localhost:3000');
await page3.evaluate(() => localStorage.setItem('cybertarot_visited', 'true'));
await page3.reload();
await page3.waitForTimeout(1000);
const hasHeroSecond = await page3.locator('[aria-label="开场动画，点击跳过"]').count();
console.log(`[3.1] 第二次访问 HeroOpening 不渲染: ${hasHeroSecond === 0}`);
await page3.screenshot({ path: `${SCREENSHOT_DIR}/05-second-visit.png` });
console.log('  截图: 05-second-visit.png');

// ========== TEST 4: 全局 CSS ==========
console.log('\n=== TEST 4: 全局 CSS 装饰 ===');
const page4 = await context.newPage();
await page4.goto('http://localhost:3000');
await page4.waitForTimeout(500);

const bodyIntro = await page4.evaluate(() => document.body.classList.contains('intro-mode'));
console.log(`[4.1] intro-mode body class: ${bodyIntro}`);

await page4.screenshot({ path: `${SCREENSHOT_DIR}/06-main-page-full.png` });
console.log('  截图: 06-main-page-full.png');

// Check CSS keyframes via injected style check
const cssFeatures = await page4.evaluate(() => {
  // Check for keyframe animations by searching all stylesheets
  const sheets = Array.from(document.styleSheets);
  const allRules = [];
  for (const s of sheets) {
    try {
      const rules = Array.from(s.cssRules || []);
      for (const r of rules) allRules.push(r.cssText);
    } catch(e) {}
  }
  const text = allRules.join(' ');

  return {
    hasScanLine: text.includes('scan-line'),
    hasGlitch: text.includes('glitch-slice'),
    hasHudCorner: text.includes('hud-corner'),
    hasHolographicDivider: text.includes('holographic-divider'),
    hasReducedMotion: text.includes('prefers-reduced-motion'),
    hasPulseNeon: text.includes('pulse-neon'),
    hasTextGlowCyan: text.includes('text-glow-cyan'),
  };
});

for (const [key, val] of Object.entries(cssFeatures)) {
  console.log(`[4.2] ${key}: ${val ? '✅' : '❌'}`);
}

// ========== TEST 5: motion 库状态 ==========
console.log('\n=== TEST 5: motion 库 ===');
const page5 = await context.newPage();
await page5.goto('http://localhost:3000');
await page5.waitForTimeout(500);
const motionCheck = await page5.evaluate(() => {
  // Check if motion/react was loaded by inspecting window/meta
  const scripts = Array.from(document.querySelectorAll('script[src*="chunk"]'));
  return { scriptCount: scripts.length };
});
console.log(`[5.1] JS chunks loaded: ${motionCheck.scriptCount}`);

await browser.close();
console.log('\n=== ✅ 视觉检查完成 ===');
console.log(`截图保存在: ${SCREENSHOT_DIR}/`);
})();
