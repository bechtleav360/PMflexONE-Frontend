import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { TooltipProvider } from '@/shared/components'
import { i18n } from '@/shared/lib/i18n'

import { SidebarOnboardingHint } from './SidebarOnboardingHint'

const SESSION_KEY = 'show-sidebar-hint'
const CUSTOM_EVENT = 'p1ng:show-sidebar-hint'

function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(
      QueryClientProvider,
      { client: qc },
      createElement(TooltipProvider, null, children),
    )
  }
}

function renderHint(child = createElement('span', null, 'Anchor')) {
  const Wrapper = makeWrapper()
  return render(createElement(Wrapper, null, createElement(SidebarOnboardingHint, null, child)))
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

beforeEach(() => {
  sessionStorage.clear()
})

afterEach(() => {
  sessionStorage.clear()
})

describe('SidebarOnboardingHint — basics', () => {
  it('renders children without crashing', () => {
    renderHint(createElement('span', null, 'My child'))
    expect(screen.getByText('My child')).toBeInTheDocument()
  })

  it('does not show popover on mount when session flag is absent', () => {
    renderHint()
    expect(screen.queryByRole('button', { name: /got it/i })).not.toBeInTheDocument()
  })

  it('shows popover after 800 ms when session flag is set', async () => {
    sessionStorage.setItem(SESSION_KEY, 'true')
    vi.useFakeTimers()
    try {
      renderHint()
      expect(screen.queryByRole('button', { name: /got it/i })).not.toBeInTheDocument()
      await act(async () => {
        vi.advanceTimersByTime(800)
      })
      expect(screen.getByRole('button', { name: /got it/i })).toBeInTheDocument()
    } finally {
      vi.useRealTimers()
    }
  })

  it('removes the session flag when the hint is scheduled', async () => {
    sessionStorage.setItem(SESSION_KEY, 'true')
    vi.useFakeTimers()
    try {
      renderHint()
      await act(async () => {
        vi.advanceTimersByTime(800)
      })
      expect(sessionStorage.getItem(SESSION_KEY)).toBeNull()
    } finally {
      vi.useRealTimers()
    }
  })

  it('does not open popover just before 800 ms', async () => {
    sessionStorage.setItem(SESSION_KEY, 'true')
    vi.useFakeTimers()
    try {
      renderHint()
      await act(async () => {
        vi.advanceTimersByTime(799)
      })
      expect(screen.queryByRole('button', { name: /got it/i })).not.toBeInTheDocument()
    } finally {
      vi.useRealTimers()
    }
  })
})

describe('SidebarOnboardingHint — interactions', () => {
  it('shows popover when the custom event is dispatched', async () => {
    vi.useFakeTimers()
    try {
      renderHint()
      await act(async () => {
        window.dispatchEvent(new Event(CUSTOM_EVENT))
        vi.advanceTimersByTime(800)
      })
      expect(screen.getByRole('button', { name: /got it/i })).toBeInTheDocument()
    } finally {
      vi.useRealTimers()
    }
  })

  it('dismisses the popover when the "Got it" button is clicked', async () => {
    sessionStorage.setItem(SESSION_KEY, 'true')
    vi.useFakeTimers()
    try {
      renderHint()
      await act(async () => {
        vi.advanceTimersByTime(800)
      })
      const btn = screen.getByRole('button', { name: /got it/i })
      expect(btn).toBeInTheDocument()
      await act(async () => {
        fireEvent.click(btn)
      })
      expect(screen.queryByRole('button', { name: /got it/i })).not.toBeInTheDocument()
    } finally {
      vi.useRealTimers()
    }
  })

  it('renders hint text inside the popover when open', async () => {
    sessionStorage.setItem(SESSION_KEY, 'true')
    vi.useFakeTimers()
    try {
      renderHint()
      await act(async () => {
        vi.advanceTimersByTime(800)
      })
      const hint = screen.getByText(/active tasks|here you.ll find|sidebar/i)
      expect(hint).toBeInTheDocument()
    } finally {
      vi.useRealTimers()
    }
  })
})
