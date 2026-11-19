import { getMirroredPalm, HandSwipeTracker } from "@/lib/handSwipe"
import type { SwipeDirection, SwipeMode } from "@/lib/handSwipe"

function centered(tracker: HandSwipeTracker, start = 0, afterSwipe = false) {
  const times = [start, start + 70, start + 140]
  if (afterSwipe) times.push(start + 210)
  for (const time of times) {
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
  centered(tracker, 630, true)
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
  expect(tracker.update({ x: 0.8, y: 0.65 }, 350, 320, 640)).toBeNull()
})

test.each([
  ["left", [0.435, 0.37, 0.35]],
  ["right", [0.565, 0.63, 0.65]],
] as const)("较短的 %s 挥手超过 14%% 后即可触发", (direction, xs) => {
  const tracker = new HandSwipeTracker()
  centered(tracker)
  expect(tracker.update({ x: xs[0], y: 0.5 }, 210, 640, 480)).toBeNull()
  expect(tracker.update({ x: xs[1], y: 0.5 }, 280, 640, 480)).toBeNull()
  expect(tracker.update({ x: xs[2], y: 0.5 }, 350, 640, 480)).toBe(direction)
})

test.each([
  ["left", 0.3], ["right", 0.3], ["left", 0.5], ["right", 0.5],
] as const)("%s 从 x=%s 起手，在恰好 14%% 的边界不会因浮点误差提前触发", (direction, origin) => {
  const tracker = new HandSwipeTracker()
  const mirror = (x: number) => direction === "left" ? x : 1 - x
  for (const time of [0, 70, 140]) tracker.update({ x: mirror(origin), y: 0.5 }, time, 640, 480)
  expect(tracker.update({ x: mirror(origin - 0.07), y: 0.5 }, 210, 640, 480)).toBeNull()
  expect(tracker.update({ x: mirror(origin - 0.14), y: 0.5 }, 280, 640, 480)).toBeNull()
  expect(tracker.update({ x: mirror(origin - 0.15), y: 0.5 }, 350, 640, 480)).toBe(direction)
})

test("横移约为纵移 1.64 倍的斜向挥手可以触发", () => {
  const tracker = new HandSwipeTracker()
  centered(tracker)
  expect(tracker.update({ x: 0.42, y: 0.565 }, 210, 640, 480)).toBeNull()
  expect(tracker.update({ x: 0.34, y: 0.63 }, 280, 640, 480)).toBe("left")
})

test.each([0.27, 0.73])("可以在放宽后的中间区域 x=%s 停稳再挥手", (x) => {
  const tracker = new HandSwipeTracker()
  for (const time of [0, 50, 100]) {
    expect(tracker.update({ x, y: 0.5 }, time, 640, 480)).toBeNull()
  }
  const step = x < 0.5 ? -0.08 : 0.08
  expect(tracker.update({ x: x + step, y: 0.5 }, 170, 640, 480)).toBeNull()
  expect(tracker.update({ x: x + 2 * step, y: 0.5 }, 240, 640, 480)).toBe(x < 0.5 ? "left" : "right")
})

test.each([99, 100])("停稳 %sms 时严格遵守 100ms 的解锁条件", (duration) => {
  const tracker = new HandSwipeTracker()
  for (const time of [0, 50, duration]) tracker.update({ x: 0.27, y: 0.5 }, time, 640, 480)
  expect(tracker.update({ x: 0.19, y: 0.5 }, duration + 70, 640, 480)).toBeNull()
  expect(tracker.update({ x: 0.11, y: 0.5 }, duration + 140, 640, 480)).toBe(duration >= 100 ? "left" : null)
})

test("漏一帧恢复时不连接旧轨迹，保留就绪状态且重新收集三帧", () => {
  const tracker = new HandSwipeTracker()
  centered(tracker)
  expect(tracker.update({ x: 0.42, y: 0.5 }, 210, 640, 480)).toBeNull()
  expect(tracker.update(null, 280, 640, 480)).toBeNull()
  expect(tracker.update({ x: 0.85, y: 0.5 }, 350, 640, 480)).toBeNull()
  expect(tracker.update({ x: 0.77, y: 0.5 }, 420, 640, 480)).toBeNull()
  expect(tracker.update({ x: 0.69, y: 0.5 }, 490, 640, 480)).toBe("left")
})

test.each([150, 151])("恢复时距上次有效识别 %sms，超过 150ms 才要求回中", (gap) => {
  const tracker = new HandSwipeTracker()
  centered(tracker)
  tracker.update(null, 210, 640, 480)
  expect(tracker.update({ x: 0.85, y: 0.5 }, 140 + gap, 640, 480)).toBeNull()
  expect(tracker.update({ x: 0.77, y: 0.5 }, 210 + gap, 640, 480)).toBeNull()
  expect(tracker.update({ x: 0.69, y: 0.5 }, 280 + gap, 640, 480)).toBe(gap <= 150 ? "left" : null)
})

