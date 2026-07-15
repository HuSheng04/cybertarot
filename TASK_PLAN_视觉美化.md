# CyberTarot 视觉美化 — 完整执行计划

> 生成日期: 2026-07-15
> 基于头脑风暴确定的设计方向拆解
> 原则：不改功能逻辑，只做视觉和动效增强

---

## 📋 全流程用户旅程（设计定稿回顾）

```
打开页面（首次）:
  [0ms]     粒子从暗处亮起
  [800ms]   CYBERTAROT glitch 闪入 → 稳定发光
  [1500ms]  副标题 spring 弹入
  [2200ms]  HUD 角括号 [ ] 出现
  [2800ms]  Hero 收缩 → 交互面板浮现
  [3500ms]  可操作

Braindance 接入:
  ┌─ 交互面板 (card-surface, max-w-2xl, rounded-xl) ─┐
  │  EEG 脑电波环 (旋转光点 + 径向波动)               │
  │  慢速扫描线 (3s/次)                                │
  │  十六进制代码飘落 (极淡装饰)                       │
  │  ●━━━━━▶ 服务端神谕核心 (hover 突触连接线)        │
  │  ●━━━━━▶ 插入记忆芯片                              │
  │  3-2-1 脑波倒计时                                  │
  └────────────────────────────────────────────────────┘
  → 整个面板 exit/enter 过渡到 QuestionInput

QuestionInput (冥想终端):
  粒子速度降低 50%, 亮度降低 30%
  ┌─ 交互面板 ──────────────────────────────────────┐
  │  输入框: 垂直光晕, focus 时扩散                  │
  │  打字: 段落式涟漪 (停顿 0.5s 触发)               │
  │  [深潜] 按钮: 柔和发光, 点击脉冲扩散              │
  └────────────────────────────────────────────────────┘
  → 1s 慢过渡到全屏翻牌模式

全屏翻牌:
  Navbar → 半透明
  3D Canvas → position:fixed, inset-0
  粒子汇聚 → 扫描溶解 → 牌面揭示
  过去(0ms) → 现状(+600ms) → 未来(+600ms)
  牌面流光: 正位 cyan / 逆位 purple

解读:
  ┌─ 下半屏 overlay (bg-deep-space/70, backdrop-blur, 顶部渐变) ─┐
  │  ══ 赛博占卜师的解读 ══                                       │
  │  段落 spring 浮现 (max-w-lg, 居中)                            │
  │  [再来一次] 解读完成后淡入                                     │
  └────────────────────────────────────────────────────────────────┘

/cards 牌库页:
  筛选标签: layoutId 滑动霓虹条
  网格: stagger 逐张 spring 弹入 (30ms/张)
  卡牌: 全息投影效果 (底部 cyan 光晕, hover 上浮+微倾斜)
  切换筛选: 旧牌收缩淡出 → 新牌弹入
  底部背景: 微弱陈列架网格线

/about 关于页:
  叙事驱动杂志风格
  Hero → 关键数字(78/3/2 发光大号) → 引文卡片
  全息分隔线 → 技术栈 stagger → 架构图 → 挑战卡片
  全页 whileInView 驱动
```

---

## 🛠 工具与依赖速查

### 需要安装的包

| 包名 | 用途 | 安装命令 |
|------|------|---------|
| `motion` | framer-motion 升级版 (API 兼容) | `pnpm add motion` |
| `@react-three/postprocessing` | R3F 后期特效 (bloom) | `pnpm add @react-three/postprocessing` |
| `postprocessing` | 配套 | `pnpm add postprocessing` |

### 不需要安装 (已有或 CSS 实现)

| 效果 | 实现方式 |
|------|---------|
| Glitch 文字 | CSS `@keyframes` + `clip-path` / MagicUI `HyperText` |
| 扫描线 | CSS `repeating-linear-gradient` + animation |
| 脑电波环 | CSS `conic-gradient` + `@keyframes` rotate |
| 全息分隔线 | CSS `linear-gradient` + `box-shadow` |
| 陈列架网格 | CSS `background-image: repeating-linear-gradient` |
| 打字涟漪 | CSS `box-shadow` animation on focus |
| 神经突触连接线 | SVG 或 CSS `border-image` + hover transition |

### 可用 Skill

