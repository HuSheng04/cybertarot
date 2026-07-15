"use client"

/* ===== BraindancePortal — 神经接口接入界面 (Phase 3 视觉重做) ===== */
/*
 * Phase 3 视觉增强 (Task 3.1–3.4)：
 * - EEG 脑电波环：conic-gradient 轨道 + 旋转光点 + 径向波动
 * - 慢速扫描线 (3s/周期) + 十六进制代码飘落装饰
 * - 神经突触按钮：hover 时分支线条 + spring 上浮
 * - 脑波倒计时：3-2-1 波形风格
 */

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "motion/react"
import { useTarot } from "./TarotProvider"

/* ============================================================ */
/*  常量配置                                                      */
/* ============================================================ */

/** 十六进制代码碎片 — 用于背景飘落装饰（Task 3.2） */
const HEX_FRAGMENTS = [
  { text: "0x7F", x: "10%", y: "8%", delay: "0s", dur: "18s" },
  { text: "0xE4", x: "78%", y: "12%", delay: "2.5s", dur: "22s" },
  { text: "0x2A", x: "45%", y: "5%", delay: "5s", dur: "16s" },
  { text: "0x9C", x: "88%", y: "20%", delay: "1.5s", dur: "20s" },
  { text: "0x3B", x: "22%", y: "25%", delay: "4s", dur: "17s" },
  { text: "0xD5", x: "62%", y: "16%", delay: "3.2s", dur: "23s" },
  { text: "0xF1", x: "35%", y: "30%", delay: "6s", dur: "19s" },
  { text: "0x8A", x: "92%", y: "35%", delay: "7s", dur: "15s" },
]

/* ============================================================ */
/*  子组件 — EEG 脑电波环（Task 3.1）                              */
/* ============================================================ */

function EegRing() {
  return (
    <div className="relative mx-auto mb-6 h-24 w-24">
      {/* 环形轨道 — conic-gradient 渐变色 */}
      <div
        className="absolute inset-0 animate-[eeg-rotate_4s_linear_infinite] rounded-full"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0%, #00f0ff 20%, transparent 45%, #b44dff 70%, transparent 100%)",
          WebkitMask:
            "radial-gradient(circle at center, transparent 40%, black 42.5%, black 49%, transparent 51%)",
          mask:
            "radial-gradient(circle at center, transparent 40%, black 42.5%, black 49%, transparent 51%)",
        }}
        aria-hidden="true"
      />

      {/* 旋转光点 — 沿轨道运动 */}
      <div
        className="absolute inset-0 animate-[eeg-rotate_4s_linear_infinite] pointer-events-none"
        aria-hidden="true"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-neon-cyan shadow-[0_0_10px_#00f0ff]" />
      </div>

      {/* 径向波动 — 3 层不同速度和大小的 pulse 环 */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
        <div className="h-12 w-12 rounded-full border border-neon-cyan/15 animate-[ping-slow_2.5s_ease-out_infinite]" />
        <div className="absolute h-16 w-16 rounded-full border border-neon-purple/10 animate-[ping-slower_3.2s_ease-out_infinite_0.6s]" />
        <div className="absolute h-20 w-20 rounded-full border border-neon-cyan/5 animate-[ping-slowest_4s_ease-out_infinite_1.2s]" />
      </div>

      {/* 中心光晕 */}
      <div className="absolute inset-5 rounded-full bg-neon-cyan/5 blur-sm pointer-events-none" aria-hidden="true" />
    </div>
  )
}

/* ============================================================ */
/*  子组件 — 慢速扫描线（Task 3.2）                                */
/* ============================================================ */

function ScanLine() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.04]"
      aria-hidden="true"
    >
      <div
        className="absolute left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-neon-cyan to-transparent"
        style={{ animation: "scan-line-down 3s linear infinite" }}
      />
    </div>
  )
}

/* ============================================================ */
/*  子组件 — 神经突触分支线条 SVG（Task 3.3）                      */
/* ============================================================ */

function SynapseLines({ color = "cyan" }: { color?: "cyan" | "purple" }) {
  const stroke = color === "cyan" ? "#00f0ff" : "#b44dff"
  return (
    <svg
      className="absolute -right-14 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-70 transition-opacity duration-300"
      width="52"
      height="36"
      viewBox="0 0 52 36"
      fill="none"
      aria-hidden="true"
    >
      {/* 水平连接线 */}
      <line x1="0" y1="18" x2="16" y2="18" stroke={stroke} strokeWidth="1" opacity="0.5" />
      {/* 上分支 */}
      <path d="M16,18 Q24,12 34,8" stroke={stroke} strokeWidth="0.8" opacity="0.35" fill="none" />
      <circle cx="34" cy="8" r="1.5" fill={stroke} opacity="0.45" />
      {/* 下分支 */}
      <path d="M16,18 Q24,24 34,28" stroke={stroke} strokeWidth="0.8" opacity="0.35" fill="none" />
      <circle cx="34" cy="28" r="1.5" fill={stroke} opacity="0.45" />
      {/* 中分支 */}
      <path d="M16,18 Q28,16 40,18" stroke={stroke} strokeWidth="0.6" opacity="0.3" fill="none" />
      <circle cx="40" cy="18" r="1" fill={stroke} opacity="0.35" />
      {/* 突触连接点 */}
      <circle cx="16" cy="18" r="2" fill={stroke} opacity="0.6" />
    </svg>
  )
}