test("连续漏帧不会续期容错时间，长时间丢手后须重新回中", () => {
  const tracker = new HandSwipeTracker()
  centered(tracker)
  for (const time of [210, 280, 350]) expect(tracker.update(null, time, 640, 480)).toBeNull()
  for (const [time, x] of [[420, 0.85], [490, 0.77], [560, 0.69]]) {
    expect(tracker.update({ x, y: 0.5 }, time, 640, 480)).toBeNull()
  }
  centered(tracker, 630)
  expect(tracker.update({ x: 0.42, y: 0.5 }, 840, 640, 480)).toBeNull()
  expect(tracker.update({ x: 0.34, y: 0.5 }, 910, 640, 480)).toBe("left")
})

test("挥手锁定后短暂漏帧不会解锁，收手途中也不会反向翻页", () => {
  const tracker = new HandSwipeTracker()
  centered(tracker)
  tracker.update({ x: 0.42, y: 0.5 }, 210, 640, 480)
  expect(tracker.update({ x: 0.34, y: 0.5 }, 280, 640, 480)).toBe("left")
  tracker.update(null, 350, 640, 480)
  for (const [time, x] of [[420, 0.4], [490, 0.55], [560, 0.7]]) {
    expect(tracker.update({ x, y: 0.5 }, time, 640, 480)).toBeNull()
  }
})

test("漏帧前的停稳时间不会计入恢复后的回中判定", () => {
  const tracker = new HandSwipeTracker()
  tracker.update({ x: 0.27, y: 0.5 }, 0, 640, 480)
  tracker.update({ x: 0.27, y: 0.5 }, 70, 640, 480)
  tracker.update(null, 100, 640, 480)
  tracker.update({ x: 0.27, y: 0.5 }, 140, 640, 480)
  expect(tracker.update({ x: 0.19, y: 0.5 }, 210, 640, 480)).toBeNull()
  expect(tracker.update({ x: 0.11, y: 0.5 }, 280, 640, 480)).toBeNull()
})

test.each([
  ["left", 0.42, 0.34],
  ["right", 0.58, 0.66],
] as const)("%s 挥手后在端点暂停，再回正不会被识别为反向挥手", (direction, middle, end) => {
  const tracker = new HandSwipeTracker()
  centered(tracker)
  tracker.update({ x: middle, y: 0.5 }, 210, 640, 480)
  expect(tracker.update({ x: end, y: 0.5 }, 280, 640, 480)).toBe(direction)
  for (const time of [350, 420, 490, 560]) {
    expect(tracker.update({ x: end, y: 0.5 }, time, 640, 480)).toBeNull()
    expect(tracker.guide).toBe("returning")
  }
  expect(tracker.update({ x: middle, y: 0.5 }, 630, 640, 480)).toBeNull()
  expect(tracker.update({ x: 0.5, y: 0.5 }, 700, 640, 480)).toBeNull()
})

test("回正途中短暂停顿或轻微过冲仍保持锁定", () => {
  const tracker = new HandSwipeTracker()
  centered(tracker)
  tracker.update({ x: 0.42, y: 0.5 }, 210, 640, 480)
  expect(tracker.update({ x: 0.34, y: 0.5 }, 280, 640, 480)).toBe("left")
  for (const [time, x] of [[350, 0.45], [420, 0.45], [490, 0.45], [560, 0.53], [630, 0.6]]) {
    expect(tracker.update({ x, y: 0.5 }, time, 640, 480)).toBeNull()
    expect(tracker.guide).not.toBe("ready")
  }
})

test.each([
  ["left", 0.42, 0.34],
  ["right", 0.58, 0.66],
] as const)("回到原位停稳 180ms 后可以有意再次 %s 挥手", (direction, middle, end) => {
  const tracker = new HandSwipeTracker()
  centered(tracker)
  tracker.update({ x: 0.42, y: 0.5 }, 210, 640, 480)
  expect(tracker.update({ x: 0.34, y: 0.5 }, 280, 640, 480)).toBe("left")
  for (const time of [350, 420, 490, 529]) {
    expect(tracker.update({ x: 0.5, y: 0.5 }, time, 640, 480)).toBeNull()
    expect(tracker.guide).toBe("settling")
  }
  expect(tracker.update({ x: 0.5, y: 0.5 }, 530, 640, 480)).toBeNull()
  expect(tracker.guide).toBe("ready")
  expect(tracker.update({ x: middle, y: 0.5 }, 600, 640, 480)).toBeNull()
  expect(tracker.update({ x: end, y: 0.5 }, 670, 640, 480)).toBe(direction)
})

