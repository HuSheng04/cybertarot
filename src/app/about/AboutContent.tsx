"use client"

import { motion } from "motion/react"
import Navbar from "@/components/Navbar"
import ArchitectureFlow from "@/components/ArchitectureFlow"
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
    detail: "React Server Components + 流式 SSR，自动代码分割",
    color: "text-neon-cyan",
  },
  {
    name: "React Three Fiber",
    detail: "3D 翻牌桌与粒子背景，WebGL 加速渲染",
    color: "text-neon-cyan",
  },
  {
    name: "Motion (Framer Motion)",
    detail: "页面过渡、段落浮现、输入框抖动动画",
    color: "text-neon-cyan",
  },
  {
    name: "DeepSeek API",
    detail: "流式 AI 占卜解读，10s 超时 + 自动重试 + 模板降级",
    color: "text-neon-purple",
  },
  {
    name: "Tailwind CSS v4",
    detail: "暗黑赛博配色系统，utility-first 样式",
    color: "text-neon-cyan",
  },
  {
    name: "TypeScript",
    detail: "全量类型覆盖，Zod schema 验证（扩展）",
    color: "text-neon-cyan",
  },
  {
    name: "Sharp",
    detail: "78 张卡面 PNG → WebP 批量压缩，平均 213KB/张",
    color: "text-neon-purple",
  },
  {
    name: "pnpm",
    detail: "依赖管理，快照隔离，节省磁盘空间",
    color: "text-neon-cyan",
  },
]

const challenges = [
  {
    title: "3D 翻牌动画时序控制",
    problem:
      "三张牌需要按「过去→现在→未来」顺序翻转，每张间隔 500ms，各自动画时长 800ms。直接使用 React 状态管理会导致动画不同步。",
    solution:
      "使用 useFrame + 手动 lerp 控制 rotation.y，配合 delay 参数实现精确时序。翻牌完成后自动触发 phase 切换（useEffect timeout 2.5s）。",
  },
  {
    title: "流式 SSE 段落切分 + 动画",
    problem:
      "DeepSeek 返回的 SSE 流需要按 ## 标题即时分割段落，且标题需先于正文 150ms 显示。服务端返回的 chunk 可能在任何位置截断。",
    solution:
      "客户端维护 text buffer，每收到 chunk 就尝试分割完整段落。维护 streamingParagraph 和 completed 两个列表，标题与正文分开渲染。",
  },
  {
    title: "Vercel Hobby Plan 10s 超时 + API 降级",
    problem:
      "Vercel Serverless 函数最多运行 10s，DeepSeek API 可能超时或不可用。面试场景要求零故障。",
    solution:
      "Prompt 压缩至 ~600 字，限制 max_tokens=1000。前端缓存 5 套模板解读，3 次重试失败后无感切换，用户零感知。",
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
            ══ 关于 CyberTarot ══
          </motion.h1>
          <motion.p
            variants={heroItem}
            className="mt-4 text-sm leading-relaxed text-text-muted"
          >
            一个将古老塔罗智慧融入赛博朋克世界的 AI 占卜体验。
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
              2077 年，旧世界的物理纸张已成传说。赛博先知们从数据废墟中发掘出古老的手稿预言，
              将它们保存在金属画框中——每一张都是一个「遗物卡牌」，承载着被遗忘的智慧碎片。
            </p>
            <p>
              用户通过 Braindance 神经接口接入赛博先知的意识网络，AI
              神谕核心会为其抽取三张遗物卡牌，
              解读过去留下的痕迹、此刻流动的能量、以及未来编织的可能性。
            </p>
            <p>
              每一次占卜都是一次穿越数据洪流的精神旅程——在 0 与 1
              的缝隙中，寻找属于你的命运信号。
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
            「在 0 与 1 的缝隙中，寻找属于你的命运信号。」
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
            { number: "78", label: "遗物卡牌" },
            { number: "3", label: "命运之牌" },
            { number: "2", label: "AI 神谕核心" },
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
            ▎系统架构
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
            <ArchitectureFlow />
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
            ▎78 张塔罗牌数据
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
              <li>中英文名称</li>
              <li>花色归属（大阿卡纳 / 权杖 / 圣杯 / 宝剑 / 星币）</li>
              <li>3 个关键词</li>
              <li>正位 + 逆位释义（各 ~50 字）</li>
              <li>
                自动注入 <code className="text-neon-cyan">imagePath</code>（
                /assets/cards/{`{id}`}.webp）
              </li>
            </ul>
            <p className="text-xs text-text-muted">
              Fisher-Yates 洗牌算法 + mulberry32
              种子随机数生成器确保同一问题结果可复现。
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
            ▎开发中解决的技术挑战
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
                  故障代码 0x{index + 1}A
                </span>

                <p className="font-subheading text-sm font-semibold tracking-wide text-neon-cyan">
                  {challenge.title}
                </p>
                <div className="mt-2 space-y-1 text-xs text-text-secondary">
                  <p>
                    <span className="font-semibold text-warning">问题：</span>
                    {challenge.problem}
                  </p>
                  <p>
                    <span className="font-semibold text-success">解法：</span>
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
            本项目是面试作品集的一部分
          </p>
          <p className="mt-2 text-xs text-text-muted">
            CyberTarot 展示了全栈 AI 产品开发能力：Next.js App Router + 3D 渲染
            + 流式 AI 集成 + 赛博 UI 设计 + 错误边界降级策略。
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
