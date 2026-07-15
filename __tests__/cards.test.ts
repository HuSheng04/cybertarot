import { CARDS, getCardById, getCardsBySuit, TOTAL_CARDS } from "@/data/cards"
import { Suit } from "@/types"

/* ============================================================ */
/*  78 张塔罗牌数据验证                                         */
/* ============================================================ */

describe("Cards 数据完整性", () => {
  test("应有 78 张牌", () => {
    expect(CARDS).toHaveLength(TOTAL_CARDS)
    expect(CARDS).toHaveLength(78)
  })

  test("所有牌 ID 唯一", () => {
    const ids = CARDS.map((c) => c.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })

  test("所有牌必填字段完整", () => {
    for (const card of CARDS) {
      expect(card.id).toBeTruthy()
      expect(card.nameZh).toBeTruthy()
      expect(card.nameEn).toBeTruthy()
      expect(card.suit).toBeDefined()
      expect(card.keywords).toBeInstanceOf(Array)
      expect(card.keywords.length).toBeGreaterThanOrEqual(2)
      expect(card.meaningUp).toBeTruthy()
      expect(card.meaningDown).toBeTruthy()
    }
  })

  test("所有牌 ID 格式正确 (major_00 / wands_01)", () => {
    const idPattern = /^(major|wands|cups|swords|pentacles)_\d{2}$/
    for (const card of CARDS) {
      expect(card.id).toMatch(idPattern)
    }
  })
})

describe("Cards 花色分组", () => {
  test("大阿卡纳共 22 张", () => {
    const major = getCardsBySuit(Suit.Major)
    expect(major).toHaveLength(22)
  })

  test("权杖共 14 张", () => {
    const wands = getCardsBySuit(Suit.Wands)
    expect(wands).toHaveLength(14)
  })

  test("圣杯共 14 张", () => {
    const cups = getCardsBySuit(Suit.Cups)
    expect(cups).toHaveLength(14)
  })

  test("宝剑共 14 张", () => {
    const swords = getCardsBySuit(Suit.Swords)
    expect(swords).toHaveLength(14)
  })

  test("星币共 14 张", () => {
    const pentacles = getCardsBySuit(Suit.Pentacles)
    expect(pentacles).toHaveLength(14)
  })

  test("花色分组之和等于 78", () => {
    const allSuits = [
      getCardsBySuit(Suit.Major),
      getCardsBySuit(Suit.Wands),
      getCardsBySuit(Suit.Cups),
      getCardsBySuit(Suit.Swords),
      getCardsBySuit(Suit.Pentacles),
    ]
    const total = allSuits.reduce((sum, group) => sum + group.length, 0)
    expect(total).toBe(78)
  })

  test("每个花色内的 ID 前缀与花色匹配", () => {
    const suitPrefixMap: Record<Suit, string> = {
      [Suit.Major]: "major",
      [Suit.Wands]: "wands",
      [Suit.Cups]: "cups",
      [Suit.Swords]: "swords",
      [Suit.Pentacles]: "pentacles",
    }

    for (const [suit, prefix] of Object.entries(suitPrefixMap)) {
      const cards = getCardsBySuit(suit as Suit)
      for (const card of cards) {
        expect(card.id.startsWith(prefix)).toBe(true)
      }
    }
  })
})

describe("Cards 辅助函数", () => {
  test("getCardById 返回正确牌张", () => {
    const fool = getCardById("major_00")
    expect(fool).toBeDefined()
    expect(fool?.nameZh).toBe("愚人")
    expect(fool?.nameEn).toBe("The Fool")
  })

  test("getCardById 对不存在的 ID 返回 undefined", () => {
    const result = getCardById("nonexistent")
    expect(result).toBeUndefined()
  })

  test("每张牌的 keywords 数组非空且有具体内容", () => {
    for (const card of CARDS) {
      expect(card.keywords.length).toBeGreaterThanOrEqual(2)
      for (const kw of card.keywords) {
        expect(typeof kw).toBe("string")
        expect(kw.length).toBeGreaterThan(0)
      }
    }
  })

  test("每张牌的 meaningUp 和 meaningDown 长度合理", () => {
    for (const card of CARDS) {
      expect(card.meaningUp.length).toBeGreaterThanOrEqual(10)
      expect(card.meaningDown.length).toBeGreaterThanOrEqual(10)
    }
  })
})
