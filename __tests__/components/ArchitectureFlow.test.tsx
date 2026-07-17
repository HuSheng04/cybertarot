import "@testing-library/jest-dom"
import { render, screen } from "@testing-library/react"
import ArchitectureFlow from "@/components/ArchitectureFlow"

describe("ArchitectureFlow", () => {
  it("contains Client, Server, and DeepSeek nodes in source order", () => {
    render(<ArchitectureFlow />)

    const headings = screen.getAllByRole("heading", { level: 3 })
    expect(headings).toHaveLength(3)
    expect(headings[0]).toHaveTextContent("Client 端")
    expect(headings[1]).toHaveTextContent("Server 端")
    expect(headings[2]).toHaveTextContent(/DeepSeek/)
  })

  it("does not render a pre element", () => {
    const { container } = render(<ArchitectureFlow />)

    expect(container.querySelector("pre")).not.toBeInTheDocument()
  })

  it("renders component tree nodes", () => {
    render(<ArchitectureFlow />)

    expect(screen.getByText("TarotProvider")).toBeInTheDocument()
    expect(screen.getByText("TarotTable3D (R3F)")).toBeInTheDocument()
    expect(screen.getByText("ReadingStream (SSE)")).toBeInTheDocument()
  })

  it("renders data flow labels", () => {
    render(<ArchitectureFlow />)

    // Each label renders twice (mobile + desktop layout, one hidden by responsive class)
    expect(screen.getAllByText("POST /api/reading")).toHaveLength(2)
    expect(screen.getAllByText("DeepSeek API")).toHaveLength(2)
  })
})
