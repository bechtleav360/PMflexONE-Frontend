import { createElement } from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import type { AssumptionListItem } from '../../types/assumption.types'
import { AssumptionRow } from './AssumptionRow'

function makeAssumption(overrides: Partial<AssumptionListItem> = {}): AssumptionListItem {
  return {
    id: 'a-1',
    version: 1,
    name: 'Test assumption',
    description: null,
    dueDate: null,
    validationStatus: 'open',
    isRisk: false,
    otherInformation: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    creator: null,
    updater: null,
    validatedBy: null,
    linkedRisk: null,
    relatedRisks: [],
    projectCharter: null,
    scope: { id: 'proj-1', scopeType: 'Project' },
    ...overrides,
  }
}

function renderRow(assumption: AssumptionListItem, handlers = {}) {
  const onView = vi.fn()
  const onEdit = vi.fn()
  const onAddNew = vi.fn()
  const onDeleteRequest = vi.fn()
  render(
    createElement(AssumptionRow, {
      assumption,
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

describe('AssumptionRow', () => {
  it('renders assumption name', () => {
    renderRow(makeAssumption({ name: 'My assumption' }))
    expect(screen.getByText('My assumption')).toBeInTheDocument()
  })

  it('shows validationStatus badge when present', () => {
    renderRow(makeAssumption({ validationStatus: 'confirmed' }))
    expect(screen.getByText('confirmed')).toBeInTheDocument()
  })

  it('hides validationStatus badge when absent', () => {
    renderRow(makeAssumption({ validationStatus: '' }))
    expect(screen.queryByText('confirmed')).not.toBeInTheDocument()
  })

  it('shows isRisk badge when isRisk is true', () => {
    renderRow(makeAssumption({ isRisk: true }))
    expect(screen.getByText('Is a risk')).toBeInTheDocument()
  })

  it('shows isRisk badge when linkedRisk is set (even if isRisk false)', () => {
    renderRow(
      makeAssumption({ isRisk: false, linkedRisk: { id: 'r-1', name: 'Risk', status: 'open' } }),
    )
    expect(screen.getByText('Is a risk')).toBeInTheDocument()
  })

  it('hides isRisk badge when neither isRisk nor linkedRisk', () => {
    renderRow(makeAssumption({ isRisk: false, linkedRisk: null }))
    expect(screen.queryByText('Is a risk')).not.toBeInTheDocument()
  })

  it('calls onView when View menu item selected', async () => {
    const assumption = makeAssumption()
    const { onView } = renderRow(assumption)
    await userEvent.click(screen.getByRole('button', { name: 'Row actions' }))
    await userEvent.click(screen.getByRole('menuitem', { name: /view/i }))
    expect(onView).toHaveBeenCalledWith(assumption)
  })

  it('calls onEdit when Edit menu item selected', async () => {
    const assumption = makeAssumption()
    const { onEdit } = renderRow(assumption)
    await userEvent.click(screen.getByRole('button', { name: 'Row actions' }))
    await userEvent.click(screen.getByRole('menuitem', { name: /edit/i }))
    expect(onEdit).toHaveBeenCalledWith(assumption)
  })

  it('calls onAddNew when Add New menu item selected', async () => {
    const { onAddNew } = renderRow(makeAssumption())
    await userEvent.click(screen.getByRole('button', { name: 'Row actions' }))
    await userEvent.click(screen.getByRole('menuitem', { name: /add new/i }))
    expect(onAddNew).toHaveBeenCalled()
  })

  it('calls onDeleteRequest when Delete menu item selected', async () => {
    const assumption = makeAssumption()
    const { onDeleteRequest } = renderRow(assumption)
    await userEvent.click(screen.getByRole('button', { name: 'Row actions' }))
    await userEvent.click(screen.getByRole('menuitem', { name: /delete/i }))
    expect(onDeleteRequest).toHaveBeenCalledWith(assumption)
  })
})
