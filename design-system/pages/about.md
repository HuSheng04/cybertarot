# CyberTarot — 关于页设计指南

> 覆盖设计系统 Master 中与关于页相关的规则
> 路由: `/about` | 文件名: `app/about/page.tsx`

---

## 1. 页面目标

展示项目的技术深度、设计理念和开发故事。面向面试官和技术受众。

## 2. 布局

- 阅读宽度：`max-w-3xl`，居中
- 卡片化 section：`bg-card-surface border border-card-border rounded-xl`
- 每个 section 使用霓虹青色标题

## 3. 内容区块 (Section Order)

### 3.1 Hero — 概念故事

- 标题："关于 CyberTarot"
- 段落：2077 年 Braindance + 遗物卡牌世界观
- 风格：叙述性文字，略带赛博诗意

### 3.2 技术栈看板

- 网格布局（2列 mobile → 3列 desktop）
- 每个技术卡片：图标 + 名称 + 一句话理由
- 包括：Next.js, R3F, Framer Motion, Tailwind CSS, DeepSeek, TypeScript, Sharp, Vercel

### 3.3 系统架构图

- Mermaid 图表展示前后端架构
- 数据流：用户 → Braindance → Next.js API → DeepSeek → 流式返回
- 组件树：TarotProvider → ReadingProvider → TarotTable3D → ReadingStream

### 3.4 设计决策

3-4 个关键决策，每项包含：问题 → 方案 → 理由
1. 为什么预设卡面而非实时生成？（成本/一致性/速度）
2. 为什么双 Context 架构？（避免流式 token 重渲染 3D）
3. 为什么 Node.js Serverless 而非 Edge？（DeepSeek 兼容性）
4. 为什么逐段浮现而非打字机？（展示时间 2s vs 18s）

### 3.5 技术挑战

2-3 个开发中解决的实际问题：
1. R3F + SSR 冲突（dynamic import 方案）
2. 纹理内存泄漏（dispose 生命周期管理）
3. Vercel 10s 超时限制（Prompt 压缩策略）

### 3.6 项目组合

- 与 CopyAI 的对比展示
- 体现"实用型 + 趣味型"AI 产品广度

## 4. 设计风格

- 保持暗黑主题
- 代码块风格：深色背景 + 荧光绿文字
- 卡片使用微发光边框
- Mermaid 图表使用霓虹配色
- 整体感觉：技术博客 + 赛博美学

## 5. Master 覆盖

| 规则 | 覆盖 |
|------|------|
| 容器宽度 | max-w-3xl（阅读宽度，非 5xl） |
| 装饰元素 | 不使用 HUD 装饰（保持阅读干净） |
