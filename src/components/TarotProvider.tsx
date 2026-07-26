"use client"

/* ===== TarotProvider — 核心流程状态管理 ===== */
/*
 * 管理占卜全流程状态：phase / question / cards / apiKey / error
 * - useReducer 实现纯状态转换
 * - apiKey 与 localStorage 双向同步
 * - 每日限额 30 次（localStorage 计数器）
 */

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react"
import type { DrawnCard, Phase } from "@/types"
import { drawCards } from "@/lib/drawEngine"

/* =================================================== */
/*  类型定义                                            */
/* =================================================== */

interface TarotState {
  /** 当前流程阶段 */
  phase: Phase
  /** 用户问题 */
  question: string
  /** 已抽卡牌（三张） */
  cards: DrawnCard[]
  /** DeepSeek API Key */
  apiKey: string | null
  /** 错误信息 */
  error: string | null
  /** 是否触发 3D 翻牌动画 */
  shouldFlip: boolean
  /** 是否达到每日限额 */
  isDailyLimitReached: boolean
}

type TarotAction =
  | { type: "SET_API_KEY"; payload: string | null }
  | { type: "RESTORE_SAVED_KEY"; payload: string | null }
  | { type: "SUBMIT_QUESTION"; payload: string }
  | { type: "FINISH_FLIP" }
  | { type: "FINISH_READING" }
  | { type: "SET_ERROR"; payload: string }
  | { type: "CLEAR_ERROR" }
  | { type: "RESET" }

interface TarotContextValue {
  state: TarotState
  setApiKey: (key: string | null) => void
  submitQuestion: (question: string) => void
  finishFlip: () => void
  finishReading: () => void
  setError: (msg: string) => void
  clearError: () => void
  reset: () => void
}

/* =================================================== */
/*  常量                                                */
/* =================================================== */

const DAILY_LIMIT = 30
const STORAGE_KEY_API_KEY = "cybertarot_api_key"
const STORAGE_KEY_COUNT = "cybertarot_daily_count"
const STORAGE_KEY_DATE = "cybertarot_daily_date"

/* =================================================== */
/*  初始状态                                            */
/* =================================================== */

const initialState: TarotState = {
  phase: "braindance",
  question: "",
  cards: [],
  apiKey: null,
  error: null,
  shouldFlip: false,
  isDailyLimitReached: false,
}

/* =================================================== */
/*  工具函数                                            */
/* =================================================== */

/** 获取 localStorage 中的 API Key */
function loadApiKey(): string | null {
  if (typeof window === "undefined") return null
  try {
    return localStorage.getItem(STORAGE_KEY_API_KEY)
  } catch {
    return null
  }
}

/** 保存 API Key 到 localStorage */
function saveApiKey(key: string | null): void {
  if (typeof window === "undefined") return
  try {
    if (key) {
      localStorage.setItem(STORAGE_KEY_API_KEY, key)
    } else {
      localStorage.removeItem(STORAGE_KEY_API_KEY)
    }
  } catch {
    // localStorage 不可用时静默失败
  }
}

/** 检查并更新每日限额 */
function checkDailyLimit(): { isLimited: boolean; count: number } {
  if (typeof window === "undefined") return { isLimited: false, count: 0 }
  try {
    const today = new Date().toISOString().slice(0, 10)
    const storedDate = localStorage.getItem(STORAGE_KEY_DATE)
    const storedCount = parseInt(localStorage.getItem(STORAGE_KEY_COUNT) || "0", 10)

    if (storedDate !== today) {
      // 新的一天，重置计数器
      localStorage.setItem(STORAGE_KEY_DATE, today)
      localStorage.setItem(STORAGE_KEY_COUNT, "0")
      return { isLimited: false, count: 0 }
    }

    return { isLimited: storedCount >= DAILY_LIMIT, count: storedCount }
  } catch {
    return { isLimited: false, count: 0 }
  }
}

