import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type * as SharedComponents from '@/shared/components'
import { showError, showSuccess } from '@/shared/components'
import { i18n } from '@/shared/lib/i18n'

import { useCreateRiskEntryDialogStore } from '../../store/useCreateRiskEntryDialogStore'
import { CreateRiskEntryForm } from './CreateRiskEntryForm'

const mockMutateAsync = vi.fn()

vi.mock('../../hooks/useCreateRiskEntry', () => ({
  useCreateRiskEntry: () => ({ mutateAsync: mockMutateAsync, isPending: false }),
}))

vi.mock('../../hooks/useRiskEntryStatuses', () => ({
  useRiskEntryStatuses: () => ({
    data: [
      { status: 'PROPOSED', description: 'Proposed', displayOrder: 1 },
      { status: 'ASSESSED', description: 'Assessed', displayOrder: 2 },
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
  return render(createElement(Wrapper, null, createElement(CreateRiskEntryForm, props)))
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

beforeEach(() => {
  useCreateRiskEntryDialogStore.setState({ isOpen: true })
  mockMutateAsync.mockReset()
  mockShowSuccess.mockReset()
  mockShowError.mockReset()
})

async function fillValidForm() {
  await userEvent.type(screen.getByLabelText(/name/i), 'Budget overrun')
  await userEvent.click(screen.getByLabelText(/pestel category/i))
  await userEvent.click(await screen.findByRole('option', { name: /^economic$/i }))
}

describe('CreateRiskEntryForm', () => {
  it('renders required field labels', () => {
    renderForm()
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/pestel category/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/type/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument()
  })

  it('shows validation errors when submitting with empty required fields', async () => {
    renderForm()
    await userEvent.click(screen.getByRole('button', { name: /create entry/i }))
    await waitFor(() => {
      expect(screen.getAllByRole('alert').length).toBeGreaterThan(0)
    })
  })

  it('calls mutateAsync with correct payload on valid submit', async () => {
    mockMutateAsync.mockResolvedValue({ id: 'r-1', displayId: 'R-001' })
    renderForm()

    await fillValidForm()
    await userEvent.click(screen.getByRole('button', { name: /create entry/i }))

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'RISK',
          name: 'Budget overrun',
          pestelCategory: 'ECONOMIC',
          status: 'PROPOSED',
        }),
      )
    })
  })

  it('shows success toast and closes dialog on successful submit', async () => {
    mockMutateAsync.mockResolvedValue({ id: 'r-1', displayId: 'R-001' })
    renderForm()

    await fillValidForm()
    await userEvent.click(screen.getByRole('button', { name: /create entry/i }))

    await waitFor(() => expect(mockShowSuccess).toHaveBeenCalledOnce())
    expect(useCreateRiskEntryDialogStore.getState().isOpen).toBe(false)
  })

  it('shows error toast on failed submit', async () => {
    mockMutateAsync.mockRejectedValue(new Error('Network error'))
    renderForm()

    await fillValidForm()
    await userEvent.click(screen.getByRole('button', { name: /create entry/i }))

    await waitFor(() => expect(mockShowError).toHaveBeenCalledOnce())
  })

  it('does not render problem-specific fields', () => {
    renderForm()
    expect(screen.queryByLabelText(/urgency/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/scope.*effort/i)).not.toBeInTheDocument()
  })
})
