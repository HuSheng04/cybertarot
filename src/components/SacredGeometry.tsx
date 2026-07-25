"use client"

/* ===== SacredGeometry — 神圣几何装饰（美化方案 P1-D / D1） ===== */
/*
 * 手绘矢量神圣几何:
 *   hexagram — 六芒星圆阵(Hero 背景)
 *   flower   — 生命之花(牌库页头)
 * 规范: 月光金线条 1px, opacity ≤0.1, 120s 缓转, 纯 CSS 驱动。
 * reduced-motion 由全局补丁自动降级。
 */

import { memo } from "react"

type Variant = "hexagram" | "flower"

interface SacredGeometryProps {
  variant?: Variant
  /** 边长(px)，等比缩放 */
  size?: number
  className?: string
}

/* ---- 六芒星圆阵: 外圆 + 内圆 + 正反双三角 + 中心圆 ---- */
function Hexagram() {
  return (
    <>
      <circle cx="100" cy="100" r="90" />
      <circle cx="100" cy="100" r="70" />
      <polygon points="100,10 177.9,145 22.1,145" />
      <polygon points="100,190 22.1,55 177.9,55" />
      <circle cx="100" cy="100" r="8" />
      {/* 六顶点刻度点 */}
      <circle cx="100" cy="10" r="1.5" />
      <circle cx="177.9" cy="145" r="1.5" />
      <circle cx="22.1" cy="145" r="1.5" />
      <circle cx="100" cy="190" r="1.5" />
      <circle cx="22.1" cy="55" r="1.5" />
      <circle cx="177.9" cy="55" r="1.5" />
    </>
  )
}

/* ---- 生命之花: 中心圆 + 六瓣环绕 + 外环 ---- */
function FlowerOfLife() {
  const petals: [number, number][] = [
    [130, 100],
    [115, 126],
    [85, 126],
    [70, 100],
    [85, 74],
    [115, 74],
  ]
  return (
    <>
      <circle cx="100" cy="100" r="90" />
      <circle cx="100" cy="100" r="30" />
      {petals.map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="30" />
      ))}
    </>
  )
}

export const SacredGeometry = memo(function SacredGeometry({
  variant = "hexagram",
  size = 480,
  className = "",
}: SacredGeometryProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      aria-hidden
      className={`sacred-spin pointer-events-none ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="0.75"
    >
      {variant === "hexagram" ? <Hexagram /> : <FlowerOfLife />}
    </svg>
  )
})
