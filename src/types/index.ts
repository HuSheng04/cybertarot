/* ===== CyberTarot 核心类型定义 ===== */

/** 花色枚举 */
export enum Suit {
  Major = "major",
  Wands = "wands",
  Cups = "cups",
  Swords = "swords",
  Pentacles = "pentacles",
}

/** 单张卡牌数据 */
export interface Card {
  id: string // e.g. "major_00", "wands_01"
  nameZh: string
  nameEn: string
  suit: Suit
  keywords: string[]
  meaningUp: string
  meaningDown: string
  imagePath: string // e.g. "/assets/cards/major_00.webp"
}

/** 已抽卡牌（含位置与正逆位） */
export interface DrawnCard {
  card: Card
  isReversed: boolean
  position: "past" | "present" | "future"
}

/** 占卜流程阶段 */
export type Phase =
  | "braindance"
  | "input"
  | "shuffling"
  | "drawing"
  | "reading"
  | "done"
  | "error"
