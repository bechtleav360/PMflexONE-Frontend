import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type * as SharedComponents from '@/shared/components'
import { showError, showSuccess } from '@/shared/components'
import { i18n } from '@/shared/lib/i18n'

import { useEditIssueEntryDialogStore } from '../../store/useEditIssueEntryDialogStore'
import type { IssueEntry } from '../../types/issueEntry.types'
import { EditIssueEntryForm } from './EditIssueEntryForm'

const mockMutateAsync = vi.fn()

vi.mock('../../hooks/useUpdateIssueEntry', () => ({
  useUpdateIssueEntry: () => ({ mutateAsync: mockMutateAsync, isPending: false }),
}))

vi.mock('../../hooks/useIssueEntryStatuses', () => ({
  useIssueEntryStatuses: () => ({
    data: [
      { status: 'open', description: 'Open', displayOrder: 1 },
      { status: 'in_progress', description: 'In Progress', displayOrder: 2 },
    ],
    isLoading: false,
  }),
}))

vi.mock('@/shared/components', async (importOriginal) => {
  const actual = await importOriginal<typeof SharedComponents>()
  return { ...actual, showSuccess: vi.fn(), showError: vi.fn() }
})

const mockShowSuccess = vi.mocked(showSuccess)
const mockShowError = vi.mocked(showError)

const sampleEntry: IssueEntry = {
  id: 'i-1',
  version: 1,
  entryNumber: 'I-001',
  name: 'Server outage',
  pestelCategory: 'TECHNOLOGICAL',
  description: null,
  status: 'open',
  identificationDate: '2024-01-15',
  urgency: 3,
  impact: 4,
  createdAt: '2024-01-15T00:00:00Z',
  updatedAt: '2024-01-15T00:00:00Z',
  owner: null,
  reporter: null,
  activeEscalations: [],
}

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
  return Wrapper
}

function renderForm(entry = sampleEntry) {
  const Wrapper = makeWrapper()
  return render(
    createElement(
      Wrapper,
      null,
      createElement(EditIssueEntryForm, {
        entry,
        scopeType: 'Project',
        scopeId: 'e2e00000-0000-0000-0000-000000000001',
      }),
    ),
  )
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

beforeEach(() => {
  useEditIssueEntryDialogStore.setState({ isOpen: true, entryId: 'i-1' })
  mockMutateAsync.mockReset()
  mockShowSuccess.mockReset()
  mockShowError.mockReset()
})

describe('EditIssueEntryForm', () => {
  it('pre-populates name field with entry value', () => {
    renderForm()
    expect(screen.getByDisplayValue('Server outage')).toBeInTheDocument()
  })

  it('renders expected fields including urgency and impact', () => {
    renderForm()
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/pestel category/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/urgency/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/impact/i)).toBeInTheDocument()
  })

  it('shows validation error when name is cleared and submitted', async () => {
    renderForm()
    await userEvent.clear(screen.getByLabelText(/name/i))
    await userEvent.click(screen.getByRole('button', { name: /save changes/i }))
    await waitFor(() => {
      expect(screen.getAllByRole('alert').length).toBeGreaterThan(0)
    })
  })

  it('calls mutateAsync with entry id and updated values on valid submit', async () => {
    mockMutateAsync.mockResolvedValue({ ...sampleEntry, name: 'Updated outage' })
    renderForm()

    await userEvent.clear(screen.getByLabelText(/name/i))
    await userEvent.type(screen.getByLabelText(/name/i), 'Updated outage')
    await userEvent.click(screen.getByRole('button', { name: /save changes/i }))

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'i-1',
          input: expect.objectContaining({
            version: 1,
            name: 'Updated outage',
          }),
        }),
      )
    })
  })

  it('shows success toast and closes dialog on successful submit', async () => {
    mockMutateAsync.mockResolvedValue({ ...sampleEntry })
    renderForm()

    await userEvent.click(screen.getByRole('button', { name: /save changes/i }))

    await waitFor(() => expect(mockShowSuccess).toHaveBeenCalledOnce())
    expect(useEditIssueEntryDialogStore.getState().isOpen).toBe(false)
  })

  it('shows error toast on failed submit', async () => {
    mockMutateAsync.mockRejectedValue(new Error('Network error'))
    renderForm()

    await userEvent.click(screen.getByRole('button', { name: /save changes/i }))

    await waitFor(() => expect(mockShowError).toHaveBeenCalledOnce())
  })

  it('calls close when cancel button is clicked', async () => {
    renderForm()
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(useEditIssueEntryDialogStore.getState().isOpen).toBe(false)
  })
})
