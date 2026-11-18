# 本地手势识别资源

- SDK：`@mediapipe/tasks-vision@1.2.3`，锁定版本见 `pnpm-lock.yaml`。
- `wasm/`：复制自该 SDK 的 `wasm/` 目录；WASM 二进制保持官方原样，JS 加载器仅将 stderr 中的 `INFO:` 信息改用 `console.info`，避免 Next.js 开发模式误报应用错误。实际错误及引擎警告保留。升级后执行 `pnpm mediapipe:sync` 并一同提交；若新版本的日志入口变化，同步脚本会报错以便检查。
- `hand_landmarker.task`：官方 Hand Landmarker full / float16 / version 1 模型。
- 模型下载：<https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task>
- 模型 SHA-256：`fbc2a30080c3c557093b5ddfc334698132eb341044ccee322ccf8bcf3607cde1`
- 官方用法、模型说明与模型卡：<https://developers.google.com/edge/mediapipe/solutions/vision/hand_landmarker?tab=Web>

浏览器只在用户主动开启手势后加载这些同源资源。视频帧仅交给本机识别器，不发送至服务端。
