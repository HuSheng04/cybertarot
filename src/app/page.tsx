"use client"

/* ===== CyberTarot 主页 — 全屏模式布局重构 ===== */
/*
 * Phase 1 布局重构要点：
 * - 交互内容（Braindance / QuestionInput / Error）在 Panel 内
 * - 3D Canvas 在 shuffling 阶段扩张到 fixed inset-0 全屏
 * - 解读 Overlay 固定在底部，浮在 Canvas 之上
 * - 1s spring 全屏过渡
 */

import dynamic from "next/dynamic"
import { Suspense, useEffect, useCallback, useState } from "react"
import { motion, AnimatePresence, useReducedMotion } from "motion/react"
import Navbar from "@/components/Navbar"
import { Panel } from "@/components/Panel"
import { CardSkeleton } from "@/components/CardSkeleton"
import { R3FErrorBoundary } from "@/components/R3FErrorBoundary"
import { BraindancePortal } from "@/components/BraindancePortal"
import { QuestionInput } from "@/components/QuestionInput"
import { ReadingSheet } from "@/components/ReadingSheet"
import { DemoTrigger } from "@/components/DemoTrigger"
import { useTarot } from "@/components/TarotProvider"
import { useFirstVisit } from "@/lib/useFirstVisit"
import { HeroOpening } from "@/components/HeroOpening"
import { SacredGeometry } from "@/components/SacredGeometry"
import { ShuffleRitual } from "@/components/ShuffleRitual"
import { springGentle, springSmooth } from "@/lib/motionTokens"

/* ---- 3D 翻牌桌：SSR 禁用 + 懒加载 ---- */
const TarotTable3D = dynamic(() => import("@/components/TarotTable3D"), {
  ssr: false,
  loading: () => <CardSkeleton />,
})

/* 洗牌三段式文案（美化方案 P2-G） */
const RITUAL_STEPS = ["洗牌", "切牌", "抽牌"] as const

/* ===== 发牌→揭示 时序常量（与 ShuffleRitual / CardMesh 对齐） =====
 * ShuffleRitual: 堆叠 0-250 → 扇形 250-1050 → 飞位 1050-2050(末张落位) → 溶解 1650-2300
 * CardMesh 揭示: stagger 0/600/1200 + DISSOLVE_DURATION 1200 → 全部揭示需 2400
 * 顺序保证: 发牌完整结束 → 才放行 3D 揭示 → 揭示完整结束 → 才进入 reading
 */
const REVEAL_DELAY = 2050 // 发牌仪式末张落位时刻（ms）
const REVEAL_TOTAL = 2400 // 3D 三张牌全部揭示完毕所需（ms）
const READING_BUFFER = 300 // 揭示完成到解读开场的气口（ms）

