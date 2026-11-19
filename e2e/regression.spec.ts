import { expect, test } from "@playwright/test"
import type { Locator } from "@playwright/test"
import { CARDS } from "../src/data/cards"

function frontCard(ring: Locator) {
  return ring.locator("[aria-current='true']")
}

async function expectSnapped(ring: Locator) {
  await expect.poll(() => frontCard(ring).evaluate(
    (button) => Number(button.style.getPropertyValue("--ring-x")),
  )).toBe(0)
}

test("触控板横滑吸附，确认后显示对应大图", async ({ page, isMobile }, testInfo) => {
  test.skip(isMobile, "触控板用桌面浏览器验证")
  const apiRequests: string[] = []
  page.on("request", (request) => {
    if (/\/api\/(reading|verify-key)/.test(request.url())) apiRequests.push(request.url())
  })
  await page.goto("/")
  const ring = page.locator(".card-ring")
  const position = page.getByRole("status")
  await expect(frontCard(ring)).toHaveAccessibleName("查看大图：愚人 / The Fool")
  await expect(position).toContainText("1 / 78")
  await ring.hover()
  await page.mouse.wheel(160, 240)
  await expect(position).toContainText("1 / 78")

  await page.mouse.wheel(155, 0)
  await expect(position).toContainText("3 / 78")
  await expectSnapped(ring)
  await expect(frontCard(ring)).toHaveAccessibleName("查看大图：女祭司 / The High Priestess")
  await expect(page.getByRole("heading", { name: "女祭司", exact: true })).toBeVisible()
  await expect(page.locator(".gallery-artwork")).toHaveCount(0)
  await page.screenshot({ path: testInfo.outputPath("gallery-ring.png") })

  await page.getByRole("button", { name: "查看大图", exact: true }).click()
  await expect(page.getByRole("img", { name: "女祭司 / The High Priestess" })).toBeVisible()
  await expect(position).toContainText("3 / 78")

  await page.getByRole("button", { name: /上一张/ }).click()
  await expect(page.getByRole("img", { name: "魔术师 / The Magician" })).toBeVisible()
  await page.keyboard.press("Escape")
  await expect(page.getByRole("button", { name: "查看大图", exact: true })).toBeFocused()
  await expect(frontCard(ring)).toHaveAccessibleName("查看大图：魔术师 / The Magician")
  await expectSnapped(ring)
  expect(apiRequests).toEqual([])
})

test("桌面与手机可连续选中 78 张牌并双向衔接", async ({ page }, testInfo) => {
  test.setTimeout(90_000)
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/")
  const viewport = page.getByRole("region", { name: "塔罗牌画廊" })
  const ring = page.locator(".card-ring")
  const position = page.getByRole("status")
  await expect(ring.locator("img")).toHaveCount(testInfo.project.name === "mobile" ? 5 : 9)
  await viewport.focus()
  await page.keyboard.press("ArrowLeft")
  await expect(position).toContainText("78 / 78")
  await page.keyboard.press("ArrowRight")

  for (const [index, card] of CARDS.entries()) {
    await expect(position).toContainText(new RegExp(`(^|，)${index + 1} / 78$`))
    await expect(frontCard(ring)).toHaveAccessibleName(`查看大图：${card.nameZh} / ${card.nameEn}`)
    const thumbnail = frontCard(ring).locator("img")
    await expect(thumbnail).toHaveAttribute("src", new RegExp(card.id))
    await expect.poll(() => thumbnail.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0)
    await page.keyboard.press("ArrowRight")
  }

  await expect(position).toContainText("1 / 78")
  await page.keyboard.press("ArrowLeft")
  await page.setViewportSize({ width: 844, height: 390 })
  await expect(ring.locator("img")).toHaveCount(9)
  await expect(position).toContainText("78 / 78")
  await expectSnapped(ring)

  const lastCard = CARDS.at(-1)!
  await page.keyboard.press("Enter")
  const image = page.getByRole("img", { name: `${lastCard.nameZh} / ${lastCard.nameEn}`, exact: true })
  await expect.poll(() => image.evaluate((element: HTMLImageElement) => (
    element.complete && element.naturalWidth > 0
  ))).toBe(true)
})

