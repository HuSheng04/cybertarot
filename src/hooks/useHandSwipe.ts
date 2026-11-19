"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { HandLandmarker } from "@mediapipe/tasks-vision"
import { getMirroredPalm, HandSwipeTracker } from "@/lib/handSwipe"
import type { SwipeDirection, SwipeGuide } from "@/lib/handSwipe"

type Status = "idle" | "starting" | "running" | "error"
type Session = {
  video: HTMLVideoElement
  stream: MediaStream | null
  detector: HandLandmarker | null
  frame: number | null
  removeListeners: () => void
}

function release(session: Session) {
  if (session.frame !== null) cancelAnimationFrame(session.frame)
  session.removeListeners()
  session.stream?.getTracks().forEach((track) => track.stop())
  if (session.stream && session.video.srcObject === session.stream) {
    session.video.pause()
    session.video.srcObject = null
  }
  // Camera tracks have already been released, even if the runtime fails to close.
  try { session.detector?.close() } catch { /* Already disposed by the runtime. */ }
}

function cameraError(error: unknown) {
  const name = error instanceof Error ? error.name : ""
  switch (name) {
    case "NotAllowedError":
    case "SecurityError":
      return "摄像头权限被拒绝，请在浏览器中允许访问后重试。"
    case "NotFoundError":
    case "OverconstrainedError":
      return "未找到可用的摄像头，请连接摄像头后重试。"
    case "NotReadableError":
    case "AbortError":
      return "摄像头无法启动，可能正被其他应用占用，请稍后重试。"
    default:
      return "摄像头无法启动，请检查设备和浏览器权限后重试。"
  }
}

export function useHandSwipe(onSwipe: (direction: SwipeDirection) => void) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const sessionRef = useRef<Session | null>(null)
  const onSwipeRef = useRef(onSwipe)
  const [status, setStatus] = useState<Status>("idle")
  const [guide, setGuide] = useState<SwipeGuide>("searching")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { onSwipeRef.current = onSwipe }, [onSwipe])

  const cleanup = useCallback(() => {
    const session = sessionRef.current
    sessionRef.current = null
    if (session) release(session)
  }, [])

  const stop = useCallback(() => {
    cleanup()
    setStatus("idle")
    setError(null)
  }, [cleanup])

  useEffect(() => cleanup, [cleanup])

  const start = useCallback(async () => {
    if (sessionRef.current) return
    setError(null)
    if (window.isSecureContext === false || !navigator.mediaDevices?.getUserMedia) {
      setStatus("error")
      setError("当前环境不支持摄像头访问，请使用支持摄像头的浏览器，并通过 HTTPS 或 localhost 打开。")
      return
    }
    const video = videoRef.current
    if (!video) return
    const session: Session = {
      video, stream: null, detector: null, frame: null, removeListeners: () => {},
    }
    sessionRef.current = session
    setGuide("searching")
    setStatus("starting")
    const isCurrent = () => sessionRef.current === session
    const fail = (message: string) => {
      if (!isCurrent()) return
      cleanup()
      setError(message)
      setStatus("error")
    }
    const onPageHide = () => stop()
    window.addEventListener("pagehide", onPageHide)
    session.removeListeners = () => window.removeEventListener("pagehide", onPageHide)
    let stage: "camera" | "model" = "camera"

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      })
      // A permission prompt can outlive a cancelled start or an unmounted page.
      if (!isCurrent()) {
        stream.getTracks().forEach((track) => track.stop())
        return
      }
      session.stream = stream
      const onEnded = () => fail("摄像头连接已中断，请检查设备后重新开启。")
      stream.getVideoTracks().forEach((track) => track.addEventListener("ended", onEnded))
      session.removeListeners = () => {
        stream.getVideoTracks().forEach((track) => track.removeEventListener("ended", onEnded))
        window.removeEventListener("pagehide", onPageHide)
      }
      video.srcObject = stream
      await video.play()
      if (!isCurrent()) return

      stage = "model"
      const { FilesetResolver, HandLandmarker } = await import("@mediapipe/tasks-vision")
      if (!isCurrent()) return
      const files = await FilesetResolver.forVisionTasks("/mediapipe/wasm")
      if (!isCurrent()) return
      const detector = await HandLandmarker.createFromOptions(files, {
        baseOptions: { modelAssetPath: "/mediapipe/hand_landmarker.task" },
        runningMode: "VIDEO",
        numHands: 1,
      })
      if (!isCurrent()) {
        detector.close()
        return
      }
      session.detector = detector
      setStatus("running")
      const tracker = new HandSwipeTracker()
      let lastSample = -Infinity
      let lastVideoTime = -1
      const detect = (now: number) => {
        if (!isCurrent()) return
        try {
          const previousGuide = tracker.guide
          if (document.hidden) tracker.reset()
          else if (now - lastSample >= 1000 / 15 && video.readyState >= 2
            && video.currentTime !== lastVideoTime) {
            lastSample = now
            lastVideoTime = video.currentTime
            const result = detector.detectForVideo(video, now)
            const direction = tracker.update(
              getMirroredPalm(result.landmarks[0]), now, video.videoWidth, video.videoHeight,
            )
            if (direction) onSwipeRef.current(direction)
          }
          if (previousGuide !== tracker.guide) setGuide(tracker.guide)
          if (isCurrent()) session.frame = requestAnimationFrame(detect)
        } catch {
          fail("手势识别运行失败，请重新开启；仍可使用按钮或方向键翻页。")
        }
      }
      session.frame = requestAnimationFrame(detect)
    } catch (cause) {
      fail(stage === "camera" ? cameraError(cause) : "手势模型加载失败，请稍后重试；仍可使用按钮或方向键翻页。")
    }
  }, [cleanup, stop])

  return { videoRef, status, guide, error, start, stop }
}
