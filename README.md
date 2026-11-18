# CyberTarot 卡片画廊

一个可直接浏览的塔罗牌画廊，收录完整的 78 张牌面与中英文牌名。打开首页即从「愚人 / The Fool」开始，无需登录或配置 AI 密钥。

## 功能

- 按大阿卡纳、权杖、圣杯、宝剑、星币的原始顺序浏览全部 78 张牌。
- 手机左右滑动、桌面触控板横向滚动，松手后牌面自动居中。
- 使用「上一张」「下一张」翻页，页码与实际滚动位置同步；首尾按钮自动禁用。
- 聚焦画廊后，可用左右方向键翻页，Home / End 跳到首张 / 末张。
- 电脑端点击「开启手势翻页」后授权摄像头，手放中间停稳，左挥下一张、右挥上一张；每次挥手后回中停稳再继续。关闭、取消开启或离开页面会释放摄像头。
- 图片按可用空间等比例显示，保留完整插画；首张优先加载，其余按需加载。
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

浏览器回归测试覆盖桌面和手机、全部 78 张牌的加载、原生滑动吸附、窗口旋转及旧接口下线。首次运行需安装 Chromium；在一个终端运行 `pnpm build && pnpm start`，再在另一个终端执行：

```bash
pnpm exec playwright install chromium
pnpm test:e2e
```

手势开关仅在宽度至少 768px 且支持精确指针的电脑端显示。摄像头需要 HTTPS 或 localhost；首次打开页面不会请求权限，只有点击开关后才加载识别器。识别画面在浏览器本机处理，不上传；拒绝授权或识别失败时仍可用原有按钮、键盘翻页。

`public/mediapipe/` 已包含模型和配套 WASM，无需运行时访问外部 CDN。升级 `@mediapipe/tasks-vision` 后运行 `pnpm mediapipe:sync`，并一起提交依赖锁文件与更新后的 WASM。资源来源和校验值见 [MediaPipe 资源说明](public/mediapipe/README.md)。

## 技术与结构

使用 Next.js 16 App Router、React 19、TypeScript 和 Tailwind CSS v4。画廊采用原生横向滚动与 CSS Scroll Snap，手势翻页通过 MediaPipe Hand Landmarker 在本地识别，不依赖远程 AI 服务。

```text
src/
├── app/
│   ├── page.tsx              # 首页画廊
│   ├── layout.tsx            # 全局布局及分享元数据
│   ├── globals.css           # 自适应布局、滚动吸附与画廊样式
│   ├── cards/page.tsx        # 跳转至首页
│   └── about/page.tsx        # 跳转至首页
├── components/CardGallery.tsx
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
