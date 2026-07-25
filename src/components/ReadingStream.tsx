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

import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "motion/react"
import type { DrawnCard } from "@/types"
import { springSmooth } from "@/lib/motionTokens"
import OracleGlyph from "@/components/icons/OracleGlyph"
import { PullQuote, splitBoldSegments } from "@/components/PullQuote"

/* =================================================== */
/*  正逆位徽章 — 颜色+形状+文字 双编码（可访问性）        */
/* =================================================== */

function OrientationBadge({ reversed }: { reversed: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        aria-hidden
        className={
          "inline-block h-2.5 w-2.5 rounded-full " +
          (reversed ? "badge-ring-half" : "badge-ring-full")
        }
      />
      <span
        className={
          "text-xs tracking-wider " +
          (reversed ? "text-neon-purple" : "text-neon-cyan")
        }
      >
        {reversed ? "逆位" : "正位"}
      </span>
    </span>
  )
}

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
  /** Compact mode: show only the first completed paragraph, no header/actions */
  compact?: boolean
  /** Whether to render the section header (default true) */
  showHeader?: boolean
  /** Whether to render action buttons (default true) */
  showActions?: boolean
  /** Called when a completed paragraph changes the active card position */
  onActivePositionChange?: (position: 'past' | 'present' | 'future' | null) => void
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

