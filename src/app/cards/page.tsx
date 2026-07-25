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
import { motion, AnimatePresence, useMotionValue, useSpring } from "motion/react"
import Navbar from "@/components/Navbar"
import { BodyMode } from "@/components/BodyMode"
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

/* ---- 大阿卡纳罗马数字(0–XXI) — Cinzel 金标(D1) ---- */
const ROMAN_NUMERALS = [
  "0", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X",
  "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX", "XXI",
]

function majorRoman(id: string): string | null {
  if (!id.startsWith("major_")) return null
  const n = parseInt(id.slice(6), 10)
  return Number.isNaN(n) ? null : (ROMAN_NUMERALS[n] ?? null)
}

function CardItem({
  card,
  index,
  onSelect,
}: {
  card: Card
  index: number
  onSelect: () => void
}) {
  /* ---- 美化方案 P1-E · hover 3D 倾斜(≤4° 跟随指针) ---- */
  const rotateX = useMotionValue(0)
  const rotateY = useMotionValue(0)
  const springRX = useSpring(rotateX, { stiffness: 250, damping: 20 })
  const springRY = useSpring(rotateY, { stiffness: 250, damping: 20 })

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      if (e.pointerType === "touch") return
      const rect = e.currentTarget.getBoundingClientRect()
      const px = (e.clientX - rect.left) / rect.width - 0.5
      const py = (e.clientY - rect.top) / rect.height - 0.5
      rotateX.set(-py * 8) // ±4°
      rotateY.set(px * 8)
    },
    [rotateX, rotateY],
  )

  const handlePointerLeave = useCallback(() => {
    rotateX.set(0)
    rotateY.set(0)
  }, [rotateX, rotateY])

  const roman = majorRoman(card.id)

  return (
    <motion.button
      type="button"
      layout
      /* ---- 全息投影卡片基础样式 ---- */
      className="group w-full cursor-pointer rounded-xl border border-card-border
                 bg-card-surface/40 shadow-card transition-shadow duration-300
                 hover:border-neon-cyan/30 hover:bg-card-hover/40
                 hover:shadow-card-glow text-left [perspective:600px]"
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
      /* ---- hover spring 上浮 + 3D 倾斜 ---- */
      whileHover={{ y: -4, transition: springSnappy }}
      whileTap={{ scale: 0.98 }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onClick={onSelect}
      aria-label={`${card.nameZh} (${card.nameEn}) — 查看详情`}
    >
      <motion.div
        style={{ rotateX: springRX, rotateY: springRY, transformStyle: "preserve-3d" }}
        className="w-full"
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
        {/* 大阿卡纳 Cinzel 罗马数字金标(D1) */}
        {roman && (
          <span className="absolute left-1.5 top-1.5 z-10 rounded border border-moonlight-gold/30 bg-deep-space/70 px-1.5 py-0.5 font-cinzel text-xs tracking-widest text-moonlight-gold backdrop-blur-sm sm:text-[10px]">
            {roman}
          </span>
        )}
        {/* 全息反光扫过 */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div className="absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 ease-out -translate-x-full group-hover:translate-x-[400%]" />
        </div>
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
        <p className="mt-0.5 truncate font-cinzel text-xs text-text-muted sm:text-[10px]">{card.nameEn}</p>
        <p className="mt-0.5 truncate text-xs text-neon-cyan/60 sm:text-[10px]">
          {card.keywords.join(" · ")}
        </p>
      </div>
      </motion.div>
    </motion.button>
  )
}

/* =================================================== */
/*  页面                                                */
/* =================================================== */

export default function CardsPage() {
  const [activeFilter, setActiveFilter] = useState<"all" | Suit>("all")
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [query, setQuery] = useState("")

  /* ---- 筛选逻辑（花色 Tab + 搜索关键词） ---- */
  const filteredCards = useMemo(() => {
    let list = activeFilter === "all" ? CARDS : CARDS.filter((c) => c.suit === activeFilter)
    const q = query.trim()
    if (q) {
      const ql = q.toLowerCase()
      list = list.filter(
        (c) =>
          c.nameZh.includes(q) ||
          c.nameEn.toLowerCase().includes(ql) ||
          c.keywords.some((k) => k.includes(q)),
      )
    }
    return list
  }, [activeFilter, query])

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
      <BodyMode mode="subpage-mode" />
      <Navbar />
      <main className="mx-auto flex max-w-5xl flex-1 flex-col px-4 pt-24 pb-16">
        {/* 美化方案 P1-E · 页头: 衬线大标题 + 档案小字 + 搜索 */}
        <section className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-serif-cn text-3xl font-bold tracking-[0.2em] text-neon-cyan">
              牌库
            </h1>
            <p className="mt-2 font-subheading text-sm tracking-wide text-text-secondary">
              {TOTAL_CARDS} 张遗物卡牌档案 · 点击查看详情
            </p>
          </div>
          <label className="relative block">
            <span className="sr-only">搜索卡牌</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索牌名 / 关键词…"
              className="w-56 rounded-lg border border-card-border bg-card-surface/50 px-3.5 py-2.5 font-subheading text-base text-text-primary placeholder:text-text-muted focus:border-neon-cyan/60 focus:shadow-neon-cyan/20 focus:outline-none transition-all duration-200 sm:text-sm"
            />
          </label>
        </section>

        {/* ---- 筛选标签 · 符文胶囊 + layoutId 滑动发光指示器 ---- */}
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
                className={`relative overflow-hidden rounded-full border px-4 py-2.5 min-h-[44px] font-subheading text-xs tracking-widest transition-colors duration-200 ${
                  isActive
                    ? "border-neon-cyan/70 bg-neon-cyan/10 text-neon-cyan shadow-[0_0_12px_rgba(0,240,255,0.25)]"
                    : "border-card-border text-text-secondary hover:border-neon-cyan/30 hover:text-text-primary"
                }`}
              >
                {tab.label}
                {/* 滑动发光指示器 — layoutId 跨标签平滑过渡 */}
                {isActive && (
                  <motion.div
                    layoutId="active-tab"
                    className="absolute -bottom-0.5 left-3 right-3 h-0.5 rounded-full bg-neon-cyan shadow-[0_0_8px_#00f0ff]"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>
            )
          })}
        </div>

        {/* 统计 */}
        <p className="mb-4 font-mono text-xs text-text-muted sm:text-[10px]">
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
            <p className="text-sm text-text-muted">
              {query.trim() ? `没有找到与「${query.trim()}」相关的卡牌` : "没有匹配的卡牌"}
            </p>
          </div>
        )}
      </main>

      {/* ---- 卡牌详情模态框 ---- */}
      <CardDetailModal card={selectedCard} onClose={handleClose} />
    </>
  )
}
