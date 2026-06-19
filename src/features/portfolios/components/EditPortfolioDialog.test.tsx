import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type * as SharedComponentsModule from '@/shared/components'
import { i18n } from '@/shared/lib/i18n'

import { useEditPortfolioDialogStore } from '../store/useEditPortfolioDialogStore'
import type { Portfolio } from '../types/portfolio.types'
import { EditPortfolioDialog } from './EditPortfolioDialog'

vi.mock('../hooks/useUpdatePortfolio', () => ({
  useUpdatePortfolio: () => ({
    mutateAsync: vi.fn().mockResolvedValue({ id: 'port-1', version: 2 }),
  }),
}))

vi.mock('@/shared/components', async (importOriginal) => {
  const actual = await importOriginal<typeof SharedComponentsModule>()
  return { ...actual, showPromise: vi.fn() }
})

const portfolio: Portfolio = {
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
  return render(createElement(Wrapper, null, createElement(EditPortfolioDialog)))
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

beforeEach(() => {
  useEditPortfolioDialogStore.setState({ isOpen: false, portfolio: null })
})

describe('EditPortfolioDialog — visibility', () => {
  it('does not render dialog when store is closed', () => {
    renderDialog()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders dialog with title when store is open', () => {
    useEditPortfolioDialogStore.setState({ isOpen: true, portfolio })
    renderDialog()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText(/edit portfolio/i)).toBeInTheDocument()
  })

  it('does not render the form when portfolio is null', () => {
    useEditPortfolioDialogStore.setState({ isOpen: true, portfolio: null })
    renderDialog()
    expect(screen.queryByRole('button', { name: /save changes/i })).not.toBeInTheDocument()
  })

  it('pre-fills the name field with the portfolio name', () => {
    useEditPortfolioDialogStore.setState({ isOpen: true, portfolio })
    renderDialog()
    expect(screen.getByDisplayValue('Digital Transformation')).toBeInTheDocument()
  })
})

describe('EditPortfolioDialog — cancel', () => {
  it('closes the dialog when Cancel is clicked', async () => {
    useEditPortfolioDialogStore.setState({ isOpen: true, portfolio })
    renderDialog()
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(useEditPortfolioDialogStore.getState().isOpen).toBe(false)
  })

  it('closes the dialog via Escape key', async () => {
    useEditPortfolioDialogStore.setState({ isOpen: true, portfolio })
    renderDialog()
    await userEvent.keyboard('{Escape}')
    expect(useEditPortfolioDialogStore.getState().isOpen).toBe(false)
  })
})
