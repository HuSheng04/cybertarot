# CyberTarot 赛博占卜师 — 项目执行计划 v3.2

> 基于 PRD v3.2 拆解，按阶段划分，每个任务标注依赖关系与验收标准
>
> 仓库：`F:\CyberTarot` | 框架：Next.js App Router + TypeScript | 部署：Vercel

---

## 📋 全局依赖与约定

| 项 | 约定 |
|------|--------|
| 包管理器 | `pnpm` |
| Node 版本 | >= 18 |
| 代码规范 | ESLint + Prettier（Tailwind 类名排序） |
| 提交规范 | `type(scope): desc`（feat/fix/refactor/docs/test/chore） |
| 图片源目录 | `public/assets/cards/`（78+1 PNG 已就位 → Sharp 脚本压缩） |
| 环境变量 | `.env.local` 模板：`DEEPSEEK_API_KEY=`, `NEXT_PUBLIC_APP_URL=` |

---

## M1：项目初始化与骨架搭建（Day 1 上午）

> 目标：跑通 Next.js 开发服务器 + Tailwind 暗黑主题 + 完整目录结构 + 路由框架

### 1.1 初始化 Next.js 项目

- [x] `pnpm create next-app cybertarot --typescript --tailwind --eslint --app --src-dir`
- [x] **安装核心依赖**：
  - 3D：`@react-three/fiber @react-three/drei three`（`@types/three` 已内置于 three.js r150+）
  - 动画：`framer-motion`
  - 工具：`sharp`（图片压缩脚本用）
- [x] **安装开发依赖**：
  - 测试：`jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom ts-jest`
  - 类型：`@types/node @types/jest`
  - 构建：`tailwindcss-animate`
- [x] 配置 `tsconfig.json`（`@/` 别名已默认，确认）
- [x] 配置 `jest.config.ts` + `__tests__/` 目录
- [x] 配置 `.env.local` 模板（DEEPSEEK_API_KEY、NEXT_PUBLIC_APP_URL）

**验收标准：**
- [x] `pnpm dev` 正常启动，访问 `localhost:3000` 显示页面
- [x] `pnpm test` 运行通过（默认测试）
- [x] `pnpm build` 无错误

### 1.2 暗黑主题系统

- [x] 定制 `tailwind.config.ts`（Tailwind v4 改用 `globals.css` 的 `@theme inline` 实现）：
  - 霓虹蓝紫配色：`bg-deep-space: #0a0a1a`、`neon-cyan: #00f0ff`、`neon-purple: #b44dff`
  - 语义色（design-system 补充）：`success: #00ff88`、`warning: #ffbb00`、`error: #ff3366`、`info: #00d4ff`
  - 字体：标题 `Orbitron` / `Rajdhani`，正文 `Inter`
  - 扩展：`boxShadow`（霓虹发光效果）、`backgroundImage`（黑暗渐变）
- [x] `app/globals.css`：next/font 加载 Google Fonts + 暗黑基础样式 + 自定义 utility 类（`text-glow-cyan`/`text-glow-purple`、`neon-border`）
- [x] 全局 `layout.tsx`：
  - `<html lang="zh-CN">` + 暗黑 class
  - `<body>` 基础结构（`bg-deep-space text-text-primary`）
  - metadata 配置：`og:title`、`og:description`（`og:image` 待 M6.10 补充）

**验收标准：**
- [x] 全页面深色背景，霓虹蓝紫配色生效
- [x] 字体加载正确，无 FOIT（字体闪烁）
- [x] 全局 layout 渲染正常

### 1.3 目录结构与路由框架

- [x] 创建完整目录结构（参见 PRD §7.1）：
  ```
  src/
  ├── app/
  │   ├── page.tsx                     ← 首页占位
  │   ├── layout.tsx                    ← 已配置
  │   ├── about/page.tsx               ← 占位
  │   ├── cards/page.tsx               ← 占位
  │   └── api/
  │       ├── reading/route.ts          ← 占位返回 200
  │       └── verify-key/route.ts       ← 占位返回 200
  ├── components/                       ← 空目录
  ├── data/                             ← 待 M2 填充
  ├── lib/                              ← 待 M2/M5 填充
  └── types/                            ← 待 M2 填充
  ```
