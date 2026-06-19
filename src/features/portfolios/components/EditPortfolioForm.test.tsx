import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type * as SharedComponentsModule from '@/shared/components'
import { showPromise } from '@/shared/components'
import { i18n } from '@/shared/lib/i18n'

import { useEditPortfolioDialogStore } from '../store/useEditPortfolioDialogStore'
import type { Portfolio } from '../types/portfolio.types'
import { EditPortfolioForm } from './EditPortfolioForm'

const mockMutateAsync = vi.fn().mockResolvedValue({ id: 'port-1', version: 2 })

vi.mock('../hooks/useUpdatePortfolio', () => ({
  useUpdatePortfolio: () => ({ mutateAsync: mockMutateAsync }),
}))

vi.mock('@/shared/components', async (importOriginal) => {
  const actual = await importOriginal<typeof SharedComponentsModule>()
  return { ...actual, showPromise: vi.fn() }
})

const mockShowPromise = vi.mocked(showPromise)

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

function renderForm(p = portfolio) {
  const Wrapper = makeWrapper()
  return render(createElement(Wrapper, null, createElement(EditPortfolioForm, { portfolio: p })))
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

beforeEach(() => {
  useEditPortfolioDialogStore.setState({ isOpen: true, portfolio })
  mockShowPromise.mockReset()
  mockMutateAsync.mockResolvedValue({ id: 'port-1', version: 2 })
})

describe('EditPortfolioForm — rendering', () => {
  it('pre-fills the name field with the portfolio name', () => {
    renderForm()
    expect(screen.getByDisplayValue('Digital Transformation')).toBeInTheDocument()
  })

  it('renders Cancel and Save Changes buttons', () => {
    renderForm()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument()
  })
})

describe('EditPortfolioForm — validation', () => {
  it('shows required error when name is cleared and form is submitted', async () => {
    renderForm()
    await userEvent.clear(screen.getByLabelText(/title/i))
    await userEvent.click(screen.getByRole('button', { name: /save changes/i }))
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/title is required/i)
    })
  })

  it('shows a validation error when name exceeds 255 characters', async () => {
    renderForm()
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'a'.repeat(256) } })
    await userEvent.click(screen.getByRole('button', { name: /save changes/i }))
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })
})

describe('EditPortfolioForm — submit', () => {
  it('calls showPromise on valid submit', async () => {
    renderForm()
    await userEvent.click(screen.getByRole('button', { name: /save changes/i }))
    await waitFor(() => expect(mockShowPromise).toHaveBeenCalledOnce())
  })

  it('closes the dialog before calling showPromise', async () => {
    renderForm()
    await userEvent.click(screen.getByRole('button', { name: /save changes/i }))
    await waitFor(() => expect(mockShowPromise).toHaveBeenCalled())
    expect(useEditPortfolioDialogStore.getState().isOpen).toBe(false)
  })

  it('error callback in update toast is callable', async () => {
    let capturedError: ((err: unknown) => unknown) | undefined
    mockShowPromise.mockImplementation((_p, opts) => {
      if (typeof opts?.error === 'function') capturedError = opts.error as (err: unknown) => unknown
      return undefined as unknown as ReturnType<typeof mockShowPromise>
    })
    renderForm()
    await userEvent.click(screen.getByRole('button', { name: /save changes/i }))
    await waitFor(() => expect(capturedError).toBeDefined())
    expect(() => capturedError!(new Error('Failed'))).not.toThrow()
  })
})

describe('EditPortfolioForm — cancel', () => {
  it('closes the dialog when Cancel is clicked', async () => {
    renderForm()
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(useEditPortfolioDialogStore.getState().isOpen).toBe(false)
  })
})
