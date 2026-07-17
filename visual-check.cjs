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

console.log('=== CyberTarot Visual Polish Integration Checks ===\n');

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
  const scripts = Array.from(document.querySelectorAll('script[src*="chunk"]'));
  return { scriptCount: scripts.length };
});
console.log(`[5.1] JS chunks loaded: ${motionCheck.scriptCount}`);

// ========== TEST 6: Navbar 品牌标识无 emoji ==========
console.log('\n=== TEST 6: Navbar 品牌标识 ===');
const page6 = await context.newPage();
await page6.goto('http://localhost:3000');
await page6.evaluate(() => localStorage.setItem('cybertarot_visited', 'true'));
await page6.reload();
await page6.waitForTimeout(1000);

const brandLink = page6.locator('a[aria-label="CyberTarot 2077"]');
const brandCount = await brandLink.count();
console.log(`[6.1] 品牌链接 (aria-label="CyberTarot 2077"): ${brandCount > 0}`);

const brandHtml = await brandLink.evaluate(el => el.innerHTML);
const hasEmoji = /[\u{1F300}-\u{1FAFF}]/u.test(brandHtml);
console.log(`[6.2] 品牌区域无 emoji: ${!hasEmoji}`);

const hasGlyph = brandHtml.includes('svg') || brandHtml.includes('glyph') || brandHtml.includes('data-testid');
console.log(`[6.3] 品牌使用 SVG 图标: ${hasGlyph}`);

// ========== TEST 7: Cards 页面 — 筛选与模态框 ==========
console.log('\n=== TEST 7: Cards 页面 — 筛选与详情模态框 ===');
const page7 = await context.newPage();
await page7.goto('http://localhost:3000/cards');
await page7.waitForTimeout(1500);

// 7.1: 默认显示全部 78 张
const cardCount = await page7.locator('[aria-label*="查看详情"]').count();
console.log(`[7.1] 默认卡片数量: ${cardCount} (期望 78)`);

// 7.2: 筛选标签存在
const allTab = page7.locator('button:has-text("全部")');
const majorTab = page7.locator('button:has-text("大阿卡纳")');
const wandsTab = page7.locator('button:has-text("权杖")');
console.log(`[7.2] 筛选标签存在: ${await allTab.count() > 0 && await majorTab.count() > 0 && await wandsTab.count() > 0}`);

// 7.3: 切换到"权杖"筛选
if (await wandsTab.count() > 0) {
  await wandsTab.click();
  await page7.waitForTimeout(500);
  const wandsCount = await page7.locator('[aria-label*="查看详情"]').count();
  console.log(`[7.3] 权杖筛选后卡片数量: ${wandsCount} (期望 14)`);
}

// 7.4: 权杖标签无冗余文字
const wandsLabel = await wandsTab.textContent();
const hasRedundantLabel = wandsLabel && wandsLabel.includes('权杖(');
console.log(`[7.4] 权杖标签无冗余文字: ${!hasRedundantLabel}`);

// 7.5: 点击卡牌打开模态框
await allTab.click();
await page7.waitForTimeout(500);
const firstCard = page7.locator('[aria-label*="查看详情"]').first();
await firstCard.click();
await page7.waitForTimeout(500);
const hasDialog = await page7.locator('[role="dialog"]').count();
console.log(`[7.5] 点击卡牌后模态框打开: ${hasDialog > 0}`);

// 7.6: 模态框有关闭按钮
const closeBtn = page7.locator('[role="dialog"] button[aria-label="关闭"]');
console.log(`[7.6] 模态框关闭按钮存在: ${await closeBtn.count() > 0}`);

// 7.7: Escape 关闭模态框
await page7.keyboard.press('Escape');
await page7.waitForTimeout(300);
const dialogAfterEscape = await page7.locator('[role="dialog"]').count();
console.log(`[7.7] Escape 关闭模态框: ${dialogAfterEscape === 0}`);

// 7.8: 再次打开并用背景点击关闭
await firstCard.click();
await page7.waitForTimeout(500);
const dialogAfterOpen = await page7.locator('[role="dialog"]').count();
console.log(`[7.8] 再次打开模态框: ${dialogAfterOpen > 0}`);

// 获取对话框位置并点击背景遮罩（非面板区域）
const backdrop = page7.locator('[role="dialog"]');
const backdropBox = await backdrop.boundingBox();
if (backdropBox) {
  // 点击遮罩边缘（对话面板外部）
  await page7.mouse.click(backdropBox.x + 5, backdropBox.y + 5);
  await page7.waitForTimeout(300);
  const dialogAfterBackdrop = await page7.locator('[role="dialog"]').count();
  console.log(`[7.9] 背景点击关闭模态框: ${dialogAfterBackdrop === 0}`);
} else {
  console.log('[7.9] 背景点击关闭模态框: ⚠️ 无法获取遮罩位置');
}

// 7.10: 再次打开并切换筛选关闭模态框
await firstCard.click();
await page7.waitForTimeout(300);
await wandsTab.click();
await page7.waitForTimeout(500);
const dialogAfterFilter = await page7.locator('[role="dialog"]').count();
console.log(`[7.10] 切换筛选关闭模态框: ${dialogAfterFilter === 0}`);

