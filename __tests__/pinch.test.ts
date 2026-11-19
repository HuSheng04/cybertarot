import { getPinchRatio, PinchTracker } from "@/lib/pinch"
import type { PinchTarget } from "@/lib/pinch"

const ring: PinchTarget = { view: "ring", slot: 3, revision: 0 }
const detail: PinchTarget = { view: "detail", slot: 3, revision: 1 }
const palm = { x: 0.5, y: 0.5 }

function frame(tracker: PinchTracker, time: number, ratio: number | null, target = ring, canStart = true, point = palm) {
  return tracker.update({ time, ratio, target, canStart, palm: point })
}

function begin(tracker: PinchTracker) {
  frame(tracker, 0, 0.6)
  frame(tracker, 70, 0.2)
}

test("指尖比例使用像素距离，并且不随镜像或画幅比例变化", () => {
  for (const height of [480, 640]) {
    const points = Array.from({ length: 21 }, () => ({ x: 0.3, y: 0.5 }))
    points[5] = { x: 0.2, y: 0.5 }
    points[17] = { x: 0.4, y: 0.5 }
    points[4] = { x: 0.3, y: 0.2 }
    points[8] = { x: 0.3, y: 0.2 + 32 / height }
    expect(getPinchRatio(points, 640, height)).toBeCloseTo(0.25)
    expect(getPinchRatio(points.map((point) => ({ ...point, x: 1 - point.x })), 640, height)).toBeCloseTo(0.25)
  }
})

test("缺关键点、非有限坐标、过小掌宽及无效画幅不会识别", () => {
  expect(getPinchRatio(undefined, 640, 480)).toBeNull()
  expect(getPinchRatio([], 640, 480)).toBeNull()
  const points = Array.from({ length: 21 }, () => ({ x: 0.5, y: 0.5 }))
  expect(getPinchRatio(points, 640, 480)).toBeNull()
  points[17].x += 0.001
  expect(getPinchRatio(points, 640, 480)).toBeNull()
  points[17].x = 0.7
  points[4].x = NaN
  expect(getPinchRatio(points, 640, 480)).toBeNull()
  expect(getPinchRatio(points, 0, 480)).toBeNull()
})

test("捏着手入镜不会触发，须先观察到张开", () => {
  const tracker = new PinchTracker()
  for (const time of [0, 70, 140, 210, 280, 350]) expect(frame(tracker, time, 0.2)).toBeNull()
  expect(tracker.feedback.phase).toBe("waiting-open")
  expect(frame(tracker, 420, 0.45)).toBeNull()
  expect(tracker.feedback.phase).toBe("ready")
  expect(frame(tracker, 490, 0.25)).toBeNull()
  expect(tracker.feedback.phase).toBe("holding")
})

test("未满 250ms 不确认，到期确认一次，长捏跨视图也不会重复", () => {
  const tracker = new PinchTracker()
  begin(tracker)
  for (const time of [140, 210, 280, 319]) expect(frame(tracker, time, 0.2)).toBeNull()
  expect(tracker.feedback.progress).toBeCloseTo(249 / 250)
  expect(frame(tracker, 320, 0.2)).toEqual(ring)
  expect(tracker.feedback.phase).toBe("locked")
  for (const time of [390, 460, 530, 600]) expect(frame(tracker, time, 0.2, detail)).toBeNull()
  expect(tracker.feedback.phase).toBe("locked")
  frame(tracker, 670, 0.45, detail)
  frame(tracker, 740, 0.25, detail)
  for (const time of [810, 880, 950]) expect(frame(tracker, time, 0.3, detail)).toBeNull()
  expect(frame(tracker, 990, 0.3, detail)).toEqual(detail)
})

test("两阈值间保持原状态，提前张开取消描边且可重新开始", () => {
  const tracker = new PinchTracker()
  frame(tracker, 0, 0.6)
  frame(tracker, 70, 0.3)
  expect(tracker.feedback.phase).toBe("ready")
  frame(tracker, 140, 0.25)
  frame(tracker, 210, 0.4)
  expect(tracker.feedback.phase).toBe("holding")
  frame(tracker, 280, 0.45)
  expect(tracker.feedback).toMatchObject({ phase: "ready", progress: 0, target: null })
  frame(tracker, 350, 0.2)
  for (const time of [420, 490, 560]) expect(frame(tracker, time, 0.4)).toBeNull()
  expect(frame(tracker, 600, 0.4)).toEqual(ring)
})

test.each(["missing", "invalid", "gap", "target", "view", "revision", "moving", "horizontal", "vertical"])("%s 中断会取消确认，恢复后必须重新张开", (reason) => {
  const tracker = new PinchTracker()
  begin(tracker)
  const target = reason === "target" ? { ...ring, slot: 4 }
    : reason === "view" ? detail : reason === "revision" ? { ...ring, revision: 2 } : ring
  const time = reason === "gap" ? 221 : 140
  expect(tracker.update({
    time, ratio: reason === "invalid" ? NaN : 0.2, target, canStart: reason !== "moving",
    palm: reason === "missing" ? null : reason === "horizontal" ? { x: 0.56, y: 0.5 }
      : reason === "vertical" ? { x: 0.5, y: 0.56 } : palm,
  })).toBeNull()
  expect(tracker.feedback).toMatchObject({ phase: "waiting-open", progress: 0 })
  for (const next of [time + 70, time + 140, time + 210, time + 280]) {
    expect(frame(tracker, next, 0.2, target)).toBeNull()
  }
  expect(tracker.feedback.phase).toBe("waiting-open")
})

test("画廊或挥手状态不允许确认时，不开始计时", () => {
  const tracker = new PinchTracker()
  frame(tracker, 0, 0.6)
  for (const time of [70, 140, 210, 280, 350]) expect(frame(tracker, time, 0.2, ring, false)).toBeNull()
  expect(tracker.feedback.progress).toBe(0)
  expect(tracker.feedback.phase).toBe("ready")
})

test("相同阶段没有进度变化时，复用反馈对象，避免重复读屏和渲染", () => {
  const tracker = new PinchTracker()
  frame(tracker, 0, 0.6)
  const ready = tracker.feedback
  frame(tracker, 70, 0.6)
  expect(tracker.feedback).toBe(ready)
  tracker.reset()
  expect(tracker.feedback.phase).toBe("waiting-open")
})
