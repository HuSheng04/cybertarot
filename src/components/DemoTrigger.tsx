"use client"

/* ===== DemoTrigger — 面试演示模式 ===== */
/*
 * 读取 URL 参数自动触发占卜流程：
 * - ?demo → 自动填入「我最近的事业运如何？」1 秒后自动触发
 * - ?q=xxx → 使用自定义问题
 * - 仅在首页生效，仅触发一次
 * - 兼容已登录 Key 和默认 Key
 */

import { useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { useTarot } from "./TarotProvider"

export function DemoTrigger() {
  const searchParams = useSearchParams()
  const { state, submitQuestion, setApiKey } = useTarot()
  const hasTriggered = useRef(false)

  useEffect(() => {
    // 只触发一次
    if (hasTriggered.current) return

    const isDemo = searchParams.get("demo") !== null
    const customQuestion = searchParams.get("q")

    if (!isDemo && !customQuestion) return

    hasTriggered.current = true

    // 确定演示问题
    const demoQuestion = customQuestion || "我最近的事业运如何？"

    // 延迟 1 秒后自动触发（模拟用户操作）
    const timer = setTimeout(
      () => {
        // 如果还没设置 apiKey（还在 braindance 阶段），先用 null（服务端 Key）
        if (state.phase === "braindance") {
          setApiKey(null)
        }

        // 延迟一点点以确保 phase 已切换到 input
        setTimeout(() => {
          submitQuestion(demoQuestion)
        }, 100)
      },
      1000,
    )

    return () => clearTimeout(timer)
  }, [searchParams, state.phase, submitQuestion, setApiKey])

  // 无 UI 渲染
  return null
}
