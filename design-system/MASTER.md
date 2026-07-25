# CyberTarot 赛博占卜师 — Design System Master

> 基于 ui-ux-pro-max 设计智能引擎生成
> 生成日期: 2026-07-14 | 项目: CyberTarot (Next.js + R3F + Framer Motion)

---

## 1. 设计定位

| 维度 | 决策 |
|------|------|
| **产品类型** | Gaming / Entertainment (AI Tarot Divination) |
| **风格体系** | Cyberpunk UI + HUD / Sci-Fi FUI（暗黑独占） |
| **受众** | 18-30 岁中文用户，tech-savvy，追求沉浸式体验 |
| **隐形受众** | 面试官 — 需 15 秒内展示完整 AI 产品能力 |
| **核心理念** | 用世界观包装技术：2077 Braindance 神经接口 + 遗物卡牌 |
| **情绪关键词** | 赛博诗意、神秘感、冷静深刻、科技温度 |

---

## 2. 配色系统

### 2.1 语义色板（已实现，保持）

```css
/* 基础色板 — 深空赛博 */
--color-deep-space:    #0a0a1a;   /* 主背景 — 极暗蓝黑 */
--color-card-surface:  #12122a;   /* 卡片/面板表面 */
--color-card-border:   #1a1a3a;   /* 边框/分割线 */
--color-card-hover:    #1e1e42;   /* 悬停状态 */

/* 霓虹强调色 */
--color-neon-cyan:     #00f0ff;   /* 主要强调 — 数据流/发光/链接 */
--color-neon-purple:   #b44dff;   /* 次要强调 — 神秘/魔法/赛博灵性 */

/* 文字层级 */
--color-text-primary:  #e8e8f0;   /* 主文本 — 高亮白 */
--color-text-secondary:#8888aa;   /* 次文本 — 柔和紫灰 */
--color-text-muted:    #5a5a7a;   /* 辅助文本 — 低优先级 */
```

### 2.2 扩展语义色板（新增）

```css
/* 功能色 */
--color-success:       #00ff88;   /* 成功/正位顺畅 — 赛博绿 */
--color-warning:       #ffbb00;   /* 警告/注意 */
--color-error:         #ff3366;   /* 错误/逆位阻塞 — 霓虹红 */
--color-info:          #00d4ff;   /* 信息提示 — 亮青 */

/* HUD 装饰色 */
--color-hud-bracket:   rgba(0, 240, 255, 0.3);  /* HUD 边角括号 */
--color-scanline:      rgba(0, 240, 255, 0.03);   /* 扫描线 */
--color-glitch:        #ff00ff;   /* Glitch 特效色 */
```

### 2.2b 第三仪式色（2026-07-25 美化方案 D1，已落地）

```css
--color-moonlight-gold: #e3c27e;  /* 月光金 — 神秘学仪式色，全站用量 ≤5% */
```

| 允许场景 | 禁止场景 |
|----------|----------|
| 大阿卡纳罗马数字金标（Cinzel） | 按钮、链接 |
| 解读完成时刻金光脉冲（gold-flash） | 正文、常态边框 |
| PullQuote 两侧饰线 | 任何信息承载（仅装饰，opacity ≤0.6） |
| 神圣几何线条（SacredGeometry） | — |

### 2.3 色板使用规则

| 元素 | 颜色 | 规则 |
|------|------|------|
| 页⾯背景 | `deep-space` | 全局统一，永不改变 |
| 卡片/面板 | `card-surface` | 所有 UI 容器 |
| 边框 | `card-border` | 分隔、容器边界 |
| 主按钮/链接 | `neon-cyan` | CTA、交互元素 |
| 神秘/魔法元素 | `neon-purple` | 牌面、占卜相关 |
| 成功/正位 | `#00ff88` | 正位指示 |
| 错误/逆位 | `#ff3366` | 逆位指示、错误提示 |
| 主文本 | `text-primary` | 标题、正文 |
| 次文本 | `text-secondary` | 描述、标签 |
| 弱化文本 | `text-muted` | 辅助信息、占位符 |

