"use client"

import { motion } from "motion/react"

type Props = {
  /** 卡牌数量（默认 3） */
  count?: number
}

/**
 * CardSkeleton — 卡牌骨架屏
 *
 * 三张脉冲发光方块占位，懒加载 3D 场景时显示。
 * 设计规范：MASTER.md §9.2 — 骨架屏脉冲动画
 */
export function CardSkeleton({ count = 3 }: Props) {
  return (
    <div className="flex items-center justify-center gap-6 md:gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="relative flex h-52 w-36 flex-col items-center justify-center rounded-xl border border-card-border bg-card-surface/30 md:h-56 md:w-40"
          initial={{ opacity: 0.5 }}
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.3,
          }}
        >
          {/* 脉冲发光外框 */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-neon-cyan/5 to-neon-purple/5" />

          {/* 卡牌图标 */}
          <div className="relative z-10 flex flex-col items-center gap-2">
            <div className="h-10 w-8 rounded-md border border-neon-cyan/30 bg-neon-cyan/5" />
            <span className="font-subheading text-[10px] uppercase tracking-widest text-text-muted">
              {["过去", "现状", "未来"][i] ?? `卡牌 ${i + 1}`}
            </span>
          </div>

          {/* 装饰边角 */}
          <div className="absolute bottom-2 left-2 h-3 w-3 border-b border-l border-neon-cyan/20" />
          <div className="absolute right-2 top-2 h-3 w-3 border-r border-t border-neon-cyan/20" />
        </motion.div>
      ))}

      {/* 加载提示 */}
      <div className="sr-only" role="status">
        正在加载 3D 赛博占卜桌…
      </div>
    </div>
  )
}

export default CardSkeleton
