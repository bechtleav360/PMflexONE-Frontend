import { describe, expect, it } from 'vitest'

import type { DeliverableTreeNode } from '../types/deliverable.types'
import { getDeliverableDescendants, getExcludedParentIds } from './getDeliverableDescendants'

function makeNode(id: string, childNodes: DeliverableTreeNode[] = []): DeliverableTreeNode {
  return {
    id,
    version: 1,
    name: `Node ${id}`,
    businessId: null,
    position: 0,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    parent: null,
    children: [],
    owner: null,
    childNodes,
  }
}

describe('getDeliverableDescendants', () => {
  it('returns empty set when node has no children', () => {
    const tree = [makeNode('a')]
    expect(getDeliverableDescendants('a', tree).size).toBe(0)
  })

  it('returns immediate children', () => {
    const tree = [makeNode('parent', [makeNode('child1'), makeNode('child2')])]
    const result = getDeliverableDescendants('parent', tree)
    expect(result).toEqual(new Set(['child1', 'child2']))
  })

  it('returns nested descendants recursively', () => {
    const grandchild = makeNode('gc')
    const child = makeNode('c', [grandchild])
    const tree = [makeNode('root', [child])]

    const result = getDeliverableDescendants('root', tree)
    expect(result).toEqual(new Set(['c', 'gc']))
  })

  it('does not include the node itself', () => {
    const tree = [makeNode('a', [makeNode('b')])]
    const result = getDeliverableDescendants('a', tree)
    expect(result.has('a')).toBe(false)
  })

  it('returns empty set when node not found', () => {
    const tree = [makeNode('a')]
    expect(getDeliverableDescendants('nonexistent', tree).size).toBe(0)
  })

  it('finds node nested deep in tree', () => {
    const deep = makeNode('deep', [makeNode('leaf')])
    const mid = makeNode('mid', [deep])
    const tree = [makeNode('root', [mid])]

    const result = getDeliverableDescendants('deep', tree)
    expect(result).toEqual(new Set(['leaf']))
  })
})

describe('getExcludedParentIds', () => {
  it('includes node itself and all descendants', () => {
    const child = makeNode('child')
    const tree = [makeNode('parent', [child])]

    const result = getExcludedParentIds('parent', tree)
    expect(result).toEqual(new Set(['parent', 'child']))
  })

  it('includes only self when no descendants', () => {
    const tree = [makeNode('solo')]
    const result = getExcludedParentIds('solo', tree)
    expect(result).toEqual(new Set(['solo']))
  })

  it('handles multi-level tree', () => {
    const leaf = makeNode('leaf')
    const child = makeNode('child', [leaf])
    const tree = [makeNode('root', [child])]

    const result = getExcludedParentIds('root', tree)
    expect(result).toEqual(new Set(['root', 'child', 'leaf']))
  })
})
