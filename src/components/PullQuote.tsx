"use client"

/* ===== PullQuote — 解读诗意引文卡（美化方案 P0-C） ===== */
/*
 * 从 LLM 输出中自动提取 **加粗句** 渲染为引文卡:
 *   衬线(Noto Serif SC) + 居中 + 两侧月光金饰线(D1)
 * 非加粗内容保持常规阅读排版。
 */

import { memo } from "react"

/** 将段落文本按 **bold** 切分为 引文 / 正文 片段 */
export function splitBoldSegments(text: string): { quote: boolean; text: string }[] {
  const segments: { quote: boolean; text: string }[] = []
  const re = /\*\*([^*]+)\*\*/g
  let last = 0
  let m: RegExpExecArray | null

  while ((m = re.exec(text)) !== null) {
    const before = text.slice(last, m.index).trim()
    if (before) segments.push({ quote: false, text: before })
    const quote = m[1].trim()
    if (quote) segments.push({ quote: true, text: quote })
    last = m.index + m[0].length
  }
  const rest = text.slice(last).trim()
  if (rest) segments.push({ quote: false, text: rest })

  // 无加粗句时整体作为正文
  if (segments.length === 0 && text.trim()) {
    segments.push({ quote: false, text: text.trim() })
  }
  return segments
}

export const PullQuote = memo(function PullQuote({ text }: { text: string }) {
  return (
    <blockquote className="pull-quote my-5 text-base leading-relaxed sm:text-lg">
      {text}
    </blockquote>
  )
})
