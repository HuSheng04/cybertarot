"use client"

/* ===== CardDetailModal — 卡牌详情模态框 ===== */
/*
 * 可访问的模态对话框组件：
 * - role="dialog" + aria-modal="true"
 * - Escape / 背景点击 / X 按钮关闭
 * - focus 管理（打开时 focus 到容器，关闭时恢复）
 * - Motion fade+scale 入场/出场动画
 */

import { useEffect, useRef, useCallback } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "motion/react"
import type { Card } from "@/types"
import { Suit } from "@/types"
import OracleGlyph from "@/components/icons/OracleGlyph"

/* ---- 花色与编号辅助 ---- */

const SUIT_LABELS: Record<Suit, string> = {
  [Suit.Major]: "大阿卡纳",
  [Suit.Wands]: "权杖",
  [Suit.Cups]: "圣杯",
  [Suit.Swords]: "宝剑",
  [Suit.Pentacles]: "星币",
}

/** 从 card.id 提取编号（如 "major_00" → "0"） */
function extractNumber(id: string): string {
  const parts = id.split("_")
  const num = parts[parts.length - 1]
  // Strip leading zero for cleaner display
  return String(Number.parseInt(num, 10))
}

/* =================================================== */
/*  Props                                               */
/* =================================================== */

type Props = {
  card: Card | null
  onClose: () => void
}

/* =================================================== */
/*  组件                                                */
/* =================================================== */

export function CardDetailModal({ card, onClose }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  /* ---- Escape 关闭 ---- */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    },
    [onClose],
  )

  /* ---- 背景点击关闭（仅点击遮罩本身） ---- */
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose()
      }
    },
    [onClose],
  )

  /* ---- Focus 管理 ---- */
  useEffect(() => {
    if (card) {
      previousFocusRef.current = document.activeElement as HTMLElement
      // Small delay to let the portal/mount settle
      requestAnimationFrame(() => {
        dialogRef.current?.focus()
      })
    }

    return () => {
      // Restore focus on unmount/close
      previousFocusRef.current?.focus()
    }
  }, [card])

  /* ---- 阻止 body 滚动 ---- */
  useEffect(() => {
    if (card) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
  }, [card])

  if (!card) return null

  const cardNumber = extractNumber(card.id)
  const suitLabel = SUIT_LABELS[card.suit]

  return (
    <AnimatePresence>
      {card && (
        <motion.div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={`${card.nameZh} (${card.nameEn}) — 卡牌详情`}
          tabIndex={-1}
          className="modal-backdrop flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onKeyDown={handleKeyDown}
          onClick={handleBackdropClick}
        >
          {/* ---- 对话框面板 · 美化方案 P1-E: 左图右文双栏(移动端堆叠) ---- */}
          <motion.div
            className="relative mx-auto max-h-[85dvh] w-full max-w-2xl overflow-y-auto rounded-xl border border-card-border bg-card-surface shadow-card"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ---- 关闭按钮 ---- */}
            <button
              type="button"
              onClick={onClose}
              aria-label="关闭"
              className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-lg border border-card-border bg-deep-space/80 text-text-secondary transition-colors hover:border-neon-cyan/50 hover:text-neon-cyan"
            >
              <OracleGlyph name="close" size={18} />
            </button>

            <div className="flex flex-col sm:flex-row">
              {/* ---- 左栏: 卡牌图片 ---- */}
              <div className="relative aspect-[3/4] w-full shrink-0 overflow-hidden sm:w-2/5">
                <Image
                  src={card.imagePath}
                  alt={`${card.nameZh} (${card.nameEn})`}
                  fill
                  sizes="(max-width: 640px) 100vw, 320px"
                  className="object-cover"
                  priority
                />
                {/* 底部渐变遮罩 — 移动端堆叠时自然过渡 */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-card-surface to-transparent sm:hidden" />
              </div>

              {/* ---- 右栏: 卡牌信息 ---- */}
              <div className="space-y-4 px-5 pb-6 pt-4 sm:w-3/5 sm:pt-6">
                {/* 牌名 + Cinzel 编号 */}
                <div>
                  <h2 className="font-serif-cn text-xl font-semibold tracking-wider text-neon-cyan">
                    {card.nameZh}
                  </h2>
                  <p className="mt-0.5 font-cinzel text-sm uppercase tracking-[0.2em] text-text-secondary">
                    {card.nameEn}
                  </p>
                  <p className="mt-0.5 font-cinzel text-xs tracking-widest text-text-muted">
                    {suitLabel} ·{" "}
                    <span className={card.suit === Suit.Major ? "text-moonlight-gold" : undefined}>
                      #{cardNumber}
                    </span>
                  </p>
                </div>

                {/* 关键词胶囊云 */}
                <div className="flex flex-wrap gap-1.5">
                  {card.keywords.map((kw) => (
                    <span
                      key={kw}
                      className="rounded-full border border-neon-cyan/25 bg-neon-cyan/5 px-2.5 py-1 font-subheading text-xs tracking-wide text-text-secondary"
                    >
                      {kw}
                    </span>
                  ))}
                </div>

                {/* 正位释义 — cyan 左边线 */}
                <div className="border-l-2 border-neon-cyan/60 pl-3">
                  <h3 className="mb-1 flex items-center gap-1.5 font-subheading text-sm font-semibold tracking-wide text-success">
                    <span aria-hidden="true">▲</span>
                    <span>正位</span>
                  </h3>
                  <p className="text-sm leading-relaxed text-text-primary">
                    {card.meaningUp}
                  </p>
                </div>

                {/* 逆位释义 — red 左边线 */}
                <div className="border-l-2 border-error/60 pl-3">
                  <h3 className="mb-1 flex items-center gap-1.5 font-subheading text-sm font-semibold tracking-wide text-error">
                    <span aria-hidden="true">▼</span>
                    <span>逆位</span>
                  </h3>
                  <p className="text-sm leading-relaxed text-text-primary">
                    {card.meaningDown}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