### 2.4 霓虹发光效果

```css
/* Cyan 发光 — 主要交互 */
--shadow-neon-cyan: 0 0 10px #00f0ff, 0 0 20px rgba(0, 240, 255, 0.3);

/* Purple 发光 — 神秘元素 */
--shadow-neon-purple: 0 0 10px #b44dff, 0 0 20px rgba(180, 77, 255, 0.3);

/* 卡片基础阴影 */
--shadow-card: 0 4px 30px rgba(0, 0, 0, 0.5);

/* 卡片 Glow 悬停 */
--shadow-card-glow: 0 4px 30px rgba(0, 240, 255, 0.1), 0 0 15px rgba(0, 240, 255, 0.05);
```

⚠️ **可访问性注意**：霓虹发光仅用于装饰和强调，不承载关键信息。核心文本始终保持 4.5:1 以上对比度。

---

## 3. 字体系统

### 3.1 字体栈（2026-07-25 美化方案 P0-A 中文革命，已落地）

| 角色 | 字体 | 权重 | 用途 |
|------|------|------|------|
| **中文标题** | Noto Serif SC (next/font 自托管切片) | 600/700 | Hero 主标题、解读段落标题、关于页/牌库页标题 — `font-serif-cn` |
| **拉丁神秘学标题** | Cinzel (next/font) | 600 | 大阿卡纳罗马数字、牌名英文、引文、Modal 编号 — `font-cinzel` |
| **科技标题** | Orbitron (next/font) | 700-900 | 拉丁眉题、数字、倒计时 — `font-heading` |
| **副标题/标签** | Rajdhani + Noto Sans SC(系统栈) | 300-700 | 导航、Tab、徽章、计数 — `font-subheading` |
| **正文** | Inter + Noto Sans SC(系统栈) | 400-600 | 正文、解读内容 — `font-body` |

> 正文中文按 §7 保底方案退回系统栈：CSS 栈保留 "Noto Sans SC" 名称（已安装的系统原生启用），不走网络切片，节省 ~200 个字体切片下载。
> CSS 令牌一律 `var(--font-*)` 优先、字面量回退（next/font 生成哈希族名）。

### 3.1b 排版规范（P0-A 新增）

- Hero 混排：上置 `CYBER TAROT 2077`（Orbitron xs, tracking 0.5em, cyan/70）→ 下置「赛博占卜师」（Noto Serif SC 700, `clamp(44px, 8vw, 84px)`, tracking 0.12em）
- 解读正文 `reading-prose`：line-height 1.9、letter-spacing 0.02em、max-width 65ch（"书感"）
- PullQuote：衬线居中 + 两侧月光金饰线（1.75rem 渐变线, opacity 0.6）
- 首字下沉 `drop-cap`：`:first-letter` 3em 衬线 cyan 700 float left

### 3.2 字号层级

```
H1: 4xl (36px) → 5xl (48px) → 6xl (60px)  ● Orbitron 700, tracking-wider
H2: 2xl (24px) → 3xl (30px)                 ● Orbitron 600, tracking-wider
H3: xl (20px)                                ● Orbitron 500
副标题: lg (18px)                             ● Rajdhani 600, tracking-wide
导航: sm (14px)                               ● Rajdhani 500, uppercase
正文: base (16px)                             ● Inter 400, leading-relaxed
小字: sm (14px) → xs (12px)                   ● Inter 400, text-muted
标签: xs (12px)                               ● Rajdhani 500, uppercase, tracking-wider
```

### 3.3 特殊文字效果

```css
/* 霓虹发光文字 — 慎用，仅用于品牌标语和 Hero */
.text-glow-cyan {
  text-shadow: 0 0 7px #00f0ff, 0 0 10px rgba(0, 240, 255, 0.5);
}
.text-glow-purple {
  text-shadow: 0 0 7px #b44dff, 0 0 10px rgba(180, 77, 255, 0.5);
}
```

