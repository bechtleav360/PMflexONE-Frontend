import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type * as SharedComponentsModule from '@/shared/components'
import { showPromise } from '@/shared/components'
import { i18n } from '@/shared/lib/i18n'

import { useCreatePortfolioDialogStore } from '../store/useCreatePortfolioDialogStore'
import { CreatePortfolioForm } from './CreatePortfolioForm'

const mockMutateAsync = vi.fn().mockResolvedValue({ id: 'port-new' })

vi.mock('../hooks/useCreatePortfolio', () => ({
  useCreatePortfolio: () => ({ mutateAsync: mockMutateAsync }),
}))

vi.mock('@/shared/components', async (importOriginal) => {
  const actual = await importOriginal<typeof SharedComponentsModule>()
  return { ...actual, showPromise: vi.fn() }
})

const mockShowPromise = vi.mocked(showPromise)

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
  return Wrapper
}

function renderForm() {
  const Wrapper = makeWrapper()
  return render(createElement(Wrapper, null, createElement(CreatePortfolioForm)))
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

beforeEach(() => {
  useCreatePortfolioDialogStore.setState({ isOpen: true })
  mockShowPromise.mockReset()
  mockMutateAsync.mockResolvedValue({ id: 'port-new' })
})

describe('CreatePortfolioForm — rendering', () => {
  it('renders the name input field', () => {
    renderForm()
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
  })

  it('renders Start Year and End Year fields', () => {
    renderForm()
    expect(screen.getByText(/start year/i)).toBeInTheDocument()
    expect(screen.getByText(/end year/i)).toBeInTheDocument()
  })

  it('renders Cancel and Create Portfolio buttons', () => {
    renderForm()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create portfolio/i })).toBeInTheDocument()
  })
})

describe('CreatePortfolioForm — validation', () => {
  it('shows required error when name is empty on submit', async () => {
    renderForm()
    await userEvent.click(screen.getByRole('button', { name: /create portfolio/i }))
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
    expect(screen.getByRole('alert')).toHaveTextContent(/title is required/i)
  })

  it('shows a validation error when name exceeds 255 characters', async () => {
    renderForm()
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'a'.repeat(256) } })
    await userEvent.click(screen.getByRole('button', { name: /create portfolio/i }))
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })
})

describe('CreatePortfolioForm — submit', () => {
  it('calls showPromise on valid submit', async () => {
    renderForm()
    await userEvent.type(screen.getByLabelText(/title/i), 'My Portfolio')
    await userEvent.click(screen.getByRole('button', { name: /create portfolio/i }))
    await waitFor(() => expect(mockShowPromise).toHaveBeenCalledOnce())
  })

  it('closes the dialog before calling showPromise', async () => {
    renderForm()
    await userEvent.type(screen.getByLabelText(/title/i), 'My Portfolio')
    await userEvent.click(screen.getByRole('button', { name: /create portfolio/i }))
    await waitFor(() => expect(mockShowPromise).toHaveBeenCalled())
    expect(useCreatePortfolioDialogStore.getState().isOpen).toBe(false)
  })

  it('error callback in create toast is callable', async () => {
    let capturedError: ((err: unknown) => unknown) | undefined
    mockShowPromise.mockImplementation((_p, opts) => {
      if (typeof opts?.error === 'function') capturedError = opts.error as (err: unknown) => unknown
      return undefined as unknown as ReturnType<typeof mockShowPromise>
    })
    renderForm()
    await userEvent.type(screen.getByLabelText(/title/i), 'My Portfolio')
    await userEvent.click(screen.getByRole('button', { name: /create portfolio/i }))
    await waitFor(() => expect(capturedError).toBeDefined())
    expect(() => capturedError!(new Error('Failed'))).not.toThrow()
  })
})

describe('CreatePortfolioForm — cancel', () => {
  it('closes the dialog when Cancel is clicked', async () => {
    renderForm()
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(useCreatePortfolioDialogStore.getState().isOpen).toBe(false)
  })
})
