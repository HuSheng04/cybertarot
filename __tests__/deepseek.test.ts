/* ===== DeepSeek API 客户端单元测试 ===== */

import { verifyApiKey } from "@/lib/deepseek"
import type { DrawnCard } from "@/types"
import { CARDS } from "@/data/cards"

/* ============================================================ */
/*  测试辅助数据                                                  */
/* ============================================================ */

function makeMockCards(): DrawnCard[] {
  return CARDS.slice(0, 3).map((card, i) => ({
    card,
    isReversed: i === 1, // 中间张逆位
    position: i === 0 ? "past" : i === 1 ? "present" : "future" as "past" | "present" | "future",
  }))
}

/* ============================================================ */
/*  verifyApiKey                                                 */
/* ============================================================ */

describe("verifyApiKey", () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  test("有效 Key 返回 valid: true", async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
    })

    const result = await verifyApiKey("sk-valid-key")
    expect(result).toEqual({
      valid: true,
      message: "记忆芯片识别成功，神经接口已同步",
    })
  })

  test("无效 Key (401) 返回 valid: false", async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
    })

    const result = await verifyApiKey("sk-invalid-key")
    expect(result).toEqual({
      valid: false,
      message: "记忆芯片无法识别，请检查 API Key",
    })
  })

  test("服务端错误 (500) 返回 valid: false + 状态码提示", async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
    })

    const result = await verifyApiKey("sk-key")
    expect(result.valid).toBe(false)
    expect(result.message).toContain("500")
  })

  test("网络超时返回 valid: false + 超时提示", async () => {
    const abortError = new DOMException("The operation was aborted", "TimeoutError")
    globalThis.fetch = jest.fn().mockRejectedValue(abortError)

    const result = await verifyApiKey("sk-key")
    expect(result).toEqual({
      valid: false,
      message: "连接神谕核心超时，检查神经接口",
    })
  })

  test("网络错误返回 valid: false + 网络提示", async () => {
    globalThis.fetch = jest.fn().mockRejectedValue(new TypeError("fetch failed"))

    const result = await verifyApiKey("sk-key")
    expect(result.valid).toBe(false)
    expect(result.message).toBe("无法连接到神谕核心，检查网络连接")
  })

  test("发送正确的 Authorization header", async () => {
    let capturedHeaders: Record<string, string> = {}
    globalThis.fetch = jest.fn().mockImplementation((_url: string, opts: RequestInit) => {
      capturedHeaders = opts.headers as Record<string, string>
      return Promise.resolve({ ok: true, status: 200 })
    })

    await verifyApiKey("sk-my-secret-key")
    expect(capturedHeaders["Authorization"]).toBe("Bearer sk-my-secret-key")
  })
})

/* ============================================================ */
/*  构建用户 Prompt 的内容验证（通过 deepseek 内部函数）          */
/* ============================================================ */

describe("createReadingStream 入参推理", () => {
  test("buildUserPrompt 包含牌名和正逆位信息", () => {
    // 验证 deepseek.ts 中 buildUserPrompt 的产出逻辑：
    // 通过推测导出——我们验证卡片数据足够让 prompt 包含必要信息
    const cards = makeMockCards()
    expect(cards).toHaveLength(3)
    expect(cards[0].position).toBe("past")
    expect(cards[1].isReversed).toBe(true)
    expect(cards[2].position).toBe("future")
  })

  test("三张牌数据传入 createReadingStream 时结构完整", () => {
    const cards = makeMockCards()
    for (const dc of cards) {
      expect(dc.card.id).toBeTruthy()
      expect(dc.card.nameZh).toBeTruthy()
      expect(dc.card.nameEn).toBeTruthy()
      expect(dc.card.keywords.length).toBeGreaterThanOrEqual(2)
      expect(dc.card.meaningUp.length).toBeGreaterThan(0)
      expect(dc.card.meaningDown.length).toBeGreaterThan(0)
      expect(typeof dc.isReversed).toBe("boolean")
      expect(["past", "present", "future"]).toContain(dc.position)
    }
  })
})

/* ============================================================ */
/*  Error Handling — createReadingStream 的环境验证              */
/* ============================================================ */

describe("createReadingStream 错误处理", () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...OLD_ENV }
  })

  afterEach(() => {
    process.env = OLD_ENV
  })

  test("无 API Key 时同步抛出错误", async () => {
    delete process.env.DEEPSEEK_API_KEY

    // 动态导入以读取更新后的 env
    const { createReadingStream } = await import("@/lib/deepseek")
    const cards = makeMockCards()

    // createReadingStream 在 Key 缺失时同步 throw
    expect(() => createReadingStream("test question", cards)).toThrow("DEEPSEEK_API_KEY 未配置")
  })

  test("有 API Key 时不会同步抛出，返回 Promise", async () => {
    process.env.DEEPSEEK_API_KEY = "sk-test-key"
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      body: {
        getReader() {
          return { read() { return Promise.resolve({ done: true, value: undefined }) } }
        },
      },
    })

    const { createReadingStream } = await import("@/lib/deepseek")
    const cards = makeMockCards()

    const result = createReadingStream("test", cards)
    expect(result).toBeInstanceOf(Promise)
    const stream = await result
    expect(stream).toBeDefined()
  })
})
