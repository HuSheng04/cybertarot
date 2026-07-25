"use client"

import Link from "next/link"
import { motion } from "motion/react"
import Navbar from "@/components/Navbar"
import { BodyMode } from "@/components/BodyMode"
import { CountUp } from "@/components/CountUp"
import { RuneDivider } from "@/components/RuneDivider"
import { springGentle, springSmooth, distance } from "@/lib/motionTokens"

/* ===== 动效 Variants ===== */

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

/* ===== 内容数据 ===== */

/* 做这个项目时最沉迷的四件事 — 兴趣领域 */
const passions = [
  {
    title: "画一套自己的牌",
    detail:
      "78 张牌面全是木刻版画风：金属画框、做旧纸面、每只瞳孔里一点青光。为了让 22 张大阿卡纳看起来比小牌「更神圣」，光是边框做旧就调了很多版。",
  },
  {
    title: "把抽牌做成仪式",
    detail:
      "不想让它像「查询结果」。于是有了堆叠、扇形洗牌、依次飞位、扫描溶解——牌还没发完之前，绝不让你看到牌面。",
  },
  {
    title: "一张 3D 牌桌",
    detail:
      "翻牌桌是真 3D 的：粒子会在抽牌前向牌位汇聚，解读到「未来」时，未来牌会亮起一圈光。可以用鼠标转着看。",
  },
  {
    title: "编一个世界观",
    detail:
      "2077 年，塔罗不再是纸牌，而是「遗物卡牌」；占卜是接入 Braindance 神经接口，让赛博先知为你解读数据洪流里的命运信号。",
  },
]

/* 小项目的运转方式 — 随手记的四个步骤 */
const steps = [
  { label: "写下心事", desc: "把最近惦记的那件事，说给终端听" },
  { label: "洗牌抽牌", desc: "Fisher-Yates 洗牌，同一问题抽到的牌相同" },
  { label: "三张牌阵", desc: "过去的痕迹 · 现在的能量 · 未来的可能" },
  { label: "先知解读", desc: "AI 把三张牌串成一段只属于你的故事" },
]

