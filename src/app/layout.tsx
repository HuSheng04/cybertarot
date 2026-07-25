import type { Metadata, Viewport } from "next"
import {
  Orbitron,
  Rajdhani,
  Inter,
  Noto_Serif_SC,
  Cinzel,
} from "next/font/google"
import { TarotProvider } from "@/components/TarotProvider"
import "./globals.css"

/* ===== 字体配置 ===== */
const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  display: "swap",
})

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
})

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
})

/* ===== 美化方案 P0-A · 中文/神秘学字体 ===== */
const notoSerifSC = Noto_Serif_SC({
  variable: "--font-noto-serif-sc",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
})

/* 正文中文按 §7 保底方案退回系统栈: CSS font-stack 仍声明 "Noto Sans SC",
   已安装该字体的系统原生启用, 未安装则回落系统默认(免去 ~200 个切片下载) */

const cinzel = Cinzel({
  variable: "--font-cinzel-next",
  subsets: ["latin"],
  weight: ["600"],
  display: "swap",
})

/* ===== 移动端视口（审计 P2）: 刘海屏 safe-area 全覆盖 + 浏览器主题色 ===== */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0a0a1a",
}

/* ===== SEO / 社交元数据 ===== */
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://cybertarot.vercel.app",
  ),
  title: {
    default: "CyberTarot 赛博占卜师 — AI 塔罗占卜",
    template: "%s — CyberTarot 赛博占卜师",
  },
  description:
    "2077 年，赛博先知为你抽取三张遗物卡牌，用 DeepSeek AI 深度解读过去、现状与未来。",
  keywords: ["塔罗占卜", "AI 占卜", "赛博朋克", "CyberTarot", "DeepSeek", "塔罗牌"],
  openGraph: {
    title: "CyberTarot 赛博占卜师 — AI 塔罗占卜",
    description:
      "2077 年，赛博先知为你抽取三张遗物卡牌，用 DeepSeek AI 深度解读过去、现状与未来。",
    type: "website",
    locale: "zh_CN",
    siteName: "CyberTarot",
    images: [
      {
        url: "/og-image.webp",
        width: 1200,
        height: 630,
        alt: "CyberTarot 赛博占卜师",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CyberTarot 赛博占卜师 — AI 塔罗占卜",
    description:
      "2077 年，赛博先知为你抽取三张遗物卡牌，用 DeepSeek AI 深度解读过去、现状与未来。",
    images: ["/assets/cards/card_back.webp"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/icon-192.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${orbitron.variable} ${rajdhani.variable} ${inter.variable} ${notoSerifSC.variable} ${cinzel.variable} scroll-smooth`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-dvh flex flex-col bg-deep-space text-text-primary font-body antialiased selection:bg-neon-cyan/20 selection:text-neon-cyan">
        <TarotProvider>{children}</TarotProvider>
      </body>
    </html>
  )
}
