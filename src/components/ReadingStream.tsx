"use client"

/* ===== ReadingStream — 流式占卜解读展示 ===== */
/*
 * 功能：
 * - 自动调用 POST /api/reading 获取流式解读
 * - Response.body.getReader() 读取 SSE 流
 * - 按 ## 标题分割段落
 * - 标题 150ms 淡入先显示，正文流式缓冲
 * - Framer Motion 逐段浮现动画
 * - 取消解读 / 再来一次
 * - 自动降级无感切换
 */

import { useEffect, useRef, useState, useCallback } from "react"
import { motion, AnimatePresence } from "motion/react"
import type { DrawnCard } from "@/types"
import { springSmooth } from "@/lib/motionTokens"

/* =================================================== */
/*  类型                                                */
/* =================================================== */

interface Paragraph {
  id: string
  title: string
  content: string
  isComplete: boolean
}

interface ReadingStreamProps {
  cards: DrawnCard[]
  question: string
  apiKey?: string
  onReset?: () => void
  onComplete?: () => void
}

/* =================================================== */
/*  SSE 解析：提取 content delta                        */
/* =================================================== */

function parseSSELine(line: string): { type: string; content?: string } | null {
  const trimmed = line.trim()
  if (!trimmed || trimmed === "data: [DONE]") return null
  if (!trimmed.startsWith("data: ")) return null

  try {
    return JSON.parse(trimmed.slice(6))
  } catch {
    return null
  }
}

/* =================================================== */
/*  段落分割：从累积文本中提取完整段落                  */
/* =================================================== */

/**
 * 从文本中提取 ## 开头的段落
 * 返回 [完整段落[], 剩余未完成文本]
 */
function extractParagraphs(buffer: string): [Paragraph[], string] {
  const lines = buffer.split("\n")
  const result: Paragraph[] = []
  let currentTitle = ""
  let currentContent = ""
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    if (line.startsWith("## ")) {
      // 保存上一个段落
      if (currentTitle) {
        result.push({
          id: `p-${result.length}`,
          title: currentTitle,
          content: currentContent.trim(),
          isComplete: true,
        })
      }
      currentTitle = line.replace(/^## /, "")
      currentContent = ""
    } else if (currentTitle) {
      currentContent += line + "\n"
    }
    i++
  }

  // 剩余未完成的作为当前 streaming 段落
  const remaining = currentTitle ? `${currentTitle}\n${currentContent}` : ""

  return [result, remaining]
}

/* =================================================== */
/*  组件                                                */
/* =================================================== */

