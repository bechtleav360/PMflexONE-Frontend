import { createElement } from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import { useCreateProblemFromIssueDialogStore } from '../../store/useCreateProblemFromIssueDialogStore'
import { useEditIssueEntryDialogStore } from '../../store/useEditIssueEntryDialogStore'
import type { IssueEntry } from '../../types/issueEntry.types'
import { IssueManagementTable } from './IssueManagementTable'

const openIssueRow: IssueEntry = {
  id: 'i-1',
  version: 2,
  entryNumber: 'I-001',
  name: 'Server outage',
  pestelCategory: 'TECHNOLOGICAL',
  description: null,
  status: 'OPEN',
  identificationDate: '2024-01-15',
  urgency: 3,
  impact: 4,
  createdAt: '2024-01-15T00:00:00Z',
  updatedAt: '2024-01-15T00:00:00Z',
  owner: null,
  reporter: null,
  activeEscalations: [],
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

beforeEach(() => {
  useEditIssueEntryDialogStore.setState({ isOpen: false, entryId: null })
  useCreateProblemFromIssueDialogStore.setState({
    isOpen: false,
    sourceIssueId: null,
    sourceIssueName: null,
    sourceIssueVersion: null,
  })
})

describe('IssueManagementTable', () => {
  it('shows empty-state message when rows is empty', () => {
    render(createElement(IssueManagementTable, { rows: [] }))
    expect(screen.getByText('No entries found.')).toBeInTheDocument()
  })

  it('renders row with entryNumber and name', () => {
    render(createElement(IssueManagementTable, { rows: [openIssueRow] }))
    expect(screen.getByText('Server outage')).toBeInTheDocument()
    expect(screen.getByText('I-001')).toBeInTheDocument()
  })

  it('clicking edit on a row opens the edit issue dialog', async () => {
    render(createElement(IssueManagementTable, { rows: [openIssueRow] }))
    await userEvent.click(screen.getByRole('button', { name: /row actions for/i }))
    await userEvent.click(screen.getByRole('menuitem', { name: /^edit$/i }))
    expect(useEditIssueEntryDialogStore.getState().isOpen).toBe(true)
    expect(useEditIssueEntryDialogStore.getState().entryId).toBe('i-1')
  })

  it('shows create-problem menu item for issues with non-terminal status', async () => {
    render(createElement(IssueManagementTable, { rows: [openIssueRow] }))
    await userEvent.click(screen.getByRole('button', { name: /row actions for/i }))
    expect(screen.getByRole('menuitem', { name: /create problem/i })).toBeInTheDocument()
  })

  it('does not show create-problem menu item for resolved issues', async () => {
    const resolvedRow: IssueEntry = { ...openIssueRow, status: 'RESOLVED' }
    render(createElement(IssueManagementTable, { rows: [resolvedRow] }))
    await userEvent.click(screen.getByRole('button', { name: /row actions for/i }))
    expect(screen.queryByRole('menuitem', { name: /create problem/i })).not.toBeInTheDocument()
  })

  it('does not show create-problem menu item for closed issues', async () => {
    const closedRow: IssueEntry = { ...openIssueRow, status: 'CLOSED' }
    render(createElement(IssueManagementTable, { rows: [closedRow] }))
    await userEvent.click(screen.getByRole('button', { name: /row actions for/i }))
    expect(screen.queryByRole('menuitem', { name: /create problem/i })).not.toBeInTheDocument()
  })

  it('clicking create-problem opens confirmation dialog with issue id, name, and version', async () => {
    render(createElement(IssueManagementTable, { rows: [openIssueRow] }))
    await userEvent.click(screen.getByRole('button', { name: /row actions for/i }))
    await userEvent.click(screen.getByRole('menuitem', { name: /create problem/i }))
    const state = useCreateProblemFromIssueDialogStore.getState()
    expect(state.isOpen).toBe(true)
    expect(state.sourceIssueId).toBe('i-1')
    expect(state.sourceIssueName).toBe('Server outage')
    expect(state.sourceIssueVersion).toBe(2)
  })

  it('clicking ID column header calls onSortChange with entryNumber asc', async () => {
    const onSortChange = vi.fn()
    render(createElement(IssueManagementTable, { rows: [openIssueRow], onSortChange }))
    await userEvent.click(screen.getByRole('button', { name: /^sort by id$/i }))
    expect(onSortChange).toHaveBeenCalledWith({ field: 'entryNumber', direction: 'asc' })
  })

  it('clicking urgency column header calls onSortChange with urgency asc', async () => {
    const onSortChange = vi.fn()
    render(createElement(IssueManagementTable, { rows: [openIssueRow], onSortChange }))
    await userEvent.click(screen.getByRole('button', { name: /urgency/i }))
    expect(onSortChange).toHaveBeenCalledWith({ field: 'urgency', direction: 'asc' })
  })

  it('clicking identified column header calls onSortChange with identificationDate asc', async () => {
    const onSortChange = vi.fn()
    render(createElement(IssueManagementTable, { rows: [openIssueRow], onSortChange }))
    await userEvent.click(screen.getByRole('button', { name: /identified/i }))
    expect(onSortChange).toHaveBeenCalledWith({ field: 'identificationDate', direction: 'asc' })
  })

  it('toggles sort direction on second click of same column header', async () => {
    const onSortChange = vi.fn()
    render(
      createElement(IssueManagementTable, {
        rows: [openIssueRow],
        sort: { field: 'urgency', direction: 'asc' },
        onSortChange,
      }),
    )
    await userEvent.click(screen.getByRole('button', { name: /urgency/i }))
    expect(onSortChange).toHaveBeenCalledWith({ field: 'urgency', direction: 'desc' })
  })
})
