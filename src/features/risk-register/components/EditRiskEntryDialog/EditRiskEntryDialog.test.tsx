import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import { useRiskEntry } from '../../hooks/useRiskEntry'
import { useEditRiskEntryDialogStore } from '../../store/useEditRiskEntryDialogStore'
import type { RiskEntry } from '../../types/riskEntry.types'
import { EditRiskEntryDialog } from './EditRiskEntryDialog'

const sampleEntry: RiskEntry = {
  id: 'r-1',
  version: 1,
  entryNumber: 'R-001',
  type: 'RISK',
  name: 'Budget overrun',
  pestelCategory: 'ECONOMIC',
  description: null,
  status: 'proposed',
  identificationDate: '2024-01-15',
  probability: 3,
  impact: 4,
  riskLevel: 12,
  createdAt: '2024-01-15T00:00:00Z',
  updatedAt: '2024-01-15T00:00:00Z',
  owner: null,
  reporter: null,
  activeEscalations: [],
}

vi.mock('../../hooks/useRiskEntry', () => ({
  useRiskEntry: vi.fn(),
}))

vi.mock('../../hooks/useUpdateRiskEntry', () => ({
  useUpdateRiskEntry: () => ({ mutateAsync: vi.fn(), isPending: false }),
}))

vi.mock('../../hooks/useIssueEntries', () => ({
  useIssueEntries: () => ({ data: [] }),
}))

vi.mock('../../hooks/useLinkRiskToIssue', () => ({
  useLinkRiskToIssue: () => ({ mutate: vi.fn() }),
}))

vi.mock('../../hooks/useUnlinkRiskFromIssue', () => ({
  useUnlinkRiskFromIssue: () => ({ mutate: vi.fn() }),
}))

vi.mock('./EditRiskEntryForm', () => ({
  EditRiskEntryForm: ({ entry }: { entry: RiskEntry }) =>
    createElement('div', { 'data-testid': 'edit-risk-form' }, entry.name),
}))

const mockUseRiskEntry = vi.mocked(useRiskEntry)

let queryClient: QueryClient

function renderDialog() {
  return render(
    createElement(EditRiskEntryDialog, {
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
  useEditRiskEntryDialogStore.setState({ isOpen: false, entryId: null })
  mockUseRiskEntry.mockReturnValue({ data: null } as ReturnType<typeof useRiskEntry>)
})

describe('EditRiskEntryDialog', () => {
  it('does not render dialog content when store is closed', () => {
    renderDialog()
    expect(screen.queryByText('Edit Risk / Opportunity')).not.toBeInTheDocument()
  })

  it('renders dialog title when store is open', () => {
    useEditRiskEntryDialogStore.setState({ isOpen: true, entryId: 'r-1' })
    renderDialog()
    expect(screen.getByText('Edit Risk / Opportunity')).toBeInTheDocument()
  })

  it('does not render form when entry is not yet loaded', () => {
    useEditRiskEntryDialogStore.setState({ isOpen: true, entryId: 'r-1' })
    mockUseRiskEntry.mockReturnValue({ data: null } as ReturnType<typeof useRiskEntry>)
    renderDialog()
    expect(screen.queryByTestId('edit-risk-form')).not.toBeInTheDocument()
  })

  it('renders form with entry when entry is loaded', () => {
    useEditRiskEntryDialogStore.setState({ isOpen: true, entryId: 'r-1' })
    mockUseRiskEntry.mockReturnValue({
      data: sampleEntry,
    } as ReturnType<typeof useRiskEntry>)
    renderDialog()
    expect(screen.getByTestId('edit-risk-form')).toBeInTheDocument()
    expect(screen.getByText('Budget overrun')).toBeInTheDocument()
  })

  it('calls close when dialog is dismissed via Escape', async () => {
    useEditRiskEntryDialogStore.setState({ isOpen: true, entryId: 'r-1' })
    renderDialog()
    await userEvent.keyboard('{Escape}')
    expect(useEditRiskEntryDialogStore.getState().isOpen).toBe(false)
  })
})
