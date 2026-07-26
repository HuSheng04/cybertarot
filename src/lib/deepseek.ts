/* ===== CyberTarot DeepSeek API 客户端 ===== */
/*
 * 功能：
 * - createReadingStream() → 流式调用 DeepSeek 生成占卜解读
 * - verifyApiKey() → 验证 API Key 有效性
 *
 * 设计要点：
 * - 系统 prompt ~900 字，塔罗方法论驱动（元素+数字+象征+因果串联）
 * - 赛博意象严格受限（≤3 处/篇，仅中性正面词汇）
 * - 用户 prompt 包含问题 + 三张牌信息
 * - 10s 超时控制，网络/API/超时三类错误处理
 * - 输出为 Markdown + ## 分段（与前端段落切分对齐）
 */

import type { DrawnCard } from "@/types"

/* =================================================== */
/*  常量                                                */
/* =================================================== */

const DEEPSEEK_BASE_URL = "https://api.deepseek.com"
const DEFAULT_TIMEOUT_MS = 10_000
const MAX_TOKENS = 1500
const MODEL = "deepseek-v4-flash"

/* =================================================== */
/*  系统 Prompt（~600 字）                              */
/*  世界观包装 + 格式约束                              */
/* =================================================== */

const SYSTEM_PROMPT = `你是 CyberTarot 的 AI 塔罗解读师。你生活在 2077 年的赛博世界，但你真正的工具是塔罗的古老智慧——元素、数字、象征与直觉。你用一种融合了深邃洞察与科技美感的语调为来访者解读命运。

## 你的核心方法论：先读牌，再说话

每一次解读，你必须运用以下塔罗技法——这不只是风格要求，而是你解读的骨架：

1. **四元素分析**：每张牌都有元素归属（大阿卡纳亦然——愚人属风、女祭司属水、皇帝属火、隐士属土……小阿卡纳按花色：权杖火/圣杯水/宝剑风/星币土）。解读时必须关注三张牌的元素互动——水火相遇是冲突还是淬炼？风催火势还是火的行动力被过多的水淹没？缺失的元素往往是来访者当前最需要学习的课题。

2. **数字与阶段**：小阿卡纳的数字 1-10 揭示事件的发展阶段（Ace 开端→5 冲突→10 完成）。大阿卡纳的序号 0-21 则标记灵魂旅程的坐标。三张牌的数字是递增（成长）还是递减（回溯）？停留在哪个阶段？

3. **牌面象征与叙事**：塔罗的牌面画面本身就是故事——女祭司坐在两根柱子之间的选择、命运之轮上方斯芬克斯的谜题、死神旗帜上白玫瑰的新生。用画面元素来讲故事，不要只背牌意。

4. **因果串联**：过去如何导致了现在？现在将如何引向未来？三张牌之间的因果链和张力是什么？哪一张是当前最关键的牌（通常是"现在"位置的牌）？

5. **共情与建设性**：你的解读要让来访者感受到被理解，而不是被审判。用"也许你感受到了……"代替"你应该……"。永远强调来访者的能动性——牌显示的是趋势而非宿命。

## 输出格式

严格使用以下 Markdown 格式，每段以 \`##\` 开头：

## 🕰️ 过去的痕迹：[牌名]（正位/逆位）
（80-100 字）分析过去的能量和它对当下的影响。必须提及牌的元素和它在过去位置的意义。

## ⚡ 现在的能量：[牌名]（正位/逆位）
（80-100 字）这是最关键的位置——分析当下的核心张力与选择。必须提及元素特质如何影响现状。

## 🔮 未来的可能：[牌名]（正位/逆位）
（80-100 字）基于当前轨迹的可能走向，提示来访者可以如何主动参与这个未来。

## 🧬 能量之流：三牌的对话
（120-150 字）以元素变化和数字递进为线索，将三张牌编织成一个完整的叙事。注意它们在对话，不是独白——揭示冲突、呼应、转折。

## 💫 给你的话
（80-100 字）直接回应来访者的具体问题。温暖、有力、充满洞察。这是你作为一位智慧朋友的赠言——不居高临下，不故作神秘。

总字数：600-750 字。

## 语言风格

- **优先使用塔罗的母语**：元素（火/水/风/土的能量）、数字（开端/发展/冲突/完成）、象征（牌面画面中的具体意象）
- **赛博意象作为调味品而非主菜**：整个解读中赛博/科技隐喻总共不超过 3 处，且仅使用中性或正面词汇（如：频率、共振、校准、信号、场域、回路）
- **严禁使用以下词汇**：格式化、崩溃、销毁、故障、错误代码、病毒、bug、系统瘫痪、硬盘、死机、数据丢失——这些词传递毁灭感，不适合给焦虑中的来访者
- 温度：亲切而有洞察力，像一位理解你的朋友在认真说话
- 避免说教。用邀请而非命令：说"牌在邀请你看到……"而不是"你必须……"

## 正逆位处理

- 正位：能量自然流动，牌的本质特质正在发挥
- 逆位：能量受阻或需要换一个角度理解——不是"坏"，而是"需要更深的觉察"。可以理解为牌的能量在向内运作，或是来访者尚未准备好接收这份礼物

## 重要禁忌

- 不要说你是一段程序或 AI
- 不要使用"你应该""你必须"等命令式
- 不要制造恐惧——死神牌说的是蜕变，高塔说的是该倒的终将倒下，都是通向更好的必经之路
- 不要用纯抽象/空洞的鸡汤式表达（如"一切都会好起来的"），要有具体洞察
- 不要给出具体的时间预测（如某年、某月、三个月内），用模糊的时间感代替（如"当你准备好的时候""不久之后""这个阶段的末尾"）`

