import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { ThemeContext, useTheme, type ThemeContextValue } from './useTheme'

function wrapper(value: ThemeContextValue) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  }
  return Wrapper
}

describe('useTheme', () => {
  it('returns the current theme from context', () => {
    const ctx: ThemeContextValue = { theme: 'dark', setTheme: vi.fn() }
    const { result } = renderHook(() => useTheme(), { wrapper: wrapper(ctx) })

    expect(result.current.theme).toBe('dark')
  })

  it('throws when used outside ThemeProvider', () => {
    expect(() => renderHook(() => useTheme())).toThrow('useTheme must be used within ThemeProvider')
  })
})
