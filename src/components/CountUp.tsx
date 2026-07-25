"use client"

/* ===== CountUp — 滚动进入视口时数字计数（美化方案 P1-F） ===== */

import { useEffect, useRef, useState } from "react"
import { useInView, useMotionValue, useSpring } from "motion/react"

interface CountUpProps {
  to: number
  /** 计数时长(ms)，默认 1200 — 仪式感需要"慢" */
  duration?: number
  className?: string
  style?: React.CSSProperties
}

export function CountUp({ to, duration = 1.2, className, style }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: "-40px" })
  const mv = useMotionValue(0)
  const spring = useSpring(mv, { duration: duration * 1000, bounce: 0 })
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (inView) mv.set(to)
  }, [inView, mv, to])

  useEffect(() => {
    const unsub = spring.on("change", (v) => setDisplay(Math.round(v)))
    return unsub
  }, [spring])

  return (
    <span ref={ref} className={className} style={style}>
      {display}
    </span>
  )
}