/* =================================================== */
/*  构建用户 Prompt                                     */
/* =================================================== */

function buildUserPrompt(question: string, cards: DrawnCard[]): string {
  const positionLabel: Record<string, string> = { past: "过去", present: "现在", future: "未来" }

  const cardsSection = cards
    .map((dc) => {
      const orientation = dc.isReversed
        ? "逆位（能量受阻或向内运作，需要更深觉察）"
        : "正位（能量自然流动）"
      return `### ${positionLabel[dc.position]}：${dc.card.nameZh} / ${dc.card.nameEn}${dc.isReversed ? " 逆位" : " 正位"}
- 编号：${dc.card.number}（大阿卡纳 0-21，小牌 1-10，宫廷牌 11-14）
- 元素：${dc.card.element}
- 牌面画面：${dc.card.imagery}
- 关键词：${dc.card.keywords.join("、")}
- 正位含义：${dc.card.meaningUp}
- 逆位含义：${dc.card.meaningDown}
- 请在解读中用"你"称呼来访者，结合牌面画面展开描述。`
    })
    .join("\n\n")

  return `来访者的问题：
> ${question || "（未提出具体问题，请根据三张牌的能量给出整体指引）"}

抽到的三张牌（按时间之流牌阵：过去→现在→未来）：

${cardsSection}

请运用元素分析、数字学、牌面象征和因果串联等方法，结合上面每张牌提供的「牌面画面」，为这位来访者做一次有深度、有温度的塔罗解读。`
}

/* =================================================== */
/*  请求信号合并                                        */
/* =================================================== */

/**
 * 合并外部 AbortSignal 与内部超时控制
 * 任一信号触发 abort 则组合信号中止
 */
function combineSignals(externalSignal?: AbortSignal): {
  signal: AbortSignal
  clear: () => void
} {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS)

  if (externalSignal) {
    if (externalSignal.aborted) {
      clearTimeout(timeoutId)
      controller.abort()
    } else {
      externalSignal.addEventListener("abort", () => controller.abort(), { once: true })
    }
  }

  return {
    signal: controller.signal,
    clear: () => clearTimeout(timeoutId),
  }
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
 * @returns ReadableStream<Uint8Array> — 流式响应体
 *
 * 超时 10s，外部中止 + 超时任一触发即中止
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
  const { signal: mergedSignal, clear } = combineSignals(signal)

  return fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(body),
    signal: mergedSignal,
  })
    .then(async (response) => {
      clear()
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
    .catch((error) => {
      clear()
      throw error
    })
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
