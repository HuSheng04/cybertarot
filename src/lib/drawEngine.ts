/* ===== CyberTarot 抽牌引擎 ===== */
/*
 * 流程：Fisher-Yates 洗牌 → 取前 3 张 → 正逆位判定 → 位置分配
 * - 问题文本作为随机种子，确保同一问题结果一致
 * - 正位概率 ~70%，逆位 ~30%
 */

import type { Card, DrawnCard } from "@/types"
import { CARDS } from "@/data/cards"

/* =================================================== */
/*  种子随机数生成器（mulberry32）                       */
/*  基于问题文本的哈希种子，保证可复现性               */
/* =================================================== */

/** 将字符串哈希为 32 位整数种子 */
function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i)
    hash = ((hash << 5) - hash + chr) | 0
  }
  // 确保非负（但 mulberry32 可接受任意 32 位整数）
  return hash >>> 0
}

/** mulberry32 伪随机数生成器 — 返回 [0, 1) */
function mulberry32(seed: number): () => number {
  let state = seed | 0
  return function (): number {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/* =================================================== */
/*  Fisher-Yates 洗牌                                   */
/*  原地洗牌，返回浅拷贝后的新数组                      */
/* =================================================== */

function fisherYatesShuffle<T>(arr: readonly T[], rand: () => number): T[] {
  const result = [...arr] // 浅拷贝，不修改原数组（immutable）
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    // 交换
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/* =================================================== */
/*  正逆位判定                                          */
/*  70% 正位 / 30% 逆位                                */
/* =================================================== */

function determineReversed(rand: () => number): boolean {
  return rand() < 0.3 // 30% 概率逆位
}

/* =================================================== */
/*  主函数                                              */
/* =================================================== */

/**
 * 抽取三张塔罗牌并分配过去/现在/未来位置
 *
 * @param question - 用户提出的问题（用于种子生成）
 * @param seedOverride - 可选的种子覆盖值（用于测试/演示）
 * @returns DrawnCard[] — 长度为 3 的数组
 *
 * 可复现性说明：
 * - 默认以问题文本为种子，同一问题始终返回相同结果
 * - 无问题（空字符串）时使用 Date.now() + 随机因子，每次不同
 * - 测试时可传入 seedOverride 固定种子
 */
export function drawCards(question: string, seedOverride?: number): DrawnCard[] {
  // ---- 1. 确定种子 ----
  let seed: number
  if (seedOverride !== undefined) {
    seed = seedOverride
  } else if (question.trim().length > 0) {
    seed = hashString(question.trim())
  } else {
    // 无问题时使用毫秒时间戳 + 随机因子，保证每次不同
    seed = (Date.now() + Math.floor(Math.random() * 999999)) >>> 0
  }

  const rand = mulberry32(seed)

  // ---- 2. Fisher-Yates 洗牌（78 张） ----
  const shuffled = fisherYatesShuffle(CARDS, rand)

  // ---- 3. 取前 3 张 ----
  const rawCards: Card[] = shuffled.slice(0, 3)

  // ---- 4. 分配正逆位 ----
  const reversedFlags = rawCards.map(() => determineReversed(rand))

  // ---- 5. 分配位置 ----
  const positions: DrawnCard["position"][] = ["past", "present", "future"]

  const drawnCards: DrawnCard[] = rawCards.map((card, index) => ({
    card,
    isReversed: reversedFlags[index],
    position: positions[index],
  }))

  return drawnCards
}

/**
 * 抽取指定数量的卡牌（通用版本，不限定 3 张）
 * 用于需要更多牌的变体占卜
 */
export function drawNCards(question: string, count: number, seedOverride?: number): DrawnCard[] {
  let seed: number
  if (seedOverride !== undefined) {
    seed = seedOverride
  } else if (question.trim().length > 0) {
    seed = hashString(question.trim())
  } else {
    seed = (Date.now() + Math.floor(Math.random() * 999999)) >>> 0
  }

  const rand = mulberry32(seed)
  const shuffled = fisherYatesShuffle(CARDS, rand)
  const rawCards = shuffled.slice(0, count)
  const reversedFlags = rawCards.map(() => determineReversed(rand))
  const basePositions: DrawnCard["position"][] = ["past", "present", "future"]
  const extraCount = Math.max(0, count - 3)
  const extraPositions: "present"[] = Array(extraCount).fill("present")
  const positions = [...basePositions.slice(0, count), ...extraPositions]

  return rawCards.map((card, index) => ({
    card,
    isReversed: reversedFlags[index],
    position: positions[index] ?? "present",
  }))
}
