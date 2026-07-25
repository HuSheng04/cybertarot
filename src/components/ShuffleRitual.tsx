"use client"

/* ===== ShuffleRitual — 洗牌仪式（美化方案 P2-G / Q8） ===== */
/*
 * 把"查询结果"变成"抽牌仪式":
 *   聚 · 牌背堆叠居中   (0–250ms)
 *   洗 · 扇形洗牌       (250–1050ms, 800ms)
 *   抽 · 三张依次飞位   (1050–1650ms, 3×200ms stagger)
 *   启 · 溶解揭示       (1650–2300ms, 让位 3D 翻牌)
 * 纯 transform/opacity 驱动; reduced-motion 直接跳过(渲染 null)。
 */

import { useEffect, useState } from "react"
import Image from "next/image"
import { motion, useReducedMotion } from "motion/react"

type Stage = "stack" | "fan" | "fly" | "dissolve"

const STAGE_TIMING: [Stage, number][] = [
  ["fan", 250],
  ["fly", 1050],
  ["dissolve", 1650],
]

/* 扇形洗牌: 5 张牌背的角度/位移 */
const FAN = [
  { rotate: -22, x: -54, y: 8 },
  { rotate: -11, x: -27, y: -2 },
  { rotate: 0, x: 0, y: -6 },
  { rotate: 11, x: 27, y: -2 },
  { rotate: 22, x: 54, y: 8 },
]

/* 抽牌飞位: 过去/现在/未来 三个落点 */
const FLY = [
  { x: -170, y: 40, rotate: -4 },
  { x: 0, y: 40, rotate: 0 },
  { x: 170, y: 40, rotate: 4 },
]

export function ShuffleRitual() {
  const shouldReduceMotion = useReducedMotion()
  const [stage, setStage] = useState<Stage>("stack")

  useEffect(() => {
    const timers = STAGE_TIMING.map(([s, delay]) =>
      setTimeout(() => setStage(s), delay),
    )
    return () => timers.forEach(clearTimeout)
  }, [])

  /* reduced-motion: 不做持续仪式动画, 直接让位 3D 翻牌 */
  if (shouldReduceMotion) return null

  const dissolving = stage === "dissolve"

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center overflow-hidden"
      animate={{ opacity: dissolving ? 0 : 1 }}
      transition={{ duration: dissolving ? 0.65 : 0.3, ease: "easeInOut" }}
    >
      <div className="relative flex items-center justify-center" style={{ perspective: 800 }}>
        {FAN.map((fan, i) => {
          const isDrawn = i >= 1 && i <= 3 // 中间三张为被抽之牌
          const fly = FLY[i - 1]

          let target: { x: number; y: number; rotate: number; opacity: number }
          if (stage === "stack") {
            target = { x: 0, y: i * -1.5, rotate: 0, opacity: 1 }
          } else if (stage === "fan") {
            target = { ...fan, opacity: 1 }
          } else {
            // fly / dissolve: 中间三张飞位, 两侧牌退场
            target = isDrawn
              ? { ...fly, opacity: 1 }
              : { x: fan.x * 1.6, y: 120, rotate: fan.rotate * 1.5, opacity: 0 }
          }

          return (
            <motion.div
              key={i}
              className="absolute h-[168px] w-[112px] overflow-hidden rounded-lg border border-neon-purple/30 shadow-card"
              style={{ zIndex: 10 - Math.abs(i - 2) }}
              initial={{ x: 0, y: i * -1.5, rotate: 0, opacity: 1 }}
              animate={target}
              transition={{
                duration: stage === "fan" ? 0.8 : 0.6,
                ease: [0.22, 1, 0.36, 1],
                delay: stage === "fly" || stage === "dissolve" ? (isDrawn ? (i - 1) * 0.2 : 0) : 0,
              }}
            >
              <Image
                src="/assets/cards/card_back.webp"
                alt=""
                fill
                sizes="112px"
                className="object-cover"
                priority
              />
              {/* 抽中牌的青光描边 */}
              {isDrawn && (stage === "fly" || stage === "dissolve") && (
                <motion.div
                  className="absolute inset-0 rounded-lg border border-neon-cyan/70"
                  initial={{ opacity: 0, boxShadow: "0 0 0 rgba(0,240,255,0)" }}
                  animate={{
                    opacity: 1,
                    boxShadow: "0 0 18px rgba(0,240,255,0.45)",
                  }}
                  transition={{ delay: (i - 1) * 0.2 + 0.3, duration: 0.3 }}
                />
              )}
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
