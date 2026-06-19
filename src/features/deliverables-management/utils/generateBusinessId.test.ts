import { describe, expect, it } from 'vitest'

import type { DeliverableTreeNode } from '../types/deliverable.types'
import { generateBusinessId, isBusinessIdDuplicate, suggestBusinessId } from './generateBusinessId'

function makeNode(
  id: string,
  businessId: string | null,
  childNodes: DeliverableTreeNode[] = [],
): DeliverableTreeNode {
  return {
    id,
    version: 1,
    name: `Node ${id}`,
    businessId,
    position: 0,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    parent: null,
    children: [],
    owner: null,
    childNodes,
  }
}

describe('generateBusinessId', () => {
  describe('root nodes (no parent)', () => {
    it('returns "1" for first root (0 siblings)', () => {
      expect(generateBusinessId(null, 0)).toBe('1')
    })

    it('returns "3" for third root (2 siblings)', () => {
      expect(generateBusinessId(null, 2)).toBe('3')
    })

    it('returns "1" for undefined parent', () => {
      expect(generateBusinessId(undefined, 0)).toBe('1')
    })
  })

  describe('child nodes', () => {
    it('returns "1.1" for first child of node "1"', () => {
      expect(generateBusinessId('1', 0)).toBe('1.1')
    })

    it('returns "1.2" for second child of node "1"', () => {
      expect(generateBusinessId('1', 1)).toBe('1.2')
    })

    it('returns "2.3.1" for first child of "2.3"', () => {
      expect(generateBusinessId('2.3', 0)).toBe('2.3.1')
    })

    it('works with alphabetic parent business ID', () => {
      expect(generateBusinessId('A', 0)).toBe('A.1')
    })
  })
})

describe('suggestBusinessId', () => {
  it('returns "1" for first root when tree is empty', () => {
    expect(suggestBusinessId([], null)).toBe('1')
  })

  it('returns next root index when parentId is null', () => {
    const tree = [makeNode('n1', '1'), makeNode('n2', '2')]
    expect(suggestBusinessId(tree, null)).toBe('3')
  })

  it('returns first child ID for parent with no children', () => {
    const tree = [makeNode('n1', '1', [])]
    expect(suggestBusinessId(tree, 'n1')).toBe('1.1')
  })

  it('returns next child ID for parent with existing children', () => {
    const children = [makeNode('c1', '1.1'), makeNode('c2', '1.2')]
    const tree = [makeNode('n1', '1', children)]
    expect(suggestBusinessId(tree, 'n1')).toBe('1.3')
  })

  it('falls back to root-level suggestion when parentId not found', () => {
    const tree = [makeNode('n1', '1')]
    expect(suggestBusinessId(tree, 'ghost-id')).toBe('2')
  })

  it('finds parent nested deeply', () => {
    const leaf = makeNode('leaf', '1.1.1', [])
    const mid = makeNode('mid', '1.1', [leaf])
    const tree = [makeNode('root', '1', [mid])]
    expect(suggestBusinessId(tree, 'leaf')).toBe('1.1.1.1')
  })

  describe('deletion-gap avoidance (the core fix)', () => {
    it('skips deleted root IDs: tree has [2,3,4,5,6] after deleting "1" → suggests "7"', () => {
      // Count-based would suggest "6" (5 siblings + 1), duplicating the existing "6"
      const tree = [
        makeNode('n2', '2'),
        makeNode('n3', '3'),
        makeNode('n4', '4'),
        makeNode('n5', '5'),
        makeNode('n6', '6'),
      ]
      expect(suggestBusinessId(tree, null)).toBe('7')
    })

    it('skips deleted child IDs: parent "1" has children [1.1, 1.3] after deleting "1.2" → suggests "1.4"', () => {
      // Count-based would suggest "1.3" (2 children + 1), duplicating the existing "1.3"
      const children = [makeNode('c1', '1.1'), makeNode('c3', '1.3')]
      const tree = [makeNode('n1', '1', children)]
      expect(suggestBusinessId(tree, 'n1')).toBe('1.4')
    })

    it('skips non-contiguous root IDs: [1, 3, 5] → suggests "6"', () => {
      const tree = [makeNode('n1', '1'), makeNode('n3', '3'), makeNode('n5', '5')]
      expect(suggestBusinessId(tree, null)).toBe('6')
    })
  })

  describe('non-numeric businessIds', () => {
    it('ignores non-numeric siblings when computing max', () => {
      // "foo" and "bar" are filtered out; numeric max is 3 → suggests "4"
      const tree = [
        makeNode('n1', '1'),
        makeNode('n2', 'foo'),
        makeNode('n3', '3'),
        makeNode('n4', 'bar'),
      ]
      expect(suggestBusinessId(tree, null)).toBe('4')
    })

    it('returns "1" when all siblings have non-numeric businessIds', () => {
      const tree = [makeNode('n1', 'foo'), makeNode('n2', 'bar')]
      expect(suggestBusinessId(tree, null)).toBe('1')
    })

    it('returns "X.1" for first child of a node with alphabetic businessId', () => {
      const tree = [makeNode('n1', 'X', [])]
      expect(suggestBusinessId(tree, 'n1')).toBe('X.1')
    })

    it('returns null-businessId siblings as non-numeric (skipped)', () => {
      const children = [makeNode('c1', null), makeNode('c2', '1.2')]
      const tree = [makeNode('n1', '1', children)]
      expect(suggestBusinessId(tree, 'n1')).toBe('1.3')
    })
  })
})

describe('isBusinessIdDuplicate', () => {
  const flat = [
    { id: 'a', businessId: '1' },
    { id: 'b', businessId: '1.1' },
    { id: 'c', businessId: '1.2' },
    { id: 'd', businessId: null },
  ]

  it('returns true when businessId is already used by another node', () => {
    expect(isBusinessIdDuplicate('1.1', flat)).toBe(true)
  })

  it('returns false when businessId is unique', () => {
    expect(isBusinessIdDuplicate('1.3', flat)).toBe(false)
  })

  it('returns false when only match is the excluded node (edit mode)', () => {
    expect(isBusinessIdDuplicate('1.1', flat, 'b')).toBe(false)
  })

  it('returns true when businessId matches a different node even with excludeId', () => {
    expect(isBusinessIdDuplicate('1.1', flat, 'a')).toBe(true)
  })

  it('returns false for empty businessId string (should not be checked)', () => {
    expect(isBusinessIdDuplicate('', flat)).toBe(false)
  })
})
