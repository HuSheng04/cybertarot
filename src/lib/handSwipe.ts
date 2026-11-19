export type SwipeDirection = "left" | "right"
export type SwipeGuide = "searching" | "centering" | "settling" | "ready" | "returning"
type Point = { x: number; y: number }
type Sample = Point & { time: number }

const PALM_INDICES = [0, 5, 9, 13, 17]
const CENTER_SETTLE_MS = 100
const RETURN_SETTLE_MS = 180
const RETURN_CENTER_RADIUS = 0.06
const TRACKING_GRACE_MS = 150

/** Raw camera frames are unmirrored; convert once to the user's mirror view. */
export function getMirroredPalm(landmarks: Point[] | undefined): Point | null {
  if (!landmarks || PALM_INDICES.some((index) => !landmarks[index])) return null
  const palm = PALM_INDICES.reduce((sum, index) => ({
    x: sum.x + landmarks[index].x / PALM_INDICES.length,
    y: sum.y + landmarks[index].y / PALM_INDICES.length,
  }), { x: 0, y: 0 })
  return { x: 1 - palm.x, y: palm.y }
}

/** Mutable tracking state, kept outside React's render loop. */
export class HandSwipeTracker {
  private samples: Sample[] = []
  private centerSamples: Sample[] = []
  private returnCenterX: number | null = null
  guide: SwipeGuide = "searching"
  private lastTime: number | null = null

  reset() {
    this.samples = []
    this.centerSamples = []
    this.returnCenterX = null
    this.guide = "searching"
    this.lastTime = null
  }

  update(palm: Point | null, time: number, width: number, height: number): SwipeDirection | null {
    if (width <= 0 || height <= 0) {
      this.reset()
      return null
    }
    // Measure the gap from the last valid hand, including paused/stalled frames.
    if (this.lastTime !== null && time - this.lastTime > TRACKING_GRACE_MS) {
      // Losing the hand cannot turn a swipe endpoint into a new neutral position.
      const returnCenterX = this.returnCenterX
      this.reset()
      this.returnCenterX = returnCenterX
      if (returnCenterX !== null) this.guide = "returning"
    }
    if (!palm) {
      // Allow a brief dropout without re-arming an already locked gesture.
      // Never join motion or center-settling samples across a tracking gap.
      this.samples = []
      this.centerSamples = []
      return null
    }
    this.lastTime = time
    const sample = { ...palm, time }

    if (this.guide !== "ready") {
      const returning = this.returnCenterX !== null
      const inCenter = this.returnCenterX !== null
        ? Math.abs(palm.x - this.returnCenterX) <= RETURN_CENTER_RADIUS
        : palm.x >= 0.25 && palm.x <= 0.75
      if (!inCenter) {
        this.guide = returning ? "returning" : "centering"
        this.centerSamples = []
        return null
      }
      this.guide = "settling"
      this.centerSamples.push(sample)
      const settleMs = returning ? RETURN_SETTLE_MS : CENTER_SETTLE_MS
      // Retain the earliest sample spanning the settling period at a 15fps cadence.
      while (this.centerSamples.length > 1 && time - this.centerSamples[1].time >= settleMs) {
        this.centerSamples.shift()
      }
      const xs = this.centerSamples.map((point) => point.x)
      if (Math.max(...xs) - Math.min(...xs) >= (returning ? 0.015 : 0.03)) {
        this.centerSamples = [sample]
        return null
      }
      if (time - this.centerSamples[0].time >= settleMs) {
        this.guide = "ready"
        this.returnCenterX = null
        this.centerSamples = []
        this.samples = [sample]
      }
      return null
    }

    this.samples = this.samples.filter((point) => time - point.time <= 400)
    this.samples.push(sample)
    if (this.samples.length < 3) return null
    const dx = palm.x - this.samples[0].x
    const dy = palm.y - this.samples[0].y
    if (Math.abs(dx) > 0.14 && Math.abs(dx) * width >= 1.5 * Math.abs(dy) * height) {
      const returnCenterX = this.samples[0].x
      this.reset()
      this.returnCenterX = returnCenterX
      this.guide = "returning"
      this.lastTime = time
      return dx < 0 ? "left" : "right"
    }
    return null
  }
}
