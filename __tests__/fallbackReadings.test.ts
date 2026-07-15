/* ===== 模板降级解读单元测试 ===== */

import { getFallbackReading } from "@/lib/fallbackReadings"
import type { DrawnCard } from "@/types"
import { CARDS } from "@/data/cards"

/* ============================================================ */
/*  测试辅助数据                                                  */
/* ============================================================ */

function makeCards(...ids: string[]): DrawnCard[] {
  return ids.map((id, i) => {
    const card = CARDS.find((c) => c.id === id)
    if (!card) throw new Error(`Card not found: ${id}`)
    return {
      card,
      isReversed: false,
      position: (i === 0 ? "past" : i === 1 ? "present" : "future") as "past" | "present" | "future",
    }
  })
}

/* ============================================================ */
/*  基础验证                                                      */
/* ============================================================ */

describe("getFallbackReading", () => {
  test("返回字符串且不为空", () => {
    const cards = makeCards("major_00", "major_01", "major_02")
    const result = getFallbackReading(cards)
    expect(typeof result).toBe("string")
    expect(result.length).toBeGreaterThan(0)
  })

  test("包含 Markdown 标题 ##", () => {
    const cards = makeCards("major_10", "major_11", "major_12")
    const result = getFallbackReading(cards)
    expect(result).toContain("## ")
  })

  test("包含四个段落标题", () => {
    const cards = makeCards("wands_01", "cups_01", "swords_01")
    const result = getFallbackReading(cards)
    const headings = result.match(/^## /gm)
    expect(headings).toHaveLength(4)
  })

  test("包含过去的痕迹、现在的能量、未来的可能、赛博先知的箴言", () => {
    const cards = makeCards("pentacles_01", "pentacles_02", "pentacles_03")
    const result = getFallbackReading(cards)
    expect(result).toContain("过去的痕迹")
    expect(result).toContain("现在的能量")
    expect(result).toContain("未来的可能")
    expect(result).toContain("赛博先知的箴言")
  })

  test("不同的卡牌组合可能返回不同的模板", () => {
    // 验证哈希分发有效：多组不同卡牌返回不同模板
    const set1 = getFallbackReading(makeCards("major_00", "major_01", "major_02"))
    const set2 = getFallbackReading(makeCards("major_10", "major_11", "major_12"))
    const set3 = getFallbackReading(makeCards("wands_01", "cups_05", "swords_10"))
    const set4 = getFallbackReading(makeCards("major_20", "pentacles_14", "cups_07"))

    const unique = new Set([set1, set2, set3, set4])
    // 5 套模板中，4 组不同输入很可能覆盖至少 2 套不同模板
    expect(unique.size).toBeGreaterThanOrEqual(2)
  })

  test("相同卡牌组合返回相同模板（确定性）", () => {
    const cards = makeCards("major_05", "major_06", "major_07")
    const first = getFallbackReading(cards)
    const second = getFallbackReading(cards)
    expect(first).toBe(second)
  })

  test("正逆位不影响模板选择（只依靠卡牌 ID 哈希）", () => {
    const cards1 = makeCards("major_00", "major_01", "major_02")
    const cards2 = makeCards("major_00", "major_01", "major_02").map((dc) => ({
      ...dc,
      isReversed: true,
    }))

    const result1 = getFallbackReading(cards1)
    const result2 = getFallbackReading(cards2)
    expect(result1).toBe(result2)
  })
})

/* ============================================================ */
/*  模板内容完整性                                                 */
/* ============================================================ */

describe("模板内容质量", () => {
  test("所有模板不包含「降级」字样（用户无感）", () => {
    // 遍历所有模板：取 5 组不同卡牌哈希覆盖所有模板
    const seen = new Set<string>()
    for (let i = 0; i < 78; i += 3) {
      const ids = [
        CARDS[i % 78].id,
        CARDS[(i + 1) % 78].id,
        CARDS[(i + 2) % 78].id,
      ]
      const result = getFallbackReading(makeCards(...ids))
      if (seen.has(result)) continue
      seen.add(result)
      expect(result).not.toContain("降级")
      expect(result).not.toContain("fallback")
      expect(result).not.toContain("备用")
    }
    // 确保覆盖了全部 5 套模板
    expect(seen.size).toBe(5)
  })

  test("所有模板字数在合理范围（300-800 字）", () => {
    const seen = new Set<string>()
    for (let i = 0; i < 78; i += 3) {
      const ids = [
        CARDS[i % 78].id,
        CARDS[(i + 1) % 78].id,
        CARDS[(i + 2) % 78].id,
      ]
      const result = getFallbackReading(makeCards(...ids))
      if (seen.has(result)) continue
      seen.add(result)
      // 去掉标题装饰符号计算纯字数
      const plain = result.replace(/[#*\n`]/g, "")
      expect(plain.length).toBeGreaterThanOrEqual(300)
      expect(plain.length).toBeLessThanOrEqual(800)
    }
  })

  test("所有模板使用第二人称「你」", () => {
    const seen = new Set<string>()
    for (let i = 0; i < 78; i += 3) {
      const ids = [
        CARDS[i % 78].id,
        CARDS[(i + 1) % 78].id,
        CARDS[(i + 2) % 78].id,
      ]
      const result = getFallbackReading(makeCards(...ids))
      if (seen.has(result)) continue
      seen.add(result)
      expect(result).toContain("你")
    }
  })
})
