import { describe, expect, it } from 'vitest'

import type { SupportService } from '../types/supportService.types'
import { buildSupportServiceTree } from './buildSupportServiceTree'

/**
 * Creates a minimal SupportService fixture for testing.
 *
 * @param id - Unique service ID (also used to generate the display name).
 * @param position - Sort position within the parent.
 * @param parentId - Parent service ID, or `null` for root nodes.
 * @returns A `SupportService` with all required fields filled in.
 */
function makeService(id: string, position: number, parentId: string | null = null): SupportService {
  return {
    id,
    version: 1,
    name: `Service ${id}`,
    description: null,
    otherInformation: null,
    estimatedEffort: null,
    position,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    parent: parentId ? { node: { id: parentId, name: `Service ${parentId}` } } : null,
    children: [],
    assignee: null,
  }
}

describe('buildSupportServiceTree', () => {
  it('returns empty array for empty input', () => {
    expect(buildSupportServiceTree([])).toEqual([])
  })

  it('returns root-only nodes when there are no parents', () => {
    const flat = [makeService('a', 0), makeService('b', 1), makeService('c', 2)]
    const tree = buildSupportServiceTree(flat)
    expect(tree).toHaveLength(3)
    expect(tree.map((n) => n.id)).toEqual(['a', 'b', 'c'])
    tree.forEach((n) => expect(n.childNodes).toHaveLength(0))
  })

  it('nests children under parent', () => {
    const flat = [
      makeService('root', 0),
      makeService('child1', 0, 'root'),
      makeService('child2', 1, 'root'),
    ]
    const tree = buildSupportServiceTree(flat)
    expect(tree).toHaveLength(1)
    expect(tree[0].id).toBe('root')
    expect(tree[0].childNodes).toHaveLength(2)
    expect(tree[0].childNodes.map((c) => c.id)).toEqual(['child1', 'child2'])
  })

  it('builds multi-level nesting', () => {
    const flat = [
      makeService('root', 0),
      makeService('child', 0, 'root'),
      makeService('grandchild', 0, 'child'),
    ]
    const tree = buildSupportServiceTree(flat)
    expect(tree).toHaveLength(1)
    expect(tree[0].childNodes).toHaveLength(1)
    expect(tree[0].childNodes[0].childNodes).toHaveLength(1)
    expect(tree[0].childNodes[0].childNodes[0].id).toBe('grandchild')
  })

  it('sorts nodes by position ascending at each level', () => {
    const flat = [
      makeService('root', 0),
      makeService('c3', 2, 'root'),
      makeService('c1', 0, 'root'),
      makeService('c2', 1, 'root'),
    ]
    const tree = buildSupportServiceTree(flat)
    expect(tree[0].childNodes.map((c) => c.id)).toEqual(['c1', 'c2', 'c3'])
  })

  it('treats orphan nodes (parent not in list) as root nodes', () => {
    const flat = [makeService('orphan', 0, 'missing-parent')]
    const tree = buildSupportServiceTree(flat)
    expect(tree).toHaveLength(1)
    expect(tree[0].id).toBe('orphan')
  })

  it('handles multiple root nodes each with children', () => {
    const flat = [
      makeService('root1', 0),
      makeService('root2', 1),
      makeService('r1c1', 0, 'root1'),
      makeService('r1c2', 1, 'root1'),
      makeService('r2c1', 0, 'root2'),
    ]
    const tree = buildSupportServiceTree(flat)
    expect(tree).toHaveLength(2)
    expect(tree[0].childNodes).toHaveLength(2)
    expect(tree[1].childNodes).toHaveLength(1)
  })
})
