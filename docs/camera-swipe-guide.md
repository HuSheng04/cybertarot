# 电脑端摄像头手势翻页实现指南

在画廊底部增加「开启手势翻页」开关。用户面对屏幕，向左挥手前进一张，向右挥手后退一张。画面在浏览器本地处理，手势、按钮和方向键共用现有翻页逻辑。

## 1. 准备识别模型

在项目根目录运行 `pnpm add @mediapipe/tasks-vision`。将安装包中的 `wasm/` 目录复制到 `public/mediapipe/wasm/`，从官方页面下载 Hand Landmarker 模型，保存为 `public/mediapipe/hand_landmarker.task`。提交锁文件，后续升级依赖时同步更新 WASM 文件。[MediaPipe 官方指南与模型下载](https://developers.google.com/edge/mediapipe/solutions/vision/hand_landmarker?tab=Web)

## 2. 开启摄像头并追踪掌心

新增 `src/hooks/useHandSwipe.ts`，让它接收 `onSwipe(direction)`，并向界面提供开启、关闭、运行状态和错误信息。只在用户点击开启后执行以下初始化。示例中的 `video` 是挂载在页面上的静音、带 `playsInline` 的视频元素。

```ts
const stream = await navigator.mediaDevices.getUserMedia({
  video: { width: { ideal: 640 }, height: { ideal: 480 } },
  audio: false,
})
video.srcObject = stream
await video.play()

const { FilesetResolver, HandLandmarker } = await import("@mediapipe/tasks-vision")
const files = await FilesetResolver.forVisionTasks("/mediapipe/wasm")
const detector = await HandLandmarker.createFromOptions(files, {
  baseOptions: { modelAssetPath: "/mediapipe/hand_landmarker.task" },
  runningMode: "VIDEO",
  numHands: 1,
})
```

在 `requestAnimationFrame` 循环中先按每秒约 15 次采样，只处理 `video.currentTime` 已变化且画面就绪的帧。调用 `detector.detectForVideo(video, performance.now())`，从结果的 `landmarks[0]` 取点。将手腕和四个指根（索引 0、5、9、13、17）的坐标取平均，得到掌心位置。轨迹放在 ref 中，界面只在状态或页码变化时更新。[视频帧识别示例](https://developers.google.com/edge/mediapipe/solutions/vision/hand_landmarker?tab=Web)

## 3. 将连续移动判为一次挥手

以下数值是普通笔记本摄像头的调试起点。坐标按画面宽高归一化到 0～1。

1. **统一方向。** 输入普通前置摄像头的原始帧时，使用 `x = 1 - palmX` 转为镜像视角，向用户右侧移动时 x 增大。若已在送入模型前镜像帧，则直接使用 `palmX`。给预览添加 CSS 镜像只影响显示。
2. **判定滑动。** 保留最近 400 毫秒的掌心位置。至少收到 3 帧后，比较窗口首尾坐标。水平位移超过画面宽度的 20%，且像素横移至少是像素纵移的 2 倍时，触发一次。用 `abs(dx) * videoWidth` 和 `abs(dy) * videoHeight` 比较两个方向。镜像视角下，dx 为负表示左挥。
3. **等待收手。** 触发后锁定识别，忽略回程。等掌心回到画面中央区域（例如 x 在 0.35～0.65），且连续 150 毫秒内横向波动小于画面宽度的 3%，再清空轨迹并解锁。首次入镜和跟踪中断后也从等待居中开始，避免把重新入镜算成一次滑动。

## 4. 接入现有画廊

在画廊组件的 `goToCard` 定义后加入回调。将开关放在现有翻页按钮旁，运行时显示「关闭手势翻页」，并提示「手放中间，左挥下一张，右挥上一张」。页码继续由现有的 `onScroll` 更新。[画廊组件](../src/components/CardGallery.tsx)

```ts
const onSwipe = useCallback((direction: "left" | "right") => {
  const step = direction === "left" ? 1 : -1
  goToCard(currentIndexRef.current + step)
}, [goToCard])
```

关闭开关、初始化失败或组件卸载时，走同一条清理路径：取消帧循环，逐条调用 `stream.getTracks()` 返回的轨道的 `stop()`，清空 `video.srcObject`，并调用 `detector.close()`。用一次启动标识检查异步结果；若用户在授权或模型加载期间已经关闭，立即释放迟到的资源。部署使用 HTTPS，本地可使用 localhost。摄像头权限被拒或设备不可用时，在开关旁显示原因，按钮和键盘仍可翻页。[浏览器摄像头权限说明](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)

## 真机验收

- [ ] 打开首页时无授权弹窗；点击开启后才请求摄像头权限。
- [ ] 左挥再收手只前进一张；回中停稳再左挥，可继续前进一张。
- [ ] 右挥后退一张；上下移动、轻微抖动和手离开再入镜均不会误翻。
- [ ] 第一张和最后一张的边界正确；手势与方向键交替使用时页码一致。
- [ ] 关闭或离开页面后摄像头释放；拒绝授权后仍可用按钮浏览。
