import { act, fireEvent, render, screen } from "@testing-library/react"
import HomePage from "@/app/page"
import CardsPage from "@/app/cards/page"
import AboutPage from "@/app/about/page"
import { CARDS } from "@/data/cards"
import * as handSwipe from "@/hooks/useHandSwipe"
import type { SwipeDirection } from "@/lib/handSwipe"

jest.mock("@/hooks/useHandSwipe", () => ({
  ...jest.requireActual("@/hooks/useHandSwipe"),
  useHandSwipe: jest.fn(jest.requireActual("@/hooks/useHandSwipe").useHandSwipe),
}))

jest.mock("next/navigation", () => ({
  redirect: jest.fn(() => { throw new Error("NEXT_REDIRECT") }),
}))

import { redirect } from "next/navigation"

const scrollToMock = jest.fn()
let resizeCallback: ResizeObserverCallback
const disconnectMock = jest.fn()

beforeEach(() => {
  jest.clearAllMocks()
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: jest.fn(() => ({ matches: false, addEventListener: jest.fn(), removeEventListener: jest.fn() })),
  })
  HTMLElement.prototype.scrollTo = scrollToMock
  global.ResizeObserver = jest.fn().mockImplementation((callback: ResizeObserverCallback) => {
    resizeCallback = callback
    return { observe: jest.fn(), disconnect: disconnectMock }
  })
})

function setupGallery() {
  const result = render(<HomePage />)
  const viewport = screen.getByRole("region", { name: "塔罗牌画廊" })
  Object.defineProperty(viewport, "clientWidth", { configurable: true, value: 390 })
  const scrollToIndex = (index: number) => {
    fireEvent.scroll(viewport, { target: { scrollLeft: index * 390 } })
  }
  return { ...result, viewport, scrollToIndex }
}