- [x] Navbar 组件：Logo + 「占卜/关于/牌库」导航链接（Framer Motion 下划线动效 + 当前页高亮）
- [x] 三个路由页面各自独立 metadata（继承全局 layout）
- [x] 创建设计系统文档：
  ```
  design-system/
  ├── MASTER.md            ← 全局设计规则源（配色/字体/布局/动画/组件规范）
  └── pages/
      ├── home.md          ← 首页设计指南（Phase 流转/翻牌时序/组件布局）
      ├── about.md         ← 关于页设计指南（内容区块/技术决策看板）
      └── cards.md         ← 牌库页设计指南（筛选/网格/详情模态框）
  ```

**验收标准：**
- [x] `/`、`/about`、`/cards` 三个路由均可访问（`pnpm build` 确认）
- [x] Navbar 路由跳转正常，高亮当前页
- [x] 目录结构符合 PRD §7.1 + 新增 design-system/ 设计文档

---

## M2：牌库系统 + 抽牌引擎（Day 1 下午）

> 目标：78 张塔罗牌数据结构 + Fisher-Yates 洗牌 + 正逆位判定 + 单元测试

### 2.1 类型定义

- [x] `src/types/index.ts` 定义核心类型：
  ```typescript
  - Suit enum（Major, Wands, Cups, Swords, Pentacles）
  - Card interface（id, nameZh, nameEn, suit, keywords, meaningUp, meaningDown）
  - DrawnCard interface（card: Card, isReversed: boolean, position: 'past' | 'present' | 'future'）
  - Phase type（braindance | input | shuffling | drawing | reading | done | error）
  ```

### 2.2 78 张牌数据

- [x] `src/data/cards.ts` 生成全量数据（启动阶段手动编写）：
  - 22 张大阿卡纳（major_00～major_21）
  - 14 张权杖（wands_01～wands_14）
  - 14 张圣杯（cups_01～cups_14）
  - 14 张宝剑（swords_01～swords_14）
  - 14 张星币（pentacles_01～pentacles_14）
  - 每张牌含：id、中英文名、花色、关键词、正/逆位释义
  - export 常量和辅助函数（`getCardById`、`getCardsBySuit`）

### 2.3 抽牌引擎

- [x] `src/lib/drawEngine.ts`：
  - `drawCards(question: string): DrawnCard[]`
  - Fisher-Yates 洗牌 → 取前 3 张 → 每张 70% 正位 / 30% 逆位随机
  - 问题字符串作为种子参与随机（确保同一问题结果一致，但保留可复现性）
  - 第 1 张→过去、第 2 张→现状、第 3 张→未来

### 2.4 单元测试

- [x] `__tests__/cards.test.ts`：
  - 78 张牌数量验证
  - 所有牌 ID 唯一
  - 花色分组正确
  - 每张牌必填字段完整
- [x] `__tests__/drawEngine.test.ts`：
  - 三次抽牌不重复（同一张牌不会出现两次）
  - 78 张牌全覆盖（多次调用统计）
  - 正位 60-80% 概率（大数验证）
  - 连续三次抽牌分布合理

**验收标准：**
- [x] 所有测试通过（`pnpm test` — 35 tests passed）
- [x] `drawCards()` 返回正确格式的三张牌
- [x] 牌面数据无缺失字段

---

## M3：卡牌图片处理（Day 1-2 并行）

> 目标：78+1 张 PNG → WebP 压缩，优化加载策略

### 3.1 Sharp 批量压缩脚本

- [x] `scripts/compress-cards.mjs`：
  - 扫描 `public/assets/cards/` 下所有 `.png`
  - 输出到 `public/assets/cards/`（同名 `.webp`）
  - 分辨率：512×700px
  - 质量：自适应（80→25，逐张迭代 ≤248KB）
  - 实际：平均 213KB，最大 247KB，总 ~16.8MB
- [x] `package.json` 添加 `prebuild` 钩子：`"prebuild": "node scripts/compress-cards.mjs"`
- [x] 验证脚本运行正常

### 3.2 卡牌数据-图片映射

- [x] 在 `cards.ts` 中扩展 Card 类型添加 `imagePath` 字段
- [x] 映射规则：`/assets/cards/{id}.webp`（经由 `buildCards()` 自动注入）
- [x] 处理顺序：major → wands → cups → swords → pentacles（自适应质量降序）

**验收标准：**
- [x] 压缩脚本执行后所有牌有对应的 `.webp` 文件（79 张）
- [x] 单张 < 250KB（248KB 硬上限，0 张超限）
- [x] 建构建置时自动执行压缩（`pnpm build` 触发生效）

---

## M4：3D 翻牌桌（Day 2）

> 目标：R3F 粒子背景 + 三张卡牌 3D 翻转动画 + 错误边界降级