| Skill | 适用阶段 |
|-------|---------|
| `ui-styling` | Phase 0 基础设施 |
| `frontend-design` | Phase 2 开场 / Phase 7 牌库 / Phase 8 关于 |
| `ui-ux-pro-max` | Phase 3 Braindance / Phase 4 冥想终端 |
| `brand` | Phase 6 解读 overlay / 全局色彩一致 |

---

## 📦 你需要准备的素材

| 素材 | 状态 | 说明 |
|------|------|------|
| 🖼 **神经网络背景图** | ✅ 已就位 | `public/assets/bg-neural-dark.webp` (22KB, 60%亮度) |
| 🖼 **卡牌 78+1 张** | ✅ 已就位 | `public/assets/cards/*.webp` |
| 🖼 **OG 预览图** | ⏳ 未准备 | 建议生成一张 1200×630 的赛博风格预览图 |
| 🖼 **favicon** | ⏳ 未准备 | 可用卡牌背面或 CYBERTAROT Logo |
| 🔤 **字体** | ✅ 已就位 | Orbitron / Rajdhani / Inter (Google Fonts) |

---

## 🏗 执行阶段

---

### ✅ Phase 0：基础设施 ✅

> 目标：统一动效参数、补齐全局 CSS 装饰、升级依赖
> 预估工时：0.5 天
> **状态：✅ 已完成**（2026-07-15）

#### ✅ Task 0.1 — 创建动效 Tokens

**文件**: `src/lib/motionTokens.ts`

**执行内容**：
- 定义 spring 配置：`snappy` / `smooth` / `gentle`
- 定义 duration：`fast` / `normal` / `slow`
- 定义 easing 曲线
- 定义 stagger 间隔：`micro` / `normal`
- 定义距离：`sm` / `md` / `lg`
- 常用 Variants：`fadeInUp` / `fadeInScale` / `staggerContainer` / `slideUp`

**使用工具**：
- `motion` (原 framer-motion) 的 transition 类型

**验收标准**：
- ✅ Tokens 被 `page.tsx` 引用验证可用（`springGentle` / `springSmooth`）
- ✅ 与 framer-motion 的 transition API 兼容

---

#### ✅ Task 0.2 — 补齐全局 CSS 装饰

**文件**: `src/app/globals.css`

**执行内容**：
- 扫描线 overlay keyframe（`scan-line`）+ body `::after` 伪元素
- HUD 角括号装饰类（`hud-corner` utility）
- 霓虹脉冲边框（`pulse-neon` animation）
- 全息分隔线 class（`holographic-divider`：gradient + ✦ 符号）
- 深空渐变背景增强（`bg-deep-radial` utility）
- `prefers-reduced-motion` 全局降级

**使用工具**：
- Tailwind v4 `@utility` 指令
- CSS `@media (prefers-reduced-motion: reduce)`

**验收标准**：
- ✅ 扫描线在 body 上可见但极淡（opacity 0.03-0.05）
- ✅ 关闭系统动画后所有动画停止
- ✅ 构建不报错
- ✅ 三项 body 背景模式：默认 / `meditation-mode` / `fullscreen-mode`

---

#### ✅ Task 0.3 — 升级 motion

**文件**: `package.json` + 全局替换 import

**执行内容**：
- `pnpm add motion`（替代 framer-motion）
- 全局替换 `from "framer-motion"` → `from "motion/react"`

**使用工具**：
- `grep -rl` 查找所有引用文件

**验收标准**：
- ✅ `pnpm dev` 正常运行
- ✅ 所有源文件已迁移到 `"motion/react"`（0 文件残留 `"framer-motion"`）
- ✅ bundle size 减小（motion ≈15KB gzipped vs framer-motion ≈35KB）
- ⚠️ `framer-motion` 仍作为直接依赖保留在 `package.json`（motion v12 以它为 peer dep，安全但可按需后续清理）

---

### ✅ Phase 1：布局重构 ✅

> 目标：交互面板包裹层 + page.tsx 全屏模式
> 预估工时：0.5 天
> **状态：✅ 已完成**（2026-07-15）

#### ✅ Task 1.1 — 交互面板包裹组件

**文件**: `src/components/Panel.tsx`

**执行内容**：
- 创建通用面板组件，包裹 BraindancePortal / QuestionInput
- 样式：`bg-card-surface/50 border border-card-border rounded-xl backdrop-blur-sm`
- 顶部细 cyan 线装饰（`via-neon-cyan/40` 渐变色）
- 接受 `className` 扩展
- 用 `motion.div` 包裹，支持 exit/enter 动画接收

