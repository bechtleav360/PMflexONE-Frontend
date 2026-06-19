import { createElement } from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type * as SharedComponents from '@/shared/components'
import { i18n } from '@/shared/lib/i18n'

import { useRiskEntries } from '../../hooks/useRiskEntries'
import { useRiskEntryStatuses } from '../../hooks/useRiskEntryStatuses'
import { useCreateRiskEntryDialogStore } from '../../store/useCreateRiskEntryDialogStore'
import { RiskManagement } from './RiskManagement'

vi.mock('../../hooks/useRiskEntries', () => ({ useRiskEntries: vi.fn() }))
vi.mock('../../hooks/useRiskEntryStatuses', () => ({ useRiskEntryStatuses: vi.fn() }))
vi.mock('../../hooks/useRiskManagementColumns', () => ({ useRiskManagementColumns: () => [] }))
vi.mock('../CreateRiskEntryDialog', () => ({ CreateRiskEntryDialog: () => null }))
vi.mock('../EditRiskEntryDialog', () => ({ EditRiskEntryDialog: () => null }))
vi.mock('../CreateIssueFromRiskDialog', () => ({ CreateIssueFromRiskDialog: () => null }))
vi.mock('../RiskManagementFilters', () => ({ RiskManagementFilters: () => null }))
vi.mock('@/shared/components', async (importOriginal) => {
  const actual = await importOriginal<typeof SharedComponents>()
  return {
    ...actual,
    ListView: ({ loading, rows }: { loading?: boolean; rows: unknown[] }) =>
      createElement('div', {
        'data-testid': 'risk-management-table',
        'data-loading': String(loading ?? false),
        'data-rows': rows.length,
      }),
  }
})

const mockUseRiskEntries = vi.mocked(useRiskEntries)
const mockUseRiskEntryStatuses = vi.mocked(useRiskEntryStatuses)

function setupDefaultMocks(overrides: { isPending?: boolean; isError?: boolean } = {}) {
  mockUseRiskEntries.mockReturnValue({
    data: [],
    isPending: overrides.isPending ?? false,
    isError: overrides.isError ?? false,
  } as unknown as ReturnType<typeof useRiskEntries>)
  mockUseRiskEntryStatuses.mockReturnValue({
    data: [],
  } as unknown as ReturnType<typeof useRiskEntryStatuses>)
}

function renderRiskManagement() {
  return render(
    createElement(RiskManagement, {
      scopeType: 'Project',
      scopeId: 'e2e00000-0000-0000-0000-000000000001',
    }),
  )
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

beforeEach(() => {
  useCreateRiskEntryDialogStore.setState({ isOpen: false })
})

describe('RiskManagement', () => {
  it('renders the page title', () => {
    setupDefaultMocks()
    renderRiskManagement()
    expect(screen.getByRole('heading', { name: /risk management/i })).toBeInTheDocument()
  })

  it('renders the add-entry button', () => {
    setupDefaultMocks()
    renderRiskManagement()
    expect(screen.getByRole('button', { name: /add entry/i })).toBeInTheDocument()
  })

  it('shows the list view in loading state when data is pending', () => {
    setupDefaultMocks({ isPending: true })
    renderRiskManagement()
    const table = screen.getByTestId('risk-management-table')
    expect(table).toBeInTheDocument()
    expect(table).toHaveAttribute('data-loading', 'true')
  })

  it('shows error message when fetch fails', () => {
    setupDefaultMocks({ isError: true })
    renderRiskManagement()
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText(/failed to load risk management entries/i)).toBeInTheDocument()
  })

  it('hides the list view when fetch fails', () => {
    setupDefaultMocks({ isError: true })
    renderRiskManagement()
    expect(screen.queryByTestId('risk-management-table')).not.toBeInTheDocument()
  })

  it('renders the list view when data is loaded', () => {
    setupDefaultMocks()
    renderRiskManagement()
    const table = screen.getByTestId('risk-management-table')
    expect(table).toBeInTheDocument()
    expect(table).toHaveAttribute('data-loading', 'false')
  })

  it('clicking add-entry button opens the create risk dialog', async () => {
    setupDefaultMocks()
    renderRiskManagement()
    await userEvent.click(screen.getByRole('button', { name: /add entry/i }))
    expect(useCreateRiskEntryDialogStore.getState().isOpen).toBe(true)
  })
})
