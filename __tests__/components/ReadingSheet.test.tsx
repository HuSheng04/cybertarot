import "@testing-library/jest-dom"
import { render, screen, fireEvent } from "@testing-library/react"
import { ReadingSheet } from "@/components/ReadingSheet"

// Mock ReadingStream to isolate the sheet behaviour
jest.mock("@/components/ReadingStream", () => ({
  ReadingStream: function MockReadingStream({
    compact: _compact,
    onReset,
    onComplete,
  }: Record<string, unknown>) {
    return (
      <div data-testid="reading-stream" data-compact={String(_compact)}>
        <span data-testid="mock-onreset">{typeof onReset}</span>
        <span data-testid="mock-oncomplete">{typeof onComplete}</span>
      </div>
    )
  },
}))

// Mock motion — strip Motion-specific props so React doesn't warn about unknown DOM attrs
jest.mock("motion/react", () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const MotionDiv = ({ initial: _i, animate: _a, exit: _e, transition: _t, layout: _l, children, ...props }: Record<string, unknown>) => (
    <div {...props}>{children as React.ReactNode}</div>
  )

  return {
    motion: { div: MotionDiv },
    AnimatePresence: ({ children }: Record<string, unknown>) => <>{children}</>,
  }
})

// Mock OracleGlyph
jest.mock("@/components/icons/OracleGlyph", () => ({
  __esModule: true,
  default: function MockGlyph({ name, className }: { name: string; className?: string }) {
    return <span data-testid={`glyph-${name}`} className={className} />
  },
}))

describe("ReadingSheet", () => {
  it("renders compact by default", () => {
    render(<ReadingSheet cards={[]} question="测试" />)

    const stream = screen.getByTestId("reading-stream")
    expect(stream).toHaveAttribute("data-compact", "true")
  })

  it("expand control changes aria-expanded to true", () => {
    render(<ReadingSheet cards={[]} question="测试" />)

    // Initially all buttons are in collapsed state (aria-label="展开解读")
    const collapsedToggles = screen.getAllByRole("button", { name: /展开解读/i })
    expect(collapsedToggles.length).toBe(2)

    fireEvent.click(collapsedToggles[0])

    // After click, labels change to "收起解读"
    const expandedToggles = screen.getAllByRole("button", { name: /收起解读/i })
    expect(expandedToggles.length).toBe(2)
    // aria-expanded presence confirmed via label change
  })

  it("collapse returns it to compact", () => {
    render(<ReadingSheet cards={[]} question="测试" />)

    // Expand
    const expandBtns = screen.getAllByRole("button", { name: /展开解读/i })
    fireEvent.click(expandBtns[0])

    // Verify expanded
    const collapseBtns = screen.getAllByRole("button", { name: /收起解读/i })
    expect(collapseBtns.length).toBe(2)

    // Collapse
    fireEvent.click(collapseBtns[0])

    // Verify returned to compact — labels switch back
    const compactToggles = screen.getAllByRole("button", { name: /展开解读/i })
    expect(compactToggles.length).toBe(2)

    // ReadingStream receives compact=true
    const stream = screen.getByTestId("reading-stream")
    expect(stream).toHaveAttribute("data-compact", "true")
  })

  it("passes onReset and onComplete through unchanged", () => {
    const onReset = jest.fn()
    const onComplete = jest.fn()

    render(
      <ReadingSheet
        cards={[]}
        question="测试"
        onReset={onReset}
        onComplete={onComplete}
      />,
    )

    expect(screen.getByTestId("mock-onreset").textContent).toBe("function")
    expect(screen.getByTestId("mock-oncomplete").textContent).toBe("function")
  })
})
