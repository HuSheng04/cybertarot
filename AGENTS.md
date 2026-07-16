# CyberTarot 项目指令

## 每次新会话启动时必须执行

在回答任何问题或执行任何操作之前，必须先读取以下文件：

1. **`design-system/MASTER.md`** — 全局设计规则源（配色/字体/布局/动画/组件规范）
2. **`design-system/pages/`** — 各页面级设计指南（按当前任务涉及的页面读取）

读取后根据 PLAN 确定当前阶段，在设计系统约束下执行任务。

## 项目基本信息

- 框架：Next.js App Router + TypeScript
- 包管理：pnpm
- 风格：Cyberpunk UI + HUD/Sci-Fi FUI，暗黑独享
- 配色：deep-space #0a0a1a / neon-cyan #00f0ff / neon-purple #b44dff
- 字体：Orbitron（标题）+ Rajdhani（副标题）+ Inter（正文）
- 3D：React Three Fiber（懒加载 + ErrorBoundary 降级）
- 动画：Framer Motion
- LLM：DeepSeek API（Node.js Serverless）
