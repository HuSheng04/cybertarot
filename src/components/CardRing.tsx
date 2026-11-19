"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import type { CSSProperties, PointerEvent } from "react"
import { CARDS } from "@/data/cards"

export const PIXELS_PER_CARD = 90
const DRAG_THRESHOLD = 6

export function wrapCardIndex(slot: number) {
  return ((slot % CARDS.length) + CARDS.length) % CARDS.length
}

type Drag = {
  pointerId: number
  startX: number
  startY: number
  startPosition: number
  moved: boolean
}

type CardRingProps = {
  position: number
  onDrag: (position: number) => void
  onSnap: () => void
  onWheel: (pixels: number) => void
  onSelect: (slot: number) => void
}

export default function CardRing({ position, onDrag, onSnap, onWheel, onSelect }: CardRingProps) {
  const ringRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<Drag | null>(null)
  const suppressClickRef = useRef(false)
  const [count, setCount] = useState(9)
  const center = Math.round(position)
  const half = (count - 1) / 2

  useEffect(() => {
    const narrowScreen = window.matchMedia("(max-width: 767px)")
    const updateCount = () => setCount(narrowScreen.matches ? 5 : 9)
    updateCount()
    narrowScreen.addEventListener("change", updateCount)
    return () => narrowScreen.removeEventListener("change", updateCount)
  }, [])

  useEffect(() => {
    const ring = ringRef.current
    if (!ring) return

    const handleWheel = (event: WheelEvent) => {
      const mode = event.deltaMode
      const { deltaX, deltaY } = event
      if (event.ctrlKey || Math.abs(deltaX) <= Math.abs(deltaY)) return

      event.preventDefault()
      if (dragRef.current) return
      const unit = mode === WheelEvent.DOM_DELTA_LINE ? 16
        : mode === WheelEvent.DOM_DELTA_PAGE ? ring.clientWidth : 1
      onWheel(deltaX * unit)
    }

    ring.addEventListener("wheel", handleWheel, { passive: false })
    return () => ring.removeEventListener("wheel", handleWheel)
  }, [onWheel])

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!event.isPrimary || event.button !== 0 || dragRef.current) return

    suppressClickRef.current = false
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startPosition: position,
      moved: false,
    }
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    if (drag?.pointerId !== event.pointerId) return

    const distance = event.clientX - drag.startX
    if (!drag.moved) {
      const verticalDistance = Math.abs(event.clientY - drag.startY)
      if (Math.abs(distance) < DRAG_THRESHOLD || Math.abs(distance) < verticalDistance) return
      drag.moved = true
      suppressClickRef.current = true
      // Capture on the ring after a drag begins so a tap still reaches its thumbnail.
      event.currentTarget.setPointerCapture(event.pointerId)
    }
    onDrag(drag.startPosition - distance / PIXELS_PER_CARD)
  }

  function finishDrag(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    if (drag?.pointerId !== event.pointerId) return

    dragRef.current = null
    if (drag.moved) onSnap()
  }

  return (
    <div
      ref={ringRef}
      className="card-ring"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishDrag}
      onPointerCancel={finishDrag}
      onLostPointerCapture={(event) => {
        if (event.target === event.currentTarget) finishDrag(event)
      }}
      onPointerLeave={(event) => {
        if (!dragRef.current?.moved) finishDrag(event)
      }}
      onClickCapture={(event) => {
        if (suppressClickRef.current && event.detail > 0) {
          event.preventDefault()
          event.stopPropagation()
        }
      }}
    >
      <div className="card-ring-track" aria-hidden="true" />
      {Array.from({ length: count }, (_, offset) => {
        const slot = center - half + offset
        const theta = (slot - position) * 2 * Math.PI / count
        const cosine = Math.cos(theta)
        const depth = (cosine + 1) / 2
        const front = slot === center
        const card = CARDS[wrapCardIndex(slot)]

        return (
          <button
            key={slot}
            type="button"
            className="card-ring-thumbnail"
            tabIndex={-1}
            aria-current={front ? true : undefined}
            aria-label={`${front ? "查看大图" : "移到前方"}：${card.nameZh} / ${card.nameEn}`}
            onClick={() => onSelect(slot)}
            style={{
              "--ring-x": Math.sin(theta),
              "--ring-y": cosine,
              "--ring-scale": 0.55 + depth * 0.45,
              zIndex: Math.round(depth * 100) + 1,
            } as CSSProperties}
          >
            <Image
              src={card.imagePath}
              alt=""
              fill
              sizes="(max-width: 400px) 28vw, (max-width: 767px) 120px, (max-width: 1050px) 16vw, 164px"
              className="card-ring-image"
              loading="eager"
              fetchPriority={front ? "high" : undefined}
              draggable={false}
            />
          </button>
        )
      })}
    </div>
  )
}