**使用工具**：
- `motion/react`
- `motionTokens.ts` 的 spring 参数

**验收标准**：
- ✅ 面板在所有页面宽度下居中（`mx-auto`）
- ✅ `max-w-2xl` 宽度限制正常
- ✅ 与现有 BraindancePortal / QuestionInput 嵌套不冲突

---

#### ✅ Task 1.2 — page.tsx 布局重构（3D 全屏模式）

**文件**: `src/app/page.tsx`

**执行内容**：
- 正常模式：Braindance / QuestionInput 在面板内，居中显示
- shuffling 开始：
  - 3D Canvas 容器从正常布局 → `position:fixed inset-0 z-30`
  - `springGentle` 过渡（≈1s spring）
- reading / done：
  - 3D Canvas 保持全屏作为背景
  - 解读 ReadingStream overlay 固定在底部（`fixed bottom-0 left-0 right-0 z-40`）
- reset：
  - 3D Canvas 退出全屏，返回正常模式（AnimatePresence exit）

**需要配合**：
- Navbar 在全屏模式下半透明（Task 5.5）
- 3D Canvas `alpha: true` 改为与背景融合

**验收标准**：
- ✅ Braindance/Input 阶段 3D Canvas 不可见
- ✅ Shuffling 阶段 Canvas 扩展到全屏，动画流畅
- ✅ Reading 阶段解读区浮在 Canvas 上（顶部渐变过渡）
- ✅ Reset 后 Canvas 收起，Input 面板出现
- ✅ 错误状态也包裹在 Panel 内

---

#### ✅ Task 1.3 — 背景系统集成

**文件**: `src/app/globals.css` + `src/app/page.tsx`

**执行内容**：
- body 三种背景模式：默认（神经网络图可见）、冥想模式（更暗）、全屏模式（纯深空）
- page.tsx 添加 `useEffect` 监听 phase 切换 body class

**使用工具**：
- CSS `radial-gradient` overlay
- 已生成的 `bg-neural-dark.webp`

**验收标准**：
- ✅ Braindance 阶段: 背景图可见，氛围感
- ✅ Input 阶段: 背景更暗，安静（`meditation-mode`）
- ✅ Shuffling+ 阶段: 纯深空色，无干扰（`fullscreen-mode`）
- ✅ useEffect cleanup 在 unmount 时恢复 body class

---

### ✅ Phase 2：开场动画 ✅

> 目标：影院级开场，首次访问触发
> 预估工时：0.5 天
> **状态：✅ 已完成**（2026-07-15）

#### ✅ Task 2.1 — Hero 开场

**文件**: `src/app/page.tsx`（Hero section）

**执行内容**：
- 粒子从暗处亮起（已有 ParticleBg，配合 body 背景从纯黑渐显）
- CYBERTAROT 标题用 glitch 文字效果：
  - 方案 A（纯 CSS）：`@keyframes` 控制文字 clip-path 偏移 + `text-shadow` 闪烁
  - 方案 B（MagicUI）：安装 HyperText 组件
- 副标题 spring 弹入（delay 1500ms）
- HUD 角括号出现（`opacity 0 → 0.4`，delay 2200ms）
- 2800ms 时整体缩小上移，进入正常交互模式

**使用工具**：
- `motion/react` 的 spring + delay 编排
- MagicUI `HyperText`（可选）

**验收标准**：
- 首次访问完整播放 3.5s 开场
- 动画节奏清晰不拖沓
- 开场后无缝过渡到 Braindance 面板

---

#### ✅ Task 2.2 — 开场跳过逻辑

**文件**: `src/app/page.tsx` 或 `src/lib/useFirstVisit.ts`（新文件）

**执行内容**：
- 创建 `useFirstVisit` hook
- localStorage 标记 `cybertarot_visited`
- 已访问用户跳过开场，直接显示 Braindance
- 开场期间用户点击任意位置可跳过

**验收标准**：
- 首次访问完整播放
- 第二次访问直接跳到 Braindance
- 点击跳过响应及时

---

### Phase 3：BraindancePortal 重做

> 目标：医疗扫描 + 神经接口融合风格
> 预估工时：1 天

#### Task 3.1 — EEG 脑电波环

**文件**: `src/components/BraindancePortal.tsx`

**执行内容**：
- 脉冲环 SVG 替换为完整的 EEG 脑电波环：
  - 环形轨道（conic-gradient 渐变色）
  - 旋转小光点（沿轨道运动）
  - 径向波动线（从环中心向外扩散的波形）
