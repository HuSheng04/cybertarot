"use client"

import Image from "next/image"
import { useCallback, useEffect, useRef, useState } from "react"
import type { KeyboardEvent } from "react"
import { CARDS, SUIT_NAMES } from "@/data/cards"
import { useHandSwipe } from "@/hooks/useHandSwipe"
import type { SwipeDirection } from "@/lib/handSwipe"
import CardRing, { PIXELS_PER_CARD, wrapCardIndex } from "./CardRing"

const SNAP_DURATION_MS = 240
const gestureHints = {
  searching: "请举起一只手，让摄像头看到手掌",
  centering: "已看到手，请移到画面中间",
  settling: "手已居中，请稍停一下",
  ready: "已就绪　← 左挥看下一张　·　右挥看上一张 →",
  returning: "已翻牌，请回到挥手前的位置并停稳",
}

const WHEEL_IDLE_MS = 150

export default function CardGallery() {
  const viewportRef = useRef<HTMLDivElement>(null)
  const modeButtonRef = useRef<HTMLButtonElement>(null)
  const focusModeButton = useRef(false)
  const positionRef = useRef(0)
  const targetRef = useRef(0)
  const frameRef = useRef<number | null>(null)
  const wheelTimerRef = useRef<number | null>(null)
  const [mode, setMode] = useState<"ring" | "detail">("ring")
  const [position, setPosition] = useState(0)
  const currentIndex = wrapCardIndex(Math.round(position))
  const currentCard = CARDS[currentIndex]

  const updatePosition = useCallback((next: number) => {
    positionRef.current = next
    setPosition(next)
  }, [])

  const cancelMotion = useCallback(() => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    if (wheelTimerRef.current !== null) window.clearTimeout(wheelTimerRef.current)
    frameRef.current = null
    wheelTimerRef.current = null
  }, [])

  const goTo = useCallback((target: number, immediate = false) => {
    cancelMotion()
    targetRef.current = target
    const from = positionRef.current
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
    if (immediate || reducedMotion.matches || from === target) {
      updatePosition(target)
      return
    }

    const startedAt = performance.now()
    function animate(now: number) {
      const progress = Math.max(0, (now - startedAt) / SNAP_DURATION_MS)
      if (progress >= 1 || reducedMotion.matches) {
        frameRef.current = null
        updatePosition(target)
        return
      }

      const eased = 1 - (1 - progress) ** 3
      updatePosition(from + (target - from) * eased)
      frameRef.current = requestAnimationFrame(animate)
    }
    frameRef.current = requestAnimationFrame(animate)
  }, [cancelMotion, updatePosition])

  const step = useCallback((direction: -1 | 1) => {
    goTo(targetRef.current + direction, mode === "detail")
  }, [goTo, mode])

  const rotateTo = useCallback((next: number) => {
    cancelMotion()
    targetRef.current = Math.round(next)
    updatePosition(next)
  }, [cancelMotion, updatePosition])

  const snap = useCallback(() => goTo(Math.round(positionRef.current)), [goTo])

  const rotateWithWheel = useCallback((pixels: number) => {
    rotateTo(positionRef.current + pixels / PIXELS_PER_CARD)
    wheelTimerRef.current = window.setTimeout(snap, WHEEL_IDLE_MS)
  }, [rotateTo, snap])

  useEffect(() => cancelMotion, [cancelMotion])

  useEffect(() => {
    if (!focusModeButton.current) return
    focusModeButton.current = false
    modeButtonRef.current?.focus()
  }, [mode])

  const onSwipe = useCallback((direction: SwipeDirection) => {
    step(direction === "left" ? 1 : -1)
  }, [step])
  const { videoRef, status: gestureStatus, guide, error: gestureError, start, stop } = useHandSwipe(onSwipe)
  const gestureEnabled = gestureStatus === "starting" || gestureStatus === "running"

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 768px) and (any-pointer: fine)")
    const stopOnMobile = () => { if (!desktop.matches) stop() }
    desktop.addEventListener("change", stopOnMobile)
    return () => desktop.removeEventListener("change", stopOnMobile)
  }, [stop])

  function changeMode(next: "ring" | "detail") {
    goTo(Math.round(positionRef.current), true)
    focusModeButton.current = true
    setMode(next)
  }

  function selectThumbnail(slot: number) {
    if (slot === Math.round(positionRef.current)) changeMode("detail")
    else {
      goTo(slot)
      viewportRef.current?.focus({ preventScroll: true })
    }
  }

  function dragTo(next: number) {
    viewportRef.current?.focus({ preventScroll: true })
    rotateTo(next)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey) return

    switch (event.key) {
      case "ArrowLeft":
      case "ArrowRight":
        event.preventDefault()
        step(event.key === "ArrowLeft" ? -1 : 1)
        break
      case "Home":
      case "End": {
        event.preventDefault()
        const index = event.key === "Home" ? 0 : CARDS.length - 1
        const cycle = Math.round((targetRef.current - index) / CARDS.length)
        goTo(index + cycle * CARDS.length, mode === "detail")
        break
      }
      case "Enter":
        if (mode === "ring" && viewportRef.current?.contains(event.target as Node)) {
          event.preventDefault()
          changeMode("detail")
        }
        break
      case "Escape":
        if (mode === "detail") {
          event.preventDefault()
          changeMode("ring")
        }
        break
    }
  }

  return (
    <main className="card-gallery" aria-labelledby="gallery-title" onKeyDown={handleKeyDown}>
      <header className="gallery-header">
        <div>
          <p className="gallery-brand">CYBER TAROT</p>
          <h1 id="gallery-title">卡片画廊</h1>
        </div>
        <p className="gallery-collection">78 张牌 · 一场漫游</p>
      </header>

      <div
        id="gallery-viewport"
        ref={viewportRef}
        className="gallery-viewport"
        role="region"
        aria-roledescription="轮播"
        aria-label="塔罗牌画廊"
        aria-describedby="gallery-hint"
        tabIndex={0}
      >
        <figure className="gallery-slide">
          {mode === "ring" ? (
            <CardRing
              position={position}
              onDrag={dragTo}
              onSnap={snap}
              onWheel={rotateWithWheel}
              onSelect={selectThumbnail}
            />
          ) : (
            <div className="gallery-artwork">
              <Image
                key={currentCard.id}
                src={currentCard.imagePath}
                alt={`${currentCard.nameZh} / ${currentCard.nameEn}`}
                fill
                sizes="(max-width: 640px) calc(100vw - 40px), 600px"
                className="gallery-image"
                loading="eager"
                draggable={false}
              />
            </div>
          )}
          <figcaption className="gallery-caption">
            <p className="gallery-suit">{SUIT_NAMES[currentCard.suit]}</p>
            <h2>{currentCard.nameZh}</h2>
            <p className="gallery-name-en" lang="en">{currentCard.nameEn}</p>
          </figcaption>
        </figure>
      </div>

      <footer className="gallery-footer">
        <div className="gallery-actions">
          <div className="gallery-main-controls">
            <nav className="gallery-controls" aria-label="卡片翻页">
              <button type="button" aria-controls="gallery-viewport" onClick={() => step(-1)}>
                <span className="gallery-arrow" aria-hidden="true">←</span> 上一张
              </button>
              <p className="gallery-position" role="status" aria-live="polite" aria-atomic="true">
                <span className="sr-only">{currentCard.nameZh} / {currentCard.nameEn}，</span>
                {currentIndex + 1} <span className="gallery-count-total">/ {CARDS.length}</span>
              </p>
              <button type="button" aria-controls="gallery-viewport" onClick={() => step(1)}>
                下一张 <span className="gallery-arrow" aria-hidden="true">→</span>
              </button>
            </nav>
            <button
              type="button"
              ref={modeButtonRef}
              className="gallery-mode-button"
              aria-controls="gallery-viewport"
              onClick={() => changeMode(mode === "ring" ? "detail" : "ring")}
            >
              {mode === "ring" ? "查看大图" : "返回牌环"}
            </button>
          </div>
          <div className="gallery-gesture">
            <button
              type="button"
              className="gallery-gesture-toggle"
              aria-pressed={gestureEnabled}
              aria-describedby="gesture-hint"
              onClick={() => { if (gestureEnabled) stop(); else void start() }}
            >
              <span className="gesture-indicator" aria-hidden="true" />
              {gestureStatus === "starting" ? "取消开启手势" : gestureEnabled ? "关闭手势翻页" : "开启手势翻页"}
            </button>
          </div>
        </div>
        <p id="gallery-hint" className="gallery-hint">
          {mode === "ring" ? "左右滑动或按方向键选牌 · Enter 查看大图" : "方向键切换 · Esc 返回牌环"}
        </p>
        <div className="gallery-gesture gallery-gesture-help">
          <p id="gesture-hint" aria-live="polite" aria-atomic="true" data-ready={gestureStatus === "running" && guide === "ready"}>
            {gestureStatus === "starting" ? "正在开启摄像头与加载模型，可随时取消…"
              : gestureStatus === "running" ? gestureHints[guide]
                : "开启后用摄像头挥手翻页 · 画面仅在本机处理"}
          </p>
          {gestureError && <p className="gallery-gesture-error" role="alert">{gestureError}</p>}
        </div>
        <video ref={videoRef} className="gesture-video" muted playsInline aria-hidden="true" />
      </footer>
    </main>
  )
}
