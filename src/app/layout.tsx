import type { Metadata, Viewport } from "next"
import {
  Orbitron,
  Inter,
  Noto_Serif_SC,
  Cinzel,
} from "next/font/google"
import "./globals.css"

/* ===== 字体配置 ===== */
const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
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
    default: "CyberTarot 卡片画廊 — 78 张塔罗牌",
    template: "%s — CyberTarot 卡片画廊",
  },
  description:
    "免登录浏览全部 78 张塔罗牌，欣赏完整牌面与中英文牌名。左右滑动，开启你的卡片漫游。",
  keywords: ["塔罗牌画廊", "卡片画廊", "赛博朋克", "CyberTarot", "78 张塔罗牌"],
  openGraph: {
    title: "CyberTarot 卡片画廊 — 78 张塔罗牌",
    description:
      "免登录浏览全部 78 张塔罗牌，欣赏完整牌面与中英文牌名。左右滑动，开启你的卡片漫游。",
    type: "website",
    locale: "zh_CN",
    siteName: "CyberTarot",
    images: [
      {
        url: "/assets/cards/major_00.webp",
        width: 497,
        height: 700,
        alt: "CyberTarot 卡片画廊",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CyberTarot 卡片画廊 — 78 张塔罗牌",
    description:
      "免登录浏览全部 78 张塔罗牌，欣赏完整牌面与中英文牌名。左右滑动，开启你的卡片漫游。",
    images: ["/assets/cards/major_00.webp"],
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
      className={`${orbitron.variable} ${inter.variable} ${notoSerifSC.variable} ${cinzel.variable} scroll-smooth`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-dvh flex flex-col bg-deep-space text-text-primary font-body antialiased selection:bg-neon-cyan/20 selection:text-neon-cyan">
        {children}
      </body>
    </html>
  )
}
