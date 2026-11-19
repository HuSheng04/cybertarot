# CyberTarot 卡片画廊

一个可直接浏览的塔罗牌画廊，收录完整的 78 张牌面与中英文牌名。打开首页即从「愚人 / The Fool」开始，无需登录或配置 AI 密钥。

## 功能

- 按大阿卡纳、权杖、圣杯、宝剑、星币的原始顺序浏览全部 78 张牌。
- 首页显示可旋转的缩略图牌环。鼠标拖动、手指滑动或触控板横滑后，最近的牌会吸附到正前方。
- 点击侧边牌、使用「上一张」「下一张」或按左右方向键选牌。第 78 张和第 1 张双向相连，Home / End 可跳到首张或末张。
- 点击前方牌、「查看大图」或按 Enter 查看完整牌面。可在大图中继续切牌，点击「返回牌环」或按 Esc 时保留最后查看的牌。
- 电脑端点击「开启手势翻页」后授权摄像头，左挥下一张、右挥上一张，每次挥手后回中停稳。切换牌环和大图时沿用同一次会话，关闭、取消开启或离开页面时释放摄像头。
- `/cards` 和 `/about` 自动跳转到首页。

## 本地启动

需要 Node.js 20.9 或以上版本及 pnpm。

```bash
pnpm install
pnpm dev
```

打开 [localhost:3000](http://localhost:3000)。无需环境变量即可使用；如需修改分享链接的站点地址，可参考 `.env.example` 设置 `NEXT_PUBLIC_APP_URL`。

```bash
pnpm test --runInBand  # 画廊交互、入口跳转与卡片数据测试
pnpm lint             # 代码检查
pnpm build            # 压缩图片并进行生产构建
pnpm start            # 启动生产版本
```

浏览器回归测试覆盖桌面和手机、全部 78 张牌的加载、首尾循环、原生滑动吸附、大小图切换和摄像头会话。首次运行需安装 Chromium。在一个终端运行 `pnpm build && pnpm start`，再在另一个终端运行以下命令。

```bash
pnpm exec playwright install chromium
pnpm test:e2e
```

手势开关仅在宽度至少 768px 且支持精确指针的电脑端显示。摄像头需要 HTTPS 或 localhost；首次打开页面不会请求权限，只有点击开关后才加载识别器。识别画面在浏览器本机处理，不上传；拒绝授权或识别失败时仍可用原有按钮、键盘翻页。

`public/mediapipe/` 已包含模型和配套 WASM，无需运行时访问外部 CDN。升级 `@mediapipe/tasks-vision` 后运行 `pnpm mediapipe:sync`，并一起提交依赖锁文件与更新后的 WASM。资源来源和校验值见 [MediaPipe 资源说明](public/mediapipe/README.md)。

## 技术与结构

使用 Next.js 16 App Router、React 19、TypeScript 和 Tailwind CSS v4。缩略图按连续牌位沿椭圆排列，手势翻页通过 MediaPipe Hand Landmarker 在本地识别。

```text
src/
├── app/
│   ├── page.tsx              # 首页画廊
│   ├── layout.tsx            # 全局布局及分享元数据
│   ├── globals.css           # 自适应布局与画廊样式
│   ├── cards/page.tsx        # 跳转至首页
│   └── about/page.tsx        # 跳转至首页
├── components/
│   ├── CardGallery.tsx       # 选牌状态、吸附与大图视图
│   └── CardRing.tsx          # 缩略图环、拖动与横向滚轮事件
├── hooks/useHandSwipe.ts     # 摄像头与识别器生命周期、15fps 视频采样
├── lib/handSwipe.ts          # 镜像掌心、挥手判定与回中解锁
├── data/cards.ts             # 全部 78 张牌的数据与图片路径
└── types/index.ts            # 卡片与花色类型
public/assets/cards/          # 牌面原图和 WebP 图片
scripts/compress-cards.mjs    # 使用 Sharp 压缩牌面
__tests__/                    # 数据与画廊测试
```

## 许可证

MIT
