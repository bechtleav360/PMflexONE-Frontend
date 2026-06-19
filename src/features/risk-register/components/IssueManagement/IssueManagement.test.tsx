import { createElement } from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import { useIssueEntries } from '../../hooks/useIssueEntries'
import { useIssueEntryStatuses } from '../../hooks/useIssueEntryStatuses'
import { useCreateIssueEntryDialogStore } from '../../store/useCreateIssueEntryDialogStore'
import { IssueManagement } from './IssueManagement'

vi.mock('../../hooks/useIssueEntries', () => ({ useIssueEntries: vi.fn() }))
vi.mock('../../hooks/useIssueEntryStatuses', () => ({ useIssueEntryStatuses: vi.fn() }))
vi.mock('../CreateIssueEntryDialog', () => ({ CreateIssueEntryDialog: () => null }))
vi.mock('../EditIssueEntryDialog', () => ({ EditIssueEntryDialog: () => null }))
vi.mock('../CreateProblemFromIssueDialog', () => ({ CreateProblemFromIssueDialog: () => null }))
vi.mock('../IssueManagementFilters', () => ({ IssueManagementFilters: () => null }))
vi.mock('../IssueManagementTable', () => ({
  IssueManagementTable: ({ rows }: { rows: unknown[] }) =>
    createElement('div', { 'data-testid': 'issue-management-table', 'data-rows': rows.length }),
}))

const mockUseIssueEntries = vi.mocked(useIssueEntries)
const mockUseIssueEntryStatuses = vi.mocked(useIssueEntryStatuses)

function setupDefaultMocks(overrides: { isPending?: boolean; isError?: boolean } = {}) {
  mockUseIssueEntries.mockReturnValue({
    data: [],
    isPending: overrides.isPending ?? false,
    isError: overrides.isError ?? false,
  } as unknown as ReturnType<typeof useIssueEntries>)
  mockUseIssueEntryStatuses.mockReturnValue({
    data: [],
  } as unknown as ReturnType<typeof useIssueEntryStatuses>)
}

function renderIssueManagement() {
  return render(
    createElement(IssueManagement, {
      scopeType: 'Project',
      scopeId: 'e2e00000-0000-0000-0000-000000000001',
    }),
  )
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

beforeEach(() => {
  useCreateIssueEntryDialogStore.setState({ isOpen: false })
})

describe('IssueManagement', () => {
  it('renders the page title', () => {
    setupDefaultMocks()
    renderIssueManagement()
    expect(screen.getByRole('heading', { name: /issue management/i })).toBeInTheDocument()
  })

  it('renders the add-entry button', () => {
    setupDefaultMocks()
    renderIssueManagement()
    expect(screen.getByRole('button', { name: /add entry/i })).toBeInTheDocument()
  })

  it('shows loading indicator when data is pending', () => {
    setupDefaultMocks({ isPending: true })
    renderIssueManagement()
    expect(screen.getByText(/loading entries/i)).toBeInTheDocument()
    expect(screen.queryByTestId('issue-management-table')).not.toBeInTheDocument()
  })

  it('shows error message when fetch fails', () => {
    setupDefaultMocks({ isError: true })
    renderIssueManagement()
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText(/failed to load issue management entries/i)).toBeInTheDocument()
  })

  it('renders the table when data is loaded', () => {
    setupDefaultMocks()
    renderIssueManagement()
    expect(screen.getByTestId('issue-management-table')).toBeInTheDocument()
  })

  it('clicking add-entry button opens the create issue dialog', async () => {
    setupDefaultMocks()
    renderIssueManagement()
    await userEvent.click(screen.getByRole('button', { name: /add entry/i }))
    expect(useCreateIssueEntryDialogStore.getState().isOpen).toBe(true)
  })
})
