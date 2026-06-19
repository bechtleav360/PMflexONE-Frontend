import { useEffect, useState, type ReactNode } from 'react'

import { ThemeContext, type Theme } from '@/shared/hooks/useTheme'

const STORAGE_KEY = 'p1ng-theme'
const MEDIA_QUERY = '(prefers-color-scheme: dark)'

/**
 * Reads the persisted theme preference from localStorage, defaulting to `'system'`.
 * @returns The stored theme preference.
 */
function getStoredTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
  return 'system'
}

/**
 * Resolves the effective colour scheme (`'light'` or `'dark'`) for a given theme preference.
 * @param theme - The user's theme preference.
 * @returns `'dark'` when the resolved theme is dark, `'light'` otherwise.
 */
function resolveEffectiveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') {
    return window.matchMedia(MEDIA_QUERY).matches ? 'dark' : 'light'
  }
  return theme
}

interface ThemeProviderProps {
  children: ReactNode
}

/**
 * Provides the colour-scheme context to its subtree.
 *
 * Persists the user's theme preference (`'system'`, `'light'`, or `'dark'`) to
 * `localStorage`. When set to `'system'`, listens to the OS
 * `prefers-color-scheme` media query and reacts to changes in real time.
 * Toggles the `dark` class on `<html>` based on the resolved effective theme.
 * @param props - Component props.
 * @param props.children - Child nodes that gain access to the theme context.
 * @returns A context provider wrapping the given children.
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(getStoredTheme)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, theme)

    const apply = () => {
      document.documentElement.classList.toggle('dark', resolveEffectiveTheme(theme) === 'dark')
    }

    apply()

    if (theme === 'system') {
      const mql = window.matchMedia(MEDIA_QUERY)
      mql.addEventListener('change', apply)
      return () => mql.removeEventListener('change', apply)
    }
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme: setThemeState }}>
      {children}
    </ThemeContext.Provider>
  )
}
