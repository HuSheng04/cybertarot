"use client"

/* ===== /cards — 牌库百科页面 ===== */
/*
 * 78 张塔罗牌全量展示：
 * - 网格布局，缩略图
 * - 按花色筛选（带滑动霓虹条指示器）
 * - 全息投影卡片效果
 * - 点击弹出模态框查看详情（正逆位释义）
 */

import { useState, useMemo, useCallback } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "motion/react"
import Navbar from "@/components/Navbar"
import { CardDetailModal } from "@/components/CardDetailModal"
import { CARDS, TOTAL_CARDS } from "@/data/cards"
import { Suit } from "@/types"
import type { Card } from "@/types"
import { springSnappy } from "@/lib/motionTokens"

/* =================================================== */
/*  筛选标签                                            */
/* =================================================== */

const FILTER_TABS: { key: "all" | Suit; label: string }[] = [
  { key: "all", label: "全部" },
  { key: Suit.Major, label: "大阿卡纳" },
  { key: Suit.Wands, label: "权杖" },
  { key: Suit.Cups, label: "圣杯" },
  { key: Suit.Swords, label: "宝剑" },
  { key: Suit.Pentacles, label: "星币" },
]

/* =================================================== */
/*  CardItem — 单张卡牌卡片（全息投影效果）            */
/* =================================================== */

function CardItem({
  card,
  index,
  onSelect,
}: {
  card: Card
  index: number
  onSelect: () => void
}) {
  return (
    <motion.button
      type="button"
      layout
      /* ---- 全息投影卡片基础样式 ---- */
      className="group w-full cursor-pointer rounded-xl border border-card-border
                 bg-card-surface/40 shadow-card transition-shadow duration-300
                 hover:border-neon-cyan/30 hover:bg-card-hover/40
                 hover:shadow-card-glow text-left"
      /* ---- stagger spring 入场 ---- */
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      /* ---- 筛选切换 exit 动画 ---- */
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 25,
        delay: index * 0.03,
      }}
      /* ---- hover spring 上浮 ---- */
      whileHover={{ y: -4, transition: springSnappy }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      aria-label={`${card.nameZh} (${card.nameEn}) — 查看详情`}
    >
      {/* 缩略图区域 */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-t-xl">
        <Image
          src={card.imagePath}
          alt={`${card.nameZh} (${card.nameEn})`}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {/* 悬浮时的查看详情提示 */}
        <div className="absolute inset-0 flex items-center justify-center bg-deep-space/0 opacity-0 transition-all duration-200 group-hover:bg-deep-space/60 group-hover:opacity-100">
          <span className="rounded-lg border border-neon-cyan/50 px-3 py-1 font-mono text-xs text-neon-cyan backdrop-blur-sm">
            [ 查看详情 ]
          </span>
        </div>
      </div>

      {/* 牌名区 */}
      <div className="p-2.5 text-center">
        <p className="truncate text-xs font-semibold text-text-primary">{card.nameZh}</p>
        <p className="mt-0.5 truncate text-[10px] text-text-muted">{card.nameEn}</p>
        <p className="mt-0.5 truncate text-[10px] text-neon-cyan/60">
          {card.keywords.join(" · ")}
        </p>
      </div>
    </motion.button>
  )
}

/* =================================================== */
/*  页面                                                */
/* =================================================== */

export default function CardsPage() {
  const [activeFilter, setActiveFilter] = useState<"all" | Suit>("all")
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)

  /* ---- 筛选逻辑 ---- */
  const filteredCards = useMemo(
    () => (activeFilter === "all" ? CARDS : CARDS.filter((c) => c.suit === activeFilter)),
    [activeFilter],
  )

  /* ---- 选择卡牌（打开模态框） ---- */
  const handleSelect = useCallback((card: Card) => {
    setSelectedCard(card)
  }, [])

  /* ---- 关闭模态框 ---- */
  const handleClose = useCallback(() => {
    setSelectedCard(null)
  }, [])

  return (
    <>
      <Navbar />
      <main className="mx-auto flex max-w-5xl flex-1 flex-col px-4 pt-24 pb-16">
        {/* 标题 */}
        <section className="mb-6">
          <h1 className="font-heading text-3xl tracking-wider text-neon-cyan">
            ══ 牌库 ══
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            全部 {TOTAL_CARDS} 张遗物卡牌，点击查看详情
          </p>
        </section>

        {/* ---- 筛选标签 + 滑动霓虹条指示器 ---- */}
        <div className="mb-6 flex flex-wrap gap-2">
          {FILTER_TABS.map((tab) => {
            const isActive = activeFilter === tab.key
            return (
              <motion.button
                key={tab.key}
                type="button"
                onClick={() => {
                  setActiveFilter(tab.key)
                  setSelectedCard(null)
                }}
                className={`relative rounded-lg border px-3.5 py-2.5 min-h-[44px] font-subheading text-xs tracking-wide transition-colors duration-200 ${
                  isActive
                    ? "border-neon-cyan bg-neon-cyan/10 text-neon-cyan"
                    : "border-card-border text-text-secondary hover:border-card-hover hover:text-text-primary"
                }`}
              >
                {tab.label}
                {/* 滑动霓虹条指示器 — layoutId 跨标签平滑过渡 */}
                {isActive && (
                  <motion.div
                    layoutId="active-tab"
                    className="absolute -bottom-0.5 left-2 right-2 h-0.5 rounded-full bg-neon-cyan"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>
            )
          })}
        </div>

        {/* 统计 */}
        <p className="mb-4 font-mono text-[10px] text-text-muted">
          显示 {filteredCards.length} / {TOTAL_CARDS} 张
        </p>

        {/* ---- 网格 + AnimatePresence 切换动效 ---- */}
        <motion.div
          layout
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
        >
          <AnimatePresence mode="popLayout">
            {filteredCards.map((card, index) => (
              <CardItem
                key={card.id}
                card={card}
                index={index}
                onSelect={() => handleSelect(card)}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {/* 空状态 */}
        {filteredCards.length === 0 && (
          <div className="flex flex-1 items-center justify-center py-20">
            <p className="text-sm text-text-muted">没有匹配的卡牌</p>
          </div>
        )}
      </main>

      {/* ---- 卡牌详情模态框 ---- */}
      <CardDetailModal card={selectedCard} onClose={handleClose} />
    </>
  )
}
