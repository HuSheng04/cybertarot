import "@testing-library/jest-dom"
import { render, screen, fireEvent } from "@testing-library/react"
import CardsPage from "@/app/cards/page"

// Mock motion
jest.mock("motion/react", () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const MotionDiv = ({ initial: _i, animate: _a, exit: _e, transition: _t, layout: _l, children, ...props }: Record<string, unknown>) => (
    <div {...props}>{children as React.ReactNode}</div>
  )
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const MotionButton = ({ initial: _i, animate: _a, exit: _e, transition: _t, layout: _l, whileHover: _wh, children, ...props }: Record<string, unknown>) => (
    <button {...props}>{children as React.ReactNode}</button>
  )

  const mockMotionValue = () => ({
    set: () => {},
    get: () => 0,
    on: () => () => {},
  })

  return {
    motion: { div: MotionDiv, button: MotionButton },
    AnimatePresence: ({ children }: Record<string, unknown>) => <>{children}</>,
    useMotionValue: mockMotionValue,
    useSpring: mockMotionValue,
  }
})

// Mock Navbar
jest.mock("@/components/Navbar", () => ({
  __esModule: true,
  default: function MockNavbar() {
    return <nav data-testid="navbar" />
  },
}))

// Mock CardDetailModal
jest.mock("@/components/CardDetailModal", () => ({
  CardDetailModal: function MockModal({ card, onClose }: { card: unknown; onClose: () => void }) {
    if (!card) return null
    return (
      <div data-testid="card-detail-modal">
        <button data-testid="modal-close" onClick={onClose}>
          Close
        </button>
      </div>
    )
  },
}))

// Mock next/image
jest.mock("next/image", () => ({
  __esModule: true,
  default: function MockImage(props: Record<string, unknown>) {
    return <img {...props} />
  },
}))

describe("CardsPage", () => {
  beforeEach(() => {
    // Mock scrollTo to prevent JSDOM errors
    window.scrollTo = jest.fn()
  })

  it("renders the page title", () => {
    render(<CardsPage />)
    expect(screen.getByText(/牌库/)).toBeInTheDocument()
  })

  it("renders all filter tabs", () => {
    render(<CardsPage />)

    // Use getByText for filter tabs to avoid matching card buttons with same Chinese text
    expect(screen.getByText("全部")).toBeInTheDocument()
    expect(screen.getByText("大阿卡纳")).toBeInTheDocument()
    expect(screen.getByText("权杖")).toBeInTheDocument()
    expect(screen.getByText("圣杯")).toBeInTheDocument()
    expect(screen.getByText("宝剑")).toBeInTheDocument()
    expect(screen.getByText("星币")).toBeInTheDocument()
  })

  it("shows all cards by default (All filter)", () => {
    render(<CardsPage />)

    // The page shows a count: "显示 78 / 78 张"
    expect(screen.getByText(/78 \/ 78/)).toBeInTheDocument()
  })

  it("Wands tab shows only wands cards", () => {
    render(<CardsPage />)

    // Click the tab rendered with text "权杖"
    const wandsTab = screen.getByText("权杖").closest("button")
    expect(wandsTab).not.toBeNull()
    fireEvent.click(wandsTab!)

    // Wands has 14 cards
    expect(screen.getByText(/14 \/ 78/)).toBeInTheDocument()
  })

  it("Wands tab label does not have redundant text", () => {
    render(<CardsPage />)

    const wandsTab = screen.getByText("权杖").closest("button")
    // Should not contain "权杖(权杖)" — redundant pair
    expect(wandsTab?.textContent).not.toMatch(/权杖\(/)
  })

  it("clicking a card opens the detail modal", () => {
    render(<CardsPage />)

    // Click the first card — get by the contained text (愚人)
    const firstCard = screen.getByText("愚人")
    fireEvent.click(firstCard)

    expect(screen.getByTestId("card-detail-modal")).toBeInTheDocument()
  })

  it("changing filter closes the detail modal", () => {
    render(<CardsPage />)

    // Open modal by clicking a card
    const firstCard = screen.getByText("愚人")
    fireEvent.click(firstCard)
    expect(screen.getByTestId("card-detail-modal")).toBeInTheDocument()

    // Switch filter
    const majorTab = screen.getByRole("button", { name: /大阿卡纳/i })
    fireEvent.click(majorTab)

    expect(screen.queryByTestId("card-detail-modal")).not.toBeInTheDocument()
  })

  it("render correct number of grid columns on desktop", () => {
    render(<CardsPage />)

    const grid = document.querySelector(".grid")
    expect(grid).toBeInTheDocument()
    // Should have grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5
    const classList = grid?.className ?? ""
    expect(classList).toContain("grid-cols-2")
    expect(classList).toContain("lg:grid-cols-5")
    // Should NOT have xl:grid-cols-6
    expect(classList).not.toContain("xl:grid-cols-6")
  })

  it("has accessible card items (semantic buttons or clickable)", () => {
    render(<CardsPage />)

    // All cards should be reachable as clickable elements
    const cards = screen.getAllByText("愚人")
    expect(cards.length).toBeGreaterThanOrEqual(1)
  })
})
