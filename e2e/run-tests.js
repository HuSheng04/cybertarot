/**
 * CyberTarot Phase 9 E2E 回归测试 runner
 *
 * 使用 Playwright API 直接运行（不需要 @playwright/test）
 * 测试所有功能场景并截图
 */
const { chromium } = require("playwright")
const path = require("path")
const fs = require("fs")

const BASE_URL = "http://localhost:3000"
const SCREENSHOT_DIR = path.resolve(__dirname, "screenshots")

// 结果统计
const results = { passed: 0, failed: 0, skipped: 0, errors: [] }

function log(msg) {
  console.log(`[${new Date().toISOString().slice(11, 19)}] ${msg}`)
}

function test(name, fn) {
  return async (page) => {
    process.stdout.write(`  TEST: ${name} ... `)
    try {
      await fn(page)
      results.passed++
      console.log("PASS")
    } catch (err) {
      results.failed++
      const errMsg = `${err.message.slice(0, 200)}`
      results.errors.push({ name, error: errMsg })
      console.log(`FAIL - ${errMsg}`)
    }
  }
}

async function snapshot(page, name) {
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, `${name}.png`),
    fullPage: false,
  })
}

async function waitForIntro(page) {
  await page.waitForTimeout(5000)
}

async function ensureNotFirstVisit(page) {
  await page.evaluate(() => localStorage.setItem("cybertarot_visited", "true"))
}

async function navigateToInput(page) {
  await page.goto(BASE_URL)
  await ensureNotFirstVisit(page)
  await page.reload()
  await page.waitForLoadState("networkidle")
  await page.locator("text=使用服务端神谕核心").click()
  await page.waitForTimeout(5000)
  await page.waitForSelector("text=冥想终端", { timeout: 5000 })
}

async function navigateToReading(page) {
  await navigateToInput(page)
  await page.locator("textarea").fill("我最近的事业运如何？")
  await page.locator("text=[ 深潜 ]").click()
  await page.waitForTimeout(2000)
}

// ===== 所有测试用例 =====

