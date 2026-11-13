import { useCallback, useEffect, useState } from 'react'
import { safeGet, safeSet } from '../utils/storage'

const THEME_KEY = 'weatherboard:theme'

function systemTheme() {
  if (typeof window === 'undefined' || !window.matchMedia) return 'dark'
  return window.matchMedia('(prefers-color-scheme: light)').matches
    ? 'light'
    : 'dark'
}

function initialTheme() {
  const saved = safeGet(THEME_KEY, null)
  return saved === 'light' || saved === 'dark' ? saved : systemTheme()
}

export function useTheme() {
  const [theme, setTheme] = useState(initialTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', theme === 'light' ? '#fafafa' : '#0a0a0a')
  }, [theme])

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark'
      safeSet(THEME_KEY, next)
      return next
    })
  }, [])

  return { theme, toggle }
}