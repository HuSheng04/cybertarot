"use client"

/* ===== 全局路由过渡 — 美化方案 §5.4: 400ms 统一淡入 ===== */

import { motion } from "motion/react"

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex min-h-dvh flex-1 flex-col"
    >
      {children}
    </motion.div>
  )
}
