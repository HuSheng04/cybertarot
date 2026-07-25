import "@testing-library/jest-dom"

/* jsdom 缺少 IntersectionObserver — framer-motion whileInView 需要 */
if (typeof globalThis.IntersectionObserver === "undefined") {
  class MockIntersectionObserver implements IntersectionObserver {
    readonly root: Element | Document | null = null
    readonly rootMargin: string = "0px"
    readonly thresholds: ReadonlyArray<number> = [0]
    constructor(
      private readonly callback: IntersectionObserverCallback,
      _options?: IntersectionObserverInit,
    ) {}
    observe(target: Element): void {
      // 立即以"已进入视口"回调一次，保证 whileInView 内容在测试中可见
      this.callback(
        [
          {
            target,
            isIntersecting: true,
            intersectionRatio: 1,
            boundingClientRect: target.getBoundingClientRect(),
            intersectionRect: target.getBoundingClientRect(),
            rootBounds: null,
            time: Date.now(),
          } as IntersectionObserverEntry,
        ],
        this as unknown as IntersectionObserver,
      )
    }
    unobserve(): void {}
    disconnect(): void {}
    takeRecords(): IntersectionObserverEntry[] {
      return []
    }
  }
  globalThis.IntersectionObserver =
    MockIntersectionObserver as unknown as typeof IntersectionObserver
}