export function ReadingStream({
  cards,
  question,
  apiKey,
  onReset,
  onComplete,
  compact = false,
  showHeader = true,
  showActions = true,
  onActivePositionChange,
}: ReadingStreamProps) {
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
  /*  状态重置（仅在重试时调用，不在 effect 中触发）       */
  /* =================================================== */

  const resetState = useCallback(() => {
    setHasError(false)
    setErrorMessage("")
    setParagraphs([])
    setStreamingTitle("")
    setStreamingContent("")
    setIsStreaming(true)
    bufferRef.current = ""
    hasCompletedRef.current = false
    setHasCompleted(false)
  }, [])

  /* =================================================== */
  /*  启动流式请求（不包含同步 setState，可安全在 effect 调用）*/
  /* =================================================== */

  const startReading = useCallback(async () => {
    controllerRef.current?.abort()
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
              const [completed, remaining] = extractParagraphs(bufferRef.current)
              setParagraphs((prev) => {
                const existing = new Set(prev.map((p) => p.title))
                const newPars = completed.filter((p) => !existing.has(p.title))

                // 将最后一个未完成段落（无后续 ## 标记）也转为完整
                if (remaining) {
                  const firstNewline = remaining.indexOf("\n")
                  if (firstNewline >= 0) {
                    const title = remaining.slice(0, firstNewline).replace(/^## /, "")
                    const content = remaining.slice(firstNewline + 1)
                    if (title && !existing.has(title)) {
                      newPars.push({
                        id: `p-${prev.length + newPars.length}`,
                        title,
                        content: content.trim(),
                        isComplete: true,
                      })
                    }
                  }
                }

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
  /*  活动位置：段落完成后通知父组件亮起对应卡牌          */
  /* =================================================== */

  const POSITION_MAP = useMemo(
    () => ["past" as const, "present" as const, "future" as const],
    [],
  )

  /** 已通知过父组件的段落数量，避免 React 批量导致丢失中间状态 */
  const notifiedCountRef = useRef(0)

  useEffect(() => {
    if (!onActivePositionChange) return
    if (paragraphs.length <= notifiedCountRef.current) return

    // 通知每个新完成的段落对应的卡牌位置
    for (let i = notifiedCountRef.current; i < paragraphs.length; i++) {
      const pos = POSITION_MAP[i]
      if (pos) onActivePositionChange(pos)
    }
    notifiedCountRef.current = paragraphs.length
  }, [paragraphs, onActivePositionChange, POSITION_MAP])

  /** 根据段落序号找到对应的 DrawnCard */
  const getCardForParagraph = useCallback((paragraphIndex: number): DrawnCard | undefined => {
    const position = POSITION_MAP[paragraphIndex]
    if (!position) return undefined
    return cards.find(c => c.position === position)
  }, [cards, POSITION_MAP])

  /* =================================================== */
  /*  渲染                                                */
  /* =================================================== */

  return (
    <div className="w-full max-w-lg space-y-4">
      {/* 标题（可通过 showHeader 控制） */}
      {showHeader && (
        <motion.h2
          className="font-heading text-lg tracking-wider text-neon-cyan"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springSmooth}
        >
          ══ 赛博占卜师的解读 ══
        </motion.h2>
      )}

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
              onClick={() => { resetState(); startReading() }}
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
          {(compact ? paragraphs.slice(0, 1) : paragraphs).map((para) => {
            const paraIndex = paragraphs.indexOf(para)
            const paraPos = POSITION_MAP[paraIndex]
            const match = getCardForParagraph(paraIndex)
            return (
            <motion.div
              key={para.id}
              id={paraPos ? `reading-para-${paraPos}` : undefined}
              className="space-y-2 scroll-mt-24"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={springSmooth}
            >
              {/* 段落标题新结构: [位置glyph] 标题 · 牌名 + Cinzel 英文 + 正逆位徽章 */}
              <h3 className="flex items-center gap-2 font-serif-cn text-base font-semibold tracking-wide text-neon-purple">
                {paraPos && (
                  <OracleGlyph name={paraPos} size={14} className="shrink-0 text-neon-purple/80" />
                )}
                <span>{para.title}</span>
                {match && (
                  <span className="font-normal text-text-secondary">· {match.card.nameZh}</span>
                )}
              </h3>
              {match && (
                <div className="flex items-center gap-3">
                  <span className="font-cinzel text-xs uppercase tracking-[0.2em] text-text-muted">
                    {match.card.nameEn}
                  </span>
                  <OrientationBadge reversed={match.isReversed} />
                </div>
              )}
              {/* 正文: **加粗诗意句** 自动提取为 PullQuote */}
              <div className="reading-prose text-sm text-text-primary">
                {splitBoldSegments(para.content).map((seg, i) =>
                  seg.quote ? (
                    <PullQuote key={i} text={seg.text} />
                  ) : (
                    <p key={i} className="whitespace-pre-wrap">{seg.text}</p>
                  ),
                )}
              </div>
              {/* 紧凑模式：有更多段落的提示 */}
              {compact && paragraphs.length > 1 && (
                <p className="text-xs text-text-muted">… 还有 {paragraphs.length - 1} 段解读</p>
              )}
            </motion.div>
            )
          })}
        </AnimatePresence>

        {/* 正在流式输出的当前段落 — 紧凑模式下隐藏 */}
        {!compact && (
          <AnimatePresence>
            {isStreaming && streamingTitle && (
              <motion.div
                className="space-y-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
              >
                <h3 className="flex items-center gap-2 font-serif-cn text-base font-semibold tracking-wide text-neon-purple">
                  {POSITION_MAP[paragraphs.length] && (
                    <OracleGlyph
                      name={POSITION_MAP[paragraphs.length]}
                      size={14}
                      className="shrink-0 text-neon-purple/80"
                    />
                  )}
                  <span>{streamingTitle}</span>
                </h3>
                <p className="reading-prose whitespace-pre-wrap text-sm text-text-primary">
                  {streamingContent}
                  {/* 脉冲光标 */}
                  <span className="inline-block h-4 w-0.5 animate-pulse bg-neon-cyan align-text-bottom" />
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* 加载中（尚未收到任何内容）— 紧凑模式下隐藏 */}
        {!compact && isStreaming && !streamingTitle && !hasError && paragraphs.length === 0 && (
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

      {/* 操作按钮区 — 可通过 showActions 控制 */}
      {showActions && (
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
              className="flow-sweep rounded-lg bg-neon-cyan px-6 py-3 font-heading text-sm font-bold tracking-wider text-deep-space"
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
                  duration: 3,
                  ease: "easeInOut",
                },
              }}
              whileHover={{ boxShadow: "0 0 30px rgba(0, 240, 255, 0.6)" }}
            >
              再来一次
            </motion.button>
          )}
        </div>
      )}
    </div>
  )
}
