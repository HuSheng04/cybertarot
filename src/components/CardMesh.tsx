"use client"

import { useRef, useEffect, useState, useCallback, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { useTexture } from "@react-three/drei"
import * as THREE from "three"

/* ===== 动画配置 ===== */
const DISSOLVE_DURATION = 1200 // 扫描溶解总时长 ms

type Props = {
  /** 卡牌正面纹理 URL */
  textureUrl?: string
  /** 是否逆位（牌面内容倒置） */
  isReversed?: boolean
  /** 翻转延迟 ms */
  delay?: number
  /** 触发翻转 */
  flip?: boolean
  /** 卡牌位置 */
  position?: [number, number, number]
  /** 位置标签（过去/现状/未来） */
  label?: string
}

/**
 * CardMesh — 单张 3D 塔罗牌（全息扫描溶解版）
 *
 * 不再使用 180° Y 轴旋转翻牌，改为全息扫描溶解过渡：
 * - 水平扫描线从上到下扫过牌背
 * - 扫过部分牌面逐渐显现
 * - 扫描线边缘有 cyan 辉光 + 数据碎片噪点
 * - 翻牌完成后牌面常驻
 */
export function CardMesh({
  textureUrl,
  isReversed = false,
  delay = 0,
  flip = false,
  position = [0, 0, 0],
  label,
}: Props) {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial | null>(null)

  /* ---- 加载纹理 ---- */
  const backTexture = useTexture("/assets/cards/card_back.webp")
  const faceTexture = useTexture(textureUrl ?? "/assets/cards/card_back.webp")

  /* ---- 扫描溶解动画状态 ---- */
  const [isRevealed, setIsRevealed] = useState(false)
  const animRef = useRef({
    started: false,
    startTime: 0,
    progress: 0,
  })
  const timeRef = useRef(0)

  /* ---- 触发翻转 ---- */
  useEffect(() => {
    if (!flip || animRef.current.started) return
    const timer = setTimeout(() => {
      animRef.current.started = true
      animRef.current.startTime = performance.now()
    }, delay)
    return () => clearTimeout(timer)
  }, [flip, delay])

  /* ---- 驱动溶解动画 + 翻牌后边缘流光 ---- */
  const edgeGlowTimeRef = useRef(0)
  useFrame(() => {
    const mat = materialRef.current
    if (!mat) return
    timeRef.current += 0.016

    // === 扫描溶解阶段 ===
    const anim = animRef.current
    if (anim.started) {
      const elapsed = performance.now() - anim.startTime
      anim.progress = Math.min(elapsed / DISSOLVE_DURATION, 1)

      // ease-out 曲线让扫描在结束前稍减速
      const eased = 1 - Math.pow(1 - anim.progress, 2)

      mat.uniforms.uProgress.value = eased
      mat.uniforms.uTime.value = timeRef.current

      if (anim.progress >= 1) {
        anim.started = false
        setIsRevealed(true)
      }
    }

    // === 翻牌后边缘流光（Task 5.4）===
    if (isRevealed) {
      edgeGlowTimeRef.current += 0.016
      const t = edgeGlowTimeRef.current

      if (isReversed) {
        // 逆位：purple 色，时断时续（闪烁不稳定感）
        const flicker = Math.sin(t * 1.5) * 0.5 + 0.5
        const burst = Math.sin(t * 4.7) > 0.92 ? 1.5 : 0.8
        const intensity = flicker * burst * 0.35
        mat.uniforms.uEdgeGlowIntensity.value = intensity
        mat.uniforms.uEdgeGlowColor.value.set("#b44dff")
      } else {
        // 正位：cyan 色，稳定匀速
        const pulse = Math.sin(t * 0.8) * 0.1 + 0.25
        mat.uniforms.uEdgeGlowIntensity.value = pulse
        mat.uniforms.uEdgeGlowColor.value.set("#00f0ff")
      }
    }
  })

  /* ---- hover 发光 ---- */
  const [hovered, setHovered] = useState(false)
  const onPointerEnter = useCallback(() => setHovered(true), [])
  const onPointerOut = useCallback(() => setHovered(false), [])

  /* ---- 清理纹理 ---- */
  useEffect(() => {
    return () => {
      try { backTexture?.dispose?.() } catch {}
      try { faceTexture?.dispose?.() } catch {}
    }
  }, [backTexture, faceTexture])

  /* ================================================================ */
  /*  自定义着色器 — 全息扫描溶解                                       */
  /*                                                                    */
  /*  uProgress: 0→1 扫描进度                                           */
  /*  scanLine 从顶部移动到底部，下方牌面显现，上方牌背保留                */
  /*  扫描线边缘：cyan 辉光 + 紫色数据碎片噪点                          */
  /* ================================================================ */
  const uniforms = useMemo(
    () => ({
      uBackTexture: { value: backTexture },
      uFaceTexture: { value: faceTexture },
      uProgress: { value: 0 },
      uIsReversed: { value: isReversed ? 1.0 : 0.0 },
      uTime: { value: 0 },
      uEdgeGlowIntensity: { value: 0 },
      uEdgeGlowColor: { value: new THREE.Color("#00f0ff") },
    }),
    [backTexture, faceTexture, isReversed],
  )

  const vertexShader = useMemo(
    () => `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    [],
  )

  const fragmentShader = useMemo(
    () => `
      precision highp float;

      uniform sampler2D uBackTexture;
      uniform sampler2D uFaceTexture;
      uniform float uProgress;
      uniform float uIsReversed;
      uniform float uTime;
      uniform float uEdgeGlowIntensity;
      uniform vec3 uEdgeGlowColor;

      varying vec2 vUv;

      // 简易噪声
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      void main() {
        // 扫描线位置（uv.y: 0=底部, 1=顶部）
        // 从顶部(1)扫到底部(0)
        float scanLine = 1.0 - uProgress;

        // 像素到扫描线的有符号距离（正=已扫描区域，负=未扫描）
        float dist = vUv.y - scanLine;

        // 扫描线边缘宽度
        float edgeWidth = 0.04;
        // smooth 过渡：已扫描区域显示牌面
        float revealAmount = smoothstep(-edgeWidth, edgeWidth, dist);

        // 牌背颜色
        vec4 backColor = texture2D(uBackTexture, vUv);
        // 牌面颜色（逆位时垂直翻转 UV）
        vec2 faceUv = vec2(vUv.x, uIsReversed > 0.5 ? 1.0 - vUv.y : vUv.y);
        vec4 faceColor = texture2D(uFaceTexture, faceUv);

        // 混合牌背 → 牌面
        vec4 finalColor = mix(backColor, faceColor, revealAmount);

        // 扫描线 cyan 辉光
        float glowDist = abs(dist);
        float glow = exp(-glowDist * 60.0) * 0.7;
        finalColor.rgb += vec3(0.0, 0.94, 1.0) * glow;

        // 数据碎片噪点（扫描线边缘附近）
        float noise = hash(floor(vUv * 180.0 + uTime * 3.0));
        float fragmentZone = smoothstep(0.0, edgeWidth, edgeWidth - glowDist);
        if (fragmentZone > 0.0 && noise > 0.82) {
          finalColor.rgb += vec3(0.71, 0.30, 1.0) * noise * 0.6;
        }

        // 全息溶解完成时微弱的 cyan tint 偏移
        if (uProgress > 0.95) {
          float finishGlow = (uProgress - 0.95) * 20.0 * 0.15;
          finalColor.rgb += vec3(0.0, 0.94, 1.0) * finishGlow;
        }

        // 翻牌后边缘数据流光（Task 5.4）
        if (uEdgeGlowIntensity > 0.01) {
          // 计算到最近边缘的距离
          vec2 edgeDist = min(vUv, 1.0 - vUv);
          float minEdge = min(edgeDist.x, edgeDist.y);
          float edgeMask = 1.0 - smoothstep(0.0, 0.05, minEdge);

          // 只在牌面可见时显示
          float faceVisible = uProgress > 0.99 ? 1.0 : 0.0;
          float glowAmount = edgeMask * uEdgeGlowIntensity * faceVisible;

          // 流光线条感（沿边缘流动）
          float flow = sin(vUv.x * 30.0 - uTime * 2.0) * 0.5 + 0.5;
          float flow2 = sin(vUv.y * 30.0 + uTime * 1.5) * 0.5 + 0.5;
          float flowPattern = mix(flow, flow2, 0.5) * glowAmount;

          finalColor.rgb += uEdgeGlowColor * glowAmount * 0.8;
          finalColor.rgb += uEdgeGlowColor * flowPattern * 0.5;
        }

        gl_FragColor = finalColor;
      }
    `,
    [],
  )

  /* ================================================================ */
  /*  渲染                                                             */
  /*                                                                    */
  /*  单 mesh + ShaderMaterial：自动管理牌背/牌面过渡                     */
  /*  翻转完成后 shader 输出牌面纹理                                     */
  /* ================================================================ */
  return (
    <group position={position}>
      <mesh ref={meshRef} onPointerEnter={onPointerEnter} onPointerOut={onPointerOut}>
        <planeGeometry args={[2.2, 3.08]} />
        <shaderMaterial
          ref={materialRef}
          uniforms={uniforms}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          transparent
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* ---- hover 发光边框 ---- */}
      {hovered && (
        <mesh position={[0, 0, 0.02]}>
          <planeGeometry args={[2.3, 3.18]} />
          <meshBasicMaterial
            color="#00f0ff"
            transparent
            opacity={0.12}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* ---- 位置标签（翻牌前显示） ---- */}
      {label && !isRevealed && (
        <mesh position={[0, -2.0, 0]}>
          <planeGeometry args={[1.6, 0.3]} />
          <meshBasicMaterial
            color="#0a0a1a"
            transparent
            opacity={0.6}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  )
}

export default CardMesh
