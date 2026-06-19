/* eslint-disable max-lines-per-function -- test describe block; line count scales with number of test cases, not logic complexity */
import { createElement } from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type * as sharedUtils from '@/shared/lib/utils'
import { makeQueryWrapper } from '@/shared/test-utils/makeQueryWrapper'

import { EscalatedEntriesTable } from './EscalatedEntriesTable'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}))

vi.mock('@/shared/lib/utils', async (importOriginal) => {
  const actual = await importOriginal<typeof sharedUtils>()
  return { ...actual, formatDate: (iso: string) => iso.slice(0, 10) }
})

const baseEntry = {
  id: 'ee-1',
  version: 1,
  sourceEntryType: 'RISK' as const,
  sourceEntryId: 'r-1',
  scope: { id: 'prog-1', name: 'Test Program', scopeType: 'Program' as const },
  escalationChain: null,
  status: 'ACTIVE' as const,
  entryNumber: 'R-001',
  name: 'Budget Risk',
  description: null,
  pestelCategory: null,
  sourceStatus: null,
  probability: 3,
  impact: 4,
  riskLevel: 12,
  targetProbability: null,
  targetImpact: null,
  escalatedAt: '2024-01-15T00:00:00Z',
  returnedAt: null,
  createdAt: '2024-01-15T00:00:00Z',
  updatedAt: '2024-01-15T00:00:00Z',
  creator: { id: 'u-1', firstName: 'Alice', lastName: 'Smith', mail: 'alice@example.com' },
  updater: null,
}