test("点侧牌先转到前方，再点前方牌确认", async ({ page, isMobile }) => {
  await page.goto("/")
  const ring = page.locator(".card-ring")
  const side = ring.getByRole("button", { name: "移到前方：魔术师 / The Magician" })
  if (isMobile) await side.tap()
  else await side.click()
  await expectSnapped(ring)
  await expect(frontCard(ring)).toHaveAccessibleName("查看大图：魔术师 / The Magician")
  await expect(page.getByRole("status")).toContainText("2 / 78")
  if (isMobile) await frontCard(ring).tap()
  else await frontCard(ring).click()
  await expect(page.getByRole("img", { name: "魔术师 / The Magician" })).toBeVisible()

  await page.getByRole("button", { name: "返回牌环" }).click()
  await expect(frontCard(ring)).toHaveAccessibleName("查看大图：魔术师 / The Magician")
})

test("鼠标从牌面拖动多格，松手只吸附", async ({ page, isMobile }) => {
  test.skip(isMobile, "由手机原生触摸用例覆盖")
  await page.goto("/")
  const ring = page.locator(".card-ring")
  const box = (await frontCard(ring).boundingBox())!
  const start = { x: box.x + box.width / 2, y: box.y + box.height / 2 }

  await page.mouse.move(start.x, start.y)
  await page.mouse.down()
  await page.mouse.move(start.x - 12, start.y, { steps: 3 })
  await page.mouse.up()
  await expectSnapped(ring)
  await expect(page.getByRole("button", { name: "查看大图", exact: true })).toBeVisible()

  await page.mouse.move(start.x, start.y)
  await page.mouse.down()
  await page.mouse.move(start.x - 275, start.y, { steps: 10 })
  await page.mouse.up()
  await expect(page.getByRole("status")).toContainText("4 / 78")
  await expectSnapped(ring)
  await page.keyboard.press("Enter")
  await expect(page.getByRole("img", { name: "女皇 / The Empress" })).toBeVisible()
})

test("小屏完整显示牌面、牌名和选牌按钮", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 320, height: 568 })
  await page.goto("/")
  const confirm = page.getByRole("button", { name: "查看大图", exact: true })
  const ring = page.locator(".card-ring")
  await expect(ring.locator("img")).toHaveCount(5)
  await expect(frontCard(ring)).toBeInViewport()
  await expect(confirm).toBeInViewport()
  if (testInfo.project.name === "mobile") {
    await page.screenshot({ path: testInfo.outputPath("gallery-ring-small.png") })
  }

  await confirm.click()
  const image = page.getByRole("img", { name: "愚人 / The Fool", exact: true })
  await expect(image).toBeVisible()
  await expect(image).toHaveCSS("object-fit", "contain")
  const artwork = await image.boundingBox()
  const caption = await page.getByRole("heading", { name: "愚人", exact: true }).boundingBox()
  expect(artwork!.height).toBeGreaterThan(150)
  expect(artwork!.y + artwork!.height).toBeLessThan(caption!.y)
  await expect(page.getByRole("button", { name: /下一张/ })).toBeInViewport()
  await expect(page.getByRole("button", { name: "返回牌环" })).toBeInViewport()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320)
  expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBe(568)
})

test("原生触摸滑过多张并在首尾双向吸附", async ({ page, context, isMobile }) => {
  test.skip(!isMobile, "仅验证手机触摸交互")
  await page.goto("/")
  const ring = page.locator(".card-ring")
  const position = page.getByRole("status")
  const box = (await frontCard(ring).boundingBox())!
  const y = box.y + box.height / 2
  const session = await context.newCDPSession(page)

  async function swipe(from: number, to: number) {
    await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: from, y }] })
    for (let step = 1; step <= 10; step++) {
      const x = from + (to - from) * step / 10
      await session.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y }] })
    }
    await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] })
    await expectSnapped(ring)
    await expect(page.getByRole("button", { name: "查看大图", exact: true })).toBeVisible()
  }

  await swipe(50, 140)
  await expect(position).toContainText("78 / 78")
  await swipe(340, 70)
  await expect(position).toContainText("3 / 78")
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
