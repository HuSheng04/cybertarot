import type { Metadata } from "next"
import AboutContent from "./AboutContent"

export const metadata: Metadata = {
  title: "关于 — CyberTarot 赛博占卜师",
  description:
    "了解 CyberTarot 的技術架構、設計理念與開發故事。Next.js + R3F + DeepSeek AI 打造的賽博塔羅體驗。",
}

export default function AboutPage() {
  return <AboutContent />
}