### 4.1 3D 场景基础组件

#### 4.1.1 ParticleBg 粒子背景

- [x] `src/components/ParticleBg.tsx`：
  - 1000-2000 粒子，霓虹蓝紫色渐变
  - 缓慢漂移动画（正弦波动），营造星云/数据流效果
  - 根据视口性能自动降级粒子数量（`window.innerWidth < 768` 减半）
  - 使用 `useFrame` 循环更新粒子位置

#### 4.1.2 CardMesh 单张 3D 卡牌

- [x] `src/components/CardMesh.tsx`：
  - `<mesh>` 双面渲染：牌背（常驻纹理 `card_back.webp`）+ 牌面（动态加载）
  - 翻牌动画：手动 lerp + useFrame 控制 rotation.y 从 0 → Math.PI（180° 翻转）
  - 纹理预加载：receives `textureUrl` props，`useTexture` 加载
  - **必须实现** `texture.dispose()` 在 unmount 时释放
  - 牌背 hover 发光边框效果（`onPointerEnter`/`onPointerOut` 控制 emissive）
  - 正逆位视觉提示：逆位时牌面旋转 180°（rotation.y = Math.PI + isReversed）

#### 4.1.3 TarotTable3D 主场景

- [x] `src/components/TarotTable3D.tsx`（**React.memo 包裹**）：
  - `<Canvas>` 配置：camera 位置、光照（环境光 + 点光源）、OrbitControls（可禁用）
  - 整合 ParticleBg + 3 个 CardMesh（左/中/右布局）
  - 卡牌位置：过去（-2.5, 0, 0）、现状（0, 0, 0）、未来（2.5, 0, 0）
  - **翻牌时序**：过去（0s）→ 现状（0.5s）→ 未来（1.0s），各 800ms 动画

### 4.2 SSR 安全 + 懒加载

- [x] 首页 `page.tsx` 中：
  ```typescript
  const TarotTable3D = dynamic(() => import('@/components/TarotTable3D'), {
    ssr: false,
    loading: () => <CardSkeleton />,
  })
  ```

### 4.3 CardSkeleton 骨架屏

- [x] `src/components/CardSkeleton.tsx`：三张卡牌占位的脉冲发光方块动画

### 4.4 R3FErrorBoundary 降级

- [x] `src/components/R3FErrorBoundary.tsx`：
  - WebGL 崩溃 / GPU 上下文丢失时捕获
  - 降级渲染 CSS 2D 卡牌（纯 HTML + CSS 样式卡牌）
  - 提示：「3D 加速不可用，已切换至经典模式」
  - 降级后保留 HUD 装饰风格

### 4.5 纹理加载与释放管理

- [x] 纹理预加载逻辑（在 CardMesh 中用 new Image() 预检测）：
  - 翻牌前：`new Image()` 加载 3 张正面纹理 → onload 确认后再翻转
  - 翻牌后：仅保留 card_back 常驻纹理
  - 重置时：调用 `texture.dispose()` 释放旧纹理
- [x] 加载失败 fallback：使用 card_back 占位

### 4.6 低配模式

- [x] 低配参数支持：lowPerformance prop → 降低粒子数量（highPerformance）、关闭抗锯齿 (antialias)
  - 粒子数量减半（highPerformance: false）
  - 低功耗 GPU 偏好 (powerPreference: "low-power")
  - 限制 DPR 范围 [1, 1.5]

**验收标准：**
- [x] 粒子背景正常渲染，带动画效果
- [x] 三张卡牌按「过去→现状→未来」时序翻转
- [x] 翻牌动画流畅（cubic ease-out 800ms）
- [x] 动画时间符合设计系统规范：翻转 800ms cubic ease-out，粒子漂移 continuous
- [x] 正逆位视觉正确（逆位牌面倒置）
- [x] 错误边界：禁用 WebGL 后自动降级为 CSS 2D 卡牌
- [x] 纹理释放（unmount 时 dispose）
- [x] 懒加载骨架屏显示正常（CardSkeleton 脉冲动画）
- [x] 构建 pnpm build + pnpm test 通过

---

## M5：LLM 解读系统（Day 2-3 并行）

> 目标：DeepSeek API 集成 + 流式解读 + 降级方案

### 5.1 DeepSeek API 客户端