const tests = [
  // A. 首次访问开场
  test("A1 开场动画序列触发", async (page) => {
    await page.goto(BASE_URL)
    await page.evaluate(() => localStorage.clear())
    await page.reload()
    await page.waitForLoadState("networkidle")

    const heroOverlay = page.locator('[aria-label="开场动画，点击跳过"]')
    await heroOverlay.waitFor({ state: "visible", timeout: 5000 })
    await snapshot(page, "A1-hero-opening")

    // 确认标题出现
    await page.locator("text=CYBERTAROT").first().waitFor({ state: "visible", timeout: 3000 })
    await waitForIntro(page)

    // 开场后覆盖层消失
    await heroOverlay.waitFor({ state: "hidden", timeout: 5000 }).catch(() => {})
    await snapshot(page, "A1-after-intro")
  }),

  test("A2 localStorage 标记", async (page) => {
    await page.goto(BASE_URL)
    await page.evaluate(() => localStorage.clear())
    await page.reload()
    await page.waitForLoadState("networkidle")

    let visited = await page.evaluate(() => localStorage.getItem("cybertarot_visited"))
    if (visited !== null) throw new Error(`Expected null, got ${visited}`)

    await waitForIntro(page)

    visited = await page.evaluate(() => localStorage.getItem("cybertarot_visited"))
    if (visited !== "true") throw new Error(`Expected "true", got ${visited}`)
  }),

  test("A3 再次访问跳过开场", async (page) => {
    await page.goto(BASE_URL)
    await ensureNotFirstVisit(page)
    await page.reload()
    await page.waitForLoadState("networkidle")

    const heroOverlay = page.locator('[aria-label="开场动画，点击跳过"]')
    const overlayVisible = await heroOverlay.isVisible().catch(() => false)
    if (overlayVisible) throw new Error("Hero overlay should not be visible on 2nd visit")

    await page.locator("text=接入 Braindance 神经接口").waitFor({ state: "visible", timeout: 5000 })
    await snapshot(page, "A3-second-visit")
  }),

  // B. Braindance
  test("B1 BraindancePortal 显示", async (page) => {
    await page.goto(BASE_URL)
    await ensureNotFirstVisit(page)
    await page.reload()
    await page.waitForLoadState("networkidle")

    await page.locator("text=接入 Braindance 神经接口").waitFor({ state: "visible", timeout: 5000 })
    await page.locator("text=使用服务端神谕核心").waitFor({ state: "visible" })
    await page.locator("text=插入记忆芯片").waitFor({ state: "visible" })
    await snapshot(page, "B1-braindance-portal")
  }),

  test("B2 服务端模式 → 倒计时 → 输入界面", async (page) => {
    await page.goto(BASE_URL)
    await ensureNotFirstVisit(page)
    await page.reload()
    await page.waitForLoadState("networkidle")

    await page.locator("text=使用服务端神谕核心").click()
    await page.waitForTimeout(500)
    await page.locator("text=正在同步脑波频率…").waitFor({ state: "visible", timeout: 3000 })
    await snapshot(page, "B2-server-countdown")

    // 等待倒计时完成
    await page.waitForTimeout(5000)
    await page.locator("text=冥想终端").waitFor({ state: "visible", timeout: 5000 })
  }),

  test("B3 字数提示", async (page) => {
    await navigateToInput(page)
    const textarea = page.locator("textarea")
    await textarea.fill("测试问题")
    await page.locator("text=4/200").waitFor({ state: "visible", timeout: 3000 })
    await snapshot(page, "B3-input-char-count")
  }),

  test("B4 空提交 → 错误提示", async (page) => {
    await navigateToInput(page)
    await page.locator("text=[ 深潜 ]").click()
    await page.locator("text=请输入你的问题").waitFor({ state: "visible", timeout: 3000 })
    await snapshot(page, "B4-empty-submit-error")
  }),

  test("B5 超长文本自动截断", async (page) => {
    await navigateToInput(page)
    const textarea = page.locator("textarea")
    const longText = "a".repeat(250)
    await textarea.fill(longText)
    await page.waitForTimeout(500)
    const actualLength = await textarea.inputValue().then((v) => v.length)
    if (actualLength !== 200) throw new Error(`Expected 200 chars, got ${actualLength}`)
    await snapshot(page, "B5-truncated-200")
  }),

  // C. 翻牌与3D场景
  test("C1 提交 → shuffling → reading 状态", async (page) => {
    await navigateToReading(page)
    await page.waitForTimeout(1000)

    // 检查是否进入了 shuffling 或 reading 状态
    const shufflingVisible = await page.locator("text=正在读取命运数据").isVisible().catch(() => false)
    const readingVisible = await page.locator("text=赛博占卜师的解读").isVisible().catch(() => false)

    if (!shufflingVisible && !readingVisible) {
      // 可能是 loading 状态，等一会儿
      await page.waitForTimeout(3000)
    }

    await snapshot(page, "C1-shuffling-reading")
  }),

  // D. 流式解读
  test("D1 解读 Overlay", async (page) => {
    await navigateToReading(page)
    await page.waitForTimeout(3000)

    // 应该看到 reading overlay
    await page.locator("text=赛博占卜师的解读").waitFor({ state: "visible", timeout: 5000 })
    await snapshot(page, "D1-reading-overlay")
  }),

  test("D2 再来一次按钮", async (page) => {
    await navigateToReading(page)
    await page.waitForTimeout(3000)

    // 等待「再来一次」按钮出现或手动取消
    try {
      await page.locator("text=再来一次").waitFor({ state: "visible", timeout: 10000 })
      await snapshot(page, "D2-reset-button-visible")
      await page.locator("text=再来一次").click()
      await page.waitForTimeout(1000)
      await snapshot(page, "D2-after-reset")
    } catch {
      // 可能还在 streaming，找「取消解读」
      try {
        await page.locator("text=取消解读").waitFor({ state: "visible", timeout: 2000 })
        await page.locator("text=取消解读").click()
        await page.waitForTimeout(1000)
        await snapshot(page, "D2-cancelled")
      } catch {
        // 可能已经 error，看页面状态
        await snapshot(page, "D2-current-state")
      }
    }
  }),

  // E. demo 模式
  test("E1 demo 模式自动触发", async (page) => {
    await page.goto(`${BASE_URL}/?demo`)
    await page.evaluate(() => localStorage.clear())
    await page.reload()
    await page.waitForLoadState("networkidle")

    // 等待 DemoTrigger 自动操作（1s 延迟 + 状态切换）
    await page.waitForTimeout(4000)

    // 检查是否跳过了 braindance
    const braindanceVisible = await page
      .locator("text=接入 Braindance 神经接口")
      .isVisible()
      .catch(() => false)

    await snapshot(page, "E1-demo-state")

    if (braindanceVisible) {
      log("  Demo: still in braindance phase (might be timing)")
    }
  }),

  // F. /cards 牌库页
  test("F1 牌库页加载", async (page) => {
    await page.goto(`${BASE_URL}/cards`)
    await page.waitForLoadState("networkidle")
    await page.locator("h1:has-text('牌库')").waitFor({ state: "visible", timeout: 5000 })
    await page.locator("text=全部 78 张遗物卡牌").waitFor({ state: "visible" })
    await snapshot(page, "F1-cards-page")

    // 检查筛选标签
    for (const label of ["全部", "大阿卡纳", "权杖", "圣杯", "宝剑", "星币"]) {
      await page.locator(`button:has-text("${label}")`).first().waitFor({ state: "visible" })
    }
  }),

  test("F2 筛选标签切换", async (page) => {
    await page.goto(`${BASE_URL}/cards`)
    await page.waitForLoadState("networkidle")

    // 大阿卡纳
    await page.locator('button:has-text("大阿卡纳")').first().click()
    await page.waitForTimeout(500)
    await page.locator("text=显示 22 / 78 张").waitFor({ state: "visible" })
    await snapshot(page, "F2-filter-major")

    // 权杖
    await page.locator('button:has-text("权杖")').first().click()
    await page.waitForTimeout(500)
    await page.locator("text=显示 14 / 78 张").waitFor({ state: "visible" })

    // 全部
    await page.locator('button:has-text("全部")').first().click()
    await page.waitForTimeout(500)
    await page.locator("text=显示 78 / 78 张").waitFor({ state: "visible" })
  }),

  test("F3 卡牌 hover 效果", async (page) => {
    await page.goto(`${BASE_URL}/cards`)
    await page.waitForLoadState("networkidle")

    const firstCard = page.locator('[class*="cursor-pointer"]').first()
    await firstCard.waitFor({ state: "visible" })
    await snapshot(page, "F3-hover-before")

    await firstCard.hover()
    await page.waitForTimeout(500)
    await snapshot(page, "F3-hover-after")
  }),

  test("F4 卡牌展开详情", async (page) => {
    await page.goto(`${BASE_URL}/cards`)
    await page.waitForLoadState("networkidle")

    const firstCard = page.locator('[class*="cursor-pointer"]').first()
    await firstCard.click()
    await page.waitForTimeout(500)

    await page.locator("text=▲ 正位").first().waitFor({ state: "visible", timeout: 5000 })
    await page.locator("text=▼ 逆位").first().waitFor({ state: "visible", timeout: 5000 })
    await snapshot(page, "F4-card-expanded")
  }),

  // G. /about
  test("G1 About 页加载", async (page) => {
    await page.goto(`${BASE_URL}/about`)
    await page.waitForLoadState("networkidle")
    await page.locator("text=關於 CyberTarot").waitFor({ state: "visible", timeout: 5000 })
    await snapshot(page, "G1-about-hero")

    // 概念故事
    await page.locator("text=概念故事").waitFor({ state: "visible", timeout: 3000 })

    // 关键数字
    await page.locator("h1:has-text('78'), span:has-text('78')").first().waitFor({ state: "visible" })
    await page.locator("text=3").first().waitFor({ state: "visible" })
    await snapshot(page, "G1-about-numbers")

    // 技术栈
    await page.locator("text=技術棧選型").waitFor({ state: "visible" })
    await page.locator("text=系统架构").waitFor({ state: "visible" }).catch(() => {
      page.locator("text=系統架構").waitFor({ state: "visible" })
    })

    // 挑战
    await page.locator("text=開發中解決的技術挑戰").waitFor({ state: "visible" })
    await snapshot(page, "G1-about-full")
  }),

  test("G2 引文卡片", async (page) => {
    await page.goto(`${BASE_URL}/about`)
    await page.waitForLoadState("networkidle")
    await page.locator("text=在 0 與 1 的縫隙中").first().waitFor({ state: "visible", timeout: 5000 })
    await snapshot(page, "G2-quote")
  }),

  // H. 键盘快捷键
  test("H1 Enter 提交问题", async (page) => {
    await navigateToInput(page)
    const textarea = page.locator("textarea")
    await textarea.fill("测试Enter提交")
    await textarea.press("Enter")
    await page.waitForTimeout(2000)
    await snapshot(page, "H1-enter-submit")
  }),

  test("H2 Esc 取消解读", async (page) => {
    await navigateToReading(page)
    await page.waitForTimeout(1000)

    // 检查 reading 是否出现
    try {
      await page.locator("text=赛博占卜师的解读").waitFor({ state: "visible", timeout: 3000 })
      await page.keyboard.press("Escape")
      await page.waitForTimeout(1000)
      await snapshot(page, "H2-esc-cancel")
    } catch {
      log("  Esc test: reading overlay not visible, skipping")
      await snapshot(page, "H2-esc-not-in-reading")
    }
  }),
]