test("回程中持续丢手也不会忘记原来的回正位置", () => {
  const tracker = new HandSwipeTracker()
  centered(tracker)
  tracker.update({ x: 0.42, y: 0.5 }, 210, 640, 480)
  expect(tracker.update({ x: 0.34, y: 0.5 }, 280, 640, 480)).toBe("left")
  for (const time of [350, 420, 490]) tracker.update(null, time, 640, 480)
  for (const time of [560, 630, 700, 770]) {
    expect(tracker.update({ x: 0.34, y: 0.5 }, time, 640, 480)).toBeNull()
    expect(tracker.guide).toBe("returning")
  }
  expect(tracker.update({ x: 0.42, y: 0.5 }, 840, 640, 480)).toBeNull()
  expect(tracker.update({ x: 0.5, y: 0.5 }, 910, 640, 480)).toBeNull()
})

test.each([0.27, 0.73])("在 x=%s 起手时也能回到自己的起点再次挥手", (x) => {
  const tracker = new HandSwipeTracker()
  for (const time of [0, 70, 140]) tracker.update({ x, y: 0.5 }, time, 640, 480)
  const step = x < 0.5 ? -0.08 : 0.08
  tracker.update({ x: x + step, y: 0.5 }, 210, 640, 480)
  expect(tracker.update({ x: x + 2 * step, y: 0.5 }, 280, 640, 480)).toBe(x < 0.5 ? "left" : "right")
  for (const time of [350, 420, 490, 560]) {
    expect(tracker.update({ x, y: 0.5 }, time, 640, 480)).toBeNull()
  }
  expect(tracker.guide).toBe("ready")
  expect(tracker.update({ x: x + step, y: 0.5 }, 630, 640, 480)).toBeNull()
  expect(tracker.update({ x: x + 2 * step, y: 0.5 }, 700, 640, 480)).toBe(x < 0.5 ? "left" : "right")
})

