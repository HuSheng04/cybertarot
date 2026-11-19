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

const reducedMotionQuery = "(prefers-reduced-motion: reduce)"
let reducedMotion: boolean

beforeEach(() => {
  jest.clearAllMocks()
  reducedMotion = true
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: jest.fn((query: string) => ({
      matches: query === reducedMotionQuery && reducedMotion,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    })),
  })
})

function setupGallery() {
  render(<HomePage />)
  return {
    viewport: screen.getByRole("region", { name: "塔罗牌画廊" }),
    previous: screen.getByRole("button", { name: /上一张/ }),
    next: screen.getByRole("button", { name: /下一张/ }),
    confirm: screen.getByRole("button", { name: "查看大图" }),
  }
}

describe("首页卡片画廊", () => {
  test("初始显示愚人及桌面牌环，首尾可循环", () => {
    const { viewport, previous, next } = setupGallery()
    const front = screen.getByRole("button", { name: "查看大图：愚人 / The Fool" })
    expect(front).toHaveAttribute("aria-current", "true")
    expect(front.querySelector("img")).toHaveAttribute("src", expect.stringContaining("major_00.webp"))
    expect(viewport.querySelectorAll("img")).toHaveLength(9)
    expect(screen.getByRole("heading", { name: "愚人" })).toBeVisible()
    expect(screen.getByRole("status")).toHaveTextContent("1 / 78")
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument()

    fireEvent.click(previous)
    expect(screen.getByRole("status")).toHaveTextContent("78 / 78")
    fireEvent.click(next)
    expect(screen.getByRole("status")).toHaveTextContent("1 / 78")
  })

  test("点击侧牌先选中，再点击前方牌查看大图", () => {
    const { viewport } = setupGallery()
    fireEvent.click(screen.getByRole("button", { name: "移到前方：魔术师 / The Magician" }))
    expect(viewport).toHaveFocus()
    expect(screen.getByRole("status")).toHaveTextContent("2 / 78")
    expect(screen.queryByRole("img", { name: "魔术师 / The Magician" })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "查看大图：魔术师 / The Magician" }))
    expect(viewport.querySelectorAll("img")).toHaveLength(1)
    expect(screen.getByRole("img", { name: "魔术师 / The Magician" })).toHaveAttribute(
      "src", expect.stringContaining("major_01.webp"),
    )
    expect(screen.getByRole("button", { name: "返回牌环" })).toHaveFocus()
  })

  test("使用键盘确认、切换和返回，牌环保留最后查看的牌", () => {
    const { viewport, confirm } = setupGallery()
    const lastCard = CARDS.at(-1)!
    fireEvent.keyDown(viewport, { key: "End" })
    expect(screen.getByRole("status")).toHaveTextContent("78 / 78")
    fireEvent.keyDown(viewport, { key: "Home" })
    fireEvent.keyDown(viewport, { key: "Enter" })
    expect(screen.getByRole("img", { name: "愚人 / The Fool" })).toBeVisible()

    const back = screen.getByRole("button", { name: "返回牌环" })
    fireEvent.keyDown(back, { key: "ArrowLeft" })
    expect(screen.getByRole("img", { name: `${lastCard.nameZh} / ${lastCard.nameEn}` })).toBeVisible()
    fireEvent.keyDown(back, { key: "Escape" })
    expect(screen.getByRole("status")).toHaveTextContent("78 / 78")
    expect(viewport.querySelector("[aria-current]")).toHaveAccessibleName(
      `查看大图：${lastCard.nameZh} / ${lastCard.nameEn}`,
    )
    expect(confirm).toHaveFocus()
  })

  test("动画中的按钮、键盘和挥手从最近的目标继续，大图中直接切换", () => {
    jest.useFakeTimers()
    reducedMotion = false
    let swipe!: (direction: SwipeDirection) => void
    const mock = jest.mocked(handSwipe.useHandSwipe).mockImplementation((callback) => {
      swipe = callback
      return {
        videoRef: { current: null }, status: "running", guide: "ready", error: null,
        start: jest.fn(), stop: jest.fn(),
      }
    })
    try {
      const { viewport, next, confirm } = setupGallery()
      fireEvent.click(next)
      fireEvent.keyDown(viewport, { key: "ArrowRight" })
      act(() => swipe("left"))
      expect(screen.getByRole("status")).toHaveTextContent("1 / 78")
      act(() => jest.advanceTimersByTime(300))
      expect(screen.getByRole("status")).toHaveTextContent("4 / 78")
      fireEvent.click(confirm)
      act(() => swipe("right"))
      expect(screen.getByRole("status")).toHaveTextContent("3 / 78")
      expect(screen.getByRole("img", { name: "女祭司 / The High Priestess" })).toBeVisible()
    } finally {
      mock.mockImplementation(jest.requireActual("@/hooks/useHandSwipe").useHandSwipe)
      jest.useRealTimers()
    }
  })

  test("默认单次翻页，手势模式在牌环和大图之间保持独立选择", () => {
    const { confirm, viewport } = setupGallery()
    const modes = screen.getByRole("radiogroup", { name: "手势翻页方式" })
    expect(modes).toBeInTheDocument()
    const single = screen.getByRole("radio", { name: "单次翻页" })
    const repeat = screen.getByRole("radio", { name: "停留连翻" })
    expect(single).toBeChecked()
    expect(repeat).not.toBeChecked()
    fireEvent.click(repeat)
    expect(repeat).toBeChecked()
    expect(handSwipe.useHandSwipe).toHaveBeenLastCalledWith(expect.any(Function), "repeat")
    fireEvent.click(confirm)
    expect(repeat).toBeChecked()
    fireEvent.click(screen.getByRole("button", { name: "返回牌环" }))
    expect(repeat).toBeChecked()
    fireEvent.keyDown(repeat, { key: "ArrowLeft" })
    expect(screen.getByRole("status")).toHaveTextContent("1 / 78")
    fireEvent.click(single)
    expect(handSwipe.useHandSwipe).toHaveBeenLastCalledWith(expect.any(Function), "single")
    fireEvent.keyDown(viewport, { key: "ArrowRight" })
    expect(screen.getByRole("status")).toHaveTextContent("2 / 78")
  })

  test("连续的识别事件在牌环和大图中仍共用同一套选牌逻辑", () => {
    let swipe!: (direction: SwipeDirection) => void
    const mock = jest.mocked(handSwipe.useHandSwipe).mockImplementation((callback) => {
      swipe = callback
      return {
        videoRef: { current: null }, status: "running", guide: "repeating-left", error: null,
        start: jest.fn(), stop: jest.fn(),
      }
    })
    try {
      const { confirm } = setupGallery()
      fireEvent.click(screen.getByRole("radio", { name: "停留连翻" }))
      expect(screen.getByText("正在连续看下一张，手移回中间即可停止")).toBeVisible()
      act(() => { swipe("left"); swipe("left") })
      expect(screen.getByRole("status")).toHaveTextContent("3 / 78")
      fireEvent.click(confirm)
      act(() => swipe("left"))
      expect(screen.getByRole("status")).toHaveTextContent("4 / 78")
      act(() => swipe("right"))
      expect(screen.getByRole("status")).toHaveTextContent("3 / 78")
      expect(screen.getByRole("img", { name: "女祭司 / The High Priestess" })).toBeVisible()
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