---

## 4. 布局系统

### 4.1 断点策略

| 断点 | 设备 | 布局行为 |
|------|------|---------|
| 375px | 小手机 | 单列，堆叠 |
| 640px (sm) | 大手机 | 单列，间距增大 |
| 768px (md) | 平板竖屏 | 开始两列布局 |
| 1024px (lg) | 平板横屏/小桌面 | 标准布局 |
| 1280px (xl) | 桌面 | max-w-5xl 容器 |
| 1440px+ | 大屏 | max-w-5xl + 留白美感 |

### 4.2 间距体系（4px 基准）

```
gap-2:  8px   堆叠间距
gap-4:  16px  组件内间距
gap-6:  24px  组件间间距
gap-8:  32px  区域间距
gap-12: 48px  大区块间距
gap-16: 64px  页面段落间距
```

### 4.3 容器约束

| 页面 | max-width | 说明 |
|------|-----------|------|
| 首页 `/` | max-w-5xl (1024px) | 沉浸式宽度 |
| 关于 `/about` | max-w-3xl (768px) | 阅读宽度 |
| 牌库 `/cards` | max-w-5xl (1024px) | 网格展示 |
| 导航栏 | max-w-5xl | 与首页对齐 |
| 模态框 | max-w-lg (512px) | 聚焦内容 |

### 4.4 Z-Index 层级

```
z-0:    背景 / 装饰层 (粒子)
z-10:   内容层 (卡片、文本)
z-20:   控件层 (按钮、输入框)
z-30:   浮动层 (下拉、提示)
z-40:   导航栏 (Navbar)
z-50:   覆盖层 (模态框)
z-60:   加载层 (全屏加载)
```

---

## 5. 组件设计规范

### 5.1 按钮系统

| 变体 | 用途 | 样式 |
|------|------|------|
| **Primary** | 核心动作 (占卜、确认) | neon-cyan 背景，hover 发光增强，白色文字 |
| **Secondary** | 次要动作 (返回、取消) | 透明背景，neon-cyan 边框，hover 填充 |
| **Ghost** | 弱动作 (设置、关于) | 无边框，hover 文字变色 |
| **Danger** | 危险动作 (删除、重置) | error-red 边框/文字 |
| **Disabled** | 不可用状态 | opacity-50, cursor-not-allowed |

**规格**：
- 最小高度: 44px（满足触控标准）
- Padding: px-6 py-3
- 圆角: rounded-lg (8px)
- 过渡: transition-all duration-200
- 加载态: disabled + spinner + "连接 Braindance..."

### 5.2 卡片系统

```css
/* 基础卡牌容器 */
.cyber-card {
  background: var(--color-card-surface);
  border: 1px solid var(--color-card-border);
  border-radius: 12px;
  box-shadow: var(--shadow-card);
}

/* 悬停增强 */
.cyber-card:hover {
  border-color: var(--color-neon-cyan);
  box-shadow: var(--shadow-card-glow);
  transition: all 300ms ease;
}
```

**HUD 边框装饰**（用于特殊卡片）：
```css
/* 边角括号装饰 — HUD 风格 */
.hud-corner::before,
.hud-corner::after {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  border-color: var(--color-neon-cyan);
  opacity: 0.4;
}
```

### 5.3 输入框

| 状态 | 样式 |
|------|------|
| **默认** | 透明背景，1px card-border 边框，text-primary 文字 |
| **Focus** | neon-cyan 边框，微发光，outline-offset 2px |
| **Error** | error-red 边框，下方红色提示 + 抖动动画 |
| **Disabled** | opacity-50, cursor-not-allowed |
| **占位符** | text-muted 颜色 |