describe('EscalatedEntriesTable', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders empty state when rows list is empty (FR-006)', () => {
    render(createElement(EscalatedEntriesTable, { rows: [] }), { wrapper: makeQueryWrapper() })
    expect(screen.getByText('features.escalatedEntries.table.empty')).toBeDefined()
  })

  it('renders a table when rows are provided', () => {
    render(createElement(EscalatedEntriesTable, { rows: [baseEntry] }), {
      wrapper: makeQueryWrapper(),
    })
    expect(screen.getByRole('table')).toBeDefined()
  })

  it('renders one row per entry', () => {
    const secondEntry = { ...baseEntry, id: 'ee-2', entryNumber: 'R-002', name: 'Market Risk' }
    render(createElement(EscalatedEntriesTable, { rows: [baseEntry, secondEntry] }), {
      wrapper: makeQueryWrapper(),
    })
    expect(screen.getByText('Budget Risk')).toBeDefined()
    expect(screen.getByText('Market Risk')).toBeDefined()
  })

  it('shows entry number in each row', () => {
    render(createElement(EscalatedEntriesTable, { rows: [baseEntry] }), {
      wrapper: makeQueryWrapper(),
    })
    expect(screen.getByText('R-001')).toBeDefined()
  })

  it('shows escalating person (creator) name in each row', () => {
    render(createElement(EscalatedEntriesTable, { rows: [baseEntry] }), {
      wrapper: makeQueryWrapper(),
    })
    expect(screen.getByText('Alice Smith')).toBeDefined()
  })

  it('shows escalated date in each row', () => {
    render(createElement(EscalatedEntriesTable, { rows: [baseEntry] }), {
      wrapper: makeQueryWrapper(),
    })
    expect(screen.getByText('2024-01-15')).toBeDefined()
  })

  it('shows escalation status badge per row', () => {
    render(createElement(EscalatedEntriesTable, { rows: [baseEntry] }), {
      wrapper: makeQueryWrapper(),
    })
    expect(screen.getByTestId('escalation-status-badge')).toBeDefined()
  })

  it('shows escalation chain when escalationChain is non-null', () => {
    const chainEntry = {
      ...baseEntry,
      escalationChain: 'Project Alpha → Program Beta',
    }
    render(createElement(EscalatedEntriesTable, { rows: [chainEntry] }), {
      wrapper: makeQueryWrapper(),
    })
    expect(screen.getByText('Project Alpha → Program Beta')).toBeDefined()
  })

  it('falls back to scopeType when escalationChain is null', () => {
    render(createElement(EscalatedEntriesTable, { rows: [baseEntry] }), {
      wrapper: makeQueryWrapper(),
    })
    expect(screen.getByText('Program')).toBeDefined()
  })

  it('calls onRowClick with entry id when name button is clicked', async () => {
    const onRowClick = vi.fn()
    const user = userEvent.setup()
    render(createElement(EscalatedEntriesTable, { rows: [baseEntry], onRowClick }), {
      wrapper: makeQueryWrapper(),
    })

    await user.click(screen.getByRole('button', { name: 'Budget Risk' }))

    expect(onRowClick).toHaveBeenCalledWith('ee-1')
  })

  it('calls onRowClick when Enter key is pressed on the name button', async () => {
    const onRowClick = vi.fn()
    const user = userEvent.setup()
    render(createElement(EscalatedEntriesTable, { rows: [baseEntry], onRowClick }), {
      wrapper: makeQueryWrapper(),
    })

    await user.type(screen.getByRole('button', { name: 'Budget Risk' }), '{Enter}')

    expect(onRowClick).toHaveBeenCalledWith('ee-1')
  })

  it('renders name as plain text when onRowClick is not provided', () => {
    render(createElement(EscalatedEntriesTable, { rows: [baseEntry] }), {
      wrapper: makeQueryWrapper(),
    })
    expect(screen.queryByRole('button', { name: 'Budget Risk' })).toBeNull()
    expect(screen.getByText('Budget Risk')).toBeDefined()
  })

  it('renders column headers via t() keys', () => {
    render(createElement(EscalatedEntriesTable, { rows: [baseEntry] }), {
      wrapper: makeQueryWrapper(),
    })
    expect(screen.getByText('features.escalatedEntries.table.columns.entryNumber')).toBeDefined()
    expect(screen.getByText('features.escalatedEntries.table.columns.name')).toBeDefined()
    expect(screen.getByText('features.escalatedEntries.table.columns.status')).toBeDefined()
  })

  it('shows Escalate menu item for ACTIVE rows when onEscalate prop is provided', async () => {
    const user = userEvent.setup()
    render(createElement(EscalatedEntriesTable, { rows: [baseEntry], onEscalate: vi.fn() }), {
      wrapper: makeQueryWrapper(),
    })

    await user.click(
      screen.getByRole('button', { name: 'features.escalatedEntries.table.rowActionsLabel' }),
    )

    expect(screen.getByText('features.escalatedEntries.actions.escalate')).toBeDefined()
  })

  it('does not show Escalate menu item when onEscalate prop is not provided', async () => {
    const user = userEvent.setup()
    render(createElement(EscalatedEntriesTable, { rows: [baseEntry] }), {
      wrapper: makeQueryWrapper(),
    })

    await user.click(
      screen.getByRole('button', { name: 'features.escalatedEntries.table.rowActionsLabel' }),
    )

    expect(screen.queryByText('features.escalatedEntries.actions.escalate')).toBeNull()
  })

  it('calls onEscalate with the row entry when Escalate menu item is selected', async () => {
    const onEscalate = vi.fn()
    const user = userEvent.setup()
    render(createElement(EscalatedEntriesTable, { rows: [baseEntry], onEscalate }), {
      wrapper: makeQueryWrapper(),
    })

    await user.click(
      screen.getByRole('button', { name: 'features.escalatedEntries.table.rowActionsLabel' }),
    )
    await user.click(screen.getByText('features.escalatedEntries.actions.escalate'))

    expect(onEscalate).toHaveBeenCalledWith(baseEntry)
  })

  it('disables Escalate menu item for non-ACTIVE rows when onEscalate is provided', async () => {
    const escalatedEntry = { ...baseEntry, status: 'ESCALATED' as const }
    const user = userEvent.setup()
    render(createElement(EscalatedEntriesTable, { rows: [escalatedEntry], onEscalate: vi.fn() }), {
      wrapper: makeQueryWrapper(),
    })

    await user.click(
      screen.getByRole('button', { name: 'features.escalatedEntries.table.rowActionsLabel' }),
    )

    const escalateItem = screen.getByText('features.escalatedEntries.actions.escalate')
    expect(escalateItem.closest('[data-disabled]')).toBeDefined()
  })
})
