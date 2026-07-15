/* ===== POST /api/verify-key — 验证 DeepSeek API Key ===== */
/*
 * 接收 { key }
 * 调用 DeepSeek 模型列表接口验证
 * 返回 { valid: boolean, message: string }
 */

import { NextRequest, NextResponse } from "next/server"
import { verifyApiKey } from "@/lib/deepseek"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { key } = body

    if (!key || typeof key !== "string" || key.trim().length === 0) {
      return NextResponse.json(
        { valid: false, message: "请插入记忆芯片" },
        { status: 400 },
      )
    }

    const result = await verifyApiKey(key.trim())
    return NextResponse.json(result)
  } catch {
    return NextResponse.json(
      { valid: false, message: "神谕核心连接异常" },
      { status: 500 },
    )
  }
}