**规格**：
- 最小高度: 48px
- 最大宽度: max-w-lg (512px)
- 字数提示: 右下角 text-xs text-muted

### 5.4 导航栏

已在 Navbar.tsx 中实现：
- 固定顶部，backdrop-blur 毛玻璃
- Framer Motion 下划线动效
- 当前页高亮 neon-cyan
- height: 56px (h-14)
- **滚动感知（2026-07-25 §5.4）**：滚动 >40px 背景加深至 `bg-deep-space/95` + 底部 `border-neon-cyan/20` 细线淡入

### 5.5 美化新增组件（2026-07-25）

| 组件 | 文件 | 职责 |
|------|------|------|
| SacredGeometry | components/SacredGeometry.tsx | 神圣几何 SVG（hexagram 六芒星圆阵 / flower 生命之花），月光金 0.75px，opacity ≤0.1，120s 缓转 |
| CardMini(CardMiniNav) | components/CardMini.tsx | 解读区迷你牌导航：缩略图+位置名，点击定位段落+3D 联动，当前段落 `mini-card-active` 光环 |
| PullQuote | components/PullQuote.tsx | 引文卡 + `splitBoldSegments()` 从 LLM 加粗句自动提取 |
| CountUp | components/CountUp.tsx | 滚动计数（useInView + useSpring），关于页 78/3/2 |
| RuneDivider | components/RuneDivider.tsx | SVG 符文分隔线（菱形刻痕 glyph），替代 ✦ 字符版 |
| ShuffleRitual | components/ShuffleRitual.tsx | 洗牌仪式：堆叠→扇形→飞位→溶解，reduced-motion 跳过 |
| BodyMode | components/BodyMode.tsx | 为 body 挂载阶段背景模式类（subpage-mode 等） |
| OrientationBadge | ReadingStream 内部 | 正位=cyan 满环+文字 / 逆位=purple 半环+文字（双编码） |

**ReadingSheet 版式（P0-C）**：顶部 CardMiniNav → 段落标题 `[glyph] 标题 · 牌名` + Cinzel 英文 + 正逆位徽章 → `reading-prose` 正文（加粗句自动 PullQuote）→ 完成 gold-flash 1800ms。
**CardDetailModal 版式（P1-E）**：左图右文双栏（max-w-2xl，移动端堆叠），Cinzel 编号（大阿卡纳金色），关键词胶囊云，正位 cyan 左边线 / 逆位 red 左边线。
**正逆位双编码**：颜色 + 形状（满环/半环）+ 文字，不只依赖颜色（可访问性）。

---

## 6. 动画系统

### 6.1 时间规范

| 场景 | 时长 | 缓动 |
|------|------|------|
| 微交互 (hover) | 150-200ms | ease-out |
| 状态过渡 (显示/隐藏) | 200-300ms | ease-in-out |
| 页面入场 | 600-800ms | easeOut (spring) |
| 卡牌翻转 | 800ms | spring (stiffness: 100) |
| 段落浮现 | 300ms/段 | ease-out |
| 段落间隔 | 200ms | — |
| 模态框 | 250ms | scale + fade |
| 退出动画 | 150ms（进入的 50%） | ease-in |

### 6.1b 仪式动效（2026-07-25 美化方案 §4.5，已落地）

> 原则：**慢即是神秘** — 环境动效 ≥1200ms，交互反馈 ≤300ms。

