"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { motion } from "motion/react"
import OracleGlyph from "@/components/icons/OracleGlyph"

const navLinks = [
  { href: "/", label: "占卜" },
  { href: "/about", label: "关于" },
  { href: "/cards", label: "牌库" },
]

type Props = {
  /** 是否处于 3D 全屏模式（shuffling/reading/done 阶段） */
  isFullscreen?: boolean
}

export default function Navbar({ isFullscreen = false }: Props) {
  const pathname = usePathname()

  /* 美化方案 §5.4 · 滚动感知: >40px 背景加深一档 + 底部 cyan 细线淡入 */
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-500 ${
        scrolled
          ? "border-neon-cyan/20 bg-deep-space/95 backdrop-blur-md"
          : "border-card-border"
      } ${
        isFullscreen
          ? "bg-deep-space/30 backdrop-blur-sm hover:bg-deep-space/80"
          : scrolled
            ? ""
            : "bg-deep-space/80 backdrop-blur-md"
      }`}
    >
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        {/* Logo */}
        <Link
          href="/"
          aria-label="CyberTarot 2077"
          className="flex items-center gap-2 py-3 font-heading text-lg tracking-wider text-neon-cyan transition-colors hover:text-neon-cyan/80"
        >
          <OracleGlyph name="brand" size={22} className="text-neon-cyan" />
          <span className="hidden sm:inline">CyberTarot</span>
          <span className="text-xs text-text-muted">2077</span>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href)

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-3 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "text-neon-cyan"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {link.label}
                {isActive && (
                  <motion.span
                    layoutId="navbar-underline"
                    className="absolute bottom-0 left-2 right-2 h-[2px] bg-neon-cyan"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
