import { createElement } from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import { useProblemEntries } from '../../hooks/useProblemEntries'
import { useProblemEntryStatuses } from '../../hooks/useProblemEntryStatuses'
import { useCreateProblemEntryDialogStore } from '../../store/useCreateProblemEntryDialogStore'
import { ProblemManagement } from './ProblemManagement'

vi.mock('../../hooks/useProblemEntries', () => ({ useProblemEntries: vi.fn() }))
vi.mock('../../hooks/useProblemEntryStatuses', () => ({ useProblemEntryStatuses: vi.fn() }))
vi.mock('../CreateProblemEntryDialog', () => ({ CreateProblemEntryDialog: () => null }))
vi.mock('../EditProblemEntryDialog', () => ({ EditProblemEntryDialog: () => null }))
vi.mock('../ProblemManagementFilters', () => ({ ProblemManagementFilters: () => null }))
vi.mock('../ProblemManagementListView', () => ({
  ProblemManagementListView: ({ rows }: { rows: unknown[] }) =>
    createElement('div', { 'data-testid': 'problem-management-table', 'data-rows': rows.length }),
}))

const mockUseProblemEntries = vi.mocked(useProblemEntries)
const mockUseProblemEntryStatuses = vi.mocked(useProblemEntryStatuses)

function setupDefaultMocks(overrides: { isPending?: boolean; isError?: boolean } = {}) {
  mockUseProblemEntries.mockReturnValue({
    data: [],
    isPending: overrides.isPending ?? false,
    isError: overrides.isError ?? false,
  } as unknown as ReturnType<typeof useProblemEntries>)
  mockUseProblemEntryStatuses.mockReturnValue({
    data: [],
  } as unknown as ReturnType<typeof useProblemEntryStatuses>)
}

function renderProblemManagement() {
  return render(
    createElement(ProblemManagement, {
      scopeType: 'Project',
      scopeId: 'e2e00000-0000-0000-0000-000000000001',
    }),
  )
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

beforeEach(() => {
  useCreateProblemEntryDialogStore.setState({ isOpen: false })
})

describe('ProblemManagement', () => {
  it('renders the page title', () => {
    setupDefaultMocks()
    renderProblemManagement()
    expect(screen.getByRole('heading', { name: /problem management/i })).toBeInTheDocument()
  })

  it('renders the add-entry button', () => {
    setupDefaultMocks()
    renderProblemManagement()
    expect(screen.getByRole('button', { name: /add entry/i })).toBeInTheDocument()
  })

  it('shows loading indicator when data is pending', () => {
    setupDefaultMocks({ isPending: true })
    renderProblemManagement()
    expect(screen.getByText(/loading entries/i)).toBeInTheDocument()
    expect(screen.queryByTestId('problem-management-table')).not.toBeInTheDocument()
  })

  it('shows error message when fetch fails', () => {
    setupDefaultMocks({ isError: true })
    renderProblemManagement()
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText(/failed to load problem management entries/i)).toBeInTheDocument()
  })

  it('renders the table when data is loaded', () => {
    setupDefaultMocks()
    renderProblemManagement()
    expect(screen.getByTestId('problem-management-table')).toBeInTheDocument()
  })

  it('clicking add-entry button opens the create problem dialog', async () => {
    setupDefaultMocks()
    renderProblemManagement()
    await userEvent.click(screen.getByRole('button', { name: /add entry/i }))
    expect(useCreateProblemEntryDialogStore.getState().isOpen).toBe(true)
  })
})
