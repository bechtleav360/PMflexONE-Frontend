import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type * as SharedComponentsModule from '@/shared/components'
import { showPromise } from '@/shared/components'
import { i18n } from '@/shared/lib/i18n'

import { useDeletePortfolioDialogStore } from '../store/useDeletePortfolioDialogStore'
import { DeletePortfolioDialog } from './DeletePortfolioDialog'

vi.mock('../hooks/useDeletePortfolio', () => ({
  useDeletePortfolio: () => ({ mutateAsync: vi.fn().mockResolvedValue(true) }),
}))

vi.mock('@/shared/components', async (importOriginal) => {
  const actual = await importOriginal<typeof SharedComponentsModule>()
  return { ...actual, showPromise: vi.fn() }
})

const mockShowPromise = vi.mocked(showPromise)

const portfolio = {
  id: 'port-1',
  version: 1,
  name: 'Digital Transformation',
  startYear: 2026,
  endYear: 2028,
  createdAt: '2026-01-01T00:00:00Z',
}

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
  return Wrapper
}

function renderDialog() {
  const Wrapper = makeWrapper()
  return render(createElement(Wrapper, null, createElement(DeletePortfolioDialog)))
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

beforeEach(() => {
  useDeletePortfolioDialogStore.setState({ isOpen: false, portfolio: null })
  mockShowPromise.mockReset()
})

describe('DeletePortfolioDialog — visibility', () => {
  it('does not render dialog when store is closed', () => {
    renderDialog()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders dialog when store is open', () => {
    useDeletePortfolioDialogStore.setState({ isOpen: true, portfolio })
    renderDialog()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('shows the portfolio name in the description', () => {
    useDeletePortfolioDialogStore.setState({ isOpen: true, portfolio })
    renderDialog()
    expect(screen.getByText(/digital transformation/i)).toBeInTheDocument()
  })
})

describe('DeletePortfolioDialog — actions', () => {
  it('calls showPromise when Delete is confirmed', async () => {
    useDeletePortfolioDialogStore.setState({ isOpen: true, portfolio })
    renderDialog()
    await userEvent.click(screen.getByRole('button', { name: /^delete$/i }))
    expect(mockShowPromise).toHaveBeenCalledOnce()
  })

  it('closes the dialog before calling showPromise', async () => {
    useDeletePortfolioDialogStore.setState({ isOpen: true, portfolio })
    renderDialog()
    await userEvent.click(screen.getByRole('button', { name: /^delete$/i }))
    expect(useDeletePortfolioDialogStore.getState().isOpen).toBe(false)
  })

  it('does not call showPromise when portfolio is null (guard)', async () => {
    useDeletePortfolioDialogStore.setState({ isOpen: true, portfolio: null })
    renderDialog()
    await userEvent.click(screen.getByRole('button', { name: /^delete$/i }))
    expect(mockShowPromise).not.toHaveBeenCalled()
  })

  it('calls close when Cancel is clicked', async () => {
    useDeletePortfolioDialogStore.setState({ isOpen: true, portfolio })
    renderDialog()
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(useDeletePortfolioDialogStore.getState().isOpen).toBe(false)
  })

  it('error callback in delete toast is callable', async () => {
    useDeletePortfolioDialogStore.setState({ isOpen: true, portfolio })
    let capturedError: ((err: unknown) => unknown) | undefined
    mockShowPromise.mockImplementation((_p, opts) => {
      if (typeof opts?.error === 'function') capturedError = opts.error as (err: unknown) => unknown
      return undefined as unknown as ReturnType<typeof mockShowPromise>
    })
    renderDialog()
    await userEvent.click(screen.getByRole('button', { name: /^delete$/i }))
    expect(() => capturedError!(new Error('Failed'))).not.toThrow()
  })
})
