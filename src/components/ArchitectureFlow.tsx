"use client"

/* ───── Data ───── */

interface FlowZone {
  title: string
  items: string[]
  accent: "cyan" | "purple"
}

const FLOW_ZONES: FlowZone[] = [
  {
    title: "Client 端",
    items: [
      "Braindance Portal → Question Input",
      "TarotTable 3D (R3F + 粒子背景)",
      "ReadingStream (SSE 流式解读)",
    ],
    accent: "cyan",
  },
  {
    title: "Server 端",
    items: [
      "Route Handler /api/reading",
      "AbortController · 自动重试 (2 次)",
      "全部失败 → 模板降级 (5 套)",
    ],
    accent: "cyan",
  },
  {
    title: "DeepSeek Chat",
    items: [
      "System Prompt ~600 字",
      "User Prompt 拼接",
      "stream=true → SSE 流式返回",
    ],
    accent: "purple",
  },
]

const COMPONENT_TREE_NODES = [
  "TarotProvider",
  "TarotTable3D (R3F)",
  "ReadingStream (SSE)",
]

const DATA_LABELS = ["POST /api/reading", "DeepSeek API"]

/* ───── Arrow SVG icons ───── */

function ArrowRight() {
  return (
    <svg
      className="h-4 w-5"
      viewBox="0 0 20 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2 8h14M10 2l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ArrowDown() {
  return (
    <svg
      className="h-5 w-4"
      viewBox="0 0 16 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M8 2v14M2 10l6 6 6-6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/* ───── Zone card ───── */

function ZoneCard({ zone }: { zone: FlowZone }) {
  const borderColor =
    zone.accent === "cyan" ? "border-neon-cyan/15" : "border-neon-purple/15"
  const shadow =
    zone.accent === "cyan"
      ? "shadow-[0_0_12px_rgba(0,240,255,0.04)]"
      : "shadow-[0_0_12px_rgba(180,77,255,0.04)]"
  const titleColor =
    zone.accent === "cyan" ? "text-neon-cyan" : "text-neon-purple"

  return (
    <div
      className={`w-full rounded-xl border ${borderColor} bg-deep-space/70 p-3 ${shadow}`}
    >
      <h3
        className={`font-subheading mb-2 text-xs font-semibold tracking-wide ${titleColor}`}
      >
        {zone.title}
      </h3>
      <ul className="space-y-1">
        {zone.items.map((item) => (
          <li
            key={item}
            className="font-mono text-[10px] leading-relaxed text-text-secondary"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ───── Arrow between zones ───── */

function FlowArrow({
  index,
}: {
  index: number
}) {
  const label = DATA_LABELS[index]
  if (!label) return null

  return (
    <>
      {/* Mobile: vertical arrow */}
      <div className="flex flex-col items-center py-1 md:hidden">
        <ArrowDown />
        <span className="mt-0.5 whitespace-nowrap font-mono text-[9px] text-neon-cyan/40">
          {label}
        </span>
      </div>
      {/* Desktop: horizontal arrow */}
      <div className="hidden md:flex md:flex-col md:items-center md:justify-center md:px-2">
        <span className="mb-1 whitespace-nowrap font-mono text-[9px] text-neon-cyan/40">
          {label}
        </span>
        <ArrowRight />
      </div>
    </>
  )
}

/* ───── Component tree note ───── */

function ComponentTreeNote() {
  return (
    <div className="flex items-center justify-center gap-1.5 rounded-lg border border-card-border bg-card-surface/20 px-3 py-2">
      <span className="font-mono text-[10px] text-text-muted">组件树:</span>
      {COMPONENT_TREE_NODES.map((node, i) => (
        <span key={node} className="flex items-center gap-1.5">
          <span className="font-mono text-[10px] text-text-secondary">
            {node}
          </span>
          {i < COMPONENT_TREE_NODES.length - 1 && (
            <span className="text-[9px] text-neon-cyan/30">→</span>
          )}
        </span>
      ))}
    </div>
  )
}

/* ───── Main component ───── */

export default function ArchitectureFlow() {
  return (
    <div className="space-y-4" data-testid="architecture-flow">
      {/* Data flow: Client → Server → DeepSeek */}
      <div className="flex flex-col items-center md:flex-row md:items-stretch">
        {FLOW_ZONES.map((zone, i) => (
          <div
            key={zone.title}
            className="flex w-full flex-col items-center md:flex-1"
          >
            <ZoneCard zone={zone} />

            {i < FLOW_ZONES.length - 1 && <FlowArrow index={i} />}
          </div>
        ))}
      </div>

      {/* Compact component tree */}
      <ComponentTreeNote />
    </div>
  )
}
