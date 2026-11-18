import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    ".next.bak*/**",
    "_temp_next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // 预编译的 MediaPipe 运行时，由同步脚本复制并适配日志级别。
    "public/mediapipe/wasm/**",
    "e2e/**",
    // 第三方技能包脚手架（非项目业务代码，不参与 lint 门槛）
    ".workbuddy-ai/**",
    "skills/**",
  ]),
]);

export default eslintConfig;
