# CyberTarot — 牌库页设计指南

> 覆盖设计系统 Master 中与牌库页相关的规则
> 路由: `/cards` | 文件名: `app/cards/page.tsx`

---

## 1. 页面目标

展示全部 78 张塔罗牌，支持浏览和筛选。作为卡牌图鉴和知识库。

## 2. 布局

- 容器宽度：`max-w-5xl`
- 筛选栏 + 响应式网格

## 3. 筛选栏

- Tab 切换风格（Rajdhani uppercase，霓虹青色选中态）
- 选项：全部 | 大阿卡纳 | 权杖 | 圣杯 | 宝剑 | 星币
- Tab 切换时网格有淡入过渡动画

## 4. 卡牌网格

| 断点 | 列数 | 卡片大小 |
|------|------|----------|
| 375px (mobile) | 2列 | 紧凑 |
| 640px (sm) | 3列 | 标准 |
| 1024px (lg) | 4-5列 | 舒适 |
| 1280px+ | 5列 | 最大 |

## 5. 卡牌卡片

每个卡片项：
- **缩略图**：`next/image` 加载，216×300px（优化管道路径）
- **中文名**：Rajdhani 600，text-primary
- **英文名**：Inter 400, text-sm, text-secondary
- **关键词**：2-3 个标签，text-xs, text-muted
- **悬停**：轻微上浮 (translateY(-4px)) + 霓虹发光边框

设计要点：
- 使用 next/image（经过 Next.js 优化管道，不同于 R3F 的 useTexture）
- 卡片统一为竖版比例，与卡牌本身比例一致
- 加载使用 blur placeholder

## 6. 详情模态框

点击卡片展开：
- 大图展示（512×700px）
- 中英文名 + 花色 + 编号
- 关键词标签列表
- 正位释义（neon-cyan 标题 + 白色正文）
- 逆位释义（error-red 标题 + 白色正文）
- 关闭按钮（ESC / 点击外部 / X 按钮）

## 7. 空状态

- 筛选结果为空时：显示"没有找到匹配的卡牌"
- 保持网格区域可见骨架

## 8. 数据状态

- **加载中**：网格显示骨架屏（脉冲方块）
- **数据就绪**：正常展示
- **图片加载失败**：显示 card_back 占位 + 牌名文字

---

## 美化更新（2026-07-25，美化方案 P1-E）

### 页头
- 「牌库」Noto Serif SC 700 大标题（tracking 0.2em）+ Rajdhani 小字「78 张遗物卡牌档案」
- 搜索框：按中文/英文牌名、关键词过滤；空结果提示含搜索词

### Tab
- 符文胶囊：rounded-full + tracking-widest；激活态 cyan 边框 + 外发光
- layoutId 滑动指示器加 `shadow-[0_0_8px_#00f0ff]` 发光

### 网格卡牌
- 大阿卡纳左上角 Cinzel 罗马数字金标（moonlight-gold，0–XXI）
- hover 3D 倾斜：rotateX/Y ≤±4° 跟随指针（useMotionValue + useSpring），触控指针跳过
- 全息反光扫过（skew 渐变 700ms）+ 底部 cyan 光晕
- 牌名英文改 Cinzel

### CardDetailModal
- 左图右文双栏（max-w-2xl，移动端堆叠）
- Cinzel 编号（大阿卡纳金色）+ 关键词胶囊云（rounded-full cyan 边）
- 正位 cyan 左边线 / 逆位 red 左边线分栏

### 背景
- `subpage-mode`：L1 星云 25% + L2 星尘 60s 慢漂 + shelf-grid 保留
