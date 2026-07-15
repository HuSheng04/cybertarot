"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "motion/react"

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

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 border-b border-card-border transition-all duration-500 ${
        isFullscreen
          ? "bg-deep-space/30 backdrop-blur-sm hover:bg-deep-space/80"
          : "bg-deep-space/80 backdrop-blur-md"
      }`}
    >
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-heading text-lg tracking-wider text-neon-cyan transition-colors hover:text-neon-cyan/80"
        >
          <span className="text-xl">🎴</span>
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
                className={`relative px-3 py-2 text-sm font-medium transition-colors ${
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
