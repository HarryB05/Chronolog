"use client"

import { useState, useEffect, useRef } from 'react'
import { LogOut, Moon, Sun, User } from 'lucide-react'
import { useChronalogSignOut } from '../../utils/auth/hooks'
import type { LoginSession } from '../../utils/auth/auth'

interface UserMenuProps {
  session: LoginSession
}

export function UserMenu({ session }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const menuRef = useRef<HTMLDivElement>(null)
  const { signOut } = useChronalogSignOut()

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const stored = localStorage.getItem('chronalog-theme') as 'light' | 'dark' | null
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const initialTheme = stored || (systemPrefersDark ? 'dark' : 'light')
    setTheme(initialTheme)
    applyTheme(initialTheme)
  }, [])

  // Apply theme to document
  const applyTheme = (newTheme: 'light' | 'dark') => {
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('chronalog-theme', newTheme)
  }

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    applyTheme(newTheme)
  }

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center rounded-full transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 dark:focus:ring-zinc-400"
      >
        {session.user.image ? (
          <img
            src={session.user.image}
            alt={session.user.name || session.user.login}
            className="h-8 w-8 rounded-full border-2 border-zinc-200 dark:border-zinc-700"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700">
            <User className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
          <div className="p-2">
            <div className="px-3 py-2">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                {session.user.name || session.user.login}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {session.user.email}
              </p>
            </div>
            <div className="my-1 h-px bg-zinc-200 dark:bg-zinc-800" />
            <button
              onClick={toggleTheme}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              {theme === 'light' ? (
                <>
                  <Moon className="h-4 w-4" />
                  <span>Dark mode</span>
                </>
              ) : (
                <>
                  <Sun className="h-4 w-4" />
                  <span>Light mode</span>
                </>
              )}
            </button>
            <button
              onClick={signOut}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