export default function AboutContent() {
  return (
    <>
      <BodyMode mode="subpage-mode" />
      <Navbar />
      <main className="mx-auto flex max-w-3xl flex-1 flex-col gap-10 px-4 pt-24 pb-16">
        {/* ================================================================ */}
        {/* Hero — 一句话介绍                                                */}
        {/* ================================================================ */}
        <motion.section
          variants={heroStagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.h1
            variants={heroItem}
            className="font-serif-cn text-3xl font-bold tracking-[0.15em] text-neon-cyan"
            style={{
              textShadow:
                "0 0 7px #00f0ff, 0 0 10px rgba(0, 240, 255, 0.5), 0 0 21px rgba(0, 240, 255, 0.3)",
            }}
          >
            关于 CyberTarot
          </motion.h1>
          <motion.p
            variants={heroItem}
            className="mt-4 text-sm leading-relaxed text-text-muted"
          >
            一个出于喜欢而做的小项目：把塔罗牌、赛博朋克和 AI 熬成一锅。
          </motion.p>
        </motion.section>

        {/* ================================================================ */}
        {/* 缘起 — 创作动机（第一人称叙事）                                   */}
        {/* ================================================================ */}
        <motion.section
          className="space-y-4"
          initial={{ opacity: 0, y: distance.md }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={springSmooth}
        >
          <h2 className="font-serif-cn text-xl font-semibold tracking-[0.15em] text-neon-purple">
            缘起
          </h2>
          <div className="space-y-3 text-sm leading-relaxed text-text-secondary">
            <p className="drop-cap">
              一直很喜欢塔罗牌的美术——木刻的粗粝、炼金术的符号、那种「看不懂但觉得很神秘」
              的气质。也很迷赛博朋克：霓虹、雨夜、意识上传。有一天突然想到，
              这两样东西其实在做同一件事：用一套符号系统，回答人心里没答案的问题。
            </p>
            <p>
              于是就做了这个小站。你可以向 2077
              年的赛博先知提问，她会为你洗牌、抽牌，
              把三张遗物卡牌串成一段解读。问题不会被记住，牌面每次都很认真——
              这大概就是占卜该有的样子。
            </p>
            <p>
              做得慢，但做得很开心。希望你玩的时候，也能感受到一点
              「深夜里独自摆弄心爱玩具」的那种快乐。
            </p>
          </div>

          {/* 关键句 PullQuote 放大（衬线 + 月光金饰线） */}
          <motion.blockquote
            className="pull-quote my-8 text-lg leading-relaxed sm:text-xl"
            initial={{ opacity: 0, y: distance.sm }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={springSmooth}
          >
            在 0 与 1 的缝隙中，寻找属于你的命运信号。
          </motion.blockquote>
        </motion.section>

        <RuneDivider />

        {/* ================================================================ */}
        {/* 几个小数字                                                       */}
        {/* ================================================================ */}
        <motion.section
          className="flex flex-wrap justify-center gap-x-8 gap-y-4 py-4 sm:gap-x-12"
          variants={numberStagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {[
            { number: 78, label: "张亲手打磨的牌面" },
            { number: 3, label: "张牌讲一个故事" },
            { number: 2, label: "位赛博先知值守" },
          ].map((item) => (
            <motion.div
              key={item.label}
              variants={numberItem}
              className="flex flex-col items-center"
            >
              <CountUp
                to={item.number}
                className="font-heading text-5xl font-bold tracking-wider text-neon-cyan sm:text-6xl"
                style={{
                  textShadow:
                    "0 0 7px #00f0ff, 0 0 10px rgba(0, 240, 255, 0.5)",
                }}
              />
              <span className="mt-1 text-xs tracking-wide text-text-muted">
                {item.label}
              </span>
            </motion.div>
          ))}
        </motion.section>

        <RuneDivider />

        {/* ================================================================ */}
        {/* 最沉迷的部分 — 兴趣领域                                          */}
        {/* ================================================================ */}
        <motion.section
          className="space-y-4"
          initial={{ opacity: 0, y: distance.md }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={springSmooth}
        >
          <h2 className="font-serif-cn text-xl font-semibold tracking-[0.15em] text-neon-purple">
            做的时候，最沉迷的部分
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {passions.map((item) => (
              <motion.div
                key={item.title}
                whileHover={{
                  y: -4,
                  borderColor: "rgba(0, 240, 255, 0.3)",
                  boxShadow:
                    "0 4px 30px rgba(0, 240, 255, 0.1), 0 0 15px rgba(0, 240, 255, 0.05)",
                  transition: { type: "spring", stiffness: 300, damping: 20 },
                }}
                className="rounded-xl border border-card-border bg-card-surface/50 p-4 transition-colors"
              >
                <p className="font-serif-cn text-sm font-semibold tracking-wide text-neon-cyan">
                  {item.title}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-text-muted">
                  {item.detail}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <RuneDivider />

        {/* ================================================================ */}
        {/* 它是怎么运转的 — 轻描淡写的四步                                   */}
        {/* ================================================================ */}
        <motion.section
          className="space-y-4"
          initial={{ opacity: 0, y: distance.md }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={springSmooth}
        >
          <h2 className="font-serif-cn text-xl font-semibold tracking-[0.15em] text-neon-purple">
            它是怎么运转的
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {steps.map((step, i) => (
              <div
                key={step.label}
                className="flex items-start gap-3 rounded-xl border border-card-border/60 bg-card-surface/30 p-4"
              >
                <span className="font-cinzel text-lg leading-none text-moonlight-gold">
                  {["I", "II", "III", "IV"][i]}
                </span>
                <div>
                  <p className="font-subheading text-sm font-semibold tracking-wide text-text-primary">
                    {step.label}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-text-muted">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs leading-relaxed text-text-muted">
            认真说起来，是 Next.js 撑起骨架、React Three Fiber
            摆的牌桌、DeepSeek 在背后扮演先知——但这些都只是工具，
            重要的是它们一起变出了这个小仪式。
          </p>
        </motion.section>

        {/* ================================================================ */}
        {/* 页尾 — 来看看                                                    */}
        {/* ================================================================ */}
        <motion.section
          className="grid gap-4 sm:grid-cols-2"
          initial={{ opacity: 0, y: distance.md }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={springSmooth}
        >
          <a
            href="https://github.com/w3118597378-max/CyberTarot"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center gap-2 rounded-xl border border-card-border bg-card-surface/50 px-6 py-8 text-center transition-all duration-300 hover:border-neon-cyan/40 hover:shadow-card-glow"
          >
            <span className="font-subheading text-sm font-semibold tracking-[0.2em] text-neon-cyan">
              GITHUB
            </span>
            <span className="font-serif-cn text-lg text-text-primary">
              翻翻源码
            </span>
            <span className="text-xs text-text-muted transition-colors group-hover:text-text-secondary">
              所有牌面、动效和小心思都在这里 →
            </span>
          </a>
          <Link
            href="/?demo"
            className="group flex flex-col items-center gap-2 rounded-xl border border-card-border bg-card-surface/50 px-6 py-8 text-center transition-all duration-300 hover:border-neon-purple/40 hover:shadow-neon-purple/20"
          >
            <span className="font-subheading text-sm font-semibold tracking-[0.2em] text-neon-purple">
              LIVE DEMO
            </span>
            <span className="font-serif-cn text-lg text-text-primary">
              亲自抽一卦
            </span>
            <span className="text-xs text-text-muted transition-colors group-hover:text-text-secondary">
              不用准备问题，先让先知讲一段听听 →
            </span>
          </Link>
        </motion.section>
      </main>
    </>
  )
}