/* ============================================================ */
/*  子组件 — 脑波倒计时波形（Task 3.4）                            */
/* ============================================================ */

function BrainWaveCountdown({ count }: { count: number }) {
  // 所有波形使用相同的 path 结构 (C ×2)，仅控制点 y 坐标变化
  // 数字越小波形越平缓，0 为直线
  const c1y = useMemo(() => {
    switch (count) {
      case 3: return 4    // 剧烈
      case 2: return 16   // 中等
      case 1: return 26   // 平缓
      default: return 38  // 直线
    }
  }, [count])

  const c2y = useMemo(() => {
    switch (count) {
      case 3: return 4
      case 2: return 16
      case 1: return 26
      default: return 38
    }
  }, [count])

  // 波形描边 path（两个对称的 cubic bezier）
  const lineD = `M8,38 C20,${c1y} 36,${c1y} 48,38 C60,${c2y} 76,${c2y} 88,38`
  // 填充 path（闭合到底部）
  const fillD = `${lineD} L92,44 L4,44 Z`

  return (
    <div className="relative flex items-center justify-center w-full h-16">
      {/* SVG 波形 */}
      <svg
        width="100%"
        height="44"
        viewBox="0 0 96 44"
        className="absolute inset-0"
        aria-hidden="true"
      >
        {/* 基线 */}
        <line x1="2" y1="38" x2="94" y2="38" stroke="rgba(0,240,255,0.08)" strokeWidth="0.8" />

        {/* 填充区域 */}
        <motion.path
          d={fillD}
          fill={count === 0 ? "rgba(0,240,255,0.12)" : "rgba(0,240,255,0.04)"}
          initial={false}
          animate={{ d: fillD }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        />

        {/* 波形线 */}
        <motion.path
          d={lineD}
          stroke="#00f0ff"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          initial={false}
          animate={{
            d: lineD,
            opacity: count === 0 ? [0.5, 1, 0.5] : 0.75,
          }}
          transition={{
            d: { duration: 0.3, ease: "easeInOut" },
            opacity: count === 0 ? { duration: 0.4, repeat: Infinity } : { duration: 0.3 },
          }}
        />
      </svg>

      {/* 倒计时数字 */}
      <motion.span
        className="font-heading text-3xl text-neon-cyan z-10 drop-shadow-[0_0_6px_#00f0ff]"
        key={count}
        initial={{ scale: 1.4, opacity: 0.3 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        {count > 0 ? count : ""}
      </motion.span>

      {/* 接入完成闪光 */}
      <AnimatePresence>
        {count === 0 && (
          <motion.div
            className="absolute inset-0 mx-auto h-16 w-32 rounded-full bg-neon-cyan/20 blur-2xl"
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: [0, 0.5, 0], scale: [0.3, 1.5, 2.2] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

/* ============================================================ */
/*  子组件 — 十六进制代码飘落（Task 3.2）                           */
/* ============================================================ */

function HexRain() {
  return (
    <>
      {HEX_FRAGMENTS.map((frag, i) => (
        <span
          key={i}
          className="pointer-events-none absolute font-mono text-[10px] text-neon-cyan select-none"
          style={{
            left: frag.x,
            top: frag.y,
            animation: `hex-fall ${frag.dur} linear ${frag.delay} infinite`,
            opacity: 0.025,
          }}
          aria-hidden="true"
        >
          {frag.text}
        </span>
      ))}
    </>
  )
}

/* ============================================================ */
/*  主组件                                                        */
/* ============================================================ */

export function BraindancePortal() {
  const { setApiKey } = useTarot()

  const [mode, setMode] = useState<"select" | "server" | "custom">("select")
  const [customKey, setCustomKey] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [verifyError, setVerifyError] = useState<string | null>(null)
  const [serverCountdown, setServerCountdown] = useState(3)

  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const countdownDoneRef = useRef(false)

  /* ---- 3-2-1 倒计时 ---- */
  useEffect(() => {
    if (mode !== "server") {
      if (countdownRef.current) clearInterval(countdownRef.current)
      countdownDoneRef.current = false
      return
    }

    countdownDoneRef.current = false

    const resetTimer = setTimeout(() => setServerCountdown(3), 0)

    countdownRef.current = setInterval(() => {
      setServerCountdown((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current)
          countdownDoneRef.current = true
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      clearTimeout(resetTimer)
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [mode])

  /* ---- 倒计时完成后触发接入 ---- */
  useEffect(() => {
    if (mode === "server" && serverCountdown === 0 && countdownDoneRef.current) {
      setApiKey(null)
    }
  }, [mode, serverCountdown, setApiKey])

  /* ---- 验证自定义 API Key ---- */
  const handleVerifyKey = useCallback(async () => {
    const trimmed = customKey.trim()
    if (!trimmed) {
      setVerifyError("请插入有效的记忆芯片")
      return
    }

    setIsVerifying(true)
    setVerifyError(null)

    try {
      const res = await fetch("/api/verify-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: trimmed }),
      })

      const data = await res.json()

      if (data.valid) {
        setApiKey(trimmed)
      } else {
        setVerifyError(data.message || "记忆芯片不兼容，请重试")
      }
    } catch {
      setVerifyError("神谕核心连接失败，请检查网络")
    } finally {
      setIsVerifying(false)
    }
  }, [customKey, setApiKey])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !isVerifying) {
        handleVerifyKey()
      }
    },
    [handleVerifyKey, isVerifying],
  )

  return (
    <motion.section
      className="relative z-10 flex w-full max-w-md flex-col items-center px-4 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* =============================================== */}
      {/*  装饰层                                          */}
      {/* =============================================== */}

      <HexRain />
      <ScanLine />

      {/* HUD 装饰：角落括号 */}
      <div className="pointer-events-none absolute inset-0 select-none">
        <span className="absolute top-0 left-0 text-2xl text-hud-bracket font-mono leading-none">
          [/
        </span>
        <span className="absolute top-0 right-0 text-2xl text-hud-bracket font-mono leading-none">
          /]
        </span>
        <span className="absolute bottom-0 left-0 text-2xl text-hud-bracket font-mono leading-none">
          [\
        </span>
        <span className="absolute bottom-0 right-0 text-2xl text-hud-bracket font-mono leading-none">
          \]
        </span>
      </div>

      {/* =============================================== */}
      {/*  标题区                                          */}
      {/* =============================================== */}
      <motion.div
        className="relative mb-6 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {/* Task 3.1: EEG 脑电波环 */}
        <EegRing />

        <h2 className="font-heading text-2xl tracking-wider text-neon-cyan text-glow-cyan">
          接入 Braindance 神经接口
        </h2>
        <p className="mt-2 font-subheading text-sm tracking-wide text-text-secondary">
          选择连接方式以激活赛博先知
        </p>
      </motion.div>

      {/* =============================================== */}
      {/*  模式选择                                        */}
      {/* =============================================== */}
      <AnimatePresence mode="wait">
        {mode === "select" && (
          <motion.div
            key="select"
            className="flex w-full flex-col gap-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {/* --- Task 3.3: 神经突触按钮 — 服务端神谕核心 --- */}
            <motion.button
              type="button"
              onClick={() => setMode("server")}
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 300, damping: 20, mass: 0.5 }}
              className="group relative w-full rounded-xl border border-card-border bg-card-surface/50 p-4 pl-5 text-left transition-colors duration-200 hover:border-neon-cyan/50 hover:bg-card-hover/50"
            >
              <div className="flex items-center gap-4">
                {/* 左侧发光圆点 */}
                <span className="relative flex h-8 w-8 items-center justify-center shrink-0">
                  <span className="absolute h-8 w-8 animate-ping rounded-full bg-neon-cyan/20" />
                  <span className="h-3 w-3 rounded-full bg-neon-cyan shadow-[0_0_10px_#00f0ff]" />
                </span>

                <div className="flex-1 min-w-0">
                  <p className="font-subheading text-sm font-semibold tracking-wide text-text-primary group-hover:text-neon-cyan transition-colors">
                    使用服务端神谕核心
                  </p>
                  <p className="mt-0.5 text-xs text-text-muted">
                    系统默认连接，无需额外配置
                  </p>
                </div>

                {/* 右侧箭头连接线 + 突触分支 */}
                <div className="relative flex items-center shrink-0">
                  <span className="font-mono text-sm text-neon-cyan/60 group-hover:text-neon-cyan transition-colors tracking-[3px]">
                    {">>>"}
                  </span>
                  <div className="hidden sm:block">
                    <SynapseLines color="cyan" />
                  </div>
                </div>
              </div>
            </motion.button>

            {/* --- Task 3.3: 神经突触按钮 — 插入记忆芯片 --- */}
            <motion.button
              type="button"
              onClick={() => setMode("custom")}
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 300, damping: 20, mass: 0.5 }}
              className="group relative w-full rounded-xl border border-card-border bg-card-surface/50 p-4 pl-5 text-left transition-colors duration-200 hover:border-neon-purple/50 hover:bg-card-hover/50"
            >
              <div className="flex items-center gap-4">
                {/* 左侧发光圆点 */}
                <span className="relative flex h-8 w-8 items-center justify-center shrink-0">
                  <span className="absolute h-8 w-8 animate-ping rounded-full bg-neon-purple/20" />
                  <span className="h-3 w-3 rounded-full bg-neon-purple shadow-[0_0_10px_#b44dff]" />
                </span>

                <div className="flex-1 min-w-0">
                  <p className="font-subheading text-sm font-semibold tracking-wide text-text-primary group-hover:text-neon-purple transition-colors">
                    插入记忆芯片
                  </p>
                  <p className="mt-0.5 text-xs text-text-muted">
                    粘贴自有 DeepSeek API Key
                  </p>
                </div>

                {/* 右侧箭头连接线 + 突触分支 */}
                <div className="relative flex items-center shrink-0">
                  <span className="font-mono text-sm text-neon-purple/60 group-hover:text-neon-purple transition-colors tracking-[3px]">
                    {">>>"}
                  </span>
                  <div className="hidden sm:block">
                    <SynapseLines color="purple" />
                  </div>
                </div>
              </div>
            </motion.button>
          </motion.div>
        )}

        {/* --- Task 3.4: 服务端模式 — 脑波倒计时 --- */}
        {mode === "server" && (
          <motion.div
            key="server"
            className="flex w-full flex-col items-center gap-5 py-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <BrainWaveCountdown count={serverCountdown} />

            <p className="text-center text-sm text-text-secondary">
              {serverCountdown > 0
                ? "正在同步脑波频率…"
                : "神谕核心已连接，正在接入 Braindance…"}
            </p>

            <button
              type="button"
              onClick={() => setMode("select")}
              className="text-xs text-text-muted underline underline-offset-2 hover:text-text-secondary transition-colors"
            >
              返回选择
            </button>
          </motion.div>
        )}

        {/* ---- 自定义模式：输入 API Key（已有样式，保持兼容）---- */}
        {mode === "custom" && (
          <motion.div
            key="custom"
            className="flex w-full flex-col gap-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div
              className={`rounded-xl border bg-card-surface/50 p-4 transition-all duration-200 ${
                verifyError
                  ? "border-error/40"
                  : "border-card-border focus-within:border-neon-purple/50"
              }`}
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="font-mono text-[10px] text-neon-purple/60">{'// 记忆芯片插槽'}</span>
              </div>

              <input
                type="password"
                value={customKey}
                onChange={(e) => {
                  setCustomKey(e.target.value)
                  if (verifyError) setVerifyError(null)
                }}
                onKeyDown={handleKeyDown}
                placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full bg-transparent font-mono text-sm text-text-primary placeholder-text-muted/50 outline-none"
                autoFocus
                disabled={isVerifying}
              />

              <div className="mt-2 flex items-center justify-between">
                <span className="font-mono text-[10px] text-text-muted">
                  {isVerifying
                    ? "正在验证…"
                    : customKey
                      ? `${customKey.slice(0, 8)}...${customKey.slice(-4)}`
                      : "等待插入"}
                </span>
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isVerifying
                      ? "animate-pulse bg-yellow-400"
                      : customKey
                        ? "bg-neon-cyan/50"
                        : "bg-text-muted/30"
                  }`}
                />
              </div>
            </div>

            <AnimatePresence>
              {verifyError && (
                <motion.p
                  className="text-xs text-error"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  ! {verifyError}
                </motion.p>
              )}
            </AnimatePresence>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleVerifyKey}
                disabled={isVerifying || !customKey.trim()}
                className="flex-1 rounded-lg bg-neon-purple px-4 py-2.5 font-subheading text-sm font-semibold tracking-wide text-white shadow-neon-purple transition-all duration-200 hover:shadow-neon-purple/50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isVerifying ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    验证中…
                  </span>
                ) : (
                  "[ 验证并接入 ]"
                )}
              </button>

              <button
                type="button"
                onClick={() => setMode("select")}
                className="rounded-lg border border-card-border px-4 py-2.5 text-xs text-text-muted transition-colors hover:text-text-secondary"
              >
                返回
              </button>
            </div>

            <p className="text-center text-[10px] text-text-muted/60">
              你的 Key 仅存储在本地浏览器，不会上传到服务器
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  )
}
