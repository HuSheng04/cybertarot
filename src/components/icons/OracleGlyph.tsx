"use client"

import type { ReactElement, SVGAttributes } from "react"

type GlyphName = "brand" | "past" | "present" | "future" | "system-error" | "close" | "expand" | "collapse"

type Props = SVGAttributes<SVGSVGElement> & {
  name: GlyphName
  size?: number
}

const PATHS: Record<GlyphName, ReactElement> = {
  /* ── 品牌 Logo：风格化卡牌 + 数据之眼 ── */
  brand: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="10" r="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="10" r="1" fill="currentColor" />
      <path d="M8 16 Q12 19 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </>
  ),

  /* ── 过去：左向箭头 ── */
  past: (
    <path
      d="M17 12H7m4-4l-4 4 4 4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),

  /* ── 现在：菱形/中心聚焦 ── */
  present: (
    <path
      d="M12 4l6 8-6 8-6-8z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),

  /* ── 未来：右向箭头 ── */
  future: (
    <path
      d="M7 12h10m-4-4l4 4-4 4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),

  /* ── 系统错误：感叹号三角 ── */
  "system-error": (
    <>
      <path
        d="M12 4L3 20h18z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12 10v4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="17" r="0.8" fill="currentColor" />
    </>
  ),

  /* ── 关闭：X ── */
  close: (
    <path
      d="M7 7l10 10M17 7l-10 10"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),

  /* ── 展开：向下的双箭头 ── */
  expand: (
    <path
      d="M7 10l5 5 5-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),

  /* ── 收起：向上的双箭头 ── */
  collapse: (
    <path
      d="M7 14l5-5 5 5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
}

export default function OracleGlyph({ name, size = 20, ...rest }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      data-glyph={name}
      {...rest}
    >
      {PATHS[name]}
    </svg>
  )
}

export type { GlyphName }
