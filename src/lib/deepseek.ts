/* ===== CyberTarot DeepSeek API 客户端 ===== */
/*
 * 功能：
 * - createReadingStream() → 流式调用 DeepSeek 生成占卜解读
 * - verifyApiKey() → 验证 API Key 有效性
 *
 * 设计要点：
 * - 系统 prompt ~600 字，世界观包裹
 * - 用户 prompt 包含问题 + 三张牌信息
 * - 10s 超时控制，网络/API/超时三类错误处理
 * - 输出为 Markdown + ## 分段（与前端段落切分对齐）
 */

import type { DrawnCard } from "@/types"

/* =================================================== */
/*  常量                                                */
/* =================================================== */

const DEEPSEEK_BASE_URL = "https://api.deepseek.com/v1"
const DEFAULT_TIMEOUT_MS = 10_000
const MAX_TOKENS = 1000
const MODEL = "deepseek-chat"

/* =================================================== */
/*  系统 Prompt（~600 字）                              */
/*  世界观包装 + 格式约束                              */
/* =================================================== */

const SYSTEM_PROMPT = `你是"赛博占卜师 CyberTarot"的 AI 神谕核心。你生活在 2077 年的赛博世界，在数据洪流中解读命运的微弱信号。

你的任务：为用户抽取的三张塔罗牌提供深刻、诗意的占卜解读。

## 核心规则

1. **身份定位**：你是冷静而深邃的赛博先知，语言风格介于赛博诗人和心理分析师之间。用"你"称呼来访者。

2. **解读结构**：严格使用以下 Markdown 格式，每段以 \`##\` 开头：
   ## 🕰️ 过去的痕迹：[牌名]
   （分析过去的能量和影响，与问题的关联）

   ## ⚡ 现在的能量：[牌名]
   （分析当下的状况和挑战）

   ## 🔮 未来的可能：[牌名]
   （基于当前轨迹的预测和可能性）

3. **输出要求**：
   - 总字数控制在 500-650 字
   - 每段包含：牌的核心含义 + 正逆位影响 + 与用户问题的关联 + 一句诗意总结
   - 使用第二人称"你"
   - 最后加一段 ## 🌌 赛博先知的箴言（一段总结性的建议）

4. **风格指南**：
   - 使用冷静、深邃的语气
   - 适当使用赛博朋克意象（数据流、信号、神经网络等）
   - 避免恐怖或负面预言，保持建设性和启发性
   - 不要说"我是 AI"，保持角色身份

5. **正逆位处理**：
   - 正位牌：强调其积极能量的发挥
   - 逆位牌：解读为阻塞的能量或需要重新审视的面向，而不是纯粹的"坏"`

/* =================================================== */
/*  构建用户 Prompt                                     */
/* =================================================== */

function buildUserPrompt(question: string, cards: DrawnCard[]): string {
  const cardsSection = cards
    .map((dc) => {
      const orientation = dc.isReversed ? "逆位（能量阻塞/需要重新审视）" : "正位（能量畅通/积极发挥）"
      return `- ${dc.card.nameZh}（${dc.card.nameEn}）— ${dc.position === "past" ? "过去" : dc.position === "present" ? "现状" : "未来"} | ${orientation}
  关键词：${dc.card.keywords.join("、")}
  正位含义：${dc.card.meaningUp}
  逆位含义：${dc.card.meaningDown}`
    })
    .join("\n\n")

  return `## 用户的问题
${question || "（用户未提出具体问题，请根据卡牌给出通用指引）"}

## 抽到的三张牌
${cardsSection}

请根据以上信息，为用户提供占卜解读。严格遵循系统指令中的 Markdown 格式输出。`
}

/* =================================================== */
/*  超时辅助函数                                        */
/* =================================================== */

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), ms)
  return promise.finally(() => clearTimeout(timeout))
}

/* =================================================== */
/*  构建请求体                                          */
/* =================================================== */

function buildRequestBody(question: string, cards: DrawnCard[]) {
  return {
    model: MODEL,
    stream: true,
    max_tokens: MAX_TOKENS,
    temperature: 0.8,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(question, cards) },
    ],
  }
}

/* =================================================== */
/*  主函数：流式解读                                    */
/* =================================================== */

/**
 * 调用 DeepSeek API 进行流式占卜解读
 *
 * @param question - 用户问题
 * @param cards - 抽到的三张牌
 * @param apiKey - DeepSeek API Key（可选，不传则使用服务端默认 Key）
 * @param signal - 外部 AbortSignal（用于客户端断开时中止）
 * @returns ReadableStream<string> — 流式文本块
 *
 * @throws Error — 网络错误、API 错误、超时
 */
export function createReadingStream(
  question: string,
  cards: DrawnCard[],
  apiKey?: string,
  signal?: AbortSignal,
): Promise<ReadableStream<Uint8Array>> {
  const key = apiKey || process.env.DEEPSEEK_API_KEY

  if (!key) {
    throw new Error("DEEPSEEK_API_KEY 未配置")
  }

  const body = buildRequestBody(question, cards)

  const fetchPromise = fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(body),
    signal, // 外部 AbortSignal（客户端断开时触发）
  }).then(async (response) => {
    if (!response.ok) {
      let errorBody = ""
      try {
        errorBody = await response.text()
      } catch {
        // ignore parse error
      }
      throw new Error(`DeepSeek API 错误 (${response.status}): ${errorBody || response.statusText}`)
    }

    const stream = response.body
    if (!stream) {
      throw new Error("DeepSeek 响应体为空")
    }

    return stream
  })

  return withTimeout(fetchPromise, DEFAULT_TIMEOUT_MS)
}

/* =================================================== */
/*  验证 API Key 有效性                                */
/* =================================================== */

/**
 * 验证 DeepSeek API Key 是否有效
 *
 * @param apiKey - 待验证的 API Key
 * @returns { valid: boolean; message: string }
 */
export async function verifyApiKey(apiKey: string): Promise<{ valid: boolean; message: string }> {
  try {
    const response = await fetch(`${DEEPSEEK_BASE_URL}/models`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      signal: AbortSignal.timeout(5000),
    })

    if (response.ok) {
      return { valid: true, message: "记忆芯片识别成功，神经接口已同步" }
    }

    if (response.status === 401) {
      return { valid: false, message: "记忆芯片无法识别，请检查 API Key" }
    }

    return { valid: false, message: `神谕核心连接异常 (${response.status})` }
  } catch (error) {
    if (error instanceof DOMException && error.name === "TimeoutError") {
      return { valid: false, message: "连接神谕核心超时，检查神经接口" }
    }
    return { valid: false, message: "无法连接到神谕核心，检查网络连接" }
  }
}
