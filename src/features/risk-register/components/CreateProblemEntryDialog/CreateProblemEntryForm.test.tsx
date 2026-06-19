import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type * as SharedComponents from '@/shared/components'
import { showError, showSuccess } from '@/shared/components'
import { i18n } from '@/shared/lib/i18n'

import { useCreateProblemEntryDialogStore } from '../../store/useCreateProblemEntryDialogStore'
import { CreateProblemEntryForm } from './CreateProblemEntryForm'

const mockMutateAsync = vi.fn()

vi.mock('../../hooks/useCreateProblemEntry', () => ({
  useCreateProblemEntry: () => ({ mutateAsync: mockMutateAsync, isPending: false }),
}))

vi.mock('../../hooks/useProblemEntryStatuses', () => ({
  useProblemEntryStatuses: () => ({
    data: [
      { status: 'OPEN', description: 'Open', displayOrder: 1 },
      { status: 'IN_PROGRESS', description: 'In Progress', displayOrder: 2 },
    ],
    isLoading: false,
  }),
}))

vi.mock('@/shared/components', async (importOriginal) => {
  const actual = await importOriginal<typeof SharedComponents>()
  return {
    ...actual,
    showSuccess: vi.fn(),
    showError: vi.fn(),
  }
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

function renderForm(
  props = { scopeType: 'Project' as const, scopeId: 'e2e00000-0000-0000-0000-000000000001' },
) {
  const Wrapper = makeWrapper()
  return render(createElement(Wrapper, null, createElement(CreateProblemEntryForm, props)))
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

beforeEach(() => {
  useCreateProblemEntryDialogStore.setState({ isOpen: true })
  mockMutateAsync.mockReset()
  mockShowSuccess.mockReset()
  mockShowError.mockReset()
})

async function fillValidForm() {
  await userEvent.type(screen.getByLabelText(/name/i), 'Server unavailable')
  await userEvent.click(screen.getByLabelText(/pestel category/i))
  await userEvent.click(await screen.findByRole('option', { name: /^technological$/i }))
}

describe('CreateProblemEntryForm', () => {
  it('renders required field labels without probability or riskLevel fields', () => {
    renderForm()
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/pestel category/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument()
    expect(screen.queryByLabelText(/probability/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/risk level/i)).not.toBeInTheDocument()
  })

  it('renders impact field but not urgency or scope effort', () => {
    renderForm()
    expect(screen.getByLabelText(/impact/i)).toBeInTheDocument()
    expect(screen.queryByLabelText(/urgency/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/scope.*effort/i)).not.toBeInTheDocument()
  })

  it('shows validation errors when submitting with empty required fields', async () => {
    renderForm()
    await userEvent.click(screen.getByRole('button', { name: /create problem/i }))
    await waitFor(() => {
      expect(screen.getAllByRole('alert').length).toBeGreaterThan(0)
    })
  })

  it('calls mutateAsync with correct payload on valid submit', async () => {
    mockMutateAsync.mockResolvedValue({ id: 'p-1', entryNumber: 'P-001' })
    renderForm()

    await fillValidForm()
    await userEvent.click(screen.getByRole('button', { name: /create problem/i }))

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Server unavailable',
          pestelCategory: 'TECHNOLOGICAL',
          status: 'OPEN',
        }),
      )
    })
  })

  it('shows success toast and closes dialog on successful submit', async () => {
    mockMutateAsync.mockResolvedValue({ id: 'p-1', entryNumber: 'P-001' })
    renderForm()

    await fillValidForm()
    await userEvent.click(screen.getByRole('button', { name: /create problem/i }))

    await waitFor(() => expect(mockShowSuccess).toHaveBeenCalledOnce())
    expect(useCreateProblemEntryDialogStore.getState().isOpen).toBe(false)
  })

  it('shows error toast on failed submit', async () => {
    mockMutateAsync.mockRejectedValue(new Error('Network error'))
    renderForm()

    await fillValidForm()
    await userEvent.click(screen.getByRole('button', { name: /create problem/i }))

    await waitFor(() => expect(mockShowError).toHaveBeenCalledOnce())
  })
})
