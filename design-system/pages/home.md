# CyberTarot — 首页设计指南

> 覆盖设计系统 Master 中与首页相关的规则
> 路由: `/` | 文件名: `app/page.tsx`

---

## 1. 页面目标

核心占卜体验入口。用户在 15 秒内完成"接入 → 提问 → 翻牌 → 解读"完整闭环。

## 2. Phase 流转与对应 UI

| Phase | 渲染组件 | 关键设计 |
|-------|----------|----------|
| `braindance` | `<BraindancePortal />` | HUD 风格接入界面，3 秒自动跳过 |
| `input` | `<QuestionInput />` | 终端风格输入框，200 字限制 |
| `shuffling` | `<CardSkeleton />` | 骨架屏脉冲动画 |
| `drawing` | `<TarotTable3D />` | 3D 翻牌（过去→现状→未来） |
| `reading` | `<TarotTable3D /> + <ReadingStream />` | 3D 场景保持 + 解读浮现 |
| `done` | 完整 UI + 「再来一次」按钮 | 解读完成状态 |
| `error` | 错误提示 + 重试 / 降级方案 | 友好错误信息 |

## 3. 首页视觉层级

```
Hero 区（顶部）：
  ┌─────────────────────────────────────┐
  │  🎴 CyberTarot 2077     [Nav]       │ ← Navbar fixed top
  │  "在数据的洪流中，寻找你的命运"        │ ← Hero 标语
  └─────────────────────────────────────┘

交互区（中部）：
  ┌─────────────────────────────────────┐
  │  [Braindance 接入] 或 [输入区]       │ ← 条件渲染
  │  视 phase 展示不同 UI                 │
  └─────────────────────────────────────┘

3D 展示区（核心视觉）：
  ┌─────────────────────────────────────┐
  │    ✦  ✦  ✦                          │ ← 粒子背景
  │  ┌──┐ ┌──┐ ┌──┐                     │
  │  │过│ │现│ │未│                     │ ← 三张 3D 卡牌
  │  │去│ │状│ │来│                     │
  │  └──┘ └──┘ └──┘                     │
  └─────────────────────────────────────┘

解读区（流式）：
  ┌─────────────────────────────────────┐
  │  ── 赛博占卜师的解读 ──              │
  │  📜 段落 1 (fade-in)                 │ ← Framer Motion
  │  📜 段落 2 (fade-in)                 │
  │  📜 段落 3 ...                       │
  │  [ 🔄 再来一次 ]                     │
  └─────────────────────────────────────┘
```

## 4. BraindancePortal 设计要点

- **世界观包装**：标题"接入 Braindance 神经接口"
- **选项 1**："使用服务端神谕核心"（3 秒脑波倒计时自动跳过）
- **选项 2**："插入记忆芯片"（粘贴 API Key）
- **视觉（Phase 3 重做）**：
  - EEG 脑电波环：conic-gradient 环形轨道 + 旋转光点 + 径向波动
  - 慢速扫描线（3s 周期）+ 十六进制代码飘落（opacity 0.025）
  - 神经突触按钮：左侧发光圆点 + 右侧 `>>>` 箭头 + hover 突触分支 SVG
  - 脑波倒计时：波形随数字变化（3=剧烈 → 0=直线），接入完成闪光
  - HUD 角标、霓虹边框保持不变
- **错误**：Key 无效 → "记忆芯片无法识别"

## 5. QuestionInput 设计要点

- **风格**：终端命令行风格
- **占位符**："输入你的问题，赛博先知将为你解读…"
- **字数**：200 字限制，实时 `{count}/200` 计数
- **提交**：Enter 或按钮，loading 态显示"连接 Braindance…"
- **空提交**：输入框抖动动画 + 错误提示

## 6. 3D 翻牌桌覆盖

- **懒加载**：`dynamic(() => import(...), { ssr: false })` + 骨架屏
- **卡牌位置**：过去 (-2.5, 0, 0) | 现状 (0, 0, 0) | 未来 (2.5, 0, 0)
- **翻牌时序**：过去 (0s) → 现状 (0.5s) → 未来 (1.0s)，各 800ms
- **正逆位**：逆位牌面 rotation.z = 180°
- **错误边界**：WebGL 崩溃降级 CSS 2D
- **纹理管理**：预加载 3 张 → onload 确认 → 翻牌，reset 时 dispose

## 7. 解读区 ReadingStream

- 段落切分：按 `##` 标题分割
- 标题先现（150ms fade-in），正文继续缓冲
- 段落浮现：fade-in + translateY(10→0)，300ms/段
- 段落间隔：200ms
- 取消按钮：AbortController 中断流
- 降级：API 失败时模板内容

## 8. Demo 模式 (`/?demo`)

- 自动填入"我最近的事业运如何？"
- `/?q=自定义问题` 支持自定义
- 延迟 1 秒自动触发占卜
- 面试官零操作可体验

---

## 美化更新（2026-07-25，美化方案 P0-A/B/C + P1-D + P2-G）

### Hero
- 混排：`CYBER TAROT 2077`（Orbitron xs, tracking 0.5em）+「赛博占卜师」（Noto Serif SC 700, clamp(44px,8vw,84px), tracking 0.12em）
- 背景 SacredGeometry(hexagram)，月光金，opacity 0.06，120s 缓转
- 副标题衬线化 + tracking 0.3em

### braindance
- EEG 环 `eeg-breathe` 4s 呼吸缩放
- 面板底部微文案 `NEURAL PROTOCOL v2.7.7 · ENCRYPTED`（text-xs, opacity 0.3）

### input
- 冥想引导「深呼吸，默念你的问题」2s 渐显渐隐一次（`meditation-hint-once`）
- 字数计数 = 弧形进度环（SVG stroke-dashoffset）+ Rajdhani 数字
- 深潜按钮 cyan→purple 对角渐变 + `flow-sweep` hover 流光 300ms

### shuffling
- ShuffleRitual：牌背堆叠 → 扇形洗牌 800ms → 三张依次飞位 600ms（stagger 200ms）→ 溶解 650ms
- 进度文案三段式「洗牌 → 切牌 → 抽牌」（750ms/段）+ cyan→purple 渐变进度条
- reduced-motion：仪式整体跳过

### reading（P0-C 核心）
- ReadingSheet 顶部 CardMiniNav：三缩略图+位置名，点击 scrollIntoView + activePosition 联动 3D，当前段落 mini-card-active 光环
- 段落标题：`[位置glyph] 标题 · 牌名`（Noto Serif SC）+ Cinzel 英文小字 + 正逆位徽章（正=cyan 满环 / 逆=purple 半环 + 文字，双编码）
- 正文 `reading-prose`（1.9/0.02em/65ch）；`**加粗句**` 自动提取为 PullQuote（衬线居中 + 两侧金线）
- 完成时刻 gold-flash 金光脉冲 1800ms 一次；「再来一次」boxShadow 呼吸 3s + flow-sweep

### 全局
- 背景三层：L1 星云/纹理（body 模式类）+ L2 粒子/星尘 + L3 噪点暗角（html::before）；扫描线 0.1（移动 0.08）
- Navbar 滚动 >40px 背景加深 + cyan 细线；`app/template.tsx` 400ms 路由淡入
- Panel 统一 `hud-corner` + backdrop-blur-md
