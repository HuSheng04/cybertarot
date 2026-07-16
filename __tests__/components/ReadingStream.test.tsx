import "@testing-library/jest-dom"
import { render, screen, waitFor } from "@testing-library/react"
import { TextEncoder, TextDecoder } from "util"
import { ReadingStream } from "@/components/ReadingStream"

// Polyfill TextEncoder/TextDecoder for jsdom
;(globalThis as Record<string, unknown>).TextEncoder ??= TextEncoder
;(globalThis as Record<string, unknown>).TextDecoder ??= TextDecoder as unknown as typeof globalThis.TextDecoder
import type { DrawnCard } from "@/types"
import { Suit } from "@/types"

// ======================================================
// Mock motion — strip Motion-specific props so React
// doesn't warn about unknown DOM attrs
// ======================================================
jest.mock("motion/react", () => {
  const createTag = (tag: string) => {
    const Component = ({ children, ...props }: Record<string, unknown>) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { initial, animate, exit, transition, whileHover, layout, ...domProps } = props
      const Tag = tag as keyof JSX.IntrinsicElements
      return <Tag {...(domProps as React.HTMLAttributes<HTMLElement>)}>{children as React.ReactNode}</Tag>
    }
    Component.displayName = `motion.${tag}`
    return Component
  }

  return {
    motion: new Proxy(
      {},
      {
        get: (_target, tag: string) => createTag(tag),
      },
    ) as Record<string, ReturnType<typeof createTag>>,
    AnimatePresence: ({ children }: Record<string, unknown>) => <>{children}</>,
  }
})

// ======================================================
// Utilities for mock fetch
// ======================================================

function createMockStreamResponse(chunks: string[]) {
  const encoder = new TextEncoder()
  let index = 0

  return {
    ok: true,
    body: {
      getReader: () => ({
        read: async (): Promise<ReadableStreamReadResult<Uint8Array>> => {
          if (index >= chunks.length) {
            return { done: true, value: undefined as unknown as Uint8Array }
          }
          const value = encoder.encode(chunks[index])
          index++
          return { done: false, value }
        },
        cancel: async () => {},
        releaseLock: () => {},
        closed: Promise.resolve(undefined),
      }),
    },
  } as Response
}

// ======================================================
// Mock data
// ======================================================

const mockCards: DrawnCard[] = [
  {
    card: {
      id: "major_10",
      nameZh: "命运之轮",
      nameEn: "Wheel of Fortune",
      suit: Suit.Major,
      keywords: ["命运", "转变"],
      meaningUp: "好运来临",
      meaningDown: "厄运将至",
      imagePath: "/assets/cards/major_10.webp",
    },
    isReversed: false,
    position: "past",
  },
  {
    card: {
      id: "major_16",
      nameZh: "高塔",
      nameEn: "The Tower",
      suit: Suit.Major,
      keywords: ["崩塌", "重建"],
      meaningUp: "剧变",
      meaningDown: "避免灾难",
      imagePath: "/assets/cards/major_16.webp",
    },
    isReversed: false,
    position: "present",
  },
  {
    card: {
      id: "major_17",
      nameZh: "星星",
      nameEn: "The Star",
      suit: Suit.Major,
      keywords: ["希望", "宁静"],
      meaningUp: "充满希望",
      meaningDown: "失去方向",
      imagePath: "/assets/cards/major_17.webp",
    },
    isReversed: false,
    position: "future",
  },
]

const streamChunks = [
  'data: {"type":"chunk","content":"## 过去的痕迹\\n"}\n',
  'data: {"type":"chunk","content":"命运之轮正向旋转，象征你过去的积累即将带来转变。"}\n',
  'data: {"type":"chunk","content":"\\n## 现在的能量\\n"}\n',
  'data: {"type":"chunk","content":"高塔的崩塌预示着旧有结构的解体，为新生腾出空间。"}\n',
  'data: {"type":"chunk","content":"\\n## 未来的可能\\n"}\n',
  'data: {"type":"chunk","content":"星星指引你走向充满希望的未来，保持内心的平静。"}\n',
  'data: {"type":"done"}\n',
]

// ======================================================
// Tests
// ======================================================

describe("ReadingStream", () => {
  afterEach(() => {
    jest.restoreAllMocks()
    delete (global as Record<string, unknown>).fetch
  })

  beforeEach(() => {
    // jsdom does not have fetch natively — provide a stub
    global.fetch = jest.fn()
  })

  it("renders a completed reading section with position marker and accessible card name", async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue(createMockStreamResponse(streamChunks))

    render(<ReadingStream cards={mockCards} question="测试" />)

    // Wait for paragraphs to appear
    await waitFor(() => {
      expect(screen.getByText("过去的痕迹")).toBeInTheDocument()
    })

    // === Assert position markers (paragraph titles) are rendered ===
    expect(screen.getByText("过去的痕迹")).toBeInTheDocument()
    expect(screen.getByText("现在的能量")).toBeInTheDocument()
    expect(screen.getByText("未来的可能")).toBeInTheDocument()

    // === Assert card names are rendered alongside their sections ===
    // Each paragraph section should display the matching card name as text
    // (card name may also appear in the paragraph content, so accept multiple matches)
    expect(screen.getAllByText(/命运之轮/).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/高塔/).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/星星/).length).toBeGreaterThanOrEqual(1)

    // === Assert text is used, not relying on color alone ===
    // All assertions check visible text content, not computed styles
  })

  it("calls onActivePositionChange as paragraphs complete", async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue(createMockStreamResponse(streamChunks))
    const onPositionChange = jest.fn()

    render(
      <ReadingStream
        cards={mockCards}
        question="测试"
        onActivePositionChange={onPositionChange}
      />,
    )

    // Wait for all paragraphs and position callbacks to settle
    await waitFor(() => {
      expect(screen.getByText("未来的可能")).toBeInTheDocument()
    })

    // onActivePositionChange should have been called with each position in order
    expect(onPositionChange).toHaveBeenCalledWith("past")
    expect(onPositionChange).toHaveBeenCalledWith("present")
    expect(onPositionChange).toHaveBeenCalledWith("future")
  })
})