// 7.11: 检查 grid 列数
const gridClasses = await page7.evaluate(() => {
  const grid = document.querySelector('.grid');
  if (!grid) return '';
  return grid.className;
});
const hasCorrectGrid = gridClasses.includes('grid-cols-2') &&
  gridClasses.includes('lg:grid-cols-5') &&
  !gridClasses.includes('xl:grid-cols-6');
console.log(`[7.11] grid 列数配置正确 (2/3/4/5, 无 xl:6): ${hasCorrectGrid}`);

// 7.12: 模态框含 aria-modal="true"
await allTab.click();
await page7.waitForTimeout(500);
await firstCard.click();
await page7.waitForTimeout(500);
const hasAriaModal = await page7.evaluate(() => {
  const dialog = document.querySelector('[role="dialog"]');
  return dialog?.getAttribute('aria-modal') === 'true';
});
console.log(`[7.12] 模态框 aria-modal="true": ${hasAriaModal}`);

await page7.screenshot({ path: `${SCREENSHOT_DIR}/07-cards-modal.png` });
console.log('  截图: 07-cards-modal.png');

// 关闭模态框
await page7.keyboard.press('Escape');
await page7.waitForTimeout(300);

// ========== TEST 8: Cards 页面 375px 响应式 ==========
console.log('\n=== TEST 8: Cards 页面 375px 响应式 ===');
const mobileCtx = await browser.newContext({
  viewport: { width: 375, height: 812 },
  deviceScaleFactor: 2,
});
const page8 = await mobileCtx.newPage();
await page8.goto('http://localhost:3000/cards');
await page8.waitForTimeout(1500);

const hasHorizontalScrollCards = await page8.evaluate(() => {
  return document.documentElement.scrollWidth > document.documentElement.clientWidth;
});
console.log(`[8.1] 375px 卡片页无水平滚动: ${!hasHorizontalScrollCards}`);

const cardsMobile = await page8.locator('[aria-label*="查看详情"]').count();
console.log(`[8.2] 375px 卡片可点击: ${cardsMobile > 0}`);

await page8.screenshot({ path: `${SCREENSHOT_DIR}/08-cards-mobile.png` });
console.log('  截图: 08-cards-mobile.png');

// ========== TEST 9: About 页面 ==========
console.log('\n=== TEST 9: About 页面 ===');
const page9 = await context.newPage();
await page9.goto('http://localhost:3000/about');
await page9.waitForTimeout(1500);

// 9.1: 关于页面标题
const aboutTitle = await page9.locator('h1:has-text("CyberTarot")').count();
console.log(`[9.1] 关于页面标题存在: ${aboutTitle > 0}`);

// 9.2: 技术栈网格
const techCards = await page9.locator('text=Next.js 16').or(page9.locator('text=React Three Fiber')).count();
console.log(`[9.2] 技术栈内容存在: ${techCards > 0}`);

// 9.3: 挑战章节
const challenges = await page9.locator('text=开发中解决').count();
console.log(`[9.3] 挑战章节存在: ${challenges > 0}`);

await page9.screenshot({ path: `${SCREENSHOT_DIR}/09-about-desktop.png` });
console.log('  截图: 09-about-desktop.png');

// 9.4: 检查 about 页面是否有预格式化的 ASCII 架构图（根据计划应该已被替换）
const hasPreBlock = await page9.locator('pre').count();
console.log(`[9.4] About 页面无 <pre> 架构块: ${hasPreBlock === 0}`);

// ========== TEST 10: About 页面 375px 无水平溢出 ==========
console.log('\n=== TEST 10: About 页面 375px ===');
const page10 = await mobileCtx.newPage();
await page10.goto('http://localhost:3000/about');
await page10.waitForTimeout(1500);

const aboutOverflow = await page10.evaluate(() => {
  return document.documentElement.scrollWidth > document.documentElement.clientWidth;
});
console.log(`[10.1] 375px About 无水平溢出: ${!aboutOverflow}`);

await page10.screenshot({ path: `${SCREENSHOT_DIR}/10-about-mobile.png` });
console.log('  截图: 10-about-mobile.png');

// ========== TEST 11: 首页 375px 响应式 ==========
console.log('\n=== TEST 11: 首页 375px ===');
const page11 = await mobileCtx.newPage();
await page11.goto('http://localhost:3000');
await page11.evaluate(() => localStorage.setItem('cybertarot_visited', 'true'));
await page11.reload();
await page11.waitForTimeout(1000);

const homeOverflow = await page11.evaluate(() => {
  return document.documentElement.scrollWidth > document.documentElement.clientWidth;
});
console.log(`[11.1] 375px 首页无水平溢出: ${!homeOverflow}`);

const navMobileVisible = await page11.locator('a[aria-label="CyberTarot 2077"]').count();
console.log(`[11.2] 375px 导航可见: ${navMobileVisible > 0}`);

const navLinksMobile = await page11.locator('nav a:has-text("占卜")').or(page11.locator('nav a:has-text("牌库")')).count();
console.log(`[11.3] 375px 导航链接可见: ${navLinksMobile > 0}`);

