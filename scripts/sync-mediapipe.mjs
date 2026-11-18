import { cpSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

const root = new URL("../", import.meta.url)
const target = new URL("public/mediapipe/wasm/", root)
mkdirSync(target, { recursive: true })
cpSync(new URL("node_modules/@mediapipe/tasks-vision/wasm/", root), target, { recursive: true })

// Emscripten sends all stderr to console.error, including TFLite's INFO logs.
// Next.js treats that console.error as an application error in development.
// Route INFO at the SDK boundary without changing the app's global console.
const originalStderr = "var err = console.error.bind(console);"
const runtimeStderr = `// CyberTarot: preserve stderr errors; classify TFLite INFO messages correctly.
var err = function(...args) {
  if (typeof args[0] === "string" && args[0].startsWith("INFO: ")) {
    console.info(...args);
  } else {
    console.error(...args);
  }
};
// End CyberTarot stderr routing.`

for (const name of readdirSync(target).filter((name) => name.endsWith(".js"))) {
  const path = new URL(name, target)
  const source = readFileSync(path, "utf8")
  if (source.split(originalStderr).length !== 2) {
    throw new Error(`MediaPipe stderr 入口已变化，请检查新版本的日志适配：${name}`)
  }
  writeFileSync(path, source.replace(originalStderr, runtimeStderr))
}
console.log(`MediaPipe WASM 已同步至 ${fileURLToPath(target)}`)