export default function HomePage() {
  const { state, finishFlip, finishReading, reset, clearError } = useTarot()
  const { phase, question, cards, apiKey, error, shouldFlip } = state

  /* ---- 开场动画状态 ---- */
  const { isFirstVisit, isReady, markVisited } = useFirstVisit()
  const [introComplete, setIntroComplete] = useState(false)

  const handleIntroComplete = useCallback(() => {
    setIntroComplete(true)
    markVisited()
  }, [markVisited])

  /* ---- 发牌→揭示 时序闸门 ----
   * reduced-motion 下 ShuffleRitual 不渲染，揭示无需等待仪式，立即放行 */
  const shouldReduceMotion = useReducedMotion()
  const [revealReady, setRevealReady] = useState(false)
  const [progressFading, setProgressFading] = useState(false)

  /* ---- 发牌完成后才放行揭示；揭示完成后才进入解读 ---- */
  useEffect(() => {
    if (phase !== "shuffling" || !shouldFlip) return

    const revealAt = shouldReduceMotion ? 0 : REVEAL_DELAY
    const timers = [
      // 发牌仪式末张落位 → 放行 3D 揭示 + 淡出进度文字
      setTimeout(() => {
        setRevealReady(true)
        setProgressFading(true)
      }, revealAt),
      // 三张牌全部揭示完毕 + 气口 → 进入解读
      setTimeout(() => {
        finishFlip()
      }, revealAt + REVEAL_TOTAL + READING_BUFFER),
    ]
    return () => {
      timers.forEach(clearTimeout)
      setRevealReady(false)
      setProgressFading(false)
    }
  }, [phase, shouldFlip, shouldReduceMotion, finishFlip])

  /* ---- 洗牌三段式文案: 洗牌 → 切牌 → 抽牌（美化方案 P2-G） ---- */
  const [ritualStep, setRitualStep] = useState(0)
  useEffect(() => {
    if (phase !== "shuffling") return
    // i=0 的 0ms 定时器同时承担"重置为第 0 步"职责，避免 effect 内同步 setState
    const timers = RITUAL_STEPS.map((_, i) =>
      setTimeout(() => setRitualStep(i), i * 750),
    )
    return () => timers.forEach(clearTimeout)
  }, [phase])

  /* ---- 翻牌进度文字显隐 ---- */
  const [showFlipDelayed, setShowFlipDelayed] = useState(false)
  useEffect(() => {
    if (phase === "shuffling" && !shouldFlip) {
      const timer = setTimeout(() => setShowFlipDelayed(true), 200)
      return () => {
        clearTimeout(timer)
        setShowFlipDelayed(false)
      }
    }
  }, [phase, shouldFlip])

  const showFlipProgress = phase === "shuffling" && (shouldFlip || showFlipDelayed)

  /* ---- 全局快捷键 ---- */
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && phase === "reading") {
        window.dispatchEvent(new CustomEvent("tarot-cancel-reading"))
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [phase])

  /* ---- 活动卡牌位置（从阅读段落到 3D 桌面的桥梁）---- */
  const [activePosition, setActivePosition] = useState<'past' | 'present' | 'future' | null>(null)

  const handleActivePositionChange = useCallback(
    (pos: 'past' | 'present' | 'future' | null) => {
      setActivePosition(pos)
    },
    [],
  )

  /* ---- 再来一次 ---- */
  const handleReset = useCallback(() => {
    setActivePosition(null)
    reset()
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [reset])

  /* ---- 错误状态重试 ---- */
  const handleRetry = useCallback(() => {
    clearError()
  }, [clearError])

  /* ---- 背景模式：intro / meditation / fullscreen 切换 ---- */
  useEffect(() => {
    const isIntro = isReady && isFirstVisit && !introComplete
    const isMeditation = phase === "input"
    const isFullscreen = phase === "shuffling" || phase === "reading" || phase === "done"

    if (isIntro) {
      document.body.classList.add("intro-mode")
      document.body.classList.remove("meditation-mode", "fullscreen-mode")
    } else if (isFullscreen) {
      document.body.classList.remove("intro-mode", "meditation-mode")
      document.body.classList.add("fullscreen-mode")
    } else if (isMeditation) {
      document.body.classList.remove("intro-mode", "fullscreen-mode")
      document.body.classList.add("meditation-mode")
    } else {
      document.body.classList.remove("intro-mode", "meditation-mode", "fullscreen-mode")
    }

    return () => {
      document.body.classList.remove("intro-mode", "meditation-mode", "fullscreen-mode")
    }
  }, [phase, isReady, isFirstVisit, introComplete])

  /* ---- 判断当前哪些区域应该显示 ---- */
  const showBraindance = phase === "braindance"
  const showInput = phase === "input"
  const showTable3D = phase !== "braindance" && phase !== "input"
  const showReading = phase === "reading" || phase === "done"
  const showError = phase === "error"

  return (
    <>
      {/* ---- 开场动画（影院级覆盖层）---- */}
      {isReady && (
        <HeroOpening
          isFirstVisit={isFirstVisit}
          onComplete={handleIntroComplete}
        />
      )}

      {/* ---- Demo 模式触发（无 UI）---- */}
      <Suspense fallback={null}>
        <DemoTrigger />
      </Suspense>

      <Navbar isFullscreen={showTable3D} />

      {/* =============================== */}
      {/*  主内容区（仅非全屏阶段可见）    */}
      {/* =============================== */}
      <main className="relative flex min-h-0 flex-1 flex-col items-center px-4 pt-14">
        {/* ---- Hero + Panel 整体垂直居中容器 ---- */}
        <div className="flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-6">

        {/* ---- 英雄区 ---- */}
        <motion.section
          className="relative z-10 flex flex-col items-center gap-4 overflow-hidden pt-8 text-center"
          initial={!isFirstVisit || introComplete ? { opacity: 0, y: 20 } : false}
          animate={
            !isFirstVisit || introComplete
              ? { opacity: 1, y: 0 }
              : { opacity: 0 }
          }
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* 美化方案 P1-D · 神圣几何(六芒星圆阵) — 第一眼建立"神秘×科技" */}
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.06]"
            style={{ width: "min(520px, 92vw)", height: "min(520px, 92vw)" }}
          >
            <SacredGeometry variant="hexagram" size={520} className="h-full w-full text-moonlight-gold" />
          </div>
          {/* 美化方案 P0-A · Hero 混排：拉丁眉题 + 中文衬线大标题 */}
          <span className="font-heading text-xs tracking-[0.5em] text-neon-cyan/70">
            CYBER TAROT 2077
          </span>
          <h1
            className="font-serif-cn font-bold text-neon-cyan"
            style={{
              fontSize: "clamp(44px, 8vw, 84px)",
              letterSpacing: "0.12em",
              lineHeight: 1.15,
            }}
          >
            赛博占卜师
          </h1>
          <p className="font-serif-cn text-lg tracking-[0.3em] text-text-secondary">
            在数据的洪流中，寻找你的命运
          </p>
          <p className="text-sm text-text-muted">
            2077 年，赛博先知为你抽取三张遗物卡牌，
            <br />
            解读过去的痕迹、现在的能量和未来的可能。
          </p>
        </motion.section>

        {/* ---- 阶段内容区域（占满剩余空间，Panel 垂直居中）---- */}
        <div className="flex w-full flex-1 flex-col items-center justify-center">
          <AnimatePresence mode="wait">
          {/* Braindance 接入 — exit: scale 0.95 + opacity 0, 200ms (Task 3.5) */}
          {showBraindance && (
            <Panel
              key="braindance"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2, ease: "easeIn" } }}
              transition={springSmooth}
              className="z-10"
            >
              <BraindancePortal />
            </Panel>
          )}

          {/* 问题输入 — enter delay 0.5s (200ms exit + 300ms pause) (Task 3.5) */}
          {showInput && (
            <Panel
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ ...springSmooth, delay: 0.5 }}
              className="z-10"
            >
              <QuestionInput />
            </Panel>
          )}

          {/* 错误状态 */}
          {showError && (
            <Panel
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={springSmooth}
              className="z-10"
            >
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="w-full rounded-xl border border-error/30 bg-error/5 px-6 py-5">
                  <p className="mb-1 font-subheading text-sm text-error">系统异常</p>
                  <p className="text-sm text-text-secondary">{error || "未知错误"}</p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="rounded-lg bg-neon-cyan px-6 py-2.5 font-heading text-sm font-bold tracking-wider text-deep-space shadow-neon-cyan transition-all duration-200 hover:shadow-neon-cyan/50"
                  >
                    [ 重新连接 ]
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="rounded-lg border border-card-border px-5 py-2.5 font-subheading text-sm tracking-wide text-text-secondary transition-all duration-200 hover:border-error/50 hover:text-error"
                  >
                    返回首页
                  </button>
                </div>
              </div>
            </Panel>
          )}
          </AnimatePresence>
        </div>
        </div>
      </main>

      {/* =============================== */}
      {/*  3D 翻牌桌 — 全屏模式           */}
      {/*  （shuffling / reading / done）  */}
      {/* =============================== */}
      <AnimatePresence>
        {showTable3D && (
          <motion.div
            key="canvas-fullscreen"
            className="fixed inset-0 z-30 bg-deep-space"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={springGentle}
          >
            {/* ---- 翻牌进度文字（Task 5.3）---- */}
            <AnimatePresence>
              {showFlipProgress && (
                <motion.div
                  className="absolute top-8 left-0 right-0 z-40 flex flex-col items-center"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{
                    opacity: progressFading ? 0 : 1,
                    y: progressFading ? -10 : 0,
                  }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.5 }}
                >
                  <p className="font-serif-cn text-sm tracking-[0.4em] text-neon-cyan">
                    {RITUAL_STEPS[ritualStep]}
                  </p>
                  {/* 不确定进度脉冲条 — cyan→purple 渐变 */}
                  <div className="mt-3 h-[2px] w-48 overflow-hidden rounded-full bg-card-border">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple"
                      animate={{
                        x: ["-100%", "400%"],
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 1.5,
                        ease: "easeInOut",
                      }}
                      style={{ width: "30%" }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 美化方案 P2-G · 洗牌仪式: 堆叠→扇形洗牌→飞位→溶解 */}
            {phase === "shuffling" && <ShuffleRitual />}

            <R3FErrorBoundary>
              <Suspense fallback={<CardSkeleton />}>
                <TarotTable3D
                  cards={cards.length > 0 ? cards : undefined}
                  isShuffling={phase === "shuffling"}
                  shouldFlip={shouldFlip && revealReady}
                  lowPerformance={false}
                  activePosition={activePosition}
                />
              </Suspense>
            </R3FErrorBoundary>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =============================== */}
      {/*  解读 Overlay — ReadingSheet     */}
      {/*  （reading / done）             */}
      {/* =============================== */}
      <AnimatePresence>
        {showReading && cards.length > 0 && (
          <ReadingSheet
            key="reading-sheet"
            cards={cards}
            question={question || "命运之问"}
            apiKey={apiKey || undefined}
            onReset={handleReset}
            onComplete={finishReading}
            onActivePositionChange={handleActivePositionChange}
          />
        )}
      </AnimatePresence>
    </>
  )
}