- [x] `src/lib/deepseek.ts`：
  - `createReadingStream(question, cards, apiKey?)` → 返回 `ReadableStream`
  - 请求 DeepSeek API：`POST https://api.deepseek.com/v1/chat/completions`
  - 系统 prompt（~600 字，PRD §7.3 内容）
  - 用户 prompt：包含问题 + 三张牌信息（牌名、正逆位、关键词）
  - 参数：`model: "deepseek-chat"`, `stream: true`, `max_tokens: 1000`
  - 超时控制：10s（与 Vercel Hobby Plan 超时对齐）
  - 错误处理：网络错误、API 错误、超时

### 5.2 API Route：POST /api/reading

- [x] `src/app/api/reading/route.ts`：
  - 接收 `{ question, cards, apiKey? }`
  - 调用 `createReadingStream()` → 返回 `ReadableStream` 给前端
  - 自定义 `AbortController`（客户端断开时中止）
  - 自动重试逻辑：首次失败 → 等待 1s → 重试 → 最多 2 次

### 5.3 API Route：POST /api/verify-key

- [x] `src/app/api/verify-key/route.ts`：
  - 接收 `{ key }`
  - 用该 key 调用 DeepSeek 余额/模型查询接口验证有效性
  - 返回 `{ valid: boolean, message: string }`

### 5.5 流式前端组件

#### 5.5.1 ReadingStream 流式解读展示

- [x] `src/components/ReadingStream.tsx`：
  - 使用 `Response.body.getReader()` 读取流式响应
  - 按 `##` 标题分割段落的逻辑（完整段落到达时一次渲染）
  - 段落标题（`## 过去的牌：...`）150ms 淡入先显示，正文继续流式缓冲
  - 已完成段落列表 + 正在流式缓冲的当前段落
  - Framer Motion 动画：每段 fade-in + translateY(10→0)，300ms/段，段落间隔 200ms
  - AbortController：用户点击「取消解读」时中止流
  - 解读完成后显示「再来一次」按钮

### 5.6 Prompt 构造与优化

- [x] 将 PRD §7.3 的 system prompt 精确实现
- [x] 提示词参数化：插入牌名、正逆位、关键词
- [x] 确保输出格式为 Markdown + `##` 分段（与段落切分逻辑一致）
- [x] 总字数控制在 500-650 字

### 5.7 降级方案（面试演示保障）

- [x] 前端缓存 3-5 套模板解读（不同牌组合）
- [x] DeepSeek API 不可用时自动切换
- [x] 用户无感（不提示「降级」字样）

### 5.8 流式中断恢复

- [x] 客户端断开时同步中止服务端 DeepSeek 请求
- [x] 最多 2 次自动重试，间隔 1 秒
- [x] 3 次失败后使用模板降级

**验收标准：**
- [x] DeepSeek API 返回流式内容，前端逐段浮现展示
- [x] 段落切分正确（`##` 标题为新段起点）
- [x] 标题先于正文显示（150ms 领先）
- [x] 「取消解读」按钮正常工作，及时停止 API 请求
- [x] API 失败时自动降级到模板内容
- [x] 总耗时 < 15 秒

---

## M6：UI 集成与完整流程（Day 3-4）

> 目标：Braindance 接入 → 输入 → 占卜 → 解读 → 重置 完整闭环

### 6.1 双 Context 状态管理

#### 6.1.1 TarotProvider（核心流程状态）

- [ ] `src/components/TarotProvider.tsx`：
  - TarotContext：phase、question、cards、error、apiKey
  - `useReducer(reducer, initialState)` 实现
  - actions：`SET_QUESTION`、`START_READING`、`FINISH_READING`、`SET_ERROR`、`SET_API_KEY`、`RESET`
  - apiKey 与 localStorage 同步（初始读取 + SET_API_KEY 时写入）
  - 每日限额（localStorage 计数器，30 次/日）

#### 6.1.2 ReadingProvider（流式文本状态）

- [ ] `src/components/ReadingProvider.tsx`：
  - ReadingContext：paragraphs、streamingParagraph、isStreaming
  - actions：`APPEND_PARAGRAPH`（完成段落）、`STREAM_CHUNK`（追加缓冲）、`CLEAR`
  - **注意**：ReadingProvider 与 TarotProvider 分离，ReadingContext 更新不触发 TarotTable3D 重渲染

#### 6.1.3 Provider 嵌套顺序

- [ ] `app/layout.tsx`：`<TarotProvider><ReadingProvider>...</ReadingProvider></TarotProvider>`

### 6.2 BraindancePortal（API Key 接入界面）

