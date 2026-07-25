"use client"

/* ===== QuestionInput — 冥想终端 (Phase 4) ===== */
/*
 * 功能：
 * - 200 字限制，实时字数提示
 * - 空提交：输入框抖动 + 错误提示
 * - 超长自动截断
 * - Enter 提交 / 按钮提交
 * - 提交后 disabled + loading 状态
 * - Focus 垂直光晕 + 打字停顿 0.5s 涟漪
 * - [深潜] 按钮渐变背景 + 点击脉冲
 */

import { useState, useCallback, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { useTarot } from "./TarotProvider"

const MAX_CHARS = 200

export function QuestionInput() {
  const { submitQuestion } = useTarot()

  const [text, setText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [shakeKey, setShakeKey] = useState(0)
  const [showRipple, setShowRipple] = useState(false)
  const [pulseClick, setPulseClick] = useState(false)

  const inputRef = useRef<HTMLTextAreaElement>(null)
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  /* ---- 空闲涟漪定时器清理 ---- */
  useEffect(() => {
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    }
  }, [])

  /* ---- 文本变更处理 ---- */
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let value = e.target.value
    // 自动截断超长输入
    if (value.length > MAX_CHARS) {
      value = value.slice(0, MAX_CHARS)
    }
    setText(value)
    if (error) setError(null)

    /* ---- 打字涟漪：停止输入 0.5s 后触发同心圆波纹 ---- */
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    if (value.trim()) {
      idleTimerRef.current = setTimeout(() => {
        setShowRipple(true)
        setTimeout(() => setShowRipple(false), 700)
      }, 500)
    }
  }, [error])

  /* ---- 提交 ---- */
  const handleSubmit = useCallback(async () => {
    const trimmed = text.trim()
    if (!trimmed) {
      setError("请输入你的问题")
      setShakeKey((k) => k + 1)
      inputRef.current?.focus()
      return
    }

    setIsSubmitting(true)
    setError(null)

    // 短暂延迟以展示 loading 状态（提升可感知性）
    await new Promise((r) => setTimeout(r, 600))

    submitQuestion(trimmed)
  }, [text, submitQuestion])

  /* ---- 点击出发（脉冲 + 提交） ---- */
  const handleDeepDive = useCallback(() => {
    if (isSubmitting) return
    setPulseClick(true)
    setTimeout(() => setPulseClick(false), 400)
    handleSubmit()
  }, [handleSubmit, isSubmitting])

  /* ---- 键盘事件 ---- */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        if (!isSubmitting) handleSubmit()
      }
      if (e.key === "Escape") {
        inputRef.current?.blur()
      }
    },
    [handleSubmit, isSubmitting],
  )

  /* =================================================== */
  /*  渲染                                                */
  /* =================================================== */

  return (
    <motion.section
      className="relative z-10 flex w-full max-w-lg flex-col items-center px-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* 美化方案 P1-D · 冥想引导: 2s 渐显渐隐一次(不循环打扰) */}
      <p
        aria-hidden
        className="meditation-hint-once mb-2 font-serif-cn text-sm tracking-[0.3em] text-text-secondary"
        style={{ animationDelay: "0.6s" }}
      >
        深呼吸，默念你的问题
      </p>

      {/* 标题 — 衬线化, 淘汰 ASCII 拼贴装饰 */}
      <motion.h2
        className="font-serif-cn text-xl font-semibold tracking-[0.2em] text-neon-cyan"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        冥想终端
      </motion.h2>
      <motion.p
        className="mt-2 text-sm text-text-secondary"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        写下你想探寻的命运线索
      </motion.p>

      {/* 输入区 */}
      <motion.div
        className="relative mt-6 w-full"
        key={shakeKey}
        animate={
          error
            ? { x: [0, -8, 8, -6, 6, -3, 3, 0] }
            : { x: 0 }
        }
        transition={{ duration: 0.4, ease: "easeInOut" }}
      >
        {/* ---- 垂直光晕 — focus 时从底部向上扩散 ---- */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-2/3 rounded-xl bg-gradient-to-t from-neon-cyan/[0.06] to-transparent opacity-0 transition-opacity duration-700 ease-out focus-within:opacity-100" />

        {/* ---- 打字涟漪 — 空闲 0.5s 后触发 ---- */}
        {showRipple && (
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 z-10 h-20 w-20 rounded-full border border-neon-cyan/15"
            style={{ animation: "ripple-expand 0.7s ease-out forwards" }}
          />
        )}

        <div
          className={`relative rounded-xl border bg-card-surface/50 p-4 transition-all duration-200 ${
            error
              ? "border-error/50"
              : "border-card-border focus-within:border-neon-cyan/50"
          }`}
        >
          <textarea
            ref={inputRef}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="输入你的问题，赛博先知将为你解读…"
            rows={3}
            disabled={isSubmitting}
            className="relative z-10 w-full resize-none bg-transparent text-base leading-relaxed text-text-primary placeholder-text-muted/50 outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
          />

          {/* 底部状态栏 */}
          <div className="relative z-10 mt-2 flex items-center justify-between border-t border-card-border pt-2">
            <span className="font-mono text-[10px] text-text-muted">
              {isSubmitting ? "连接 Braindance…" : "Enter 提交 · Shift+Enter 换行"}
            </span>
            {/* 美化方案 P1-D · 字数计数升级: 弧形进度环 + Rajdhani 数字 */}
            <span className="flex items-center gap-1.5" aria-label={`已输入 ${text.length} 字，上限 ${MAX_CHARS} 字`}>
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden className="-rotate-90">
                <circle cx="8" cy="8" r="6" fill="none" stroke="var(--color-card-border)" strokeWidth="1.5" />
                <circle
                  cx="8" cy="8" r="6" fill="none"
                  stroke={text.length > MAX_CHARS * 0.9 ? "var(--color-warning)" : "var(--color-neon-cyan)"}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 6}
                  strokeDashoffset={2 * Math.PI * 6 * (1 - text.length / MAX_CHARS)}
                  style={{ transition: "stroke-dashoffset 200ms ease-out" }}
                />
              </svg>
              <span
                className={`font-subheading text-xs tabular-nums ${
                  text.length > MAX_CHARS * 0.9
                    ? "text-warning"
                    : text.length > MAX_CHARS * 0.7
                      ? "text-text-secondary"
                      : "text-text-muted"
                }`}
              >
                {text.length}
              </span>
            </span>
          </div>
        </div>

        {/* 错误提示 */}
        <AnimatePresence>
          {error && (
            <motion.p
              className="mt-2 flex items-center gap-1.5 text-xs text-error"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <span>!</span>
              <span>{error}</span>
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ---- [深潜] 按钮 (Task 4.3) ---- */}
      <motion.button
        type="button"
        onClick={handleDeepDive}
        disabled={isSubmitting}
        className={`flow-sweep mt-6 rounded-lg px-10 py-3 font-heading text-sm font-bold tracking-wider text-white transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 ${
          pulseClick ? "animate-[pulse-click_0.4s_ease-out_forwards]" : ""
        }`}
        style={{
          background: "linear-gradient(135deg, rgba(0,240,255,0.85), rgba(180,77,255,0.85))",
          boxShadow: "0 0 10px rgba(0,240,255,0.2), 0 0 20px rgba(180,77,255,0.1)",
        }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        whileHover={{ scale: 1.02, boxShadow: "0 0 16px rgba(0,240,255,0.35), 0 0 30px rgba(180,77,255,0.2)" }}
        whileTap={{ scale: 0.98 }}
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            连接 Braindance…
          </span>
        ) : (
          "[ 深潜 ]"
        )}
      </motion.button>
    </motion.section>
  )
}
