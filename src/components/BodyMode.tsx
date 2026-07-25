"use client"

/* ===== BodyMode — 为 <body> 挂载阶段背景模式类 ===== */
/*
 * 美化方案 P0-B · 背景阶段联动
 * 内页(/cards /about)挂载 "subpage-mode":
 *   L1 星云 25% 可见 + L2 星尘慢漂
 * 卸载时自动清理，不影响首页的 intro/meditation/fullscreen 模式。
 */

import { useEffect } from "react"

export function BodyMode({ mode }: { mode: string }) {
  useEffect(() => {
    document.body.classList.add(mode)
    return () => {
      document.body.classList.remove(mode)
    }
  }, [mode])

  return null
}