- 使用 CSS `@keyframes` 实现，避免 JS 开销

**参考**：心电图的波形视觉 + 雷达扫描环

**验收标准**：
- 环匀速旋转，光点清晰可见
- 波动线有呼吸感
- 不干扰下方文字可读性

---

#### Task 3.2 — 慢速扫描线 + 代码装饰

**文件**: `src/components/BraindancePortal.tsx`

**执行内容**：
- 扫描线：`::before` 伪元素 + `scan-line` animation，3s 周期
- 遇到按钮/文字时产生微弱光晕
- 背景代码碎片：产生 5-8 个十六进制字符串，随机位置缓慢向下飘落，opacity 0.02-0.03

**验收标准**：
- 扫描线可见但不抢眼（opacity 0.05）
- 代码飘落方向一致、速度均匀
- 与面板内容不重叠干扰

---

#### Task 3.3 — 神经突触按钮

**文件**: `src/components/BraindancePortal.tsx`

**执行内容**：
- 两个选择按钮：左侧发光圆点 + 右侧箭头连接线 `━━━▶`
- hover 时连接线长出分支状线条（CSS `::after` 或 SVG）
- hover 时按钮 spring 微上浮（`whileHover={{ y: -2 }}`）
- 「服务端」按钮 = cyan 色，「记忆芯片」按钮 = purple 色

**验收标准**：
- hover 时突触分支线条平滑出现
- 点击区域不缩小（整行可点）
- 与现有验证逻辑完全兼容

---

#### Task 3.4 — 脑波倒计时

**文件**: `src/components/BraindancePortal.tsx`

**执行内容**：
- 3-2-1 倒计时改为脑电波波形风格
- 波形线条随数字变化跳动（数字越小波形越剧烈）
- 倒计时结束时波形汇聚成一条直线 + 闪光 → 接入完成

**验收标准**：
- 倒计时 3 秒完整
- 波形跳动与数字变化同步
- 接入完成闪光不明显刺眼

---

#### Task 3.5 — 面板过渡

**文件**: `src/components/BraindancePortal.tsx` + `src/app/page.tsx`

**执行内容**：
- Braindance → QuestionInput 过渡：整个面板 exit（scale 0.95 + opacity 0, 200ms）→ 停顿 300ms → 新面板 enter（scale 1 + opacity 1, 400ms spring）

**验收标准**：
- 过渡流畅，不闪烁
- 过渡期间背景保持稳定

---

### Phase 4：QuestionInput 冥想化

> 目标：安静、内省的冥想终端感
> 预估工时：0.5 天

#### Task 4.1 — 粒子降速

**文件**: `src/app/page.tsx`

**执行内容**：
- Input 阶段时，ParticleBg 的漂移速度降低 50%（通过 prop 控制）
- 如果粒子已经扩展到全页背景，在此阶段调暗/降速

**验收标准**：
- Input 阶段粒子运动明显变慢
- 整体视觉氛围更安静

---

#### Task 4.2 — 输入框光晕 + 打字涟漪

**文件**: `src/components/QuestionInput.tsx`

**执行内容**：
- 输入框：垂直方向渐变光晕（focus 时从底部向上发光扩散）
- 用 `box-shadow` animation 实现，不影响布局
- 打字涟漪：用户停止输入 0.5s 后，从文字位置发出 1 次同心圆波纹
- 用 CSS `::after` + `@keyframes` 实现波纹

**验收标准**：
- Focus 时光晕柔和扩散，不刺眼
- 涟漪在停顿时触发，不频繁
- 不影响输入功能

---

#### Task 4.3 — 「深潜」按钮

**文件**: `src/components/QuestionInput.tsx`

**执行内容**：
- 按钮文字改为「深潜」
- 背景从 neon-cyan 改为 subtler 渐变（cyan → purple 微渐变）
- 发光更柔和（非 shadow-neon-cyan 全强度，改为 50% 透明度）
- 点击时环形脉冲扩散效果（CSS animation）
- 禁用态保持 opacity-50

**验收标准**：
- 按钮柔和发光不刺眼
- 点击脉冲正常
- "深潜" 字号清晰可读

---

### Phase 5：全息翻牌

> 目标：粒子汇聚 → 扫描溶解 → 牌面流光
> 预估工时：1 天

#### Task 5.1 — 粒子汇聚

