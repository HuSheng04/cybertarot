/**
 * CyberTarot 动效 Tokens
 *
 * 统一动画参数配置，与 framer-motion / motion 的 transition API 兼容。
 * 所有组件动画参数优先引用此文件，避免散落 magic number。
 */

import type { Transition, Variants } from "motion/react"

/* ===== Spring 配置 ===== */

/** 快速弹性 — 微交互、hover、小型元素入场 */
export const springSnappy: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 20,
  mass: 0.5,
}

/** 标准弹性 — 面板切换、卡片动画、段落浮现 */
export const springSmooth: Transition = {
  type: "spring",
  stiffness: 200,
  damping: 25,
  mass: 1,
}

/** 柔和弹性 — 大元素入场、全屏过渡、解读 overlay */
export const springGentle: Transition = {
  type: "spring",
  stiffness: 100,
  damping: 30,
  mass: 1.2,
}

/* ===== 持续时间 ===== */

export const duration = {
  fast: 0.15,   // 150ms — hover、微交互
  normal: 0.3,  // 300ms — 面板切换、淡入淡出
  slow: 0.6,    // 600ms — 页面入场、大过渡
} as const

/* ===== Easing 曲线 ===== */

export const easing = {
  /** 快速进入，缓慢结束 — hover、微交互 */
  out: [0.16, 1, 0.3, 1] as [number, number, number, number],
  /** 缓慢进入，快速结束 — 退出动画 */
  in: [0.7, 0, 0.84, 0] as [number, number, number, number],
  /** 两端平滑 — 面板过渡 */
  inOut: [0.65, 0, 0.35, 1] as [number, number, number, number],
  /** 弹性感觉的 cubic-bezier */
  bounce: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
} as const

/* ===== Stagger 间隔 ===== */

export const stagger = {
  micro: 0.03,  // 30ms — 网格卡片、标签列表
  normal: 0.1,  // 100ms — 段落、列表项
} as const

/* ===== 距离 ===== */

export const distance = {
  sm: 8,   // 微上浮、hover 偏移
  md: 16,  // 标准入场位移
  lg: 32,  // 大入场位移、全屏过渡
} as const

/* ===== 常用 Variants ===== */

/** 淡入 + 上移 — 标准入场 */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: distance.md },
  visible: { opacity: 1, y: 0, transition: springSmooth },
}

/** 淡入 + 缩放 — 卡片/模态框入场 */
export const fadeInScale: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: springSnappy },
}

/** Stagger 容器 — 配合 fadeInUp 或自定义子项使用 */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: stagger.micro,
      delayChildren: 0,
    },
  },
}

/** 底部滑入 — overlay 等 */
export const slideUp: Variants = {
  hidden: { y: "100%" },
  visible: { y: 0, transition: springGentle },
  exit: { y: "100%", transition: { ...springGentle, duration: 0.2 } },
}
