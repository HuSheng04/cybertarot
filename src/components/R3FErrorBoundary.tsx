"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"

type Props = {
  children: ReactNode
  fallback?: ReactNode
}

type State = {
  hasError: boolean
  errorMessage: string
}

/**
 * R3FErrorBoundary — 3D 场景错误边界
 *
 * 捕获 WebGL 崩溃 / GPU 上下文丢失，降级渲染 CSS 2D 卡牌。
 * 设计规范：MASTER.md §9.3 — WebGL 崩溃 → CSS 2D 降级
 */
export class R3FErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, errorMessage: "" }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.warn("[R3FErrorBoundary] 3D 场景错误:", error.message, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex flex-col items-center gap-6 py-12">
            {/* 提示信息 */}
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="font-heading text-lg tracking-wider text-neon-cyan">
                经典模式
              </div>
              <p className="max-w-xs text-sm text-text-muted">
                3D 加速不可用，已切换至经典模式
              </p>
            </div>

            {/* CSS 2D 占位卡牌 */}
            <div className="flex items-center justify-center gap-4 md:gap-6">
              {["过去", "现状", "未来"].map((label, i) => (
                <div
                  key={label}
                  className="group relative flex h-52 w-36 flex-col items-center justify-center rounded-xl border border-card-border bg-card-surface shadow-card transition-all duration-300 hover:border-neon-cyan/30 hover:shadow-card-glow md:h-56 md:w-40"
                  style={{ animationDelay: `${i * 0.15}s` }}
                >
                  {/* 牌背图案 */}
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-12 w-9 items-center justify-center rounded-md border border-neon-cyan/20 bg-gradient-to-br from-neon-cyan/5 to-neon-purple/5">
                      <span className="font-heading text-xs tracking-widest text-neon-cyan/40">
                        ?
                      </span>
                    </div>
                    <span className="font-subheading text-xs uppercase tracking-widest text-text-muted">
                      {label}
                    </span>
                  </div>

                  {/* 边角 HUD 装饰 */}
                  <div className="absolute bottom-2 left-2 h-3 w-3 border-b border-l border-neon-cyan/20" />
                  <div className="absolute right-2 top-2 h-3 w-3 border-r border-t border-neon-cyan/20" />
                </div>
              ))}
            </div>

            {/* 错误详情（仅开发环境） */}
            {process.env.NODE_ENV === "development" && (
              <details className="max-w-md text-xs text-text-muted">
                <summary className="cursor-pointer font-subheading tracking-wider">
                  错误详情
                </summary>
                <pre className="mt-2 rounded-lg bg-card-surface p-3 text-[10px] leading-relaxed">
                  {this.state.errorMessage}
                </pre>
              </details>
            )}
          </div>
        )
      )
    }

    return this.props.children
  }
}

export default R3FErrorBoundary
