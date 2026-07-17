"use client"

import { motion } from "motion/react"
import Navbar from "@/components/Navbar"
import {
  springSmooth,
  springGentle,
  springSnappy,
  stagger,
  distance,
} from "@/lib/motionTokens"

/* ===== Variants ===== */

const heroStagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.25, delayChildren: 0.1 },
  },
}

const heroItem = {
  hidden: { opacity: 0, y: distance.md },
  visible: {
    opacity: 1,
    y: 0,
    transition: springGentle,
  },
}

const numberStagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.2, delayChildren: 0.1 },
  },
}

const numberItem = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springGentle,
  },
}

const techStagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: stagger.micro,
      delayChildren: 0.2,
    },
  },
}

const techItem = {
  hidden: { opacity: 0, y: distance.md },
  visible: {
    opacity: 1,
    y: 0,
    transition: springSmooth,
  },
}

const challengeStagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
}

const challengeItem = {
  hidden: { opacity: 0, x: -distance.sm },
  visible: {
    opacity: 1,
    x: 0,
    transition: springSmooth,
  },
}

/* ===== Data ===== */

const techStack = [
  {
    name: "Next.js 16 (App Router)",
    detail: "React Server Components + 流式 SSR，自動代碼分割",
    color: "text-neon-cyan",
  },
  {
    name: "React Three Fiber",
    detail: "3D 翻牌桌與粒子背景，WebGL 加速渲染",
    color: "text-neon-cyan",
  },
  {
    name: "Motion (Framer Motion)",
    detail: "頁面過渡、段落浮現、輸入框抖動動畫",
    color: "text-neon-cyan",
  },
  {
    name: "DeepSeek API",
    detail: "流式 AI 占卜解讀，10s 超時 + 自動重試 + 模板降級",
    color: "text-neon-purple",
  },
  {
    name: "Tailwind CSS v4",
    detail: "暗黑賽博配色系統，utility-first 樣式",
    color: "text-neon-cyan",
  },
  {
    name: "TypeScript",
    detail: "全量類型覆蓋，Zod schema 驗證（擴展）",
    color: "text-neon-cyan",
  },
  {
    name: "Sharp",
    detail: "78 張卡面 PNG → WebP 批量壓縮，平均 213KB/張",
    color: "text-neon-purple",
  },
  {
    name: "pnpm",
    detail: "依賴管理，快照隔離，節省磁碟空間",
    color: "text-neon-cyan",
  },
]

const challenges = [
  {
    title: "3D 翻牌動畫時序控制",
    problem:
      "三張牌需要按「過去→現在→未來」順序翻轉，每張間隔 500ms，各自動畫時長 800ms。直接使用 React 狀態管理會導致動畫不同步。",
    solution:
      "使用 useFrame + 手動 lerp 控制 rotation.y，配合 delay 參數實現精確時序。翻牌完成後自動觸發 phase 切換（useEffect timeout 2.5s）。",
  },
  {
    title: "流式 SSE 段落切分 + 動畫",
    problem:
      "DeepSeek 返回的 SSE 流需要按 ## 標題即時分割段落，且標題需先於正文 150ms 顯示。服務端返回的 chunk 可能在任何位置截斷。",
    solution:
      "客戶端維護 text buffer，每收到 chunk 就嘗試分割完整段落。維護 streamingParagraph 和 completed 兩個列表，標題與正文分開渲染。",
  },
  {
    title: "Vercel Hobby Plan 10s 超時 + API 降級",
    problem:
      "Vercel Serverless 函數最多運行 10s，DeepSeek API 可能超時或不可用。面試場景要求零故障。",
    solution:
      "Prompt 壓縮至 ~600 字，限制 max_tokens=1000。前端緩存 5 套模板解讀，3 次重試失敗後無感切換，用戶零感知。",
  },
]

/* ===== Holographic Divider ===== */

