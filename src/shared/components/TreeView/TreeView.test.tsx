import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { FlatRow, TreeNodeBase } from './treeRows'
import { getFlatVisibleRows } from './treeRows'
import { TreeView } from './TreeView'

vi.mock('./useTreeView', () => ({
  useTreeView: ({ nodes, expandedIds }: { nodes: TreeNodeBase[]; expandedIds: Set<string> }) => ({
    mountRef: { current: null },
    listRef: { current: null },
    scrollEl: document.body,
    scrollMargin: 0,
    sensors: [],
    flatRows: getFlatVisibleRows(nodes, expandedIds),
    sortableIds: [],
  }),
}))

vi.mock('./VirtualBody', () => ({
  VirtualBody: ({
    flatRows,
    renderRow,
    ariaLabel,
  }: {
    flatRows: FlatRow[]
    renderRow: (
      node: TreeNodeBase,
      level: number,
      posInSet: number,
      setSize: number,
    ) => React.ReactNode
    ariaLabel: string
  }) => (
    <div
      role="tree"
      aria-label={ariaLabel}
    >
      {flatRows.map((r) => (
        <div
          key={r.id}
          role="treeitem"
          aria-selected={false}
        >
          {renderRow(r.node, r.level, r.posInSet, r.setSize)}
        </div>
      ))}
    </div>
  ),
}))

const makeNode = (id: string, childNodes: TreeNodeBase[] = []): TreeNodeBase => ({ id, childNodes })
const renderRow = (node: TreeNodeBase) => <span>{node.id}</span>
const ariaLabel = 'Test tree'

describe('TreeView', () => {
  it('renders nodes', () => {
    const nodes = [makeNode('a'), makeNode('b')]
    render(
      <TreeView
        nodes={nodes}
        ariaLabel={ariaLabel}
        expandedIds={new Set()}
        renderRow={renderRow}
      />,
    )
    expect(screen.getByText('a')).toBeInTheDocument()
    expect(screen.getByText('b')).toBeInTheDocument()
  })

  it('shows emptyState when nodes is empty', () => {
    render(
      <TreeView
        nodes={[]}
        ariaLabel={ariaLabel}
        expandedIds={new Set()}
        renderRow={renderRow}
        // eslint-disable-next-line react/jsx-no-literals -- test label string; not user-facing
        emptyState={<p>Nothing here</p>}
      />,
    )
    expect(screen.getByText('Nothing here')).toBeInTheDocument()
  })

  it('hides children of collapsed nodes', () => {
    const nodes = [makeNode('parent', [makeNode('child')])]
    render(
      <TreeView
        nodes={nodes}
        ariaLabel={ariaLabel}
        expandedIds={new Set()}
        renderRow={renderRow}
      />,
    )
    expect(screen.getByText('parent')).toBeInTheDocument()
    expect(screen.queryByText('child')).not.toBeInTheDocument()
  })

  it('shows children of expanded nodes', () => {
    const nodes = [makeNode('parent', [makeNode('child')])]
    render(
      <TreeView
        nodes={nodes}
        ariaLabel={ariaLabel}
        expandedIds={new Set(['parent'])}
        renderRow={renderRow}
      />,
    )
    expect(screen.getByText('child')).toBeInTheDocument()
  })

  it('shows loading skeletons when isLoading is true', () => {
    render(
      <TreeView
        nodes={[]}
        ariaLabel={ariaLabel}
        expandedIds={new Set()}
        renderRow={renderRow}
        isLoading
      />,
    )
    expect(document.querySelector('[aria-busy="true"]')).toBeInTheDocument()
  })

  it('shows error alert when isError is true', () => {
    render(
      <TreeView
        nodes={[]}
        ariaLabel={ariaLabel}
        expandedIds={new Set()}
        renderRow={renderRow}
        isError
        errorMessage="Load failed"
      />,
    )
    expect(screen.getByText('Load failed')).toBeInTheDocument()
  })

  it('renders toolbar when provided', () => {
    const nodes = [makeNode('a')]
    render(
      <TreeView
        nodes={nodes}
        ariaLabel={ariaLabel}
        expandedIds={new Set()}
        renderRow={renderRow}
        // eslint-disable-next-line react/jsx-no-literals -- test label string; not user-facing
        toolbar={<button type="button">Expand all</button>}
      />,
    )
    expect(screen.getByText('Expand all')).toBeInTheDocument()
  })
})
