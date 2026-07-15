/* ===== POST /api/reading — 流式占卜解读 ===== */
/*
 * 接收 { question, cards, apiKey? }
 * 返回 ReadableStream 流式解读
 *
 * 特性：
 * - AbortController 客户端断开时中止
 * - 自动重试最多 2 次，间隔 1s
 * - 超时 10s
 * - 全部失败 → 模板降级
 */

import { NextRequest } from "next/server"
import { createReadingStream } from "@/lib/deepseek"
import { getFallbackReading } from "@/lib/fallbackReadings"
import type { DrawnCard } from "@/types"

/* =================================================== */
/*  请求体类型                                          */
/* =================================================== */

interface ReadingRequest {
  question: string
  cards: DrawnCard[]
  apiKey?: string
}

/* =================================================== */
/*  SSE 编码辅助                                       */
/* =================================================== */

function encodeSSE(data: string): Uint8Array {
  return new TextEncoder().encode(`data: ${data}\n\n`)
}

/* =================================================== */
/*  延迟工具                                            */
/* =================================================== */

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/* =================================================== */
/*  POST 处理器                                        */
/* =================================================== */

export async function POST(request: NextRequest) {
  try {
    const body: ReadingRequest = await request.json()

    // ---- 参数校验 ----
    if (!body.cards || !Array.isArray(body.cards) || body.cards.length !== 3) {
      return new Response(JSON.stringify({ error: "需要提供三张卡牌数据" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const question = body.question || "（未指定问题）"
    const cards = body.cards

    // ---- 创建 AbortController（客户端断开时中止 DeepSeek 请求） ----
    const abortController = new AbortController()

    // 客户端断开时自动中止
    request.signal.addEventListener(
      "abort",
      () => {
        abortController.abort()
      },
      { once: true },
    )

    // ---- 尝试调用 DeepSeek API（最多 2 次重试） ----
    let lastError: Error | null = null
    let apiStream: ReadableStream<Uint8Array> | null = null

    for (let attempt = 0; attempt < 3; attempt++) {
      if (attempt > 0) {
        // 重试前等待 1s
        await delay(1000)
      }

      try {
        apiStream = await createReadingStream(question, cards, body.apiKey, abortController.signal)
        lastError = null
        break
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        // 被中止的请求不重试
        if (abortController.signal.aborted) break
        // 非网络错误（如参数错误）不重试
        if (lastError.message.includes("400") || lastError.message.includes("401") || lastError.message.includes("403")) {
          break
        }
      }
    }

    // ---- 构建响应流 ----
    const responseStream = new ReadableStream({
      async start(controller) {
        // ---- API 调用成功 — 流式转发 DeepSeek 响应 ----
        if (apiStream) {
          try {
            const reader = apiStream.getReader()
            const decoder = new TextDecoder()
            let buffer = ""

            while (true) {
              const { done, value } = await reader.read()
              if (done) break

              buffer += decoder.decode(value, { stream: true })

              // 解析 SSE 格式的 DeepSeek 响应
              const lines = buffer.split("\n")
              buffer = lines.pop() || "" // 保留未完成的行

              for (const line of lines) {
                const trimmed = line.trim()
                if (!trimmed || trimmed === "data: [DONE]") continue
                if (!trimmed.startsWith("data: ")) continue

                try {
                  const json = JSON.parse(trimmed.slice(6))
                  const content = json.choices?.[0]?.delta?.content
                  if (content) {
                    controller.enqueue(encodeSSE(JSON.stringify({ type: "chunk", content })))
                  }
                } catch {
                  // 跳过无法解析的 chunk
                }
              }
            }

            // 发送完成信号
            controller.enqueue(encodeSSE(JSON.stringify({ type: "done" })))
          } catch {
            // 流读取异常
            if (!abortController.signal.aborted) {
              // 放弃流式，使用模板降级
              const fallback = getFallbackReading(cards)
              controller.enqueue(encodeSSE(JSON.stringify({ type: "fallback", content: fallback })))
            }
          } finally {
            controller.close()
          }
          return
        }

        // ---- API 全部失败 — 模板降级 ----
        const fallback = getFallbackReading(cards)
        controller.enqueue(encodeSSE(JSON.stringify({ type: "fallback", content: fallback })))
        controller.enqueue(encodeSSE(JSON.stringify({ type: "done" })))
        controller.close()
      },

      cancel() {
        abortController.abort()
      },
    })

    return new Response(responseStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch {
    // JSON 解析失败等
    return new Response(JSON.stringify({ error: "请求解析失败" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }
}
