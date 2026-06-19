import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import type * as SharedComponents from '@/shared/components'
import type { TreeNodeBase } from '@/shared/components'
import { i18n } from '@/shared/lib/i18n'

import type { RequirementListItem } from '../../types/requirement.types'
import type { TreeItem } from '../../utils'
import { RequirementTree } from './RequirementTree'

function makeNode(overrides: Partial<RequirementListItem> = {}): TreeItem<RequirementListItem> {
  return {
    id: 'req-1',
    version: 1,
    sortOrder: 0,
    name: 'Test Requirement',
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
    childNodes: [],
    ...overrides,
  }
}

vi.mock('@/shared/components', async (importOriginal) => {
  const actual = await importOriginal<typeof SharedComponents>()

  function MockTreeView({
    nodes,
    renderRow,
    expandedIds: _expandedIds,
    emptyState,
    toolbar,
    isLoading,
    isError,
    onDragEnd,
    renderDragOverlay,
  }: {
    nodes: TreeNodeBase[]
    renderRow: (
      node: TreeNodeBase,
      level: number,
      posInSet: number,
      setSize: number,
    ) => React.ReactNode
    expandedIds: Set<string>
    emptyState?: React.ReactNode
    toolbar?: React.ReactNode
    isLoading?: boolean
    isError?: boolean
    onDragEnd?: (event: { active: { id: string }; over: { id: string } | null }) => void
    renderDragOverlay?: (nodeId: string) => React.ReactNode
  }) {
    if (isLoading) return <div aria-busy="true" />
    // eslint-disable-next-line react/jsx-no-literals -- test mock error label; not user-facing
    if (isError) return <div role="alert">Error</div>
    return (
      <div data-testid="tree-view">
        {toolbar}
        {nodes.length === 0
          ? emptyState
          : nodes.map((node, i) => <div key={i}>{renderRow(node, 1, i + 1, nodes.length)}</div>)}
        {onDragEnd && nodes.length > 0 && (
          <button
            aria-label="simulate-drag"
            data-testid="simulate-drag"
            onClick={() => onDragEnd({ active: { id: nodes[0].id }, over: { id: nodes[0].id } })}
          />
        )}
        {renderDragOverlay && nodes.length > 0 && renderDragOverlay(nodes[0].id)}
      </div>
    )
  }

  function MockTreeViewNode({
    renderRow,
    renderContextMenu,
  }: {
    renderRow: () => React.ReactNode
    renderContextMenu?: () => React.ReactNode
  }) {
    return (
      <div>
        {renderRow()}
        <div data-testid="context-menu-items">{renderContextMenu?.()}</div>
      </div>
    )
  }

  return {
    ...actual,
    TreeView: MockTreeView,
    TreeViewNode: MockTreeViewNode,
    ContextMenuItem: ({
      children,
      onSelect,
    }: {
      children: React.ReactNode
      onSelect?: () => void
    }) => (
      <button
        role="menuitem"
        onClick={onSelect}
      >
        {children}
      </button>
    ),
    ContextMenuSeparator: () => null,
  }
})

