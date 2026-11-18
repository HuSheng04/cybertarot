# CyberTarot 目录整理方案

画廊代码已经集中在 `src/`。本轮优先收拾根目录的 7 个检查与截图脚本、旧设计文档和临时输出，保留现有源码、牌图和测试路径。

| 对象 | 建议 |
| --- | --- |
| 根目录的 `visual-*.cjs`、`mobile-audit.cjs`、`readme-shots.cjs` | 仍用于画廊的脚本移入 `scripts/visual/`，输出路径改为项目内的相对路径。仅检查旧占卜流程的脚本确认无引用后删除。 |
| 旧版 PRD、`美化方案.md`、`design-system/` | 旧资料集中到 `docs/archive/`。当前画廊方案保留在 `docs/`，根目录的 `README.md` 作为项目入口。 |
| `.playwright-cli/` | 将仍被文档引用的截图移入 `docs/screenshots/` 并更新链接。其余临时日志和快照移出版本控制，将该目录加入 `.gitignore`。 |
| 源码、牌图与测试 | 沿用 `src/`、`public/assets/cards/`、`__tests__/` 和 `e2e/`。`scripts/compress-cards.mjs` 保留原位，构建命令会调用它。 |

**执行顺序**：先归档文档并更新链接，再整理脚本和临时文件。最后运行 `pnpm test`、`pnpm build` 和 `pnpm test:e2e`，确认首页仍能滑动浏览卡片。
