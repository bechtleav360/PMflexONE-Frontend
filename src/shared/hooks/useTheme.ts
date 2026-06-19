import { createContext, useContext } from 'react'

/** The active colour scheme. `'system'` defers to the OS preference. */
export type Theme = 'system' | 'light' | 'dark'

/**
 * Shape of the value provided by {@link ThemeProvider}.
 * @property theme - Currently active colour scheme.
 * @property setTheme - Switches the active colour scheme and persists the choice to localStorage.
 */
export interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
}

/** React context carrying the current theme and setter. Consumed via {@link useTheme}. */
export const ThemeContext = createContext<ThemeContextValue | null>(null)

/**
 * Returns the current theme and a setter to switch it.
 *
 * Must be called inside a {@link ThemeProvider} — throws if the context is absent.
 * @returns The theme context value containing the active theme and `setTheme`.
 */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
