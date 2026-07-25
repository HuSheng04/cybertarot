"use client"

/* ===== RuneDivider — SVG 符文分隔线（美化方案 P1-F） ===== */
/*
 * 替换旧的 ✦ 字符版 holographic-divider。
 * 结构: 渐变细线 — 符文 glyph(SVG 菱形+刻痕) — 渐变细线
 * 滚动进入视口时淡入展开。
 */

import { motion } from "motion/react"

function RuneMark() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden
      className="mx-3 shrink-0 text-neon-cyan/40"
    >
      {/* 菱形外框 + 内部刻痕(类符文) */}
      <path d="M7 1 L13 7 L7 13 L1 7 Z" stroke="currentColor" strokeWidth="1" />
      <path d="M7 4 V10 M4.5 6.5 L9.5 6.5" stroke="currentColor" strokeWidth="0.8" />
    </svg>
  )
}

export function RuneDivider() {
  return (
    <motion.div
      className="relative my-12 flex items-center"
      initial={{ opacity: 0, scaleX: 0.5 }}
      whileInView={{ opacity: 0.35, scaleX: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      aria-hidden
    >
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-neon-cyan/30 to-transparent shadow-[0_0_6px_rgba(0,240,255,0.15)]" />
      <RuneMark />
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-neon-cyan/30 to-transparent shadow-[0_0_6px_rgba(0,240,255,0.15)]" />
    </motion.div>
  )
}
