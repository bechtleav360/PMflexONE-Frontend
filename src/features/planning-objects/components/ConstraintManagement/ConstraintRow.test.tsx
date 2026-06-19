import { createElement } from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import type { ConstraintListItem } from '../../types/constraint.types'
import { ConstraintRow } from './ConstraintRow'

function makeConstraint(overrides: Partial<ConstraintListItem> = {}): ConstraintListItem {
  return {
    id: 'c-1',
    version: 1,
    name: 'Test constraint',
    description: null,
    timeConstrained: false,
    dueDate: null,
    otherInformation: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    creator: null,
    updater: null,
    owner: null,
    projectCharter: null,
    scope: { id: 'proj-1', scopeType: 'Project' },
    ...overrides,
  }
}

function renderRow(constraint: ConstraintListItem, handlers = {}) {
  const onView = vi.fn()
  const onEdit = vi.fn()
  const onAddNew = vi.fn()
  const onDeleteRequest = vi.fn()
  render(
    createElement(ConstraintRow, {
      constraint,
      isExpanded: false,
      onView,
      onEdit,
      onAddNew,
      onDeleteRequest,
      ...handlers,
    }),
  )
  return { onView, onEdit, onAddNew, onDeleteRequest }
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

describe('ConstraintRow', () => {
  it('renders constraint name', () => {
    renderRow(makeConstraint({ name: 'Budget cap' }))
    expect(screen.getByText('Budget cap')).toBeInTheDocument()
  })

  it('hides time-bound badge when timeConstrained is false', () => {
    renderRow(makeConstraint({ timeConstrained: false }))
    expect(screen.queryByText(/Time-bound/)).not.toBeInTheDocument()
  })

  it('shows time-bound badge without date when timeConstrained true and no dueDate', () => {
    renderRow(makeConstraint({ timeConstrained: true, dueDate: null }))
    expect(screen.getByText('Time-bound — No deadline')).toBeInTheDocument()
  })

  it('shows time-bound badge with formatted date when timeConstrained true and dueDate set', () => {
    renderRow(makeConstraint({ timeConstrained: true, dueDate: '2025-06-15' }))
    const badge = screen.getByText(/Jun 15, 2025/i)
    expect(badge).toBeInTheDocument()
  })

  it('calls onView when View menu item selected', async () => {
    const constraint = makeConstraint()
    const { onView } = renderRow(constraint)
    await userEvent.click(screen.getByRole('button', { name: 'Row actions' }))
    await userEvent.click(screen.getByRole('menuitem', { name: /view/i }))
    expect(onView).toHaveBeenCalledWith(constraint)
  })

  it('calls onEdit when Edit menu item selected', async () => {
    const constraint = makeConstraint()
    const { onEdit } = renderRow(constraint)
    await userEvent.click(screen.getByRole('button', { name: 'Row actions' }))
    await userEvent.click(screen.getByRole('menuitem', { name: /edit/i }))
    expect(onEdit).toHaveBeenCalledWith(constraint)
  })

  it('calls onAddNew when Add New menu item selected', async () => {
    const { onAddNew } = renderRow(makeConstraint())
    await userEvent.click(screen.getByRole('button', { name: 'Row actions' }))
    await userEvent.click(screen.getByRole('menuitem', { name: /add new/i }))
    expect(onAddNew).toHaveBeenCalled()
  })

  it('calls onDeleteRequest when Delete menu item selected', async () => {
    const constraint = makeConstraint()
    const { onDeleteRequest } = renderRow(constraint)
    await userEvent.click(screen.getByRole('button', { name: 'Row actions' }))
    await userEvent.click(screen.getByRole('menuitem', { name: /delete/i }))
    expect(onDeleteRequest).toHaveBeenCalledWith(constraint)
  })
})