export function ReadingStream({ cards, question, apiKey, onReset, onComplete }: ReadingStreamProps) {
  const [paragraphs, setParagraphs] = useState<Paragraph[]>([])
  const [streamingTitle, setStreamingTitle] = useState("")
  const [streamingContent, setStreamingContent] = useState("")
  const [isStreaming, setIsStreaming] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const controllerRef = useRef<AbortController | null>(null)
  const bufferRef = useRef("")
  const [hasCompleted, setHasCompleted] = useState(false)
  const hasCompletedRef = useRef(false)

  /* =================================================== */
  /*  启动流式请求                                        */
  /* =================================================== */

  const startReading = useCallback(async () => {
    // 清除上次错误状态（支持重试时安全重置）
    setHasError(false)
    setErrorMessage("")
    setParagraphs([])
    setStreamingTitle("")
    setStreamingContent("")
    setIsStreaming(true)
    bufferRef.current = ""
    hasCompletedRef.current = false
    setHasCompleted(false)

    const controller = new AbortController()
    controllerRef.current = controller

    try {
      const response = await fetch("/api/reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, cards, apiKey }),
        signal: controller.signal,
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.error || `请求失败 (${response.status})`)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error("无法获取响应流")

      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const text = decoder.decode(value, { stream: true })
        const lines = text.split("\n")

        for (const line of lines) {
          const parsed = parseSSELine(line)
          if (!parsed) continue

          if (parsed.type === "chunk" && parsed.content) {
            // 累积文本到 buffer 并分割段落
            bufferRef.current += parsed.content

            const [completed, remaining] = extractParagraphs(bufferRef.current)

            if (completed.length > 0) {
              setParagraphs((prev) => {
                // 合并去重
                const existing = new Set(prev.map((p) => p.title))
                const newPars = completed.filter((p) => !existing.has(p.title))
                return [...prev, ...newPars]
              })
            }

            // 从 remaining 提取当前的 streaming 标题和内容
            if (remaining) {
              const firstNewline = remaining.indexOf("\n")
              if (firstNewline >= 0) {
                const title = remaining.slice(0, firstNewline).replace(/^## /, "")
                const content = remaining.slice(firstNewline + 1)
                setStreamingTitle(title)
                setStreamingContent(content)
              } else {
                const title = remaining.replace(/^## /, "")
                setStreamingTitle(title)
                setStreamingContent("")
              }
            } else {
              setStreamingTitle("")
              setStreamingContent("")
            }
          }

          if (parsed.type === "fallback" && parsed.content) {
            // 降级模式 — 直接解析全文
            bufferRef.current = parsed.content
            const [completed] = extractParagraphs(bufferRef.current)
            setParagraphs(completed)
            setStreamingTitle("")
            setStreamingContent("")
          }

          if (parsed.type === "done") {
            // 将剩余的 streaming 段落转为完整段落
            if (bufferRef.current) {
              const [completed] = extractParagraphs(bufferRef.current)
              setParagraphs((prev) => {
                const existing = new Set(prev.map((p) => p.title))
                const newPars = completed.filter((p) => !existing.has(p.title))
                return [...prev, ...newPars]
              })
            }
            setStreamingTitle("")
            setStreamingContent("")
            setIsStreaming(false)
            hasCompletedRef.current = true
            setHasCompleted(true)
            onComplete?.()
          }
        }
      }
    } catch (error) {
      if (controller.signal.aborted) {
        // 用户取消 — 不做任何事
        setIsStreaming(false)
        return
      }

      setHasError(true)
      setErrorMessage(error instanceof Error ? error.message : "连接神谕核心失败")
      setIsStreaming(false)
    }
  }, [cards, question, apiKey, onComplete])

  /* =================================================== */
  /*  取消解读                                            */
  /* =================================================== */

  const cancelReading = useCallback(() => {
    controllerRef.current?.abort()
    setIsStreaming(false)
  }, [])

  /* =================================================== */
  /*  组件挂载时自动启动                                  */
  /* =================================================== */

  useEffect(() => {
    startReading()
    return () => {
      controllerRef.current?.abort()
    }
  }, [startReading])

  /* ---- 监听全局 Esc 取消事件 ---- */
  useEffect(() => {
    function handleCancel() {
      cancelReading()
    }
    window.addEventListener("tarot-cancel-reading", handleCancel)
    return () => window.removeEventListener("tarot-cancel-reading", handleCancel)
  }, [cancelReading])

  /* =================================================== */
  /*  渲染                                                */
  /* =================================================== */

  return (
    <div className="w-full max-w-lg space-y-4">
      {/* 标题 */}
      <motion.h2
        className="font-heading text-lg tracking-wider text-neon-cyan"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springSmooth}
      >
        ══ 赛博占卜师的解读 ══
      </motion.h2>

      {/* 错误提示 */}
      <AnimatePresence>
        {hasError && (
          <motion.div
            className="rounded-xl border border-error/30 bg-error/5 px-4 py-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <p className="text-sm text-error">{errorMessage}</p>
            <button
              type="button"
              onClick={startReading}
              className="mt-2 text-xs text-neon-cyan hover:text-neon-cyan/80 transition-colors"
            >
              [ 重新连接神谕核心 ]
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 已完成段落 */}
      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {paragraphs.map((para) => (
            <motion.div
              key={para.id}
              className="space-y-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={springSmooth}
            >
              <h3 className="font-subheading text-base font-semibold tracking-wide text-neon-purple">
                {para.title}
              </h3>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-primary">
                {para.content}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* 正在流式输出的当前段落 */}
        <AnimatePresence>
          {isStreaming && streamingTitle && (
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
            >
              <h3 className="font-subheading text-base font-semibold tracking-wide text-neon-purple">
                {streamingTitle}
              </h3>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-primary">
                {streamingContent}
                {/* 脉冲光标 */}
                <span className="inline-block h-4 w-0.5 animate-pulse bg-neon-cyan align-text-bottom" />
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 加载中（尚未收到任何内容） */}
        {isStreaming && !streamingTitle && !hasError && paragraphs.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-8">
            <div className="flex gap-1">
              <span className="h-2 w-2 animate-bounce rounded-full bg-neon-cyan [animation-delay:0ms]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-neon-purple [animation-delay:150ms]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-neon-cyan [animation-delay:300ms]" />
            </div>
            <p className="text-sm text-text-muted">赛博先知正在解析命运的神经网络…</p>
          </div>
        )}
      </div>

      {/* 操作按钮区 */}
      <div className="flex items-center justify-center gap-4 pt-4">
        {isStreaming && (
          <button
            type="button"
            onClick={cancelReading}
            className="rounded-lg border border-card-border px-5 py-2.5 font-subheading text-sm tracking-wide text-text-secondary transition-all duration-200 hover:border-error/50 hover:text-error"
          >
            [ 取消解读 ]
          </button>
        )}

        {!isStreaming && !hasError && (paragraphs.length > 0 || hasCompleted) && (
          <motion.button
            type="button"
            onClick={onReset}
            className="rounded-lg bg-neon-cyan px-6 py-3 font-heading text-sm font-bold tracking-wider text-deep-space"
            initial={{ opacity: 0, y: 10, boxShadow: "0 0 10px rgba(0, 240, 255, 0.15)" }}
            animate={{
              opacity: 1,
              y: 0,
              boxShadow: [
                "0 0 12px rgba(0, 240, 255, 0.25)",
                "0 0 20px rgba(0, 240, 255, 0.45)",
                "0 0 12px rgba(0, 240, 255, 0.25)",
              ],
            }}
            transition={{
              ...springSmooth,
              delay: 0.4,
              boxShadow: {
                repeat: Infinity,
                duration: 2.5,
                ease: "easeInOut",
              },
            }}
            whileHover={{ boxShadow: "0 0 30px rgba(0, 240, 255, 0.6)" }}
          >
            [ 🔄 再来一次 ]
          </motion.button>
        )}
      </div>
    </div>
  )
}
