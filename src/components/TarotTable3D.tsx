"use client"

import { memo, Suspense, useState, useEffect, useMemo } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import * as THREE from "three"

import { ParticleBg } from "./ParticleBg"
import { CardMesh } from "./CardMesh"
import type { DrawnCard } from "@/types"

/* ===== 环境光照配置 ===== */
const AMBIENT_INTENSITY = 0.5
const DIRECTIONAL_INTENSITY = 0.8

type Props = {
  /** 已抽取的卡牌（三张） */
  cards?: DrawnCard[]
  /** 是否正在洗牌动画中 */
  isShuffling?: boolean
  /** 是否触发翻牌 */
  shouldFlip?: boolean
  /** 是否低配模式 */
  lowPerformance?: boolean
}

/**
 * TarotTable3D — 赛博占卜桌主场景
 *
 * 整合 ParticleBg 粒子背景 + 3 张 CardMesh 卡牌，
 * 按「过去→现状→未来」时序翻牌。
 * React.memo 包裹避免无关重渲染。
 *
 * 卡牌位置：
 *  过去: (-2.5, 0, 0)
 *  现状: (0, 0, 0)
 *  未来: (2.5, 0, 0)
 *
 * 翻牌时序（设计规范 §6.3）：
 *  0ms:    过去牌开始翻转 (800ms)
 *  500ms:  现状牌开始翻转 (800ms)
 *  1000ms: 未来牌开始翻转 (800ms)
 */
function TarotTable3DScene({ cards, isShuffling = false, shouldFlip = false, lowPerformance = false }: Props) {
  const [flipped, setFlipped] = useState(false)

  // Latch shouldFlip to true once it becomes true (render-phase update avoids effect)
  if (shouldFlip && !flipped) {
    setFlipped(true)
  }

  /* ---- 粒子汇聚（翻牌后 1200ms 恢复漂移）---- */
  const [convergeDelayed, setConvergeDelayed] = useState(false)
  useEffect(() => {
    if (flipped) {
      const timer = setTimeout(() => setConvergeDelayed(true), 1200)
      return () => {
        clearTimeout(timer)
        setConvergeDelayed(false)
      }
    }
  }, [flipped])

  const convergeProgress = (isShuffling && !shouldFlip) || (flipped && !convergeDelayed) ? 1 : 0

  /* ---- 卡牌数据（无 cards 时使用占位） ---- */
  const cardPositions = useMemo<
    { label: string; pos: [number, number, number]; delay: number; rev: boolean; url?: string }[]
  >(
    () => [
      {
        label: "过去",
        pos: [-2.5, 0, 0] as [number, number, number],
        delay: 0,
        rev: cards?.[0]?.isReversed ?? false,
        url: cards?.[0]?.card?.imagePath,
      },
      {
        label: "现状",
        pos: [0, 0, 0] as [number, number, number],
        delay: 600,
        rev: cards?.[1]?.isReversed ?? false,
        url: cards?.[1]?.card?.imagePath,
      },
      {
        label: "未来",
        pos: [2.5, 0, 0] as [number, number, number],
        delay: 1200,
        rev: cards?.[2]?.isReversed ?? false,
        url: cards?.[2]?.card?.imagePath,
      },
    ],
    [cards],
  )

  return (
    <>
      {/* ---- 环境光 ---- */}
      <ambientLight intensity={AMBIENT_INTENSITY} />
      <directionalLight position={[5, 5, 5]} intensity={DIRECTIONAL_INTENSITY} />
      <pointLight position={[-3, 3, -3]} intensity={0.3} color="#b44dff" />
      <pointLight position={[3, -2, 4]} intensity={0.2} color="#00f0ff" />

      {/* ---- 粒子背景（翻牌前汇聚到卡牌位置）---- */}
      <ParticleBg
        highPerformance={!lowPerformance}
        convergeTargets={[[-2.5, 0, 0], [0, 0, 0], [2.5, 0, 0]]}
        convergeProgress={convergeProgress}
      />

      {/* ---- 三张卡牌 ---- */}
      <Suspense fallback={null}>
        {cardPositions.map((c) => (
          <CardMesh
            key={c.label}
            label={!shouldFlip ? c.label : undefined}
            position={c.pos}
            delay={c.delay}
            flip={flipped}
            isReversed={c.rev}
            textureUrl={c.url}
          />
        ))}
      </Suspense>

      {/* ---- 轨道控制（允许用鼠标旋转视角） ---- */}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        maxPolarAngle={Math.PI / 2.5}
        minPolarAngle={Math.PI / 3.5}
        autoRotate={false}
        target={[0, 0, 0]}
      />
    </>
  )
}

const MemoizedScene = memo(TarotTable3DScene)

/**
 * TarotTable3D — 入口组件（处理 Canvas 渲染）
 *
 * 由于 Canvas 需要在客户端创建，此组件应在父组件中通过
 * dynamic(() => import(...), { ssr: false }) 导入。
 */
export function TarotTable3D({ cards, isShuffling, shouldFlip, lowPerformance }: Props) {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 45, near: 0.1, far: 20 }}
      dpr={lowPerformance ? [1, 1.5] : [1, 2]}
      gl={{
        antialias: !lowPerformance,
        alpha: false,
        powerPreference: lowPerformance ? "low-power" : "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.2,
      }}
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        top: 0,
        left: 0,
      }}
    >
      <MemoizedScene
        cards={cards}
        isShuffling={isShuffling}
        shouldFlip={shouldFlip}
        lowPerformance={lowPerformance}
      />
    </Canvas>
  )
}

export default TarotTable3D
