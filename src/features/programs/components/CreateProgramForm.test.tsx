import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ClientError } from 'graphql-request'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type * as SharedComponents from '@/shared/components'
import { showError, showSuccess } from '@/shared/components'
import { i18n } from '@/shared/lib/i18n'

import { useCreateProgramDialogStore } from '../store/useCreateProgramDialogStore'
import { CreateProgramForm } from './CreateProgramForm'

const mockMutateAsync = vi.fn()

vi.mock('../hooks/useCreateProgram', () => ({
  useCreateProgram: () => ({ mutateAsync: mockMutateAsync, isPending: false }),
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

const mockShowSuccess = vi.mocked(showSuccess)
const mockShowError = vi.mocked(showError)

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
  return Wrapper
}

function renderForm() {
  const Wrapper = makeWrapper()
  return render(createElement(Wrapper, null, createElement(CreateProgramForm)))
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

beforeEach(() => {
  useCreateProgramDialogStore.setState({ isOpen: true, defaultPortfolioId: null })
  mockShowSuccess.mockReset()
  mockShowError.mockReset()
  mockMutateAsync.mockResolvedValue({
    id: 'prog-new',
    version: 1,
    name: 'My Program',
    status: 'created',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  })
})

describe('CreateProgramForm — rendering', () => {
  it('renders name, cancel, and submit buttons', () => {
    renderForm()
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create program/i })).toBeInTheDocument()
  })
})

describe('CreateProgramForm — validation', () => {
  it('shows required error when name is empty on submit', async () => {
    renderForm()
    await userEvent.click(screen.getByRole('button', { name: /create program/i }))
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
    expect(screen.getByRole('alert')).toHaveTextContent(/required/i)
  })

  it('rejects whitespace-only name', async () => {
    renderForm()
    await userEvent.type(screen.getByLabelText(/name/i), '   ')
    await userEvent.click(screen.getByRole('button', { name: /create program/i }))
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })
})

describe('CreateProgramForm — submit', () => {
  it('calls mutateAsync with trimmed name and portfolioId from store', async () => {
    useCreateProgramDialogStore.setState({ isOpen: true, defaultPortfolioId: 'port-1' })
    renderForm()
    await userEvent.type(screen.getByLabelText(/name/i), 'My Program')
    await userEvent.click(screen.getByRole('button', { name: /create program/i }))
    await waitFor(() =>
      expect(mockMutateAsync).toHaveBeenCalledWith({
        name: 'My Program',
        portfolioId: 'port-1',
        metadata: null,
      }),
    )
  })

  it('shows success toast and closes dialog on success', async () => {
    renderForm()
    await userEvent.type(screen.getByLabelText(/name/i), 'My Program')
    await userEvent.click(screen.getByRole('button', { name: /create program/i }))
    await waitFor(() => expect(mockShowSuccess).toHaveBeenCalledOnce())
    expect(useCreateProgramDialogStore.getState().isOpen).toBe(false)
  })

  it('surfaces duplicate-name GQL error as inline name field error', async () => {
    const err = new ClientError(
      {
        errors: [{ message: 'Already exists', extensions: { code: 'DUPLICATE_NAME' } }],
        status: 400,
      } as unknown as ConstructorParameters<typeof ClientError>[0],
      { query: '' },
    )
    mockMutateAsync.mockRejectedValue(err)
    renderForm()
    await userEvent.type(screen.getByLabelText(/name/i), 'Duplicate Name')
    await userEvent.click(screen.getByRole('button', { name: /create program/i }))
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
    expect(mockShowError).not.toHaveBeenCalled()
  })

  it('shows error toast for non-duplicate errors', async () => {
    mockMutateAsync.mockRejectedValue(new Error('Network error'))
    renderForm()
    await userEvent.type(screen.getByLabelText(/name/i), 'My Program')
    await userEvent.click(screen.getByRole('button', { name: /create program/i }))
    await waitFor(() => expect(mockShowError).toHaveBeenCalledOnce())
  })
})

describe('CreateProgramForm — cancel', () => {
  it('closes the dialog when Cancel is clicked', async () => {
    renderForm()
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(useCreateProgramDialogStore.getState().isOpen).toBe(false)
  })
})