| 动效 | 参数 | 场景 | 实现 |
|------|------|------|------|
| EEG 呼吸 | scale 1↔1.04, 4s ease-in-out infinite | braindance | `eeg-breathe` utility |
| 神圣几何缓转 | rotate 360°, 120s linear | Hero / 牌库页头 | `sacred-spin` utility |
| 星尘漂移 | 60s linear infinite alternate | 内页背景 L2 | `body.subpage-mode::before` |
| 页面切换 | opacity 0→1, 400ms | 全站路由 | `app/template.tsx` |
| 完成金光 | gold 光晕 0→0.6→0, 1800ms 一次 | 解读完成 | `gold-flash` utility |
| 「再来一次」呼吸 | boxShadow 脉冲 3s infinite | done 阶段 | ReadingStream motion |
| hover 流光 | gradient sweep 300ms | 主按钮/卡牌 | `flow-sweep` utility |
| 冥想引导 | 2s 渐显渐隐一次 | input 阶段 | `meditation-hint-once` |
| 洗牌仪式 | 堆叠→扇形 800ms→飞位 600ms(stagger 200ms)→溶解 650ms | shuffling | ShuffleRitual 组件 |

### 6.1c 背景三层纵深（美化方案 P0-B，已落地）

```
L3 近景 · 质感层   html::before = SVG feTurbulence 噪点(烘焙 opacity 0.03) + 四角暗角(移动端仅噪点)
L2 中景 · 动态层   首页: ParticleBg 粒子(R3F)  内页: body.subpage-mode::before 星尘慢漂
L1 远景 · 氛围层   deep-space 底色 + bg-nebula.webp(1920×1080, ≤200KB) + 径向渐变
```

| body 类 | L1 状态 | 阶段 |
|---------|---------|------|
| `intro-mode` | 纯黑 | 开场动画 |
| （默认） | bg-neural-dark 纹理 | braindance |
| `meditation-mode` | 星云 ~30% | input 提问 |
| `fullscreen-mode` | 纯深空 | shuffling/reading/done |
| `subpage-mode` | 星云 ~25% + 星尘 | /cards /about（BodyMode 组件挂载） |

扫描线：全局 opacity 0.1（移动端 0.08）。

### 6.2 动画类型

| 类型 | 使用场景 | 实现方式 |
|------|----------|----------|
| **fade-in + translateY** | 页面入场、段落浮现 | Framer Motion `motion.div` |
| **3D 翻转 (180° Y)** | 卡牌展示 | R3F spring rotation.y |
| **粒子漂移** | 背景氛围 | R3F `useFrame` |
| **霓虹脉冲** | 按钮、边框 | CSS `pulse-neon` keyframe |
| **扫描线** | Braindance 界面装饰 | CSS `scan-line` keyframe |
| **悬浮浮动** | 装饰元素 | CSS `float` keyframe |

### 6.3 入场时序

```
页面加载:
  0ms:     Hero 标题 fade-in (800ms)
  300ms:   副标题 fade-in (600ms)
  600ms:   描述文字 fade-in (600ms)
  800ms:   交互区域渐变出现

翻牌时序:
  0ms:     过去牌开始翻转 (800ms)
  500ms:   现状牌开始翻转 (800ms)
  1000ms:  未来牌开始翻转 (800ms)

解读浮现:
  段落到达即显示标题 (150ms fade-in)
  300ms 后正文浮现
  段落间隔 200ms
```

### 6.4 Reduced Motion

```typescript
// 在所有 Framer Motion 组件中尊重 prefers-reduced-motion
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

// 条件动画
<motion.div
  initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6 }}
/>
```

---

## 7. 页面级设计指南

### 7.1 首页 `/` — 占卜主界面

**布局层级**：
```
┌─────────────────────────────────────────┐
│  Navbar (fixed, backdrop-blur)          │
├─────────────────────────────────────────┤
│                                         │
│  条件渲染区域:                            │
│  ┌───────────────────────────────────┐  │
│  │ BraindancePortal (首次/无 Key)    │  │ ← HUD 风格接入界面
│  │ 或 QuestionInput (已有 Key)       │  │ ← 赛博终端风格
│  └───────────────────────────────────┘  │
│                                         │
│  ┌── 3D 翻牌桌 ──────────────────────┐  │
│  │  ParticleBg (粒子背景)             │  │ ← 常驻氛围
│  │  CardMesh ×3 (过去/现状/未来)      │  │ ← 懒加载
│  └────────────────────────────────────┘  │
│                                         │
│  ── 赛博占卜师的解读 ────                │
│  ReadingStream (逐段浮现)               │ ← Framer Motion
│                                         │
│  [ 🔄 再来一次 ]                        │ ← 底部 CTA
└─────────────────────────────────────────┘
```