- [ ] `src/components/BraindancePortal.tsx`：
  - 概念主题：神经接口接入界面
  - 标题「接入 Braindance 神经接口」+ 副标题
  - 选项 1：「使用服务端神谕核心」（不操作 → 3 秒自动使用默认 Key）
  - 选项 2：「插入记忆芯片」（粘贴自有 API Key → 输入框 + 验证按钮）
  - 验证成功后存入 localStorage，转入输入区
  - 倒计时动画（3-2-1 自动跳过）
  - 错误状态：Key 无效时的提示
  - 视觉风格：扫描线、脉冲环、霓虹边框

### 6.3 QuestionInput（问题输入区）

- [ ] `src/components/QuestionInput.tsx`：
  - 文本输入框：200 字限制，实时字数提示（`120/200`）
  - 空提交：输入框抖动 +「请输入你的问题」错误提示
  - 超长截断：输入时自动截断
  - Enter 提交、按钮点击提交
  - 提交后 disabled + loading 状态（转圈 +「连接 Braindance…」）
  - 占位文字：「输入你的问题，赛博先知将为你解读…」

### 6.4 DemoTrigger（面试模式）

- [ ] `src/components/DemoTrigger.tsx`：
  - `?demo` 参数检测：自动填入「我最近的事业运如何？」
  - `?q=xxx` 参数检测：使用自定义问题
  - 延迟 1 秒后自动触发占卜（模拟用户点击）
  - 仅在首页生效，仅触发一次
  - 兼容已登录 Key 和默认 Key

### 6.5 首页完整流程集成

- [ ] `app/page.tsx` 组装：
  ```
  phase === 'braindance' && !apiKey → <BraindancePortal />
  (phase === 'input' || apiKey)     → <QuestionInput />
  phase >= 'shuffling'              → <TarotTable3D />
  phase >= 'reading'                → <ReadingStream />
  phase === 'done'                  → +「再来一次」按钮
  phase === 'error'                 → 错误提示 + 重试
  ```

### 6.6 再来一次（RESET）

- [ ] 「再来一次」按钮：
  - 触发 `dispatch({ type: 'RESET' })` + `dispatch({ type: 'CLEAR' })`
  - 清空问题、卡牌、解读
  - 释放 3D 纹理（`texture.dispose()`）
  - 滚动到页面顶部
  - 不重置 apiKey（保留 Key 状态）

### 6.7 /about 页面

- [ ] `src/app/about/page.tsx`：
  - 项目定位与概念故事
  - 技术栈选型与决策理由
  - 系统架构图（Mermaid 或 ASCII）
  - 78 张牌生成流程说明
  - 开发中解决的 2-3 个技术挑战
  - 与 CopyAI 的项目组合展示
  - 风格：技术博客风 + 暗黑主题

### 6.8 /cards 百科页面

- [ ] `src/app/cards/page.tsx`：
  - 78 张牌全量展示，网格布局
  - 缩略图使用 `next/image`（经过优化管道）
  - 按花色筛选（Tab 切换：全部、大阿卡纳、权杖、圣杯、宝剑、星币）
  - 每张牌显示：缩略图 + 中文名 + 英文名 + 关键词
  - 点击展开详情：正逆位释义

### 6.9 键盘快捷键

- [ ] 全局快捷键：
  - Enter（输入框 focus 时）：提交问题
  - Esc（解读中）：取消解读
- [ ] 使用 `useEffect` + `keydown` 事件监听

### 6.10 Open Graph 与 SEO

- [ ] `app/layout.tsx` 完善 metadata：
  - `title: "CyberTarot 赛博占卜师 — AI 塔罗占卜"`
  - `description: "2077 年，赛博先知为你抽取三张遗物卡牌，用 DeepSeek AI 深度解读过去、现状与未来。"`
  - `og:image`（项目 Logo / 预览图）
- [ ] `/about`、`/cards` 各自独立 meta

**验收标准：**
- [ ] 完整用户链路走通：访问 → Key 接入 → 输入问题 → 3D 翻牌 → 流式解读 → 再来一次
- [ ] Braindance 接入界面视觉符合赛博风格
- [ ] Braindance 界面使用 HUD 装饰（扫描线/脉冲环/霓虹边框），解读区/牌库区保持清洁
- [ ] 按钮系统符合设计系统规范（primary/secondary/ghost 变体，hover 发光过渡 150-200ms）
- [ ] `?demo` 模式自动触发完整流程
- [ ] /about 页面内容充实
- [ ] /cards 页面展示 78 张牌，筛选正常
- [ ] 键盘快捷键 Enter/Esc 工作
- [ ] 输入框 200 字限制 + 空提交验证
- [ ] 每日限额 30 次（localStorage）

