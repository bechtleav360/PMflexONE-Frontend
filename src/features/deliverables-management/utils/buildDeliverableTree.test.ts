import { describe, expect, it } from 'vitest'

import type { Deliverable } from '../types/deliverable.types'
import { buildDeliverableTree } from './buildDeliverableTree'

function makeDeliverable(overrides: Partial<Deliverable> & { id: string }): Deliverable {
  return {
    version: 1,
    name: `Deliverable ${overrides.id}`,
    businessId: null,
    position: 0,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    parent: null,
    children: [],
    owner: null,
    ...overrides,
  }
}

describe('buildDeliverableTree', () => {
  it('returns empty array for empty input', () => {
    expect(buildDeliverableTree([])).toEqual([])
  })

  it('returns single root node with no children', () => {
    const result = buildDeliverableTree([makeDeliverable({ id: 'a' })])
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('a')
    expect(result[0].childNodes).toEqual([])
  })

  it('nests child under parent', () => {
    const parent = makeDeliverable({ id: 'p', position: 0 })
    const child = makeDeliverable({
      id: 'c',
      position: 0,
      parent: { node: { id: 'p', name: 'Deliverable p' } },
    })

    const result = buildDeliverableTree([parent, child])
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('p')
    expect(result[0].childNodes).toHaveLength(1)
    expect(result[0].childNodes[0].id).toBe('c')
  })

  it('builds multi-level tree correctly', () => {
    const root = makeDeliverable({ id: 'root', position: 0 })
    const level1 = makeDeliverable({
      id: 'l1',
      position: 0,
      parent: { node: { id: 'root', name: 'root' } },
    })
    const level2 = makeDeliverable({
      id: 'l2',
      position: 0,
      parent: { node: { id: 'l1', name: 'l1' } },
    })

    const result = buildDeliverableTree([root, level1, level2])
    expect(result).toHaveLength(1)
    expect(result[0].childNodes[0].childNodes[0].id).toBe('l2')
  })

  it('sorts siblings by position ascending', () => {
    const root1 = makeDeliverable({ id: 'r1', position: 2 })
    const root2 = makeDeliverable({ id: 'r2', position: 1 })
    const root3 = makeDeliverable({ id: 'r3', position: 3 })

    const result = buildDeliverableTree([root1, root2, root3])
    expect(result.map((n) => n.id)).toEqual(['r2', 'r1', 'r3'])
  })

  it('sorts children by position ascending', () => {
    const parent = makeDeliverable({ id: 'p', position: 0 })
    const c1 = makeDeliverable({ id: 'c1', position: 3, parent: { node: { id: 'p', name: 'p' } } })
    const c2 = makeDeliverable({ id: 'c2', position: 1, parent: { node: { id: 'p', name: 'p' } } })

    const result = buildDeliverableTree([parent, c1, c2])
    expect(result[0].childNodes.map((n) => n.id)).toEqual(['c2', 'c1'])
  })

  it('treats orphan nodes (parent not found) as roots', () => {
    const orphan = makeDeliverable({
      id: 'orphan',
      position: 0,
      parent: { node: { id: 'missing-parent', name: 'ghost' } },
    })

    const result = buildDeliverableTree([orphan])
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('orphan')
  })

  it('handles multiple roots', () => {
    const r1 = makeDeliverable({ id: 'r1', position: 1 })
    const r2 = makeDeliverable({ id: 'r2', position: 2 })

    const result = buildDeliverableTree([r2, r1])
    expect(result).toHaveLength(2)
    expect(result[0].id).toBe('r1')
    expect(result[1].id).toBe('r2')
  })

  it('does not mutate input array', () => {
    const input = [
      makeDeliverable({ id: 'b', position: 2 }),
      makeDeliverable({ id: 'a', position: 1 }),
    ]
    buildDeliverableTree(input)
    expect(input[0].id).toBe('b')
  })
})
