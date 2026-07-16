import "@testing-library/jest-dom"
import { render, screen } from "@testing-library/react"
import Navbar from "@/components/Navbar"

// Mock next/navigation
jest.mock("next/navigation", () => ({
  usePathname: () => "/",
}))

// Mock motion — strip layoutId so React doesn't warn about unknown DOM props
jest.mock("motion/react", () => {
  const MotionSpan = ({
    layoutId: _layoutId,
    transition: _transition,
    children,
    ...props
  }: Record<string, unknown>) => <span {...props}>{children as React.ReactNode}</span>
  MotionSpan.displayName = "MotionSpan"

  return {
    motion: {
      span: MotionSpan,
    },
  }
})

describe("Navbar", () => {
  it("renders the brand link with accessible name 'CyberTarot 2077'", () => {
    render(<Navbar />)

    const brandLink = screen.getByRole("link", { name: "CyberTarot 2077" })
    expect(brandLink).toBeInTheDocument()
    expect(brandLink).toHaveAttribute("href", "/")
  })

  it("does not render the 🎴 emoji in the brand area", () => {
    const { container } = render(<Navbar />)

    expect(container.innerHTML).not.toContain("🎴")
  })

  it("renders navigation links", () => {
    render(<Navbar />)

    expect(screen.getByRole("link", { name: "占卜" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "关于" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "牌库" })).toBeInTheDocument()
  })

  it("applies fullscreen styles when isFullscreen is true", () => {
    const { container } = render(<Navbar isFullscreen />)

    const nav = container.querySelector("nav")
    expect(nav?.className).toContain("bg-deep-space/30")
  })
})
