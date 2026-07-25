"use client"

/* ===== Panel — 交互面板包裹组件 ===== */
/*
 * 包裹 BraindancePortal / QuestionInput 等交互内容，
 * 提供统一的赛博风格卡片容器。
 *
 * 特性：
 * - bg-card-surface/50 + backdrop-blur 半透明磨砂质感
 * - 顶部细 neon-cyan 装饰线
 * - 接受 motion props 支持 exit/enter 动画
 * - 接受 className 扩展
 */

import { type ReactNode } from "react"
import { motion, type HTMLMotionProps } from "motion/react"

type PanelProps = {
  children: ReactNode
  className?: string
} & Omit<HTMLMotionProps<"div">, "children" | "className">

export function Panel({ children, className = "", ...motionProps }: PanelProps) {
  return (
    <motion.div
      className={`hud-corner relative w-full max-w-2xl mx-auto rounded-xl border border-card-border bg-card-surface/50 backdrop-blur-md shadow-card ${className}`}
      {...motionProps}
    >
      {/* 顶部细 cyan 线装饰 */}
      <div
        className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-neon-cyan/40 to-transparent"
        aria-hidden="true"
      />

      <div className="flex flex-col items-center px-6 py-6">{children}</div>
    </motion.div>
  )
}
