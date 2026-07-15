"use client"

import { useRef, useMemo, useEffect, useState } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

/* ===== 配置 ===== */
const PARTICLE_COUNT_DESKTOP = 1500
const PARTICLE_COUNT_MOBILE = 700
const DRIFT_SPEED = 0.15
const CONVERGE_SPEED = 0.02 // 每帧汇聚速度

type Props = {
  /** 高性能模式（默认 true，false 时粒子数量减半） */
  highPerformance?: boolean
  /** 速度倍率（默认 1.0，Input 冥想阶段调至 0.5 用于降速） */
  speedMultiplier?: number
  /** 汇聚目标位置（翻牌前粒子向卡牌汇聚） */
  convergeTargets?: [number, number, number][]
  /** 汇聚进度 0-1（0=正常漂移，1=完全汇聚到目标） */
  convergeProgress?: number
}

/**
 * ParticleBg — 霓虹蓝紫粒子背景
 *
 * 在 Canvas 内渲染 700-1500 个粒子，缓慢漂移（正弦波），
 * 自动根据视口宽度降级数量。
 *
 * 设计规范：MASTER.md §6.2 — 粒子漂移 continuous
 */
export function ParticleBg({ highPerformance = true, speedMultiplier = 1.0, convergeTargets, convergeProgress = 0 }: Props) {
  const pointsRef = useRef<THREE.Points | null>(null)
  const posArrayRef = useRef<Float32Array | null>(null)
  const speedsArrayRef = useRef<Float32Array | null>(null)
  const offsetsArrayRef = useRef<Float32Array | null>(null)

  const [isMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 768 : false,
  )

  const count = useMemo(() => {
    if (!highPerformance) return Math.floor(PARTICLE_COUNT_MOBILE / 2)
    return isMobile ? PARTICLE_COUNT_MOBILE : PARTICLE_COUNT_DESKTOP
  }, [isMobile, highPerformance])

  /* ---- 粒子初始数据 ---- */
  /* eslint-disable react-hooks/purity */
  const particleData = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    const spd = new Float32Array(count)
    const off = new Float32Array(count)
    const tgtIdx = new Float32Array(count)

    const colorCyan = new THREE.Color("#00f0ff")
    const colorPurple = new THREE.Color("#b44dff")

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      pos[i3] = (Math.random() - 0.5) * 24
      pos[i3 + 1] = (Math.random() - 0.5) * 16
      pos[i3 + 2] = -6 + Math.random() * 8

      const t = Math.random()
      const c = colorCyan.clone().lerp(colorPurple, t)
      col[i3] = c.r
      col[i3 + 1] = c.g
      col[i3 + 2] = c.b

      spd[i] = 0.3 + Math.random() * 0.7
      off[i] = Math.random() * Math.PI * 2
      // 随机分配到 3 个汇聚目标组
      tgtIdx[i] = Math.floor(Math.random() * 3)
    }

    return { positions: pos, colors: col, speeds: spd, offsets: off, targetIndices: tgtIdx }
  }, [count])
  /* eslint-enable react-hooks/purity */

  /* ---- 构建 Geometry ---- */
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute("position", new THREE.BufferAttribute(particleData.positions, 3))
    geo.setAttribute("color", new THREE.BufferAttribute(particleData.colors, 3))
    return geo
  }, [particleData])

  /* ---- 缓存数组引用供动画使用 ---- */
  useEffect(() => {
    posArrayRef.current = particleData.positions
    speedsArrayRef.current = particleData.speeds
    offsetsArrayRef.current = particleData.offsets
  }, [particleData])

  /* ---- 汇聚目标索引缓存 ---- */
  const targetIndexRef = useRef<Float32Array | null>(null)
  useEffect(() => {
    targetIndexRef.current = particleData.targetIndices
  }, [particleData])

  /* ---- 原始位置备份（用于汇聚后恢复） ---- */
  const originalPosRef = useRef<Float32Array | null>(null)
  useEffect(() => {
    // 深拷贝一份原始位置
    const copy = new Float32Array(particleData.positions.length)
    copy.set(particleData.positions)
    originalPosRef.current = copy
  }, [particleData])

  /* ---- 动画循环 ---- */
  const timeRef = useRef(0)
  const convergenceAppliedRef = useRef(false)
  useFrame((_, delta) => {
    if (!posArrayRef.current || !pointsRef.current) return
    timeRef.current += delta
    const elapsed = timeRef.current
    const posAttr = pointsRef.current.geometry.getAttribute("position")
    if (!posAttr) return
    const array = posAttr.array as Float32Array
    const spd = speedsArrayRef.current!
    const off = offsetsArrayRef.current!
    const factor = speedMultiplier

    // 先应用正常漂移
    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      array[i3] += Math.sin(elapsed * DRIFT_SPEED * factor + off[i]) * 0.0015 * factor
      array[i3 + 1] += Math.sin(elapsed * spd[i] * 0.3 * factor + off[i]) * 0.001 * factor
      const angle = elapsed * 0.02 * spd[i] * factor + off[i]
      array[i3 + 2] += Math.sin(angle) * 0.001 * factor
    }

    // 粒子汇聚 — 向卡牌位置靠拢
    if (convergeTargets && convergeTargets.length >= 3 && convergeProgress > 0) {
      const orig = originalPosRef.current
      const tgtIdx = targetIndexRef.current
      if (orig && tgtIdx) {
        // 每帧向目标移动，汇聚进度越高越靠近
        const convergeFactor = convergeProgress * CONVERGE_SPEED * 60 * delta
        for (let i = 0; i < count; i++) {
          const i3 = i * 3
          const targetIdx = Math.min(Math.floor(tgtIdx[i]), convergeTargets.length - 1)
          const target = convergeTargets[targetIdx]
          if (!target) continue
          // 目标位置加上微小的随机偏移，避免所有粒子重叠
          const tx = target[0] + (orig[i3] * 0.15)
          const ty = target[1] + (orig[i3 + 1] * 0.15)
          const tz = target[2] + (orig[i3 + 2] * 0.15)
          // lerp 向目标
          array[i3] += (tx - array[i3]) * Math.min(convergeFactor, 0.15)
          array[i3 + 1] += (ty - array[i3 + 1]) * Math.min(convergeFactor, 0.15)
          array[i3 + 2] += (tz - array[i3 + 2]) * Math.min(convergeFactor, 0.15)
        }
      }
      convergenceAppliedRef.current = true
    } else if (convergeProgress === 0 && convergenceAppliedRef.current) {
      // 汇聚结束后，慢慢恢复原始位置
      const orig = originalPosRef.current
      if (orig) {
        const restoreSpeed = 0.02 * 60 * delta
        for (let i = 0; i < count; i++) {
          const i3 = i * 3
          array[i3] += (orig[i3] - array[i3]) * Math.min(restoreSpeed, 0.1)
          array[i3 + 1] += (orig[i3 + 1] - array[i3 + 1]) * Math.min(restoreSpeed, 0.1)
          array[i3 + 2] += (orig[i3 + 2] - array[i3 + 2]) * Math.min(restoreSpeed, 0.1)
        }
      }
      convergenceAppliedRef.current = false
    }

    posAttr.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <primitive object={geometry} attach="geometry" />
      <pointsMaterial
        size={0.04}
        vertexColors
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  )
}

export default ParticleBg
