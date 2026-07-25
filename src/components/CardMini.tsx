"use client"

/* ===== CardMini — 解读区顶部迷你牌导航（美化方案 P0-C） ===== */
/*
 * 三张缩略图 + 位置名(过去/现在/未来):
 * - 点击 = 平滑滚动定位到对应解读段落 + 联动 3D 牌高亮(activePosition)
 * - 当前解读段落对应的迷你牌带青色光环(mini-card-active)
 * - 移动端横滑(scroll-x)
 */

import Image from "next/image"
import type { DrawnCard } from "@/types"

type Position = "past" | "present" | "future"

const POSITION_LABEL: Record<Position, string> = {
  past: "过去",
  present: "现在",
  future: "未来",
}

const POSITION_ORDER: Position[] = ["past", "present", "future"]

interface CardMiniNavProps {
  cards: DrawnCard[]
  activePosition: Position | null
  onSelect: (position: Position) => void
}

export function CardMiniNav({ cards, activePosition, onSelect }: CardMiniNavProps) {
  return (
    <nav
      aria-label="三张卡牌快速定位"
      className="flex items-center justify-start gap-4 overflow-x-auto px-4 pb-2 sm:justify-center"
    >
      {POSITION_ORDER.map((pos) => {
        const drawn = cards.find((c) => c.position === pos)
        if (!drawn) return null
        const isActive = activePosition === pos

        return (
          <button
            key={pos}
            type="button"
            onClick={() => onSelect(pos)}
            aria-current={isActive || undefined}
            aria-label={`定位到${POSITION_LABEL[pos]}的解读：${drawn.card.nameZh}${drawn.isReversed ? "（逆位）" : ""}`}
            className="group flex shrink-0 flex-col items-center gap-1.5"
          >
            <span
              className={
                "relative block h-20 w-[54px] overflow-hidden rounded-md border transition-all duration-300 " +
                (isActive
                  ? "mini-card-active border-neon-cyan/60"
                  : "border-card-border opacity-70 group-hover:opacity-100")
              }
            >
              <Image
                src={drawn.card.imagePath}
                alt=""
                fill
                sizes="54px"
                className={
                  "object-cover " + (drawn.isReversed ? "rotate-180" : "")
                }
              />
            </span>
            <span
              className={
                "font-subheading text-xs tracking-widest transition-colors " +
                (isActive ? "text-neon-cyan" : "text-text-muted group-hover:text-text-secondary")
              }
            >
              {POSITION_LABEL[pos]}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