/** 增加每日使用计数 */
function incrementDailyCount(): void {
  if (typeof window === "undefined") return
  try {
    const today = new Date().toISOString().slice(0, 10)
    const storedDate = localStorage.getItem(STORAGE_KEY_DATE)

    if (storedDate !== today) {
      localStorage.setItem(STORAGE_KEY_DATE, today)
      localStorage.setItem(STORAGE_KEY_COUNT, "1")
    } else {
      const count = parseInt(localStorage.getItem(STORAGE_KEY_COUNT) || "0", 10)
      localStorage.setItem(STORAGE_KEY_COUNT, String(count + 1))
    }
  } catch {
    // 静默失败
  }
}

/* =================================================== */
/*  Reducer                                            */
/* =================================================== */

function tarotReducer(state: TarotState, action: TarotAction): TarotState {
  switch (action.type) {
    case "SET_API_KEY":
      return {
        ...state,
        apiKey: action.payload,
        phase: "input",
        error: null,
      }

    case "RESTORE_SAVED_KEY":
      return {
        ...state,
        apiKey: action.payload,
        // 不改变 phase — 让用户仍看到 BraindancePortal 做选择
      }

    case "SUBMIT_QUESTION": {
      // 检查每日限额
      const { isLimited } = checkDailyLimit()
      if (isLimited) {
        return {
          ...state,
          isDailyLimitReached: true,
          error: "今日占卜次数已达上限（30/30），赛博先知需要休息。明日再来。",
          phase: "error",
        }
      }

      // 抽牌
      const drawnCards = drawCards(action.payload)

      // 增加计数
      incrementDailyCount()

      return {
        ...state,
        question: action.payload,
        cards: drawnCards,
        phase: "shuffling",
        shouldFlip: true,
        error: null,
      }
    }

    case "FINISH_FLIP":
      return {
        ...state,
        phase: "reading",
      }

    case "FINISH_READING":
      return {
        ...state,
        phase: "done",
      }

    case "SET_ERROR":
      return {
        ...state,
        phase: "error",
        error: action.payload,
      }

    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
        phase: "input",
      }

    case "RESET":
      return {
        ...initialState,
        apiKey: state.apiKey, // 保留 Key
        phase: "input", // 回到输入界面
      }

    default:
      return state
  }
}

/* =================================================== */
/*  Context                                            */
/* =================================================== */

const TarotContext = createContext<TarotContextValue | null>(null)

/* =================================================== */
/*  Provider                                           */
/* =================================================== */

export function TarotProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(tarotReducer, initialState)

  // ---- 启动时从 localStorage 读取 apiKey ----
  useEffect(() => {
    const savedKey = loadApiKey()
    if (savedKey) {
      dispatch({ type: "RESTORE_SAVED_KEY", payload: savedKey })
    }
  }, [])

  // ---- apiKey 变更时同步到 localStorage ----
  useEffect(() => {
    saveApiKey(state.apiKey)
  }, [state.apiKey])

  /* ===== action 封装 ===== */

  const setApiKey = useCallback((key: string | null) => {
    dispatch({ type: "SET_API_KEY", payload: key })
  }, [])

  const submitQuestion = useCallback((question: string) => {
    dispatch({ type: "SUBMIT_QUESTION", payload: question })
  }, [])

  const finishFlip = useCallback(() => {
    dispatch({ type: "FINISH_FLIP" })
  }, [])

  const finishReading = useCallback(() => {
    dispatch({ type: "FINISH_READING" })
  }, [])

  const setError = useCallback((msg: string) => {
    dispatch({ type: "SET_ERROR", payload: msg })
  }, [])

  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" })
  }, [])

  const reset = useCallback(() => {
    dispatch({ type: "RESET" })
  }, [])

  /* ===== context value ===== */

  const value = useMemo<TarotContextValue>(
    () => ({
      state,
      setApiKey,
      submitQuestion,
      finishFlip,
      finishReading,
      setError,
      clearError,
      reset,
    }),
    [state, setApiKey, submitQuestion, finishFlip, finishReading, setError, clearError, reset],
  )

  return <TarotContext.Provider value={value}>{children}</TarotContext.Provider>
}

/* =================================================== */
/*  Hook                                               */
/* =================================================== */

export function useTarot(): TarotContextValue {
  const ctx = useContext(TarotContext)
  if (!ctx) {
    throw new Error("useTarot must be used within a TarotProvider")
  }
  return ctx
}
