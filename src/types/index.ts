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
  /** 四元素归属 */
  element: "火" | "水" | "风" | "土"
  /** 塔罗编号：大阿卡纳 0-21，小阿卡纳数字牌 1-10，宫廷牌按 Page/Knight/Queen/King 为 11-14 */
  number: number
  /** RWS 牌面的关键视觉元素描述 */
  imagery: string
}