**文件**: `src/components/ParticleBg.tsx` + `src/components/TarotTable3D.tsx`

**执行内容**：
- 翻牌前 1s，ParticleBg 粒子的运动方向改为向三个卡牌位置汇聚
- 汇聚完成后粒子恢复漂移
- 轻量版实现：不新增粒子，只改变现有粒子的目标方向向量

**验收标准**：
- 粒子向卡牌位置汇聚，视觉上清晰可辨
- 汇聚完成后卡牌位置有光聚集效果
- 不新增性能开销

---

#### Task 5.2 — 扫描溶解

**文件**: `src/components/CardMesh.tsx`

**执行内容**：
- 不使用 180° Y 轴旋转翻牌
- 改为：水平扫描线从上到下扫过牌背 → 扫过部分牌面逐渐显现
- 全息溶解过渡效果：牌背纹理 fade out + 牌面纹理 fade in，中间有短暂的数据碎片粒子飘散
- 用 `useFrame` 控制 dissolve 进度 + `shaderMaterial` 或 `opacity` 过渡

**验收标准**：
- 扫描溶解过程平滑，约 1200ms
- 三张牌按序溶解（过去→现状→未来），间隔 600ms
- 溶解时有数据碎片效果

---

#### Task 5.3 — 进度文字

**文件**: `src/components/TarotTable3D.tsx`

**执行内容**：
- 翻牌前在屏幕上方显示「正在读取命运数据…」
- 装饰性进度条（纯 CSS，不确定进度，用脉冲动画表示进行中）
- 翻牌完成文字淡出

**验收标准**：
- 文字在翻牌开始时出现，完成后消失
- 进度条有脉动动画
- 不干扰 3D 场景

---

#### Task 5.4 — 牌面流光

**文件**: `src/components/CardMesh.tsx`

**执行内容**：
- 翻牌完成后，牌面边缘有微弱的数据流光
- 正位：cyan 色，光流稳定匀速
- 逆位：purple 色，光流时断时续（闪烁不稳定感）
- 用 `useFrame` 控制边缘发光强度

**验收标准**：
- 流光可见但不抢眼（opacity 0.2-0.3）
- 正位/逆位颜色区分明显
- 性能无影响

---

#### Task 5.5 — 全屏过渡 + Navbar 半透明

**文件**: `src/app/page.tsx` + `src/components/Navbar.tsx`

**执行内容**：
- Shuffling 开始时，3D Canvas 从 `relative` 盒子过渡到 `position:fixed inset-0`，1s spring
- Navbar 过渡到半透明模式（`bg-deep-space/30 backdrop-blur-sm`）
- Reading/Done 阶段保持全屏
- Reset 时 Canvas 收起，Navbar 恢复

**验收标准**：
- 全屏过渡 1s，动画流畅无闪烁
- Navbar 半透明时 hover 恢复不透明
- Reset 后布局完全恢复

---

### Phase 6：解读 Overlay

> 目标：下半屏浮动解读区，渐变融合
> 预估工时：0.5 天

#### Task 6.1 — 下半屏 overlay

**文件**: `src/app/page.tsx` + `src/components/ReadingStream.tsx`

**执行内容**：
- ReadingStream 容器改为 `position:fixed bottom-0 left-0 right-0 z-40`
- 背景：`bg-deep-space/70 backdrop-blur-sm`
- 顶部：从透明到不透明的渐变过渡（与 3D 场景融合）
- 宽度：`max-w-lg mx-auto`，居中
- 从底部 spring 滑入（translateY 100% → 0%）

**验收标准**：
- Overlay 覆盖下半屏，与 3D 场景融合自然
- 顶部渐变过渡无明显边缘
- 内容在 overlay 内滚动正常

---

#### Task 6.2 — 段落 spring 化

**文件**: `src/components/ReadingStream.tsx`

**执行内容**：
- 当前 `transition={{ duration: 0.3 }}` 改为 spring smooth
- 已完成的段落从缓存数组渲染
- 当前 streaming 段落保持脉冲光标

**验收标准**：
- 段落浮现手感更自然
- 流式内容正常渲染不卡顿

---

#### Task 6.3 — 按钮淡入

**文件**: `src/components/ReadingStream.tsx`

**执行内容**：
- 解读完成后，「再来一次」按钮 opacity 0 → 1，delay 400ms
- 按钮带微弱发光脉冲（吸引注意但不强制）

