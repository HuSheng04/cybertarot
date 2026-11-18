export type SwipeDirection = "left" | "right"
type Point = { x: number; y: number }
type Sample = Point & { time: number }

const PALM_INDICES = [0, 5, 9, 13, 17]

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
  private ready = false
  private lastTime: number | null = null

  reset() {
    this.samples = []
    this.centerSamples = []
    this.ready = false
    this.lastTime = null
  }

  update(palm: Point | null, time: number, width: number, height: number): SwipeDirection | null {
    if (!palm || width <= 0 || height <= 0) {
      this.reset()
      return null
    }
    // A paused tab or stalled camera must re-center before it can swipe again.
    if (this.lastTime !== null && time - this.lastTime > 200) this.reset()
    this.lastTime = time
    const sample = { ...palm, time }

    if (!this.ready) {
      if (palm.x < 0.35 || palm.x > 0.65) {
        this.centerSamples = []
        return null
      }
      this.centerSamples.push(sample)
      // Retain the earliest sample spanning at least 150ms at a 15fps cadence.
      while (this.centerSamples.length > 1 && time - this.centerSamples[1].time >= 150) {
        this.centerSamples.shift()
      }
      const xs = this.centerSamples.map((point) => point.x)
      if (Math.max(...xs) - Math.min(...xs) >= 0.03) {
        this.centerSamples = [sample]
        return null
      }
      if (time - this.centerSamples[0].time >= 150) {
        this.ready = true
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
    if (Math.abs(dx) > 0.2 && Math.abs(dx) * width >= 2 * Math.abs(dy) * height) {
      this.reset()
      return dx < 0 ? "left" : "right"
    }
    return null
  }
}