**状态流转**：
```
braindance → input → shuffling → drawing → reading → done → reset
     ↓                                                         ↑
  输入问题                                                   再来一次
```

**设计要点**：
1. 首次访问展示 BraindancePortal（HUD 风格，3 秒自动跳过）
2. 已有 Key 直接展示 QuestionInput（终端风格）
3. 3D 场景懒加载，骨架屏占位（防 SSR 崩溃）
4. 解读流式展现，段落逐段浮现
5. 始终保留 "再来一次" 出口

### 7.2 关于页 `/about` — 个人作品介绍（2026-07-25 改版）

**定位**：兴趣驱动开发的作品介绍，第一人称、有亲和力；**非**面试/简历展示。
**内容区块**：
1. Hero（一句话定位）
2. 缘起 · 创作动机（drop-cap + PullQuote）
3. 小数字 78/3/2（CountUp）
4. 最沉迷的部分（4 张兴趣卡）
5. 它是怎么运转的（Cinzel 金罗马数字 4 步 + 一句技术注脚）
6. 页尾 GitHub / 站内 demo 双卡

**禁区**：面试话术、技术选型论证、架构图、挑战复盘、项目组合展示。
详细规则见 `design-system/pages/about.md`。

### 7.3 牌库页 `/cards` — 78 张牌百科

**布局**：
- 筛选 Tab 栏（全部 | 大阿卡纳 | 权杖 | 圣杯 | 宝剑 | 星币）
- 响应式网格：mobile 2列 → tablet 3列 → desktop 4列
- 每张牌卡片：缩略图（next/image）+ 中英文名 + 关键词
- 点击展开详情（模态框）：正/逆位释义

**设计要点**：
- 缩略图使用 next/image（经过优化管道）
- 卡牌在网格中呈现"收藏展示"感
- 悬停时微发光 + 轻微上浮
- 筛选切换时应有过渡动画

---

## 8. HUD / 赛博风格装饰元素

### 8.1 适用装饰

| 元素 | 使用位置 | 实现 |
|------|----------|------|
| **边角括号 `[ ]`** | Braindance 界面、特殊卡片 | CSS ::before/::after |
| **扫描线** | Braindance 接入界面 | CSS animation `scan-line` |
| **霓虹脉冲边框** | 主要 CTA 按钮 | CSS `pulse-neon` |
| **终端光标闪烁** | 输入框 | CSS caret + animation |
| **十六进制代码飘落** | 粒子背景（可选） | R3F 或 CSS |
| **数据流线条** | 装饰分隔线 | CSS gradient + animation |

### 8.2 装饰使用原则

✅ **可以**：
- 在 Braindance 接入界面使用扫描线和 HUD 元素（世界观包装）
- 按钮使用霓虹脉冲（交互反馈）
- 特殊卡片使用边角括号（强调层级）

❌ **避免**：
- 在解读文本区域使用过度装饰（影响可读性）
- 在牌库网格使用扫描线（干扰浏览）
- 所有页面同时使用多种装饰（视觉噪音）

---

## 9. UX 关键准则

### 9.1 输入验证

| 场景 | 反馈 |
|------|------|
| 空问题提交 | 输入框抖动 + "请输入你的问题" |
| 超长问题 | 自动截断 200 字，实时计数 |
| API Key 无效 | 红色提示 + "记忆芯片无法识别" |
| 网络断开 | "连接超时，检查神经接口" |

### 9.2 加载状态

