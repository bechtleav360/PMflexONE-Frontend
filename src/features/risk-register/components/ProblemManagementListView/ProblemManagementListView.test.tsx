import { createElement } from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import { useEditProblemEntryDialogStore } from '../../store/useEditProblemEntryDialogStore'
import type { ProblemEntry } from '../../types/problemEntry.types'
import { ProblemManagementListView } from './ProblemManagementListView'

const openProblemRow: ProblemEntry = {
  id: 'p-1',
  version: 1,
  entryNumber: 'P-001',
  name: 'Database failure',
  pestelCategory: 'TECHNOLOGICAL',
  description: null,
  status: 'open',
  identificationDate: '2024-03-10',
  impact: 3,
  createdAt: '2024-03-10T00:00:00Z',
  updatedAt: '2024-03-10T00:00:00Z',
  owner: null,
  reporter: null,
  activeEscalations: [],
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

beforeEach(() => {
  useEditProblemEntryDialogStore.setState({ isOpen: false, entryId: null })
})

describe('ProblemManagementListView', () => {
  it('shows empty-state message when rows is empty', () => {
    render(createElement(ProblemManagementListView, { rows: [] }))
    expect(screen.getByText('No entries found.')).toBeInTheDocument()
  })

  it('renders row with entryNumber and name', () => {
    render(createElement(ProblemManagementListView, { rows: [openProblemRow] }))
    expect(screen.getByText('P-001')).toBeInTheDocument()
    expect(screen.getByText('Database failure')).toBeInTheDocument()
  })

  it('clicking edit on a row opens the edit problem dialog', async () => {
    render(createElement(ProblemManagementListView, { rows: [openProblemRow] }))
    await userEvent.click(screen.getByRole('button', { name: /row actions for/i }))
    await userEvent.click(screen.getByRole('menuitem', { name: /^edit$/i }))
    expect(useEditProblemEntryDialogStore.getState().isOpen).toBe(true)
    expect(useEditProblemEntryDialogStore.getState().entryId).toBe('p-1')
  })

  it('disables edit menu item when activeEscalation is set', async () => {
    const escalatedRow: ProblemEntry = {
      ...openProblemRow,
      activeEscalations: [
        {
          id: 'esc-1',
          status: 'ACTIVE',
          scope: { id: 'scope-1', scopeType: 'Program' },
          escalatedAt: '2024-05-01T00:00:00Z',
        },
      ],
    }
    render(createElement(ProblemManagementListView, { rows: [escalatedRow] }))
    await userEvent.click(screen.getByRole('button', { name: /row actions for/i }))
    expect(screen.getByRole('menuitem', { name: /^edit$/i })).toHaveAttribute('data-disabled')
  })

  it('clicking ID column header calls onSortChange with entryNumber asc', async () => {
    const onSortChange = vi.fn()
    render(createElement(ProblemManagementListView, { rows: [openProblemRow], onSortChange }))
    await userEvent.click(screen.getByRole('button', { name: /^sort by id$/i }))
    expect(onSortChange).toHaveBeenCalledWith({ field: 'entryNumber', direction: 'asc' })
  })

  it('clicking identified column header calls onSortChange with identificationDate asc', async () => {
    const onSortChange = vi.fn()
    render(createElement(ProblemManagementListView, { rows: [openProblemRow], onSortChange }))
    await userEvent.click(screen.getByRole('button', { name: /sort by identified/i }))
    expect(onSortChange).toHaveBeenCalledWith({ field: 'identificationDate', direction: 'asc' })
  })

  it('toggles sort direction on second click of same column header', async () => {
    const onSortChange = vi.fn()
    render(
      createElement(ProblemManagementListView, {
        rows: [openProblemRow],
        sort: { field: 'entryNumber', direction: 'asc' },
        onSortChange,
      }),
    )
    await userEvent.click(screen.getByRole('button', { name: /sort.*\bid\b/i }))
    expect(onSortChange).toHaveBeenCalledWith({ field: 'entryNumber', direction: 'desc' })
  })
})
