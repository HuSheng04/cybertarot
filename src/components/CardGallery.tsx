"use client"

import Image from "next/image"
import { useCallback, useEffect, useRef, useState } from "react"
import type { KeyboardEvent } from "react"
import { CARDS, SUIT_NAMES } from "@/data/cards"
import { useHandSwipe } from "@/hooks/useHandSwipe"
import type { SwipeDirection } from "@/lib/handSwipe"

export default function CardGallery() {
  const viewportRef = useRef<HTMLDivElement>(null)
  const currentIndexRef = useRef(0)
  const [currentIndex, setCurrentIndex] = useState(0)
  const currentCard = CARDS[currentIndex]

  const updatePosition = useCallback(() => {
    const viewport = viewportRef.current
    if (!viewport?.clientWidth) return

    const index = Math.max(
      0,
      Math.min(CARDS.length - 1, Math.round(viewport.scrollLeft / viewport.clientWidth)),
    )
    currentIndexRef.current = index
    setCurrentIndex(index)
  }, [])

  const goToCard = useCallback((index: number) => {
    const viewport = viewportRef.current
    if (!viewport) return

    const target = Math.max(0, Math.min(CARDS.length - 1, index))
    viewport.scrollTo({
      left: target * viewport.clientWidth,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    })
  }, [])

  const onSwipe = useCallback((direction: SwipeDirection) => {
    goToCard(currentIndexRef.current + (direction === "left" ? 1 : -1))
  }, [goToCard])
  const { videoRef, status: gestureStatus, error: gestureError, start, stop } = useHandSwipe(onSwipe)
  const gestureEnabled = gestureStatus === "starting" || gestureStatus === "running"

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 768px) and (any-pointer: fine)")
    const stopOnMobile = () => { if (!desktop.matches) stop() }
    desktop.addEventListener("change", stopOnMobile)
    return () => desktop.removeEventListener("change", stopOnMobile)
  }, [stop])

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    // Keep the same card centered when rotating a phone or resizing a window.
    const alignCurrentCard = () => {
      viewport.scrollTo({
        left: currentIndexRef.current * viewport.clientWidth,
        behavior: "auto",
      })
    }
    const observer = new ResizeObserver(alignCurrentCard)
    observer.observe(viewport)
    return () => observer.disconnect()
  }, [])

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const targets: Record<string, number> = {
      ArrowLeft: currentIndexRef.current - 1,
      ArrowRight: currentIndexRef.current + 1,
      Home: 0,
      End: CARDS.length - 1,
    }
    if (event.key in targets) {
      event.preventDefault()
      goToCard(targets[event.key])
    }
  }

  return (
    <main className="card-gallery" aria-labelledby="gallery-title">
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
        onScroll={updatePosition}
        onKeyDown={handleKeyDown}
      >
        {CARDS.map((card, index) => (
          <figure
            key={card.id}
            className="gallery-slide"
            role="group"
            aria-roledescription="卡片"
            aria-label={`${index + 1} / ${CARDS.length}：${card.nameZh} / ${card.nameEn}`}
            aria-hidden={index !== currentIndex}
          >
            <div className="gallery-artwork">
              <Image
                src={card.imagePath}
                alt={`${card.nameZh} / ${card.nameEn}`}
                fill
                sizes="(max-width: 640px) calc(100vw - 40px), 600px"
                className="gallery-image"
                preload={index === 0}
                loading={index === 0 ? undefined : "lazy"}
                draggable={false}
              />
            </div>
            <figcaption className="gallery-caption">
              <p className="gallery-suit">{SUIT_NAMES[card.suit]}</p>
              <h2>{card.nameZh}</h2>
              <p className="gallery-name-en" lang="en">{card.nameEn}</p>
            </figcaption>
          </figure>
        ))}
      </div>

      <footer className="gallery-footer">
        <div className="gallery-actions">
          <nav className="gallery-controls" aria-label="卡片翻页">
            <button
              type="button"
              aria-controls="gallery-viewport"
              disabled={currentIndex === 0}
              onClick={() => goToCard(currentIndexRef.current - 1)}
            >
              <span aria-hidden="true">←</span> 上一张
            </button>
            <p className="gallery-position" role="status" aria-live="polite" aria-atomic="true">
              <span className="sr-only">{currentCard.nameZh} / {currentCard.nameEn}，</span>
              {currentIndex + 1} <span className="gallery-count-total">/ {CARDS.length}</span>
            </p>
            <button
              type="button"
              aria-controls="gallery-viewport"
              disabled={currentIndex === CARDS.length - 1}
              onClick={() => goToCard(currentIndexRef.current + 1)}
            >
              下一张 <span aria-hidden="true">→</span>
            </button>
          </nav>
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
        <p id="gallery-hint" className="gallery-hint">左右滑动 · 触控板或方向键翻页</p>
        <div className="gallery-gesture gallery-gesture-help">
          <p id="gesture-hint" aria-live="polite">
            {gestureStatus === "starting" ? "正在开启摄像头与加载模型，可随时取消…"
              : gestureStatus === "running" ? "手放中间，左挥下一张，右挥上一张 · 每次挥手后回中停稳"
                : "开启后用摄像头挥手翻页 · 画面仅在本机处理"}
          </p>
          {gestureError && <p className="gallery-gesture-error" role="alert">{gestureError}</p>}
        </div>
        <video ref={videoRef} className="gesture-video" muted playsInline aria-hidden="true" />
      </footer>
    </main>
  )
}