describe("首页卡片画廊", () => {
  test("无需登录即可看到愚人和 1 / 78，首张禁用上一张", () => {
    setupGallery()
    expect(screen.getByRole("heading", { name: "愚人" })).toBeVisible()
    expect(screen.getByRole("img", { name: "愚人 / The Fool" })).toHaveAttribute(
      "src", expect.stringContaining("major_00.webp"),
    )
    expect(screen.getByRole("status")).toHaveTextContent("1 / 78")
    expect(screen.getByRole("button", { name: /上一张/ })).toBeDisabled()
    expect(screen.getByRole("button", { name: /下一张/ })).toBeEnabled()
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument()
  })

  test("全部牌面遵循数据顺序，只有首张优先加载", () => {
    const { viewport } = setupGallery()
    const images = viewport.querySelectorAll("img")
    expect(images).toHaveLength(CARDS.length)
    images.forEach((image, index) => {
      expect(image).toHaveAttribute("alt", `${CARDS[index].nameZh} / ${CARDS[index].nameEn}`)
      expect(image).toHaveAttribute("src", expect.stringContaining(`${CARDS[index].id}.webp`))
      if (index > 0) expect(image).toHaveAttribute("loading", "lazy")
    })
    expect(images[0]).not.toHaveAttribute("loading", "lazy")
  })

  test("按钮只发起滚动，实际滚动后才同步牌名、页码和边界", () => {
    const { scrollToIndex } = setupGallery()
    fireEvent.click(screen.getByRole("button", { name: /下一张/ }))
    expect(scrollToMock).toHaveBeenLastCalledWith({ left: 390, behavior: "smooth" })
    expect(screen.getByRole("status")).toHaveTextContent("1 / 78")

    scrollToIndex(1)
    expect(screen.getByRole("heading", { name: "魔术师" })).toBeVisible()
    expect(screen.getByRole("status")).toHaveTextContent("2 / 78")
    fireEvent.click(screen.getByRole("button", { name: /上一张/ }))
    expect(scrollToMock).toHaveBeenLastCalledWith({ left: 0, behavior: "smooth" })

    scrollToIndex(CARDS.length - 1)
    expect(screen.getByRole("status")).toHaveTextContent("78 / 78")
    expect(screen.getByRole("heading", { name: CARDS.at(-1)!.nameZh })).toBeVisible()
    expect(screen.getByRole("button", { name: /下一张/ })).toBeDisabled()
    expect(screen.getByRole("button", { name: /上一张/ })).toBeEnabled()

    scrollToIndex(0)
    expect(screen.getByRole("button", { name: /上一张/ })).toBeDisabled()
  })

  test("手动滑动后，按钮从当前牌继续翻页", () => {
    const { scrollToIndex } = setupGallery()
    scrollToIndex(23)
    expect(screen.getByRole("status")).toHaveTextContent("24 / 78")
    expect(screen.getByRole("heading", { name: CARDS[23].nameZh })).toBeVisible()
    fireEvent.click(screen.getByRole("button", { name: /下一张/ }))
    expect(scrollToMock).toHaveBeenLastCalledWith({ left: 24 * 390, behavior: "smooth" })
  })

  test("窗口宽度变化后，保持当前牌居中并清理监听", () => {
    const { viewport, scrollToIndex, unmount } = setupGallery()
    scrollToIndex(15)
    Object.defineProperty(viewport, "clientWidth", { value: 844 })
    resizeCallback([], {} as ResizeObserver)
    expect(scrollToMock).toHaveBeenLastCalledWith({ left: 15 * 844, behavior: "auto" })
    expect(screen.getByRole("status")).toHaveTextContent("16 / 78")
    unmount()
    expect(disconnectMock).toHaveBeenCalled()
  })

  test("支持键盘翻页，减少动态效果时直接定位", () => {
    const { viewport } = setupGallery()
    jest.mocked(window.matchMedia).mockReturnValue({ matches: true } as MediaQueryList)
    fireEvent.keyDown(viewport, { key: "End" })
    expect(scrollToMock).toHaveBeenLastCalledWith({ left: 77 * 390, behavior: "auto" })
    fireEvent.keyDown(viewport, { key: "Home" })
    expect(scrollToMock).toHaveBeenLastCalledWith({ left: 0, behavior: "auto" })
    fireEvent.keyDown(viewport, { key: "ArrowRight" })
    expect(scrollToMock).toHaveBeenLastCalledWith({ left: 390, behavior: "auto" })
  })

  test("手势共用实际页码，和键盘交替翻页时保持首尾边界", () => {
    let swipe!: (direction: SwipeDirection) => void
    const mock = jest.mocked(handSwipe.useHandSwipe).mockImplementation((callback) => {
      swipe = callback
      return {
        videoRef: { current: null }, status: "running", error: null,
        start: jest.fn(), stop: jest.fn(),
      }
    })
    try {
      const { viewport, scrollToIndex } = setupGallery()
      act(() => swipe("right"))
      expect(scrollToMock).toHaveBeenLastCalledWith({ left: 0, behavior: "smooth" })
      act(() => swipe("left"))
      expect(scrollToMock).toHaveBeenLastCalledWith({ left: 390, behavior: "smooth" })
      scrollToIndex(1)
      fireEvent.keyDown(viewport, { key: "ArrowRight" })
      expect(scrollToMock).toHaveBeenLastCalledWith({ left: 780, behavior: "smooth" })
      scrollToIndex(2)
      act(() => swipe("right"))
      expect(scrollToMock).toHaveBeenLastCalledWith({ left: 390, behavior: "smooth" })
      scrollToIndex(77)
      act(() => swipe("left"))
      expect(scrollToMock).toHaveBeenLastCalledWith({ left: 77 * 390, behavior: "smooth" })
      expect(screen.getByRole("status")).toHaveTextContent("78 / 78")
    } finally {
      mock.mockImplementation(jest.requireActual("@/hooks/useHandSwipe").useHandSwipe)
    }
  })
})

describe("旧入口跳转", () => {
  test.each([CardsPage, AboutPage])("统一重定向到首页", (Page) => {
    expect(() => Page()).toThrow("NEXT_REDIRECT")
    expect(redirect).toHaveBeenCalledWith("/")
  })
})