function HolographicDivider() {
  return (
    <motion.div
      className="relative my-16 flex items-center"
      initial={{ opacity: 0, scaleX: 0.5 }}
      whileInView={{ opacity: 0.3, scaleX: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-neon-cyan/30 to-transparent shadow-[0_0_6px_rgba(0,240,255,0.15)]" />
      <span className="mx-3 font-mono text-xs text-neon-cyan/40">✦</span>
      <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-neon-cyan/30 to-transparent shadow-[0_0_6px_rgba(0,240,255,0.15)]" />
    </motion.div>
  )
}

export default function AboutContent() {
  return (
    <>
      <Navbar />
      <main className="mx-auto flex max-w-3xl flex-1 flex-col gap-10 px-4 pt-24 pb-16">
        {/* ================================================================ */}
        {/* Task 8.1 — 叙事 Hero                                              */}
        {/* ================================================================ */}
        <motion.section
          variants={heroStagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.h1
            variants={heroItem}
            className="font-heading text-3xl tracking-wider text-neon-cyan"
            style={{
              textShadow:
                "0 0 7px #00f0ff, 0 0 10px rgba(0, 240, 255, 0.5), 0 0 21px rgba(0, 240, 255, 0.3)",
            }}
          >
            ══ 關於 CyberTarot ══
          </motion.h1>
          <motion.p
            variants={heroItem}
            className="mt-4 text-sm leading-relaxed text-text-muted"
          >
            一個將古老塔羅智慧融入賽博龐克世界的 AI 占卜體驗。
          </motion.p>
        </motion.section>

        {/* ================================================================ */}
        {/* 概念故事                                                         */}
        {/* ================================================================ */}
        <motion.section
          className="space-y-4"
          initial={{ opacity: 0, y: distance.md }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={springSmooth}
        >
          <h2 className="font-subheading text-xl tracking-wide text-neon-purple">
            ▎概念故事
          </h2>
          <div className="space-y-3 text-sm leading-relaxed text-text-secondary">
            <p>
              2077 年，舊世界的物理紙張已成傳說。賽博先知們從數據廢墟中發掘出古老的手稿預言，
              將它們保存在金屬畫框中——每一張都是一個「遺物卡牌」，承載著被遺忘的智慧碎片。
            </p>
            <p>
              用戶通過 Braindance 神經接口接入賽博先知的意識網絡，AI
              神諭核心會為其抽取三張遺物卡牌，
              解讀過去留下的痕跡、此刻流動的能量、以及未來編織的可能性。
            </p>
            <p>
              每一次占卜都是一次穿越數據洪流的精神旅程——在 0 與 1
              的縫隙中，尋找屬於你的命運信號。
            </p>
          </div>

          {/* Task 8.3 — 引文卡片 */}
          <motion.blockquote
            className="border-l-4 border-neon-cyan bg-card-surface/30 py-3 pl-4 pr-4 text-sm italic leading-relaxed text-text-secondary"
            initial={{ opacity: 0, x: -distance.sm }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={springSmooth}
          >
            「在 0 與 1 的縫隙中，尋找屬於你的命運信號。」
          </motion.blockquote>
        </motion.section>

        <HolographicDivider />

        {/* ================================================================ */}
        {/* Task 8.2 — 关键数字展示                                          */}
        {/* ================================================================ */}
        <motion.section
          className="flex justify-center gap-8 sm:gap-12 py-4"
          variants={numberStagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {[
            { number: "78", label: "遺物卡牌" },
            { number: "3", label: "命運之牌" },
            { number: "2", label: "AI 神諭核心" },
          ].map((item) => (
            <motion.div
              key={item.number}
              variants={numberItem}
              className="flex flex-col items-center"
            >
              <span
                className="font-heading text-5xl font-bold tracking-wider text-neon-cyan sm:text-6xl"
                style={{
                  textShadow:
                    "0 0 7px #00f0ff, 0 0 10px rgba(0, 240, 255, 0.5)",
                }}
              >
                {item.number}
              </span>
              <span className="mt-1 text-xs tracking-wide text-text-muted">
                {item.label}
              </span>
            </motion.div>
          ))}
        </motion.section>

        <HolographicDivider />

        {/* ================================================================ */}
        {/* Task 8.4 — 技術棧卡片增強                                        */}
        {/* ================================================================ */}
        <section className="space-y-4">
          <motion.h2
            className="font-subheading text-xl tracking-wide text-neon-purple"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={springSmooth}
          >
            ▎技術棧選型
          </motion.h2>
          <motion.div
            className="grid gap-3 sm:grid-cols-2"
            variants={techStagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {techStack.map((tech) => (
              <motion.div
                key={tech.name}
                variants={techItem}
                whileHover={{
                  y: -4,
                  borderColor: "rgba(0, 240, 255, 0.3)",
                  boxShadow:
                    "0 4px 30px rgba(0, 240, 255, 0.1), 0 0 15px rgba(0, 240, 255, 0.05)",
                  transition: { type: "spring", stiffness: 300, damping: 20 },
                }}
                className="rounded-xl border border-card-border bg-card-surface/50 p-4 transition-colors"
              >
                <p
                  className={`font-subheading text-sm font-semibold tracking-wide ${tech.color}`}
                >
                  {tech.name}
                </p>
                <p className="mt-1 text-xs text-text-muted">{tech.detail}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        <HolographicDivider />

        {/* ================================================================ */}
        {/* Task 8.5 — 系統架構圖視覺增強                                    */}
        {/* ================================================================ */}
        <section className="space-y-4">
          <motion.h2
            className="font-subheading text-xl tracking-wide text-neon-purple"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={springSmooth}
          >
            ▎系統架構
          </motion.h2>
          <motion.div
            className="overflow-x-auto rounded-xl border bg-deep-space/80 p-4"
            style={{
              borderColor: "rgba(0, 240, 255, 0.15)",
              boxShadow:
                "0 0 15px rgba(0, 240, 255, 0.05), inset 0 0 15px rgba(0, 240, 255, 0.02)",
            }}
            initial={{ opacity: 0, y: distance.md }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={springGentle}
          >
            <pre className="font-mono text-xs leading-loose text-text-secondary">
{`┌─────────────────────────────────────────────────────┐
│                    🖥  Client                         │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────┐  │
│  │Braindance│──→│Question  │──→│TarotTable3D(R3F) │  │
│  │Portal    │  │Input     │  │+ ParticleBg       │  │
│  └──────────┘  └──────────┘  └────────┬──────────┘  │
│                                       │              │
│  ┌────────────────────────────────────▼───────────┐  │
│  │          ReadingStream (SSE 流式)              │  │
│  └──────────────────────┬─────────────────────────┘  │
└─────────────────────────┼───────────────────────────┘
                          │ POST /api/reading
┌─────────────────────────▼───────────────────────────┐
│                   🖥  Server                         │
│  ┌───────────────────────────────────────────────┐  │
│  │  Route Handler /api/reading                   │  │
│  │  ├─ AbortController (客戶端斷開中止)          │  │
│  │  ├─ 自動重試 (最多 2 次, 間隔 1s)            │  │
│  │  └─ 全部失敗 → 模板降級 (5 套)               │  │
│  └───────────────────┬───────────────────────────┘  │
│                      │ DeepSeek API                  │
│  ┌───────────────────▼───────────────────────────┐  │
│  │  DeepSeek Chat (stream=true)                  │  │
│  │  系統 Prompt ~600 字 + 用戶 Prompt           │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘`}
            </pre>
          </motion.div>

          {/* 架构图图例: 高亮关键节点 */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-4 text-[10px] text-text-muted"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-neon-cyan/20" />
              Client 端
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-neon-cyan/20" />
              Server 端
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-neon-purple/20" />
              DeepSeek API
            </span>
            <span className="inline-flex items-center gap-1.5 text-neon-cyan/60">
              ──→ 數據流向
            </span>
          </motion.div>
        </section>

        <HolographicDivider />

        {/* ===== 78 張牌生成流程 ===== */}
        <motion.section
          className="space-y-4"
          initial={{ opacity: 0, y: distance.md }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={springSmooth}
        >
          <h2 className="font-subheading text-xl tracking-wide text-neon-purple">
            ▎78 張塔羅牌數據
          </h2>
          <div className="space-y-3 text-sm leading-relaxed text-text-secondary">
            <p>
              全部 78 張牌（22 張大阿卡納 + 56 張小阿卡納）的數據以 TypeScript
              常量定義在{" "}
              <code className="rounded bg-card-surface px-1.5 py-0.5 font-mono text-xs text-neon-cyan">
                src/data/cards.ts
              </code>{" "}
              中，每張牌包含：
            </p>
            <ul className="list-inside list-disc space-y-1 text-xs">
              <li>
                唯一 ID（如{" "}
                <code className="text-neon-cyan">major_00</code>、{" "}
                <code className="text-neon-cyan">wands_05</code>）
              </li>
              <li>中英文名稱</li>
              <li>花色歸屬（大阿卡納 / 權杖 / 聖杯 / 寶劍 / 星幣）</li>
              <li>3 個關鍵詞</li>
              <li>正位 + 逆位釋義（各 ~50 字）</li>
              <li>
                自動注入 <code className="text-neon-cyan">imagePath</code>（
                /assets/cards/{`{id}`}.webp）
              </li>
            </ul>
            <p className="text-xs text-text-muted">
              Fisher-Yates 洗牌算法 + mulberry32
              種子隨機數生成器確保同一問題結果可復現。
              正位概率 ~70%，逆位 ~30%。
            </p>
          </div>
        </motion.section>

        <HolographicDivider />

        {/* ================================================================ */}
        {/* Task 8.6 — 挑戰卡片故障風格                                     */}
        {/* ================================================================ */}
        <section className="space-y-4">
          <motion.h2
            className="font-subheading text-xl tracking-wide text-neon-purple"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={springSmooth}
          >
            ▎開發中解決的技術挑戰
          </motion.h2>
          <motion.div
            className="space-y-4"
            variants={challengeStagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {challenges.map((challenge, index) => (
              <motion.div
                key={challenge.title}
                variants={challengeItem}
                whileHover={{ y: -2, transition: springSnappy }}
                className="group relative rounded-xl border border-card-border bg-card-surface/50 p-4 transition-colors hover:border-error/20"
              >
                {/* 故障风格标签 */}
                <span className="absolute -top-2 left-3 rounded bg-error/10 px-2 font-mono text-[10px] tracking-wider text-error">
                  ⚠ 故障代碼 0x{index + 1}A
                </span>

                <p className="font-subheading text-sm font-semibold tracking-wide text-neon-cyan">
                  {challenge.title}
                </p>
                <div className="mt-2 space-y-1 text-xs text-text-secondary">
                  <p>
                    <span className="font-semibold text-warning">▸ 問題：</span>
                    {challenge.problem}
                  </p>
                  <p>
                    <span className="font-semibold text-success">▸ 解法：</span>
                    {challenge.solution}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        <HolographicDivider />

        {/* ===== CopyAI 組合展示 ===== */}
        <motion.section
          className="rounded-xl border border-card-border bg-card-surface/30 p-6 text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={springGentle}
        >
          <p className="font-subheading text-sm tracking-wide text-neon-cyan">
            本項目是面試作品集的一部分
          </p>
          <p className="mt-2 text-xs text-text-muted">
            CyberTarot 展示了全棧 AI 產品開發能力：Next.js App Router + 3D 渲染
            + 流式 AI 集成 + 賽博 UI 設計 + 錯誤邊界降級策略。
          </p>
          <div className="mt-4 flex items-center justify-center gap-6 text-xs text-text-muted">
            <span className="transition-colors duration-200 hover:text-neon-cyan">
              Next.js
            </span>
            <span className="text-neon-cyan">✦</span>
            <span className="transition-colors duration-200 hover:text-neon-cyan">
              R3F
            </span>
            <span className="text-neon-cyan">✦</span>
            <span className="transition-colors duration-200 hover:text-neon-cyan">
              DeepSeek
            </span>
            <span className="text-neon-cyan">✦</span>
            <span className="transition-colors duration-200 hover:text-neon-cyan">
              TypeScript
            </span>
          </div>
        </motion.section>
      </main>
    </>
  )
}
