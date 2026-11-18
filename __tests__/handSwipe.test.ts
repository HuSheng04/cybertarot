import { getMirroredPalm, HandSwipeTracker } from "@/lib/handSwipe"

function centered(tracker: HandSwipeTracker, start = 0) {
  for (const time of [start, start + 70, start + 140, start + 210]) {
    expect(tracker.update({ x: 0.5, y: 0.5 }, time, 640, 480)).toBeNull()
  }
}

test("只平均手腕和四个指根，并转换原始帧的镜像方向", () => {
  const landmarks = Array.from({ length: 21 }, () => ({ x: 0, y: 0 }))
  for (const index of [0, 5, 9, 13, 17]) landmarks[index] = { x: 0.8, y: 0.6 }
  expect(getMirroredPalm(landmarks)?.x).toBeCloseTo(0.2)
  expect(getMirroredPalm(landmarks)?.y).toBeCloseTo(0.6)
  expect(getMirroredPalm(undefined)).toBeNull()
})

test("左右挥手各触发一次，回程和未停稳的再挥不会翻页", () => {
  const tracker = new HandSwipeTracker()
  centered(tracker)
  expect(tracker.update({ x: 0.4, y: 0.5 }, 280, 640, 480)).toBeNull()
  expect(tracker.update({ x: 0.25, y: 0.5 }, 350, 640, 480)).toBe("left")
  for (const [time, x] of [[420, 0.5], [490, 0.6], [560, 0.8]]) {
    expect(tracker.update({ x, y: 0.5 }, time, 640, 480)).toBeNull()
  }
  centered(tracker, 630)
  expect(tracker.update({ x: 0.6, y: 0.5 }, 910, 640, 480)).toBeNull()
  expect(tracker.update({ x: 0.75, y: 0.5 }, 980, 640, 480)).toBe("right")
})

test("首次入镜、离开后再入镜和采样中断必须先居中", () => {
  const tracker = new HandSwipeTracker()
  for (const [time, x] of [[0, 0.8], [70, 0.5], [140, 0.2]]) {
    expect(tracker.update({ x, y: 0.5 }, time, 640, 480)).toBeNull()
  }
  centered(tracker, 210)
  tracker.update(null, 490, 640, 480)
  expect(tracker.update({ x: 0.8, y: 0.5 }, 560, 640, 480)).toBeNull()
  expect(tracker.update({ x: 0.2, y: 0.5 }, 630, 640, 480)).toBeNull()
  centered(tracker, 700)
  expect(tracker.update({ x: 0.1, y: 0.5 }, 1300, 640, 480)).toBeNull()
})

test("轻微抖动、竖直移动和超过 400ms 的慢移不会翻页", () => {
  for (const positions of [
    [{ x: 0.51, y: 0.5 }, { x: 0.48, y: 0.5 }, { x: 0.52, y: 0.5 }],
    [{ x: 0.6, y: 0.7 }, { x: 0.75, y: 0.95 }, { x: 0.8, y: 1 }],
  ]) {
    const tracker = new HandSwipeTracker()
    centered(tracker)
    positions.forEach((point, i) => {
      expect(tracker.update(point, 280 + 70 * i, 640, 480)).toBeNull()
    })
  }
  const tracker = new HandSwipeTracker()
  centered(tracker)
  for (let i = 1; i <= 12; i++) {
    expect(tracker.update({ x: 0.5 - i * 0.025, y: 0.5 }, 210 + 70 * i, 640, 480)).toBeNull()
  }
})

test("横纵位移按像素比例判定，且至少收到三帧", () => {
  const tracker = new HandSwipeTracker()
  centered(tracker)
  expect(tracker.update({ x: 0.75, y: 0.5 }, 280, 320, 640)).toBeNull()
  expect(tracker.update({ x: 0.8, y: 0.6 }, 350, 320, 640)).toBeNull()
})