| 阶段 | 反馈 |
|------|------|
| LLM 推理中 | 解读区显示脉冲光标 + "赛博先知正在解析…" |
| 3D 纹理加载 | 骨架屏脉冲动画 |
| 翻牌动画 | 按过去→现状→未来时序自动播放 |
| 操作提交 | 按钮 disabled + spinner |

### 9.3 错误恢复

| 场景 | 行为 |
|------|------|
| WebGL 崩溃 | ErrorBoundary 降级 CSS 2D |
| DeepSeek API 失败 | 自动重试 2 次 → 模板降级 |
| 纹理加载失败 | card_back fallback |
| 服务端 Key 超额 | "今日神谕次数已达上限"提示 |

### 9.4 键盘快捷键

| 按键 | 行为 | 条件 |
|------|------|------|
| Enter | 提交问题 | 输入框 focus 时 |
| Esc | 取消解读 | 解读进行中 |

---

## 10. 暗黑主题独享

本项目为 **Dark Mode Only**。原因：
1. 赛博朋克风格天然依赖暗色背景
2. 霓虹发光效果在浅色模式下失去视觉冲击
3. 3D 粒子背景需要暗色底衬
4. PRD 明确指定霓虹蓝紫暗黑主题

⚠️ **可访问性补偿**：
- 所有文本保持 4.5:1 以上对比度
- 不依赖颜色传递信息（搭配文字/图标）
- 支持系统字体缩放
- 尊重 prefers-reduced-motion
- 清晰 focus-visible 指示器

---

## 11. 性能预算

| 指标 | 目标 |
|------|------|
| FCP | < 2s |
| TTI | < 3s |
| 3D 场景首次加载 | < 3s（懒加载 + 骨架屏） |
| LLM 首 token | < 4s |
| 单次占卜总耗时 | ≤ 15s |
| 3D 帧率 | 60fps（低配降粒子） |
| 纹理内存 | 常驻仅 card_back，翻牌后 dispose |

---

## 12. 反模式 (Anti-Patterns)

### 设计层面
- ❌ 使用 emoji 作为图标（使用 SVG: Lucide 或 Heroicons）
- ❌ 混合多种赛博风格（保持 HUD + Cyberpunk UI 一致性）
- ❌ 过度使用霓虹发光（仅用于强调，不用于正文）
- ❌ 装饰影响功能（HUD 元素不可干扰可读性）

### 交互层面
- ❌ 缺乏触控反馈（按钮必须 hover/active 状态）
- ❌ 动画阻塞交互（动画必须 interruptible）
- ❌ 移动端水平滚动
- ❌ 禁用缩放

### 代码层面
- ❌ R3F 组件在服务端渲染（必须 dynamic + ssr:false）
- ❌ 纹理泄漏（每次 RESET 必须 texture.dispose()）
- ❌ 流式 token 逐字 DOM 操作（使用段落粒度更新）

---

## 13. 快速参考卡片

### 常用 Tailwind 类名组合

```jsx
// 霓虹卡片
className="bg-card-surface border border-card-border rounded-xl shadow-card"

// 主按钮
className="bg-neon-cyan text-deep-space font-heading px-6 py-3 rounded-lg
           shadow-neon-cyan hover:shadow-neon-cyan/50 transition-all duration-200"

// 描边按钮
className="border border-neon-cyan text-neon-cyan px-6 py-3 rounded-lg
           hover:bg-neon-cyan/10 transition-all duration-200"

// 发光文本
className="font-heading text-neon-cyan text-glow-cyan"

// 输入框
className="bg-transparent border border-card-border rounded-lg px-4 py-3
           text-text-primary placeholder:text-text-muted
           focus:border-neon-cyan focus:shadow-neon-cyan/20 focus:outline-none"

// 页面容器
className="mx-auto max-w-5xl px-4 pt-24 pb-16"
```

---

> 本设计系统作为 CyberTarot 项目的全局设计规则源。
> 各页面如有特殊覆盖需求，在 `design-system/pages/<page>.md` 中定义。
