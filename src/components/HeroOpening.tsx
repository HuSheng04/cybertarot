/**
 * HeroOpening — 影院级开场动画
 *
 * 时序（首次访问）:
 *   [800ms]  CYBERTAROT glitch 闪入 → 稳定发光
 *   [1500ms] 副标题 spring 弹入
 *   [2200ms] HUD 角括号 [ ] 出现
 *   [2800ms] 整体收缩淡出 → 进入正常交互
 *
 * 跳过逻辑:
 *   - 非首次访问 → 不渲染
 *   - 首次访问点击任意位置 → 立即跳过
 */
"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import { motion, AnimatePresence } from "motion/react"

interface HeroOpeningProps {
  isFirstVisit: boolean
  onComplete: () => void
}

type Phase =
  | "init"          // 纯黑背景
  | "title"         // 标题 glitch 入场
  | "subtitle"      // 副标题弹入
  | "brackets"      // HUD 角括号
  | "exiting"       // 收缩淡出
  | "done"          // 完成

export function HeroOpening({ isFirstVisit, onComplete }: HeroOpeningProps) {
  const [phase, setPhase] = useState<Phase>("init")
  const [glitchActive, setGlitchActive] = useState(false)
  const hasCompleted = useRef(false)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  /** 安全地设置多个超时并自动清理 */
  const setTimers = useCallback((...specs: [number, () => void][]) => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = specs.map(([delay, fn]) => setTimeout(fn, delay))
  }, [])

  /** 跳过开场 */
  const handleSkip = useCallback(() => {
    if (hasCompleted.current) return
    hasCompleted.current = true
    timersRef.current.forEach(clearTimeout)
    setPhase("done")
    onComplete()
  }, [onComplete])

  /** 开场时序主逻辑 */
  useEffect(() => {
    if (!isFirstVisit) {
      handleSkip()
      return
    }

    setTimers(
      [800, () => {
        setPhase("title")
        setGlitchActive(true)
        // glitch 持续约 300ms 后稳定
        setTimeout(() => setGlitchActive(false), 300)
      }],
      [1500, () => setPhase("subtitle")],
      [2200, () => setPhase("brackets")],
      [2800, () => {
        setPhase("exiting")
        // 等 exit 动画完成
        setTimeout(() => {
          if (!hasCompleted.current) {
            hasCompleted.current = true
            setPhase("done")
            onComplete()
          }
        }, 700)
      }],
    )

    return () => {
      timersRef.current.forEach(clearTimeout)
    }
  }, [isFirstVisit, setTimers, onComplete, handleSkip])

  if (!isFirstVisit) return null

  const isShowing = phase !== "done"

  return (
    <AnimatePresence>
      {isShowing && (
        <motion.div
          key="hero-opening"
          className="fixed inset-0 z-50 flex cursor-pointer select-none flex-col items-center justify-center bg-deep-space"
          initial={{ opacity: 1 }}
          animate={{ opacity: phase === "exiting" ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          onClick={handleSkip}
          aria-label="开场动画，点击跳过"
        >
          {/* ---- 跳过提示 ---- */}
          {phase !== "exiting" && (
            <motion.span
              className="absolute bottom-12 font-mono text-xs tracking-widest text-text-muted"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              [ 点击任意处跳过 ]
            </motion.span>
          )}

          {/* ---- 标题区域（含 glitch 效果） ---- */}
          {phase !== "init" && (
            <motion.div
              className="relative flex flex-col items-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              {/* 主标题 — 永远稳定显示（小屏 clamp 收缩防横向溢出） */}
              <h1
                className={`relative font-heading tracking-[0.15em] text-neon-cyan ${
                  glitchActive ? "" : "text-glow-cyan"
                }`}
                style={{ fontSize: "clamp(30px, 10vw, 96px)" }}
              >
                CYBERTAROT
              </h1>

              {/* Glitch 偏移层 1 — cyan */}
              <span
                aria-hidden
                className={`pointer-events-none absolute left-0 top-0 font-heading tracking-[0.15em] text-neon-cyan/80 ${
                  glitchActive ? "animate-glitch-slice-1" : "hidden"
                }`}
                style={{ fontSize: "clamp(30px, 10vw, 96px)" }}
              >
                CYBERTAROT
              </span>

              {/* Glitch 偏移层 2 — magenta */}
              <span
                aria-hidden
                className={`pointer-events-none absolute left-0 top-0 font-heading tracking-[0.15em] text-glitch ${
                  glitchActive ? "animate-glitch-slice-2" : "hidden"
                }`}
                style={{ color: "#ff00ff", fontSize: "clamp(30px, 10vw, 96px)" }}
              >
                CYBERTAROT
              </span>
            </motion.div>
          )}

          {/* ---- 副标题 spring 弹入 ---- */}
          <AnimatePresence>
            {phase === "subtitle" || phase === "brackets" || phase === "exiting" ? (
              <motion.p
                key="subtitle"
                className="mt-6 font-serif-cn text-xl tracking-[0.3em] text-text-secondary sm:text-2xl"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{
                  type: "spring",
                  stiffness: 180,
                  damping: 18,
                  mass: 0.8,
                }}
              >
                在数据的洪流中，寻找你的命运
              </motion.p>
            ) : null}
          </AnimatePresence>

          {/* ---- HUD 角括号 [  ] ---- */}
          <AnimatePresence>
            {(phase === "brackets" || phase === "exiting") && (
              <motion.div
                key="brackets"
                className="mt-10 flex items-center gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="font-heading text-2xl leading-none text-neon-cyan">[</span>
                <span className="h-px w-20 bg-gradient-to-r from-neon-cyan/40 to-transparent" />
                <span className="h-px w-20 bg-gradient-to-l from-neon-cyan/40 to-transparent" />
                <span className="font-heading text-2xl leading-none text-neon-cyan">]</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ---- 底部装饰线 ---- */}
          {phase !== "init" && phase !== "exiting" && (
            <motion.div
              className="absolute bottom-32 h-px w-40 bg-gradient-to-r from-transparent via-neon-cyan/20 to-transparent"
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 1.8, duration: 0.8 }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
