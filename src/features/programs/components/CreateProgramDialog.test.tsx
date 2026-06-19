import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type * as SharedComponents from '@/shared/components'
import { i18n } from '@/shared/lib/i18n'

import { useCreateProgramDialogStore } from '../store/useCreateProgramDialogStore'
import { CreateProgramDialog } from './CreateProgramDialog'

vi.mock('../hooks/useCreateProgram', () => ({
  useCreateProgram: () => ({
    mutateAsync: vi.fn().mockResolvedValue({
      id: 'prog-new',
      version: 1,
      name: 'P',
      status: 'created',
      createdAt: '',
      updatedAt: '',
    }),
    isPending: false,
  }),
}))

vi.mock('@/features/portfolios', () => ({
  usePortfolios: () => ({
    data: [{ id: 'port-1', name: 'Portfolio A', version: 1, createdAt: '', updatedAt: '' }],
    isLoading: false,
  }),
}))

vi.mock('@/shared/components', async (importOriginal) => {
  const actual = await importOriginal<typeof SharedComponents>()
  return { ...actual, showSuccess: vi.fn(), showError: vi.fn() }
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
  return render(createElement(Wrapper, null, createElement(CreateProgramDialog)))
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

beforeEach(() => {
  useCreateProgramDialogStore.setState({ isOpen: false, defaultPortfolioId: null })
})

describe('CreateProgramDialog — visibility', () => {
  it('does not render dialog when store is closed', () => {
    renderDialog()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders dialog with title when store is open', () => {
    useCreateProgramDialogStore.setState({ isOpen: true, defaultPortfolioId: null })
    renderDialog()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /new program/i })).toBeInTheDocument()
  })

  it('renders name input when open', () => {
    useCreateProgramDialogStore.setState({ isOpen: true, defaultPortfolioId: null })
    renderDialog()
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
  })
})

describe.skip('CreateProgramDialog — portfolio', () => {
  it('disables portfolio selector when defaultPortfolioId is set', () => {
    useCreateProgramDialogStore.setState({ isOpen: true, defaultPortfolioId: 'port-1' })
    renderDialog()
    const portfolioTrigger = screen.getByLabelText(/portfolio/i)
    expect(portfolioTrigger).toBeDisabled()
  })

  it('enables portfolio selector when defaultPortfolioId is null', () => {
    useCreateProgramDialogStore.setState({ isOpen: true, defaultPortfolioId: null })
    renderDialog()
    const portfolioTrigger = screen.getByLabelText(/portfolio/i)
    expect(portfolioTrigger).not.toBeDisabled()
  })
})

describe('CreateProgramDialog — cancel', () => {
  it('closes the dialog when Cancel is clicked', async () => {
    useCreateProgramDialogStore.setState({ isOpen: true, defaultPortfolioId: null })
    renderDialog()
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(useCreateProgramDialogStore.getState().isOpen).toBe(false)
  })

  it('closes the dialog via Escape key', async () => {
    useCreateProgramDialogStore.setState({ isOpen: true, defaultPortfolioId: null })
    renderDialog()
    await userEvent.keyboard('{Escape}')
    expect(useCreateProgramDialogStore.getState().isOpen).toBe(false)
  })
})
