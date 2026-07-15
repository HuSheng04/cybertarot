import { drawCards, drawNCards } from "@/lib/drawEngine"
import { CARDS } from "@/data/cards"

/* ============================================================ */
/*  抽牌引擎测试                                                */
/*  使用 seedOverride 保证确定性                                  */
/* ============================================================ */

/** 固定种子供测试使用 */
const TEST_SEED = 42

describe("drawCards 基本功能", () => {
  test("应返回 3 张牌", () => {
    const result = drawCards("测试问题", TEST_SEED)
    expect(result).toHaveLength(3)
  })

  test("返回结果应包含 card / isReversed / position 三个字段", () => {
    const result = drawCards("测试问题", TEST_SEED)
    for (const drawn of result) {
      expect(drawn).toHaveProperty("card")
      expect(drawn).toHaveProperty("isReversed")
      expect(drawn).toHaveProperty("position")
    }
  })

  test("位置应依次为 past / present / future", () => {
    const result = drawCards("测试问题", TEST_SEED)
    expect(result[0].position).toBe("past")
    expect(result[1].position).toBe("present")
    expect(result[2].position).toBe("future")
  })

  test("单次抽牌中三张不重复", () => {
    const result = drawCards("测试问题", TEST_SEED)
    const ids = result.map((d) => d.card.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(3)
  })

  test("同一问题 + 同一种子应返回相同结果（可复现性）", () => {
    const result1 = drawCards("我最近的事业运如何？", TEST_SEED)
    const result2 = drawCards("我最近的事业运如何？", TEST_SEED)
    expect(result1).toEqual(result2)
  })

  test("默认种子（无问题）应每次不同", () => {
    const result1 = drawCards("")
    const result2 = drawCards("")
    // 空字符串使用 Date.now()，理论上极小概率相同
    const ids1 = result1.map((d) => d.card.id + d.isReversed)
    const ids2 = result2.map((d) => d.card.id + d.isReversed)
    expect(ids1).not.toEqual(ids2)
  })

  test("不同问题应产生不同结果", () => {
    const resultA = drawCards("我最近的事业运如何？", 123)
    const resultB = drawCards("我的感情生活如何？", 456)
    const idsA = resultA.map((d) => d.card.id)
    const idsB = resultB.map((d) => d.card.id)
    // 极大概率不同
    expect(idsA).not.toEqual(idsB)
  })
})

describe("drawCards 牌面数据完整性", () => {
  test("返回的每张牌都应存在于 CARDS 中", () => {
    const result = drawCards("测试", TEST_SEED)
    for (const drawn of result) {
      const found = CARDS.find((c: { id: string }) => c.id === drawn.card.id)
      expect(found).toBeDefined()
    }
  })

  test("三次抽牌在多次调用中应覆盖全部 78 张", () => {
    const seen = new Set<string>()
    const ITERATIONS = 200 // 200 × 3 = 600 张抽取，理论全覆盖

    for (let i = 0; i < ITERATIONS; i++) {
      const result = drawCards(`运行第 ${i} 次`, i)
      for (const drawn of result) {
        seen.add(drawn.card.id)
      }
    }

    // 78 张都应被抽到过
    expect(seen.size).toBe(78)
  })

  test("正位概率应在 60-80% 范围内（大数验证）", () => {
    let uprightCount = 0
    const total = 3000 // 3000 次 × 3 张 = 9000 张

    for (let i = 0; i < total; i++) {
      const result = drawCards(`概率测试 ${i}`, i)
      for (const drawn of result) {
        if (!drawn.isReversed) uprightCount++
      }
    }

    const totalCards = total * 3
    const uprightRate = uprightCount / totalCards
    expect(uprightRate).toBeGreaterThanOrEqual(0.6)
    expect(uprightRate).toBeLessThanOrEqual(0.8)
  })
})

describe("drawCards 边缘情况", () => {
  test("特殊字符问题应正常处理", () => {
    const result = drawCards("！@#¥%……&*（）——+【】{}|：“”《》？", TEST_SEED)
    expect(result).toHaveLength(3)
    for (const drawn of result) {
      expect(drawn.card).toBeDefined()
    }
  })

  test("超长问题应正常处理（1000 字）", () => {
    const longQuestion = "我".repeat(1000)
    const result = drawCards(longQuestion, TEST_SEED)
    expect(result).toHaveLength(3)
  })

  test("纯空格问题应视为空字符串处理", () => {
    const result1 = drawCards("   ", TEST_SEED)
    const result2 = drawCards("", TEST_SEED)
    // 纯空格被 trim 成空字符串，不同种子应不同
    // 但由于都用 seedOverride，结果应该相同
    expect(result1).toEqual(result2)
  })

  test("seedOverride = 0 应正常工作", () => {
    const result = drawCards("测试", 0)
    expect(result).toHaveLength(3)
  })
})

describe("drawCards 连续多次调用的分布合理性", () => {
  test("连续 3 次调用不应完全一样", () => {
    const r1 = drawCards("事业", 1)
    const r2 = drawCards("事业", 2)
    const r3 = drawCards("事业", 3)

    const ids1 = r1.map((d) => d.card.id).join(",")
    const ids2 = r2.map((d) => d.card.id).join(",")
    const ids3 = r3.map((d) => d.card.id).join(",")

    // 三个种子应产生三个不同的结果
    const allSame = ids1 === ids2 && ids2 === ids3
    expect(allSame).toBe(false)
  })

  test("多次抽牌中各花色应大致均匀分布", () => {
    const suitCount: Record<string, number> = {}
    const total = 500

    for (let i = 0; i < total; i++) {
      const result = drawCards(`花色分布 ${i}`, i)
      for (const drawn of result) {
        const suit = drawn.card.suit
        suitCount[suit] = (suitCount[suit] ?? 0) + 1
      }
    }

    // 5 个花色，期望各占 ~20%，允许 ±8% 波动
    const totalCards = total * 3
    for (const suit of ["major", "wands", "cups", "swords", "pentacles"]) {
      const rate = (suitCount[suit] ?? 0) / totalCards
      expect(rate).toBeGreaterThanOrEqual(0.12)
      expect(rate).toBeLessThanOrEqual(0.28)
    }
  })
})

describe("drawNCards 通用版本", () => {
  test("应返回指定数量的牌", () => {
    const result = drawNCards("测试", 5, TEST_SEED)
    expect(result).toHaveLength(5)
  })

  test("参数 count = 1 应返回 1 张", () => {
    const result = drawNCards("测试", 1, TEST_SEED)
    expect(result).toHaveLength(1)
  })

  test("参数 count = 78 应全部不重复", () => {
    const result = drawNCards("测试", 78, TEST_SEED)
    const ids = result.map((d) => d.card.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(78)
  })

  test("同一问题 + 种子，drawCards 与 drawNCards(3) 结果一致", () => {
    const r1 = drawCards("确定性问题", 999)
    const r2 = drawNCards("确定性问题", 3, 999)
    expect(r1).toEqual(r2)
  })
})
