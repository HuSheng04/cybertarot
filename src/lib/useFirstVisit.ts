/**
 * useFirstVisit — 判断是否首次访问（通过 localStorage）
 *
 * - 首次访问: 完整播放开场动画
 * - 非首次访问: 直接跳过开场
 */
"use client"

import { useState, useEffect, useCallback } from "react"

const STORAGE_KEY = "cybertarot_visited"

export function useFirstVisit() {
  const [isFirstVisit, setIsFirstVisit] = useState(true)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    setTimeout(() => {
      const visited = localStorage.getItem(STORAGE_KEY)
      if (visited === "true") {
        setIsFirstVisit(false)
      }
      setIsReady(true)
    }, 0)
  }, [])

  const markVisited = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, "true")
    } catch {
      // localStorage 不可用时静默失败
    }
    setIsFirstVisit(false)
  }, [])

  return { isFirstVisit, isReady, markVisited }
}
