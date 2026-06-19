import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type * as SharedComponentsModule from '@/shared/components'
import { i18n } from '@/shared/lib/i18n'

import { useCreatePortfolioDialogStore } from '../store/useCreatePortfolioDialogStore'
import { CreatePortfolioDialog } from './CreatePortfolioDialog'

vi.mock('../hooks/useCreatePortfolio', () => ({
  useCreatePortfolio: () => ({ mutateAsync: vi.fn().mockResolvedValue({ id: 'port-new' }) }),
}))

vi.mock('@/shared/components', async (importOriginal) => {
  const actual = await importOriginal<typeof SharedComponentsModule>()
  return { ...actual, showPromise: vi.fn() }
})

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
  return Wrapper
}

function renderDialog() {
  const Wrapper = makeWrapper()
  return render(createElement(Wrapper, null, createElement(CreatePortfolioDialog)))
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

beforeEach(() => {
  useCreatePortfolioDialogStore.setState({ isOpen: false })
})

describe('CreatePortfolioDialog — visibility', () => {
  it('does not render dialog when store is closed', () => {
    renderDialog()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders dialog with title when store is open', () => {
    useCreatePortfolioDialogStore.setState({ isOpen: true })
    renderDialog()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /create portfolio/i })).toBeInTheDocument()
  })

  it('renders the name input when open', () => {
    useCreatePortfolioDialogStore.setState({ isOpen: true })
    renderDialog()
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
  })
})

describe('CreatePortfolioDialog — cancel', () => {
  it('closes the dialog when Cancel is clicked', async () => {
    useCreatePortfolioDialogStore.setState({ isOpen: true })
    renderDialog()
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(useCreatePortfolioDialogStore.getState().isOpen).toBe(false)
  })

  it('closes the dialog via Escape key', async () => {
    useCreatePortfolioDialogStore.setState({ isOpen: true })
    renderDialog()
    await userEvent.keyboard('{Escape}')
    expect(useCreatePortfolioDialogStore.getState().isOpen).toBe(false)
  })
})