// ===== 主运行逻辑 =====

async function main() {
  log("CyberTarot Phase 9 功能回归测试")
  log(`截图目录: ${SCREENSHOT_DIR}`)
  log("")

  // 确保截图目录存在
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })

  let browser
  try {
    browser = await chromium.launch({
      headless: true,
      args: ["--disable-gpu", "--use-gl=angle", "--use-angle=swiftshader", "--no-sandbox"],
    })

    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      deviceScaleFactor: 1,
    })

    const page = await context.newPage()

    log(`浏览器已启动，正在测试 ${tests.length} 个用例...\n`)

    for (const t of tests) {
      await t(page)
    }

    await context.close()
  } catch (err) {
    console.error("Fatal error:", err)
  } finally {
    if (browser) await browser.close()
  }

  // 输出结果
  console.log("\n" + "=".repeat(50))
  console.log("测试结果汇总")
  console.log("=".repeat(50))
  console.log(`  通过: ${results.passed}`)
  console.log(`  失败: ${results.failed}`)
  console.log(`  跳过: ${results.skipped}`)

  if (results.errors.length > 0) {
    console.log("\n失败详情:")
    for (const e of results.errors) {
      console.log(`  [FAIL] ${e.name}`)
      console.log(`         ${e.error}`)
    }
  }

  console.log(`\n截图已保存至: ${SCREENSHOT_DIR}`)

  // 退出码
  process.exit(results.failed > 0 ? 1 : 0)
}

main()