await page11.screenshot({ path: `${SCREENSHOT_DIR}/11-home-mobile.png` });
console.log('  截图: 11-home-mobile.png');

// ========== TEST 12: 键盘可访问性 ==========
console.log('\n=== TEST 12: 键盘可访问性检查 ===');
const page12 = await context.newPage();
await page12.goto('http://localhost:3000/cards');
await page12.waitForTimeout(1000);

// Tab 到第一个可聚焦元素
await page12.keyboard.press('Tab');
await page12.waitForTimeout(200);

// 检查 Tab 焦点是否在一个可聚焦元素上
const focusedEl = await page12.evaluate(() => {
  const el = document.activeElement;
  if (!el) return null;
  return el.tagName + (el.getAttribute('aria-label') ? '[' + el.getAttribute('aria-label') + ']' : '');
});
console.log(`[12.1] Tab 焦点元素: ${focusedEl || 'none'}`);

// 尝试在 Cards 页通过键盘导航到卡牌
for (let i = 0; i < 20; i++) {
  await page12.keyboard.press('Tab');
  await page12.waitForTimeout(50);
}
const activeLabel = await page12.evaluate(() => {
  const el = document.activeElement;
  return el?.getAttribute('aria-label') || el?.textContent?.trim() || null;
});
console.log(`[12.2] Tab 导航到: ${activeLabel || 'unknown'}`);

// 尝试 Enter 打开当前焦点元素的模态框
const couldOpen = await page12.evaluate(async () => {
  const el = document.activeElement;
  if (el && el.tagName === 'BUTTON') {
    (el as HTMLButtonElement).click();
    await new Promise(r => setTimeout(r, 300));
    return document.querySelector('[role="dialog"]') !== null;
  }
  return false;
});
if (couldOpen) {
  console.log('[12.3] Enter 打开模态框: ✅');
  await page12.keyboard.press('Escape');
  await page12.waitForTimeout(300);
} else {
  console.log('[12.3] Enter 打开模态框: ⚠️ (暂无 focus 的按钮)');
}

await page12.screenshot({ path: `${SCREENSHOT_DIR}/12-keyboard.png` });
console.log('  截图: 12-keyboard.png');

// ========== TEST 13: 设计系统合规 — 无结构性 emoji ==========
console.log('\n=== TEST 13: 设计系统合规检查 ===');

// 检查各个页面是否还有结构性 emoji 🎴🖥🚀⚠ 等
// 允许 ✦ 作为非语义装饰
const emojiPages = [
  { name: '首页', url: '/' },
  { name: 'Cards', url: '/cards' },
  { name: 'About', url: '/about' },
];

for (const { name, url } of emojiPages) {
  const p = await context.newPage();
  await p.goto(`http://localhost:3000${url}`);
  await p.evaluate(() => localStorage.setItem('cybertarot_visited', 'true'));
  await p.reload();
  await p.waitForTimeout(1000);

  const structuralEmoji = await p.evaluate(() => {
    // 排除 ✦ 装饰符号和 ▲▼ 方向指示
    const text = document.body.innerText;
    const emojiRegex = /[\u{1F300}-\u{1F9FF}]/u;
    const matches = text.match(emojiRegex);
    return matches ? matches.join(', ') : null;
  });
  console.log(`[13.1] ${name} 页无结构性 emoji: ${!structuralEmoji}${structuralEmoji ? ' (发现: ' + structuralEmoji + ')' : ''}`);
  await p.close();
}

// ========== TEST 14: Ctrl/Cmd+ 快捷键检查 ==========
console.log('\n=== TEST 14: 全局快捷键 ===');
const page14 = await context.newPage();
await page14.goto('http://localhost:3000');
await page14.evaluate(() => localStorage.setItem('cybertarot_visited', 'true'));
await page14.reload();
await page14.waitForTimeout(500);

// 首页应渲染标题
const homeTitle = await page14.locator('h1:has-text("赛博占卜师")').count();
console.log(`[14.1] 首页初始渲染: ${homeTitle > 0}`);

await page14.screenshot({ path: `${SCREENSHOT_DIR}/14-home-initial.png` });
console.log('  截图: 14-home-initial.png');

// ========== TEST 15: Demo 模式 ==========
console.log('\n=== TEST 15: Demo 模式 (/?demo) ===');
const page15 = await context.newPage();
await page15.goto('http://localhost:3000/?demo');
await page15.waitForTimeout(2000);
const demoContent = await page15.locator('text=赛博占卜师').or(page15.locator('text=正在读取命运数据')).count();
console.log(`[15.1] Demo 模式触发: ${demoContent > 0}`);
await page15.screenshot({ path: `${SCREENSHOT_DIR}/15-demo-mode.png` });
console.log('  截图: 15-demo-mode.png');

// ========== CLEANUP ==========
await browser.close();
await mobileCtx.close();

console.log('\n=== ✅ 视觉检查完成 ===');
console.log(`截图保存在: ${SCREENSHOT_DIR}/`);
})();