**验收标准**：
- 按钮在解读完成后延迟出现
- 点击正常触发 reset

---

### Phase 7：/cards 牌库页

> 目标：收藏展示感，全息投影卡牌
> 预估工时：0.5 天

#### Task 7.1 — 筛选标签滑动指示器

**文件**: `src/app/cards/page.tsx`

**执行内容**：
- 筛选标签组下方加 `layoutId="active-tab"` 的滑动霓虹条
- 选中的标签底部 cyan 条 spring 滑到对应位置
- 与 Navbar 下划线完全相同的模式

**使用工具**：
- `motion/react` layoutId

**验收标准**：
- 点击不同标签时，指示条平滑滑动
- 滑动 spring 手感自然

---

#### Task 7.2 — 网格 stagger 入场

**文件**: `src/app/cards/page.tsx`

**执行内容**：
- 卡牌网格包裹在 `motion.div` 中，使用 `staggerChildren: 0.03`
- 每张 card item 使用 spring 弹入（y: 30 → 0, opacity: 0 → 1）

**验收标准**：
- 页面加载时卡牌逐张弹入，每张间隔 30ms
- 动画流畅不卡顿

---

#### Task 7.3 — 卡牌全息投影效果

**文件**: `src/app/cards/page.tsx`（CardItem 组件）

**执行内容**：
- 卡片底部加 cyan 色渐变光晕（`box-shadow` 或 `::after` 伪元素）
- hover 时 spring 上浮 `y: -4` + 轻微 `rotateX: 2deg`
- hover 时光晕扩大、边框 glow 增强
- 正位/逆位展开详情保持现有样式

**验收标准**：
- 光晕可见但不喧宾夺主
- hover 上浮 spring 手感自然
- 图片显示正常

---

#### Task 7.4 — 筛选切换动效

**文件**: `src/app/cards/page.tsx`

**执行内容**：
- 切换筛选时，旧卡片组 `AnimatePresence` exit（scale 0.9 + opacity 0, 200ms）
- 新卡片组 stagger 弹入（同 Task 7.2）

**验收标准**：
- 切换无闪烁
- 新旧过渡自然

---

#### Task 7.5 — 背景陈列网格

**文件**: `src/app/cards/page.tsx` 或 `globals.css`

**执行内容**：
- 牌库页网格区域背景加极淡垂直线条（`repeating-linear-gradient`）
- 类似收藏展示柜的玻璃隔层
- opacity 0.03-0.05，不干扰内容

**验收标准**：
- 隐约可见但不抢眼
- 不影响卡牌可读性

---

### ✅ Phase 8：/about 关于页 ✅

> 目标：叙事驱动杂志风格
> 预估工时：0.5 天
> **状态：✅ 已完成**（2026-07-15）

#### Task 8.1 — 叙事 Hero

**文件**: `src/app/about/page.tsx`

**执行内容**：
- Hero 区域：大标题 neon-cyan 发光，副标题紧随
- `whileInView` 触发 spring 入场
- 背景与页面默认背景融合

**验收标准**：
- Hero 入场自然
- 发光不过度

---

#### Task 8.2 — 关键数字展示

**文件**: `src/app/about/page.tsx`

**执行内容**：
- 概念故事后插入数字展示区：78 / 3 / 2
- 每个数字：`text-6xl font-heading neon-cyan`，下方小字说明
- `whileInView` 触发 spring scale 入场（从 0.5 放大到 1）

**验收标准**：
- 数字 spring 放大人眼舒适
- 数字与说明文字对齐

---

#### Task 8.3 — 引文样式 + 全息分隔线

**文件**: `src/app/about/page.tsx`

**执行内容**：
- 概念故事的末尾关键句用引文卡片样式：
  `border-l-4 border-neon-cyan` + `bg-card-surface/30` + `pl-4 py-3`
- Section 之间用全息分隔线：
  渐变线 `linear-gradient` + 中央 ✦ 符号，opacity 0.3

**验收标准**：
- 引文卡片突出但不突兀
- 分隔线清晰有质感

---

#### Task 8.4 — 技术栈卡片增强

**文件**: `src/app/about/page.tsx`

**执行内容**：
- 保持现有网格布局
- 加 `whileInView` stagger 入场
- hover 时 neon 边框发光 + spring 上浮

**验收标准**：
- 卡片逐张入场
- hover 效果统一

---

#### Task 8.5 — 架构图视觉增强

**文件**: `src/app/about/page.tsx`

