import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import { useProblemEntry } from '../../hooks/useProblemEntry'
import { useEditProblemEntryDialogStore } from '../../store/useEditProblemEntryDialogStore'
import type { ProblemEntry } from '../../types/problemEntry.types'
import { EditProblemEntryDialog } from './EditProblemEntryDialog'

const sampleEntry: ProblemEntry = {
  id: 'p-1',
  version: 1,
  entryNumber: 'P-001',
  name: 'Server crash',
  pestelCategory: 'TECHNOLOGICAL',
  description: null,
  status: 'open',
  identificationDate: '2024-01-20',
  impact: 4,
  createdAt: '2024-01-20T00:00:00Z',
  updatedAt: '2024-01-20T00:00:00Z',
  owner: null,
  reporter: null,
  activeEscalations: [],
}

vi.mock('../../hooks/useProblemEntry', () => ({
  useProblemEntry: vi.fn(),
}))

vi.mock('./EditProblemEntryForm', () => ({
  EditProblemEntryForm: ({ entry }: { entry: ProblemEntry }) =>
    createElement('div', { 'data-testid': 'edit-problem-form' }, entry.name),
}))

const mockUseProblemEntry = vi.mocked(useProblemEntry)

let queryClient: QueryClient

function renderDialog() {
  return render(
    createElement(EditProblemEntryDialog, {
      scopeType: 'Project',
      scopeId: 'e2e00000-0000-0000-0000-000000000001',
    }),
    {
      wrapper: ({ children }: { children: React.ReactNode }) =>
        createElement(QueryClientProvider, { client: queryClient }, children),
    },
  )
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

beforeEach(() => {
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  useEditProblemEntryDialogStore.setState({ isOpen: false, entryId: null })
  mockUseProblemEntry.mockReturnValue({ data: null } as ReturnType<typeof useProblemEntry>)
})

describe('EditProblemEntryDialog', () => {
  it('does not render dialog content when store is closed', () => {
    renderDialog()
    expect(screen.queryByText('Edit Problem')).not.toBeInTheDocument()
  })

  it('renders dialog title when store is open', () => {
    useEditProblemEntryDialogStore.setState({ isOpen: true, entryId: 'p-1' })
    renderDialog()
    expect(screen.getByText('Edit Problem')).toBeInTheDocument()
  })

  it('does not render form when entry is not yet loaded', () => {
    useEditProblemEntryDialogStore.setState({ isOpen: true, entryId: 'p-1' })
    mockUseProblemEntry.mockReturnValue({ data: null } as ReturnType<typeof useProblemEntry>)
    renderDialog()
    expect(screen.queryByTestId('edit-problem-form')).not.toBeInTheDocument()
  })

  it('renders form with entry when entry is loaded', () => {
    useEditProblemEntryDialogStore.setState({ isOpen: true, entryId: 'p-1' })
    mockUseProblemEntry.mockReturnValue({
      data: sampleEntry,
    } as ReturnType<typeof useProblemEntry>)
    renderDialog()
    expect(screen.getByTestId('edit-problem-form')).toBeInTheDocument()
    expect(screen.getByText('Server crash')).toBeInTheDocument()
  })

  it('calls close when dialog is dismissed via Escape', async () => {
    useEditProblemEntryDialogStore.setState({ isOpen: true, entryId: 'p-1' })
    renderDialog()
    await userEvent.keyboard('{Escape}')
    expect(useEditProblemEntryDialogStore.getState().isOpen).toBe(false)
  })
})
