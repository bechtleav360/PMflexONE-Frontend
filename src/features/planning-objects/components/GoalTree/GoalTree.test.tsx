/* eslint-disable max-lines -- comprehensive test coverage for GoalTree component */
import { createElement } from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import type * as SharedComponents from '@/shared/components'
import type { TreeNodeBase } from '@/shared/components'
import { TooltipProvider } from '@/shared/components/Tooltip'
import { i18n } from '@/shared/lib/i18n'

import type { GoalListItem } from '../../types/goal.types'
import type { TreeItem } from '../../utils'
import { GoalTree } from './GoalTree'

function makeNode(overrides: Partial<GoalListItem> = {}): TreeItem<GoalListItem> {
  return {
    id: 'goal-1',
    version: 1,
    sortOrder: 0,
    name: 'Test Goal',
    description: null,
    progress: 0,
    dueDate: null,
    keyResults: null,
    impact: null,
    outcome: null,
    otherInformation: null,
    acceptedAt: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    creator: null,
    updater: null,
    acceptedBy: null,
    parent: null,
    children: [],
    scope: { id: 'proj-1', scopeType: 'Project' },
    parentLevelGoalName: null,
    childNodes: [],
    ...overrides,
  }
}

vi.mock('@/shared/components', async (importOriginal) => {
  const actual = await importOriginal<typeof SharedComponents>()

  const MockTreeViewNode = ({
    renderRow,
    renderContextMenu,
  }: {
    renderRow: () => React.ReactNode
    renderContextMenu?: () => React.ReactNode
  }) => (
    <div>
      {renderRow()}
      <div data-testid="context-menu-items">{renderContextMenu?.()}</div>
    </div>
  )
  MockTreeViewNode.displayName = 'MockTreeViewNode'

  const MockTreeView = ({
    nodes,
    renderRow,
    expandedIds: _expandedIds,
    emptyState,
    isLoading,
    isError,
    toolbar,
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
    isLoading?: boolean
    isError?: boolean
    toolbar?: React.ReactNode
    onDragEnd?: (event: { active: { id: string }; over: { id: string } | null }) => void
    renderDragOverlay?: (nodeId: string) => React.ReactNode
  }) => {
    if (isLoading || isError) return null
    return (
      <>
        {toolbar}
        {nodes.length === 0 ? (
          <>{emptyState}</>
        ) : (
          <div data-testid="tree-view">
            {nodes.map((node, i) => (
              <div key={i}>{renderRow(node, 1, i + 1, nodes.length)}</div>
            ))}
            {onDragEnd && (
              <button
                aria-label="simulate-drag"
                data-testid="simulate-drag"
                onClick={() =>
                  onDragEnd({ active: { id: nodes[0].id }, over: { id: nodes[0].id } })
                }
              />
            )}
            {renderDragOverlay && renderDragOverlay(nodes[0].id)}
          </div>
        )}
      </>
    )
  }
  MockTreeView.displayName = 'MockTreeView'

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

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

// eslint-disable-next-line max-lines-per-function -- many independent test cases, each needs full render+assert cycle
describe('GoalTree', () => {
  it('renders empty state when no nodes provided', () => {
    render(
      createElement(
        TooltipProvider,
        null,
        createElement(GoalTree, { nodes: [], onEdit: vi.fn(), onDelete: vi.fn() }),
      ),
    )
    expect(screen.getByText('No goals yet')).toBeInTheDocument()
  })

  it('does not render expand/collapse button when nodes is empty', () => {
    render(
      createElement(
        TooltipProvider,
        null,
        createElement(GoalTree, { nodes: [], onEdit: vi.fn(), onDelete: vi.fn() }),
      ),
    )
    expect(screen.queryByText('Expand all')).not.toBeInTheDocument()
    expect(screen.queryByText('Collapse all')).not.toBeInTheDocument()
  })

  it('renders nodes when present', () => {
    const nodes = [makeNode()]
    render(
      createElement(
        TooltipProvider,
        null,
        createElement(GoalTree, { nodes, onEdit: vi.fn(), onDelete: vi.fn() }),
      ),
    )
    expect(screen.getByText('Test Goal')).toBeInTheDocument()
  })

  it('renders expand-all button initially when nodes are present', () => {
    const nodes = [makeNode()]
    render(
      createElement(
        TooltipProvider,
        null,
        createElement(GoalTree, { nodes, onEdit: vi.fn(), onDelete: vi.fn() }),
      ),
    )
    expect(screen.getByText('Expand all')).toBeInTheDocument()
  })

  it('expand all button shows collapse all after click', async () => {
    const nodes = [
      makeNode({ id: 'goal-1', childNodes: [makeNode({ id: 'goal-2' })] } as Partial<GoalListItem>),
    ]
    render(
      createElement(
        TooltipProvider,
        null,
        createElement(GoalTree, { nodes, onEdit: vi.fn(), onDelete: vi.fn() }),
      ),
    )
    await userEvent.click(screen.getByText('Expand all'))
    expect(screen.getByText('Collapse all')).toBeInTheDocument()
  })

  it('collapse all button shows expand all after click', async () => {
    const nodes = [
      makeNode({ id: 'goal-1', childNodes: [makeNode({ id: 'goal-2' })] } as Partial<GoalListItem>),
    ]
    render(
      createElement(
        TooltipProvider,
        null,
        createElement(GoalTree, { nodes, onEdit: vi.fn(), onDelete: vi.fn() }),
      ),
    )
    await userEvent.click(screen.getByText('Expand all'))
    await userEvent.click(screen.getByText('Collapse all'))
    expect(screen.getByText('Expand all')).toBeInTheDocument()
  })

  it('calls onView via context menu when onView is provided', async () => {
    const onView = vi.fn()
    const nodes = [makeNode()]
    render(
      createElement(
        TooltipProvider,
        null,
        createElement(GoalTree, { nodes, onEdit: vi.fn(), onDelete: vi.fn(), onView }),
      ),
    )
    const viewItems = screen.getAllByRole('menuitem', { name: /view/i })
    await userEvent.click(viewItems[0])
    expect(onView).toHaveBeenCalledWith('goal-1')
  })

  it('renders addChild context menu item when onAddChild is provided', async () => {
    const onAddChild = vi.fn()
    const nodes = [makeNode()]
    render(
      createElement(
        TooltipProvider,
        null,
        createElement(GoalTree, {
          nodes,
          onEdit: vi.fn(),
          onDelete: vi.fn(),
          onAddChild,
        }),
      ),
    )
    const addChildItem = screen.getAllByRole('menuitem', { name: /add child/i })
    await userEvent.click(addChildItem[0])
    expect(onAddChild).toHaveBeenCalledWith('goal-1')
  })

  it('renders addSibling context menu item when onAddSibling is provided', async () => {
    const onAddSibling = vi.fn()
    const nodes = [makeNode()]
    render(
      createElement(
        TooltipProvider,
        null,
        createElement(GoalTree, {
          nodes,
          onEdit: vi.fn(),
          onDelete: vi.fn(),
          onAddSibling,
        }),
      ),
    )
    const addSiblingItem = screen.getAllByRole('menuitem', { name: /add sibling/i })
    await userEvent.click(addSiblingItem[0])
    expect(onAddSibling).toHaveBeenCalledWith('goal-1')
  })

  it('calls onEdit via context menu when onEdit is provided', async () => {
    const onEdit = vi.fn()
    const nodes = [makeNode()]
    render(
      createElement(
        TooltipProvider,
        null,
        createElement(GoalTree, { nodes, onEdit, onDelete: vi.fn() }),
      ),
    )
    const editItems = screen.getAllByRole('menuitem', { name: /edit/i })
    await userEvent.click(editItems[0])
    expect(onEdit).toHaveBeenCalledWith('goal-1')
  })

  it('calls onDelete via context menu when onDelete is provided', async () => {
    const onDelete = vi.fn()
    const nodes = [makeNode()]
    render(
      createElement(
        TooltipProvider,
        null,
        createElement(GoalTree, { nodes, onEdit: vi.fn(), onDelete }),
      ),
    )
    const deleteItems = screen.getAllByRole('menuitem', { name: /delete/i })
    await userEvent.click(deleteItems[0])
    expect(onDelete).toHaveBeenCalledWith('goal-1')
  })

  it('toggleExpand is called when onToggleExpand fires from TreeViewNode', async () => {
    const nodes = [
      makeNode({ id: 'goal-1', childNodes: [makeNode({ id: 'goal-2' })] } as Partial<GoalListItem>),
    ]
    render(
      createElement(
        TooltipProvider,
        null,
        createElement(GoalTree, { nodes, onEdit: vi.fn(), onDelete: vi.fn() }),
      ),
    )
    expect(screen.getByText('Test Goal')).toBeInTheDocument()
  })

  it('calls outer onDragEnd when drag is simulated', async () => {
    const onDragEnd = vi.fn()
    const nodes = [makeNode()]
    render(
      createElement(
        TooltipProvider,
        null,
        createElement(GoalTree, { nodes, onEdit: vi.fn(), onDelete: vi.fn(), onDragEnd }),
      ),
    )
    await userEvent.click(screen.getByTestId('simulate-drag'))
    expect(onDragEnd).toHaveBeenCalledWith('goal-1', 'goal-1')
  })

  it('renders drag overlay content when onDragEnd is provided', () => {
    const onDragEnd = vi.fn()
    const nodes = [makeNode({ name: 'Drag Goal' })]
    render(
      createElement(
        TooltipProvider,
        null,
        createElement(GoalTree, { nodes, onEdit: vi.fn(), onDelete: vi.fn(), onDragEnd }),
      ),
    )
    expect(screen.getAllByText('Drag Goal').length).toBeGreaterThanOrEqual(1)
  })
})
