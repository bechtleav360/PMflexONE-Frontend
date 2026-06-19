import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import { useIssueEntry } from '../../hooks/useIssueEntry'
import { useEditIssueEntryDialogStore } from '../../store/useEditIssueEntryDialogStore'
import type { IssueEntry } from '../../types/issueEntry.types'
import { EditIssueEntryDialog } from './EditIssueEntryDialog'

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

vi.mock('../../hooks/useIssueEntry', () => ({
  useIssueEntry: vi.fn(),
}))

vi.mock('./EditIssueEntryForm', () => ({
  EditIssueEntryForm: ({ entry }: { entry: IssueEntry }) =>
    createElement('div', { 'data-testid': 'edit-issue-form' }, entry.name),
}))

const mockUseIssueEntry = vi.mocked(useIssueEntry)

let queryClient: QueryClient

function renderDialog() {
  return render(
    createElement(EditIssueEntryDialog, {
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
  useEditIssueEntryDialogStore.setState({ isOpen: false, entryId: null })
  mockUseIssueEntry.mockReturnValue({ data: null } as ReturnType<typeof useIssueEntry>)
})

describe('EditIssueEntryDialog', () => {
  it('does not render dialog content when store is closed', () => {
    renderDialog()
    expect(screen.queryByText('Edit Issue')).not.toBeInTheDocument()
  })

  it('renders dialog title when store is open', () => {
    useEditIssueEntryDialogStore.setState({ isOpen: true, entryId: 'i-1' })
    renderDialog()
    expect(screen.getByText('Edit Issue')).toBeInTheDocument()
  })

  it('does not render form when entry is not yet loaded', () => {
    useEditIssueEntryDialogStore.setState({ isOpen: true, entryId: 'i-1' })
    mockUseIssueEntry.mockReturnValue({ data: null } as ReturnType<typeof useIssueEntry>)
    renderDialog()
    expect(screen.queryByTestId('edit-issue-form')).not.toBeInTheDocument()
  })

  it('renders form with entry when entry is loaded', () => {
    useEditIssueEntryDialogStore.setState({ isOpen: true, entryId: 'i-1' })
    mockUseIssueEntry.mockReturnValue({ data: sampleEntry } as ReturnType<typeof useIssueEntry>)
    renderDialog()
    expect(screen.getByTestId('edit-issue-form')).toBeInTheDocument()
    expect(screen.getByText('Server outage')).toBeInTheDocument()
  })

  it('calls close when dialog is dismissed via Escape', async () => {
    useEditIssueEntryDialogStore.setState({ isOpen: true, entryId: 'i-1' })
    renderDialog()
    await userEvent.keyboard('{Escape}')
    expect(useEditIssueEntryDialogStore.getState().isOpen).toBe(false)
  })
})
