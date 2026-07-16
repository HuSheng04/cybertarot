import "@testing-library/jest-dom"
import { render, screen, fireEvent } from "@testing-library/react"
import { CardDetailModal } from "@/components/CardDetailModal"
import { CARDS } from "@/data/cards"
import type { Card } from "@/types"

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

const mockCard: Card = CARDS[0] // The Fool (愚人)

describe("CardDetailModal", () => {
  const onClose = jest.fn()

  beforeEach(() => {
    onClose.mockClear()
  })

  it("renders nothing when card is null", () => {
    const { container } = render(
      <CardDetailModal card={null} onClose={onClose} />,
    )
    expect(container.innerHTML).toBe("")
  })

  it("renders the dialog with card's Chinese and English names", () => {
    render(<CardDetailModal card={mockCard} onClose={onClose} />)

    expect(screen.getByRole("dialog")).toBeInTheDocument()
    expect(screen.getByText("愚人")).toBeInTheDocument()
    expect(screen.getByText("The Fool")).toBeInTheDocument()
  })

  it("renders keywords as chips", () => {
    render(<CardDetailModal card={mockCard} onClose={onClose} />)

    for (const kw of mockCard.keywords) {
      expect(screen.getByText(kw)).toBeInTheDocument()
    }
  })

  it("renders upright meaning with cyan/success label", () => {
    render(<CardDetailModal card={mockCard} onClose={onClose} />)

    // Upright label should be visible
    const uprightLabel = screen.getByText(/^正位$/)
    expect(uprightLabel).toBeInTheDocument()
    // The parent h3 carries the semantic color class
    const parentHeading = uprightLabel.closest("h3")
    expect(parentHeading?.className).toMatch(/text-success/i)
  })

  it("renders reversed meaning with red label", () => {
    render(<CardDetailModal card={mockCard} onClose={onClose} />)

    const reversedLabel = screen.getByText(/^逆位$/)
    expect(reversedLabel).toBeInTheDocument()
    const parentHeading = reversedLabel.closest("h3")
    expect(parentHeading?.className).toMatch(/text-error/i)
  })

  it("renders the card image", () => {
    render(<CardDetailModal card={mockCard} onClose={onClose} />)

    const img = screen.getByRole("img")
    expect(img).toHaveAttribute("alt")
    expect(img.getAttribute("alt")).toContain("愚人")
  })

  it("has a close button with an accessible label", () => {
    render(<CardDetailModal card={mockCard} onClose={onClose} />)

    const closeBtn = screen.getByRole("button", { name: /关闭/i })
    expect(closeBtn).toBeInTheDocument()
  })

  it("calls onClose when close button is clicked", () => {
    render(<CardDetailModal card={mockCard} onClose={onClose} />)

    const closeBtn = screen.getByRole("button", { name: /关闭/i })
    fireEvent.click(closeBtn)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("calls onClose when Escape is pressed", () => {
    render(<CardDetailModal card={mockCard} onClose={onClose} />)

    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape", code: "Escape" })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("calls onClose when backdrop is clicked", () => {
    render(<CardDetailModal card={mockCard} onClose={onClose} />)

    // The backdrop is the outermost overlay
    const dialog = screen.getByRole("dialog")
    fireEvent.click(dialog)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("has aria-modal set to true", () => {
    render(<CardDetailModal card={mockCard} onClose={onClose} />)

    expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true")
  })

  it("renders the card image with next/image", () => {
    render(<CardDetailModal card={mockCard} onClose={onClose} />)

    const img = screen.getByRole("img")
    expect(img).toBeInTheDocument()
    // next/image renders as <img> or <noscript>; just verify it exists
    expect(img.getAttribute("alt")).toMatch(/愚人|The Fool/)
  })
})
