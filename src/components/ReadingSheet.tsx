"use client"

import { useState, useCallback, useEffect } from "react"
import { motion } from "motion/react"
import OracleGlyph from "@/components/icons/OracleGlyph"
import { ReadingStream } from "./ReadingStream"
import type { DrawnCard } from "@/types"

/* =================================================== */
/*  Hook: detects prefers-reduced-motion                */
/* =================================================== */

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    typeof window !== "undefined"
      ? window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false
      : false,
  )
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)")
    if (!mq) return
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])
  return reduced
}

/* =================================================== */
/*  Types                                               */
/* =================================================== */

interface ReadingSheetProps {
  cards: DrawnCard[]
  question: string
  apiKey?: string
  onReset?: () => void
  onComplete?: () => void
  /** 段落位置变化回调 — 传递到 ReadingStream */
  onActivePositionChange?: (position: 'past' | 'present' | 'future' | null) => void
}

/* =================================================== */
/*  Motion tokens                                       */
/* =================================================== */

const SHEET_SPRING_FULL = { type: "spring" as const, stiffness: 120, damping: 28, mass: 1.1 }
const SHEET_SPRING_NONE = { duration: 0 }
const EXPAND_TRANSITION = { duration: 0.25, ease: "easeInOut" as const }
const EXPAND_TRANSITION_NONE = { duration: 0 }

/* =================================================== */
/*  Component                                          */
/* =================================================== */

export function ReadingSheet({ cards, question, apiKey, onReset, onComplete, onActivePositionChange }: ReadingSheetProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [readState, setReadState] = useState<"streaming" | "completed">("streaming")
  const prefersReducedMotion = useReducedMotion()

  /* ---- callbacks ---- */
  const handleComplete = useCallback(() => {
    setReadState("completed")
    onComplete?.()
  }, [onComplete])

  const handleToggle = useCallback(() => {
    setIsExpanded((prev) => !prev)
  }, [])

  const handleReset = useCallback(() => {
    setIsExpanded(false)
    setReadState("streaming")
    onReset?.()
  }, [onReset])

  /* ---- state text ---- */
  const stateText = readState === "completed" ? "解读完成" : "正在连接神谕核心…"

  /* ---- motion config ---- */
  const sheetSpring = prefersReducedMotion ? SHEET_SPRING_NONE : SHEET_SPRING_FULL
  const expandSpring = prefersReducedMotion ? EXPAND_TRANSITION_NONE : EXPAND_TRANSITION

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 z-40"
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={sheetSpring}
    >
      {/* ---- Gradient background + scrollable container ---- */}
      <div
        className={
          "bg-gradient-to-t from-deep-space/85 from-20% via-deep-space/60 via-60% to-transparent to-100% backdrop-blur-sm pt-10"
          + (isExpanded ? " max-h-[75dvh] overflow-y-auto" : "")
        }
      >
        {/* ---- Handle bar ---- */}
        <div className="flex flex-col">
          <button
            type="button"
            onClick={handleToggle}
            className="flex w-full items-center justify-center py-1.5"
            aria-expanded={isExpanded}
            aria-label={isExpanded ? "收起解读" : "展开解读"}
          >
            <div className="h-1 w-12 rounded-full bg-text-muted/40 transition-colors hover:bg-text-muted/60" />
          </button>

          {/* ---- Header row ---- */}
          <div className="flex items-center justify-between px-4 pb-2">
            <div className="flex items-center gap-2">
              <OracleGlyph name="brand" size={16} className="shrink-0 text-neon-cyan" />
              <h2 className="font-heading text-sm tracking-wider text-neon-cyan">赛博占卜师的解读</h2>
              <span className="text-xs text-text-muted">{stateText}</span>
            </div>
            <button
              type="button"
              onClick={handleToggle}
              className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-card-hover"
              aria-label={isExpanded ? "收起解读" : "展开解读"}
            >
              <OracleGlyph name={isExpanded ? "collapse" : "expand"} size={16} className="text-text-secondary" />
            </button>
          </div>
        </div>

        {/* ---- Content area — animated height ---- */}
        <motion.div layout transition={expandSpring} className="mx-auto max-w-lg px-4 pb-8">
          <ReadingStream
            cards={cards}
            question={question}
            apiKey={apiKey}
            onReset={handleReset}
            onComplete={handleComplete}
            compact={!isExpanded}
            showHeader={false}
            showActions={isExpanded}
            onActivePositionChange={onActivePositionChange}
          />
        </motion.div>
      </div>
    </motion.div>
  )
}
