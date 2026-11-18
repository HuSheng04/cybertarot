import { expect, test } from "@playwright/test"
import { CARDS } from "../src/data/cards"

test("直接显示第一张牌，支持按钮与触控板交替翻页", async ({ page }, testInfo) => {
  const apiRequests: string[] = []
  page.on("request", (request) => {
    if (/\/api\/(reading|verify-key)/.test(request.url())) apiRequests.push(request.url())
  })
  await page.goto("/")
  await expect(page.getByRole("heading", { name: "愚人", exact: true })).toBeVisible()
  const position = page.getByRole("status")
  await expect(position).toContainText("1 / 78")
  await expect(page.getByRole("button", { name: /上一张/ })).toBeDisabled()

  await page.getByRole("button", { name: /下一张/ }).click()
  await expect(position).toContainText("2 / 78")
  await expect(page.getByRole("heading", { name: "魔术师", exact: true })).toBeVisible()

  const viewport = page.getByRole("region", { name: "塔罗牌画廊" })
  await expect.poll(() => viewport.evaluate((element) => element.scrollLeft / element.clientWidth)).toBe(1)
  await viewport.hover()
  const width = await viewport.evaluate((element) => element.clientWidth)
  await page.mouse.wheel(width * 0.85, 0)
  await expect.poll(async () => {
    return viewport.evaluate((element) => Math.round(element.scrollLeft / element.clientWidth))
  }).toBeGreaterThan(1)
  await expect.poll(async () => viewport.evaluate((element) => {
    return Math.abs(element.scrollLeft / element.clientWidth - Math.round(element.scrollLeft / element.clientWidth))
  })).toBeLessThan(0.01)
  const index = await viewport.evaluate((element) => Math.round(element.scrollLeft / element.clientWidth))
  await expect(position).toContainText(`${index + 1} / 78`)
  await expect(page.getByRole("heading", { name: CARDS[index].nameZh, exact: true })).toBeVisible()

  await page.getByRole("button", { name: /上一张/ }).click()
  await expect(position).toContainText(`${index} / 78`)
  await expect.poll(() => viewport.evaluate((element) => element.scrollLeft / element.clientWidth)).toBe(index - 1)
  expect(apiRequests).toEqual([])
  await page.screenshot({ path: testInfo.outputPath("gallery.png") })
})

test("78 张牌全部可显示，首尾和窗口尺寸变化正确", async ({ page }) => {
  test.setTimeout(90_000)
  await page.goto("/")
  const viewport = page.getByRole("region", { name: "塔罗牌画廊" })
  await expect(viewport.locator("img")).toHaveCount(CARDS.length)

  for (const [index, card] of CARDS.entries()) {
    await viewport.evaluate((element, target) => {
      element.scrollTo({ left: target * element.clientWidth, behavior: "auto" })
    }, index)
    await expect(page.getByRole("status")).toContainText(`${index + 1} / ${CARDS.length}`)
    await expect(page.getByRole("heading", { name: card.nameZh, exact: true })).toBeVisible()
    const image = page.getByRole("img", { name: `${card.nameZh} / ${card.nameEn}`, exact: true })
    await expect(image).toBeVisible()
    await expect.poll(() => image.evaluate((element: HTMLImageElement) => (
      element.complete && element.naturalWidth > 0
    ))).toBe(true)
  }

  await expect(page.getByRole("button", { name: /下一张/ })).toBeDisabled()
  await page.setViewportSize({ width: 844, height: 390 })
  await expect(page.getByRole("status")).toContainText("78 / 78")
  await expect.poll(() => viewport.evaluate((element) => element.scrollLeft / element.clientWidth)).toBe(77)

  await viewport.focus()
  await page.keyboard.press("Home")
  await expect(page.getByRole("status")).toContainText("1 / 78")
  await expect(page.getByRole("button", { name: /上一张/ })).toBeDisabled()
})

test("小屏完整显示牌面、牌名和翻页按钮", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 })
  await page.goto("/")
  const image = page.getByRole("img", { name: "愚人 / The Fool", exact: true })
  await expect(image).toBeVisible()
  await expect(image).toHaveCSS("object-fit", "contain")
  const artwork = await image.boundingBox()
  const caption = await page.getByRole("heading", { name: "愚人", exact: true }).boundingBox()
  const button = await page.getByRole("button", { name: /下一张/ }).boundingBox()
  expect(artwork!.height).toBeGreaterThan(150)
  expect(artwork!.y + artwork!.height).toBeLessThan(caption!.y)
  expect(button!.y + button!.height).toBeLessThanOrEqual(568)
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320)
  expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBe(568)
})

test("手机原生触摸滑动后吸附居中", async ({ page, context }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "仅验证手机触摸交互")
  await page.goto("/")
  const viewport = page.getByRole("region", { name: "塔罗牌画廊" })
  await expect(page.getByRole("status")).toContainText("1 / 78")
  const box = (await viewport.boundingBox())!
  const y = box.y + box.height / 2
  const session = await context.newCDPSession(page)
  await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 330, y }] })
  for (let x = 310; x >= 50; x -= 20) {
    await session.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y }] })
  }
  await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] })
  await expect(page.getByRole("status")).toContainText("2 / 78")
  await expect.poll(() => viewport.evaluate((element) => element.scrollLeft / element.clientWidth)).toBe(1)
  await session.detach()
})

test("旧入口统一跳转，解读及密钥接口返回 404", async ({ page, request }) => {
  for (const route of ["/cards", "/about"]) {
    await page.goto(route)
    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByRole("heading", { name: "愚人", exact: true })).toBeVisible()
  }
  for (const route of ["/api/reading", "/api/verify-key"]) {
    expect((await request.post(route, { data: {} })).status()).toBe(404)
  }
})
