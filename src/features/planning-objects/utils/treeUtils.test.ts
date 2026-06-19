import { describe, expect, it } from 'vitest'

import { buildTree } from './treeUtils'

type Item = { id: string; parent?: { id: string } | null }

describe('buildTree', () => {
  it('returns empty array for empty input', () => {
    expect(buildTree([])).toEqual([])
  })

  it('returns single root node for single item without parent', () => {
    const items: Item[] = [{ id: 'a' }]
    const result = buildTree(items)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('a')
    expect(result[0].childNodes).toHaveLength(0)
  })

  it('returns two root nodes for two items without parents', () => {
    const items: Item[] = [{ id: 'a' }, { id: 'b' }]
    const result = buildTree(items)
    expect(result).toHaveLength(2)
    expect(result.map((n) => n.id)).toContain('a')
    expect(result.map((n) => n.id)).toContain('b')
  })

  it('places child under parent', () => {
    const items: Item[] = [{ id: 'parent' }, { id: 'child', parent: { id: 'parent' } }]
    const result = buildTree(items)
    expect(result).toHaveLength(1)
    const root = result[0]
    expect(root.id).toBe('parent')
    expect(root.childNodes).toHaveLength(1)
    expect(root.childNodes[0].id).toBe('child')
  })

  it('builds a three-level hierarchy (root→child→grandchild) correctly', () => {
    const items: Item[] = [
      { id: 'root' },
      { id: 'child', parent: { id: 'root' } },
      { id: 'grandchild', parent: { id: 'child' } },
    ]
    const result = buildTree(items)
    expect(result).toHaveLength(1)
    const root = result[0]
    const child = root.childNodes[0]
    const grandchild = child.childNodes[0]
    expect(grandchild.id).toBe('grandchild')
  })

  it('treats orphan node (parent.id references non-existent item) as root', () => {
    const items: Item[] = [{ id: 'orphan', parent: { id: 'ghost' } }]
    const result = buildTree(items)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('orphan')
  })

  it('handles multiple roots with children without cross-contamination', () => {
    const items: Item[] = [
      { id: 'rootA' },
      { id: 'rootB' },
      { id: 'childA', parent: { id: 'rootA' } },
      { id: 'childB', parent: { id: 'rootB' } },
    ]
    const result = buildTree(items)
    expect(result).toHaveLength(2)
    const nodeA = result.find((n) => n.id === 'rootA')!
    const nodeB = result.find((n) => n.id === 'rootB')!
    expect(nodeA.childNodes).toHaveLength(1)
    expect(nodeA.childNodes[0].id).toBe('childA')
    expect(nodeB.childNodes).toHaveLength(1)
    expect(nodeB.childNodes[0].id).toBe('childB')
  })
})