---

## M7：部署与面试准备（Day 4-5）

> 目标：Vercel 部署 + 自定义域名 + README + 质量检查

### 7.1 Vercel 部署

- [ ] 推送代码到 GitHub 仓库
- [ ] Vercel 导入项目（`vercel.json` 配置）
- [ ] 环境变量配置：`DEEPSEEK_API_KEY`
- [ ] 自定义域名：`cybertarot.vercel.app`（先使用 vercel.app 子域名）
- [ ] 验证生产环境所有功能正常
- [ ] 预览分支自动部署（Vercel 默认）

### 7.2 `/?demo` 模式端到端验证

- [ ] 打开 `https://cybertarot.vercel.app/?demo`
- [ ] 自动填问题 → 自动触发 → 15 秒内完成闭环
- [ ] 面试官零操作可达

### 7.3 性能验证

- [ ] Lighthouse 检测：
  - FCP < 2s
  - TTI < 3s
- [ ] 3D 场景首次加载 < 3s
- [ ] LLM 首 token < 4s
- [ ] 单次占卜总耗时 ≤ 15s
- [ ] 移动端降级验证（视口 < 768px）

### 7.4 边缘情况回归

- [ ] PRD §11 所有边缘情况逐条验证
- [ ] WebGL 禁用场景（Chrome DevTools → Settings → Disable WebGL）
- [ ] 网络断开场景
- [ ] 快速连续点击「占卜」按钮
- [ ] 多次「再来一次」后纹理释放

### 7.5 README 编写

- [ ] 项目概述 + 概念故事
- [ ] 技术栈与架构图
- [ ] 本地开发指南（`git clone` → `pnpm install` → `pnpm dev`）
- [ ] 在线演示链接（`?demo`）
- [ ] 面试话术要点（PRD §10.2）

### 7.6 社交预览图

- [ ] 项目 Logo / OG 预览图制作（浏览器标签 + 社交媒体卡片）
- [ ] favicon 配置

### 7.7 最终质量门禁

- [ ] `pnpm build` 生产构建无错误
- [ ] `pnpm test` 全部通过
- [ ] `pnpm lint` 无错误
- [ ] 三个页面各自验证功能完好
- [ ] 代码自审（使用 code-reviewer agent）

**验收标准：**
- [ ] 生产环境所有功能正常
- [ ] `?demo` 模式 15 秒内完成闭环
- [ ] 性能预算达标（FCP < 2s, TTI < 3s）
- [ ] 边缘情况处理到位
- [ ] README 完整，面试可直接展示

---

## 📊 总时间线

| 阶段 | 内容 | 预估工时 | 并行？ |
|------|------|---------|--------|
| **M1** | 项目初始化 + 骨架 | 3-4h | - |
| **M2** | 牌库 + 抽牌引擎 | 3-4h | - |
| **M3** | 卡面处理 (Sharp) | 2-3h | 可与 M2 并行 |
| **M4** | 3D 翻牌桌 | 6-8h | 可与 M5 并行 |
| **M5** | LLM 解读系统 | 5-7h | 可与 M4 并行 |
| **M6** | UI 集成与完整流程 | 8-10h | 依赖 M4+M5 完成 |
| **M7** | 部署 + 面试准备 | 4-5h | - |
| **合计** | **全部完成** | **~40h** | **理论工期 4-5 天** |

---

## ⚠️ 风险与缓解

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| R3F WebGL 兼容性问题 | 部分浏览器不可用 | ErrorBoundary 降级 CSS 2D |
| Vercel Serverless 10s 超时 | 解读被截断 | Prompt 压缩 ~600 字，模型选 deepseek-chat |
| DeepSeek API 延迟/不可用 | 解读无法生成 | 前端缓存模板解读降级 |
| 图片压缩/纹理加载延迟 | 翻牌卡顿 | 翻牌前预加载 + onload 确认 |
| R3F 纹理内存泄漏 | 多次操作后卡顿 | dispose() 强制释放 |
| 78 张手写 cards.ts 工作量大 | 进度延迟 | 用脚本生成模板代码 |
| `?demo` 模式面试时出错 | 面试展示失败 | 部署前多次端到端验证 |

---

> 📝 说明：本计划基于 PRD v3.2 拆解，标注了每个任务的依赖关系与验收标准。每个阶段完成后建议运行 `pnpm build && pnpm test` 确保不引入回归。M4 与 M5 可并行开发以缩短工期。
