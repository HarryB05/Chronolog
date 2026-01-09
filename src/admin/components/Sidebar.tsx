"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { FileText, Settings, Image, BookOpen } from "lucide-react"

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  external?: boolean
}

const navItems: NavItem[] = [
  { href: "/chronalog", label: "Changelog", icon: FileText },
  { href: "/chronalog/media", label: "Media", icon: Image },
  { href: "/chronalog/settings", label: "Settings", icon: Settings },
  { href: "https://chronalog.dev/docs", label: "Docs", icon: BookOpen, external: true },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="sticky top-16 h-[calc(100vh-4rem)] w-64 shrink-0 border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex h-full flex-col">
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {navItems.map((item) => {
            const isActive = !item.external && pathname === item.href
            const Icon = item.icon
            const className = `flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
            }`
            
            if (item.external) {
              return (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={className}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </a>
              )
            }
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={className}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