describe("停留连翻", () => {
  const sides = [
    { direction: "left", middle: 0.4, side: 0.25, short: 0.34, outside: 0.281, opposite: 0.8 },
    { direction: "right", middle: 0.6, side: 0.75, short: 0.66, outside: 0.719, opposite: 0.2 },
  ] as const

  function swipe(direction: SwipeDirection, end: number, mode: SwipeMode = "repeat") {
    const tracker = new HandSwipeTracker(mode)
    centered(tracker)
    tracker.update({ x: direction === "left" ? 0.4 : 0.6, y: 0.5 }, 210, 640, 480)
    expect(tracker.update({ x: end, y: 0.5 }, 280, 640, 480)).toBe(direction)
    return tracker
  }

  // Include intermediate valid frames so timed tests do not simulate tracking loss.
  function hold(tracker: HandSwipeTracker, x: number, from: number, to: number) {
    const events: SwipeDirection[] = []
    for (let time = Math.min(from + 100, to); time <= to && to > from; time = Math.min(time + 100, to)) {
      const direction = tracker.update({ x, y: 0.5 }, time, 640, 480)
      if (direction) events.push(direction)
      if (time === to) break
    }
    return events
  }

  test.each(sides)("$direction：单次模式在侧边长停不会连翻", ({ direction, side }) => {
    const tracker = swipe(direction, side, "single")
    expect(hold(tracker, side, 280, 3000)).toEqual([])
    expect(tracker.guide).toBe("returning")
  })

  test.each(sides)("$direction：450ms 翻第二张，随后每 650ms 翻一张", ({ direction, side }) => {
    const tracker = swipe(direction, side)
    expect(tracker.guide).toBe(`holding-${direction}`)
    expect(hold(tracker, side, 280, 729)).toEqual([])
    expect(tracker.update({ x: side, y: 0.5 }, 730, 640, 480)).toBe(direction)
    expect(tracker.guide).toBe(`repeating-${direction}`)
    expect(hold(tracker, side, 730, 1379)).toEqual([])
    expect(tracker.update({ x: side, y: 0.5 }, 1380, 640, 480)).toBe(direction)
    expect(tracker.update({ x: side, y: 0.5 }, 1381, 640, 480)).toBeNull()
  })

  test.each(sides)("$direction：侧边轻微回摆不应中断连续翻页", ({ direction }) => {
    const mirror = (x: number) => direction === "left" ? x : 1 - x
    const tracker = swipe(direction, mirror(0.24))
    for (const [index, time] of [350, 420, 490, 560, 630, 700].entries()) {
      expect(tracker.update({ x: mirror(index % 2 ? 0.24 : 0.27), y: 0.5 }, time, 640, 480)).toBeNull()
    }
    expect(tracker.update({ x: mirror(0.27), y: 0.5 }, 730, 640, 480)).toBe(direction)
    expect(tracker.guide).toBe(`repeating-${direction}`)
    expect(hold(tracker, mirror(0.27), 730, 1379)).toEqual([])
    expect(tracker.update({ x: mirror(0.27), y: 0.5 }, 1380, 640, 480)).toBe(direction)
    expect(tracker.update({ x: mirror(0.31), y: 0.5 }, 1450, 640, 480)).toBeNull()
    expect(hold(tracker, mirror(0.24), 1450, 2500)).toEqual([])
  })

  test.each(sides)("$direction：延后进入侧边时才开始计算停留", ({ direction, side, short }) => {
    const tracker = swipe(direction, short)
    expect(tracker.guide).toBe(`repeat-pending-${direction}`)
    expect(hold(tracker, short, 280, 700)).toEqual([])
    expect(tracker.update({ x: side, y: 0.5 }, 770, 640, 480)).toBeNull()
    expect(tracker.guide).toBe(`holding-${direction}`)
    expect(hold(tracker, side, 770, 1219)).toEqual([])
    expect(tracker.update({ x: side, y: 0.5 }, 1220, 640, 480)).toBe(direction)
  })

  test.each(sides)("$direction：只把手伸入边缘不会翻页", ({ side }) => {
    const tracker = new HandSwipeTracker("repeat")
    expect(hold(tracker, side, -100, 2000)).toEqual([])
  })

  test.each(sides)("$direction：短挥后先收手，不能再沿用连翻资格", ({ direction, side, short }) => {
    const tracker = swipe(direction, short)
    expect(tracker.update({ x: 0.5, y: 0.5 }, 350, 640, 480)).toBeNull()
    expect(tracker.guide).toBe("settling")
    expect(tracker.update({ x: side, y: 0.5 }, 420, 640, 480)).toBeNull()
    expect(hold(tracker, side, 420, 2000)).toEqual([])
  })

  test.each(sides)("$direction：快速收手跨过起点也会取消连翻资格", ({ direction, side, short, opposite }) => {
    const tracker = swipe(direction, short)
    expect(tracker.update({ x: opposite, y: 0.5 }, 350, 640, 480)).toBeNull()
    expect(tracker.guide).toBe("returning")
    expect(hold(tracker, side, 350, 2000)).toEqual([])
  })

  test.each(sides)("$direction：移出侧边缓冲区立即取消，再入侧边或经过另一侧不翻页", ({ direction, side, outside, opposite }) => {
    const tracker = swipe(direction, side)
    expect(hold(tracker, side, 280, 729)).toEqual([])
    expect(tracker.update({ x: outside, y: 0.5 }, 730, 640, 480)).toBeNull()
    expect(tracker.guide).toBe("returning")
    expect(hold(tracker, side, 730, 1500)).toEqual([])
    expect(hold(tracker, opposite, 1500, 2500)).toEqual([])
  })

  test.each(sides)("$direction：连翻开始后收手也会取消", ({ direction, side, outside }) => {
    const tracker = swipe(direction, side)
    expect(hold(tracker, side, 280, 730)).toEqual([direction])
    expect(tracker.update({ x: outside, y: 0.5 }, 800, 640, 480)).toBeNull()
    expect(hold(tracker, side, 800, 2500)).toEqual([])
  })

  test.each(sides)("$direction：漏一帧就取消待连翻，恢复后不续翻", ({ direction, side }) => {
    const tracker = swipe(direction, side)
    expect(hold(tracker, side, 280, 680)).toEqual([])
    expect(tracker.update(null, 730, 640, 480)).toBeNull()
    expect(hold(tracker, side, 730, 2500)).toEqual([])
  })

  test.each(sides)("$direction：帧间隔超过 150ms 后不补翻", ({ direction, side }) => {
    const tracker = swipe(direction, side)
    expect(hold(tracker, side, 280, 680)).toEqual([])
    expect(tracker.update({ x: side, y: 0.5 }, 831, 640, 480)).toBeNull()
    expect(hold(tracker, side, 831, 2500)).toEqual([])
  })

  test("到期帧稍晚时，从实际翻页帧重新计算下次间隔", () => {
    const tracker = swipe("left", 0.25)
    expect(hold(tracker, 0.25, 280, 680)).toEqual([])
    expect(tracker.update({ x: 0.25, y: 0.5 }, 780, 640, 480)).toBe("left")
    expect(hold(tracker, 0.25, 780, 1429)).toEqual([])
    expect(tracker.update({ x: 0.25, y: 0.5 }, 1430, 640, 480)).toBe("left")
  })

  test.each(["single", "repeat"] as const)("切换到 %s 模式后，清空待连翻并要求重新居中", (mode) => {
    const tracker = swipe("left", 0.25)
    if (mode === "repeat") tracker.setMode("single")
    tracker.setMode(mode)
    expect(tracker.guide).toBe("searching")
    expect(hold(tracker, 0.2, 280, 2000)).toEqual([])
    centered(tracker, 2070)
    expect(tracker.guide).toBe("ready")
  })
})