**执行内容**：
- 保持 ASCII 图内容
- 容器加 neon 边框发光
- 数据流向箭头用 CSS 高亮（cyan 色）
- 关键节点（Client / Server / DeepSeek）加微弱高亮背景

**验收标准**：
- ASCII 图可读性不受影响
- 发光边框统一风格

---

#### Task 8.6 — 挑战卡片故障风格

**文件**: `src/app/about/page.tsx`

**执行内容**：
- 每个挑战卡片左上角加「⚠ 故障代码」风格标签（`font-mono text-[10px] bg-error/10 text-error`）
- 问题→解法用 cyan/绿色区分（已有 warning/success 色）
- `whileInView` 入场

**验收标准**：
- 标签可见不杂乱
- 问题/解法颜色区分清晰

---

### Phase 9：质量验证

> 目标：确认所有改动不影响功能 + 性能达标
> 预估工时：0.5 天

#### 验收清单

- [ ] **构建通过**：`pnpm build` 无错误
- [ ] **功能回归**：
  - 完整流程 braindance → input → shuffling → reading → done → reset
  - `?demo` 模式自动触发
  - 流式解读正常
  - 3D 降级（禁用 WebGL → CSS 2D）
  - 卡牌筛选正常
  - 键盘快捷键 Enter/Esc
- [ ] **性能**：
  - Chrome Performance tab 确认 60fps（翻牌阶段）
  - 首屏 JS bundle < 300KB gzipped
  - CLS < 0.1
- [ ] **可访问性**：
  - `prefers-reduced-motion` 降级后所有动画停止
  - 键盘导航正常
  - 文字对比度 4.5:1+
- [ ] **响应式**：
  - 375px 移动端：内容不溢出，交互可用
  - 768px 平板：布局正常
  - 1440px 桌面：面板居中，全屏正常
- [ ] **最终检查**：
  - 无 `console.log` 残留
  - 无未使用的 import
  - 字体加载正常，无 FOIT

---

## ⏱ 总工时估算

| Phase | 内容 | 预估工时 | 状态 |
|-------|------|---------|------|
| Phase 0 | 基础设施 | 0.5 天 | ✅ 已完成 |
| Phase 1 | 布局重构 | 0.5 天 | ✅ 已完成 |
| Phase 2 | 开场动画 | 0.5 天 | ✅ 已完成 |
| Phase 3 | BraindancePortal 重做 | 1 天 | ✅ 已完成 |
| Phase 4 | QuestionInput 冥想化 | 0.5 天 | ⏳ 待开始 |
| Phase 5 | 全息翻牌 | 1 天 | ✅ 已完成 |
| Phase 6 | 解读 Overlay | 0.5 天 | ⏳ 待开始 |
| Phase 7 | /cards 牌库页 | 0.5 天 | ✅ 已完成 |
| Phase 8 | /about 关于页 | 0.5 天 | ✅ 已完成 |
| Phase 9 | 质量验证 | 0.5 天 | ⏳ 待开始 |
| **合计** | | **6 天** | **5/10 阶段完成** |

> ⚠️ **并行建议**：
> - Phase 2（开场）可与 Phase 3（Braindance）并行
> - Phase 7（牌库）可与 Phase 8（关于）并行
> - 理论最短工期：**4 天**

---

## 🚨 风险与注意事项

| 风险 | 影响 | 应对 |
|------|------|------|
| 3D Canvas `alpha: true` 可能影响性能 | Canvas 全屏 + 透明背景可能降低帧率 | 测试后决定是否启用，低配设备保持 `alpha: false` |
| 全屏过渡时 layout shift | CLS 上升 | 用 `position:fixed` + `transform` 过渡，避免触发 reflow |
| CSS glitch 效果在 Safari 可能不同 | Safari 不支持某些 clip-path | 降级为纯文字发光，不做故障特效 |
| 粒子汇聚到卡牌需要修改 R3F 粒子逻辑 | 实现复杂度较高 | 先试轻量版（只改方向向量），不行再考虑新增粒子 |
| 长解读内容在 overlay 中需要内滚动 | 超出 overlay 高度不可见 | overlay 内加 `overflow-y: auto`，最大高度 60dvh |

---

> 📝 本计划基于 2026-07-15 头脑风暴结果生成。
> 所有设计决策已确认，可以直接开始按 Phase 顺序执行。
> 如有需求变更，更新本文件并标记变更日期。