const defaultProps = {
  onView: vi.fn(),
  onEdit: vi.fn(),
  onAddChild: vi.fn(),
  onAddSibling: vi.fn(),
  onDelete: vi.fn(),
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

// eslint-disable-next-line max-lines-per-function -- many independent test cases, each needs full render+assert cycle
describe('RequirementTree', () => {
  it('renders empty state when no nodes provided', () => {
    render(
      <RequirementTree
        nodes={[]}
        {...defaultProps}
      />,
    )
    expect(screen.getByText('No requirements yet')).toBeInTheDocument()
  })

  it('does not render expand/collapse button when nodes is empty', () => {
    render(
      <RequirementTree
        nodes={[]}
        {...defaultProps}
      />,
    )
    expect(screen.queryByText('Expand all')).not.toBeInTheDocument()
    expect(screen.queryByText('Collapse all')).not.toBeInTheDocument()
  })

  it('renders nodes when present', () => {
    render(
      <RequirementTree
        nodes={[makeNode()]}
        {...defaultProps}
      />,
    )
    expect(screen.getByText('Test Requirement')).toBeInTheDocument()
  })

  it('renders expand-all button initially when nodes are present', () => {
    render(
      <RequirementTree
        nodes={[makeNode()]}
        {...defaultProps}
      />,
    )
    expect(screen.getByText('Expand all')).toBeInTheDocument()
  })

  it('shows collapse all label after clicking expand all', async () => {
    render(
      <RequirementTree
        nodes={[
          makeNode({ childNodes: [makeNode({ id: 'req-child' })] } as Partial<RequirementListItem>),
        ]}
        {...defaultProps}
      />,
    )
    await userEvent.click(screen.getByText('Expand all'))
    expect(screen.getByText('Collapse all')).toBeInTheDocument()
  })

  it('shows expand all label after collapsing', async () => {
    render(
      <RequirementTree
        nodes={[
          makeNode({ childNodes: [makeNode({ id: 'req-child' })] } as Partial<RequirementListItem>),
        ]}
        {...defaultProps}
      />,
    )
    await userEvent.click(screen.getByText('Expand all'))
    await userEvent.click(screen.getByText('Collapse all'))
    expect(screen.getByText('Expand all')).toBeInTheDocument()
  })

  it('renders isLoading state', () => {
    render(
      <RequirementTree
        nodes={[]}
        {...defaultProps}
        isLoading
      />,
    )
    expect(document.querySelector('[aria-busy="true"]')).toBeInTheDocument()
  })

  it('renders isError state', () => {
    render(
      <RequirementTree
        nodes={[]}
        {...defaultProps}
        isError
      />,
    )
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('calls onView via context menu', async () => {
    const onView = vi.fn()
    render(
      <RequirementTree
        nodes={[makeNode()]}
        {...defaultProps}
        onView={onView}
      />,
    )
    const viewItems = screen.getAllByRole('menuitem', { name: /view/i })
    await userEvent.click(viewItems[0])
    expect(onView).toHaveBeenCalledWith('req-1')
  })

  it('calls onEdit via context menu', async () => {
    const onEdit = vi.fn()
    render(
      <RequirementTree
        nodes={[makeNode()]}
        {...defaultProps}
        onEdit={onEdit}
      />,
    )
    const editItems = screen.getAllByRole('menuitem', { name: /edit/i })
    await userEvent.click(editItems[0])
    expect(onEdit).toHaveBeenCalledWith('req-1')
  })

  it('calls onAddChild via context menu', async () => {
    const onAddChild = vi.fn()
    render(
      <RequirementTree
        nodes={[makeNode()]}
        {...defaultProps}
        onAddChild={onAddChild}
      />,
    )
    const addChildItems = screen.getAllByRole('menuitem', { name: /add child/i })
    await userEvent.click(addChildItems[0])
    expect(onAddChild).toHaveBeenCalledWith('req-1')
  })

  it('calls onAddSibling via context menu', async () => {
    const onAddSibling = vi.fn()
    render(
      <RequirementTree
        nodes={[makeNode()]}
        {...defaultProps}
        onAddSibling={onAddSibling}
      />,
    )
    const addSiblingItems = screen.getAllByRole('menuitem', { name: /add sibling/i })
    await userEvent.click(addSiblingItems[0])
    expect(onAddSibling).toHaveBeenCalledWith('req-1')
  })

  it('calls onDelete via context menu', async () => {
    const onDelete = vi.fn()
    render(
      <RequirementTree
        nodes={[makeNode()]}
        {...defaultProps}
        onDelete={onDelete}
      />,
    )
    const deleteItems = screen.getAllByRole('menuitem', { name: /delete/i })
    await userEvent.click(deleteItems[0])
    expect(onDelete).toHaveBeenCalledWith('req-1')
  })

  it('calls outer onDragEnd when drag is simulated', async () => {
    const onDragEnd = vi.fn()
    render(
      <RequirementTree
        nodes={[makeNode()]}
        {...defaultProps}
        onDragEnd={onDragEnd}
      />,
    )
    await userEvent.click(screen.getByTestId('simulate-drag'))
    expect(onDragEnd).toHaveBeenCalledWith('req-1', 'req-1')
  })

  it('renders drag overlay content when onDragEnd is provided', () => {
    const onDragEnd = vi.fn()
    render(
      <RequirementTree
        nodes={[makeNode({ name: 'Drag Req' })]}
        {...defaultProps}
        onDragEnd={onDragEnd}
      />,
    )
    expect(screen.getAllByText('Drag Req').length).toBeGreaterThanOrEqual(1)
  })
})
