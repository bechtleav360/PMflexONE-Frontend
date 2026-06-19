import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import type { RequirementListItem } from '../../types/requirement.types'
import { RequirementTreeRow } from './RequirementTreeRow'

vi.mock('../RequirementScopeBadge', () => ({
  RequirementScopeBadge: ({ scope }: { scope: string }) => (
    <span data-testid="scope-badge">{scope}</span>
  ),
}))

vi.mock('../RequirementStatusBadge', () => ({
  RequirementStatusBadge: ({ status }: { status: string }) => (
    <span data-testid="status-badge">{status}</span>
  ),
}))

const mockOnView = vi.fn()
const mockOnEdit = vi.fn()
const mockOnAddChild = vi.fn()
const mockOnAddSibling = vi.fn()
const mockOnDelete = vi.fn()

vi.mock('./RequirementTreeRowActions', () => ({
  RequirementTreeRowActions: (props: {
    requirementId: string
    onView: (id: string) => void
    onEdit: (id: string) => void
    onAddChild: (id: string) => void
    onAddSibling: (id: string) => void
    onDelete: (id: string) => void
  }) => (
    /* eslint-disable react/jsx-no-literals -- test mock labels; not user-facing */
    <div data-testid="req-row-actions">
      <button onClick={() => props.onView(props.requirementId)}>View</button>
      <button onClick={() => props.onEdit(props.requirementId)}>Edit</button>
      <button onClick={() => props.onAddChild(props.requirementId)}>AddChild</button>
      <button onClick={() => props.onAddSibling(props.requirementId)}>AddSibling</button>
      <button onClick={() => props.onDelete(props.requirementId)}>Delete</button>
    </div>
    /* eslint-enable react/jsx-no-literals */
  ),
}))

function makeReq(overrides: Partial<RequirementListItem> = {}): RequirementListItem {
  return {
    id: 'req-1',
    version: 1,
    sortOrder: 0,
    name: 'Test Req',
    requirementScope: 'IN_SCOPE',
    source: 'INTERNAL',
    estimatedEffortMin: null,
    estimatedEffortMax: null,
    type: 'FUNCTIONAL',
    priority: 'MUST_HAVE',
    status: 'NEW',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    creator: null,
    parent: null,
    scope: { id: 'proj-1', scopeType: 'Project' },
    ...overrides,
  }
}

const defaultCallbacks = {
  onView: mockOnView,
  onEdit: mockOnEdit,
  onAddChild: mockOnAddChild,
  onAddSibling: mockOnAddSibling,
  onDelete: mockOnDelete,
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

describe('RequirementTreeRow', () => {
  it('renders requirement name', () => {
    render(
      <RequirementTreeRow
        req={makeReq({ name: 'My Requirement' })}
        {...defaultCallbacks}
      />,
    )
    expect(screen.getByText('My Requirement')).toBeInTheDocument()
  })

  it('renders scope badge', () => {
    render(
      <RequirementTreeRow
        req={makeReq({ requirementScope: 'OUT_OF_SCOPE' })}
        {...defaultCallbacks}
      />,
    )
    expect(screen.getByTestId('scope-badge')).toHaveTextContent('OUT_OF_SCOPE')
  })

  it('renders status badge', () => {
    render(
      <RequirementTreeRow
        req={makeReq({ status: 'IMPLEMENTED' })}
        {...defaultCallbacks}
      />,
    )
    expect(screen.getByTestId('status-badge')).toHaveTextContent('IMPLEMENTED')
  })

  it('calls onView with req id', async () => {
    render(
      <RequirementTreeRow
        req={makeReq()}
        {...defaultCallbacks}
        onView={mockOnView}
      />,
    )
    await userEvent.click(screen.getByText('View'))
    expect(mockOnView).toHaveBeenCalledWith('req-1')
  })

  it('calls onEdit with req id', async () => {
    render(
      <RequirementTreeRow
        req={makeReq()}
        {...defaultCallbacks}
        onEdit={mockOnEdit}
      />,
    )
    await userEvent.click(screen.getByText('Edit'))
    expect(mockOnEdit).toHaveBeenCalledWith('req-1')
  })

  it('calls onAddChild with req id', async () => {
    render(
      <RequirementTreeRow
        req={makeReq()}
        {...defaultCallbacks}
        onAddChild={mockOnAddChild}
      />,
    )
    await userEvent.click(screen.getByText('AddChild'))
    expect(mockOnAddChild).toHaveBeenCalledWith('req-1')
  })

  it('calls onAddSibling with req id', async () => {
    render(
      <RequirementTreeRow
        req={makeReq()}
        {...defaultCallbacks}
        onAddSibling={mockOnAddSibling}
      />,
    )
    await userEvent.click(screen.getByText('AddSibling'))
    expect(mockOnAddSibling).toHaveBeenCalledWith('req-1')
  })

  it('calls onDelete with req id', async () => {
    render(
      <RequirementTreeRow
        req={makeReq()}
        {...defaultCallbacks}
        onDelete={mockOnDelete}
      />,
    )
    await userEvent.click(screen.getByText('Delete'))
    expect(mockOnDelete).toHaveBeenCalledWith('req-1')
  })
})
