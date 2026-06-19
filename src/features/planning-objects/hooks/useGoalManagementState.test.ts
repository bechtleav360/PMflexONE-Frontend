import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { GoalListItem } from '../types/goal.types'
import { useGoalManagementState } from './useGoalManagementState'

function makeGoal(overrides: Partial<GoalListItem> & { id: string; name: string }): GoalListItem {
  return {
    version: 1,
    sortOrder: 0,
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
    parentLevelGoalName: null,
    ...overrides,
  }
}

const goals: GoalListItem[] = [
  makeGoal({ id: 'g-1', name: 'Alpha Goal' }),
  makeGoal({ id: 'g-2', name: 'Beta Goal' }),
  makeGoal({ id: 'g-3', name: 'Alpha Sub', parent: { id: 'g-1' } }),
]

describe('useGoalManagementState', () => {
  it('returns all goals as tree when search is empty', () => {
    const { result } = renderHook(() => useGoalManagementState(goals))
    expect(result.current.searchQuery).toBe('')
    expect(result.current.tree.length).toBeGreaterThan(0)
    const allIds = result.current.tree.flatMap((n) => [n.id, ...n.childNodes.map((c) => c.id)])
    expect(allIds).toContain('g-1')
    expect(allIds).toContain('g-2')
  })

  it('filters goals by search query (case-insensitive)', () => {
    const { result } = renderHook(() => useGoalManagementState(goals))

    act(() => {
      result.current.setSearchQuery('alpha')
    })

    type Node = { id: string; childNodes: Node[] }
    function collectIds(nodes: Node[]): string[] {
      return nodes.flatMap((n) => [n.id, ...collectIds(n.childNodes)])
    }
    const allIds = collectIds(result.current.tree)
    expect(allIds).toContain('g-1')
    expect(allIds).toContain('g-3')
    expect(allIds).not.toContain('g-2')
  })

  it('makes orphaned child a root when parent excluded by filter', () => {
    const { result } = renderHook(() => useGoalManagementState(goals))

    act(() => {
      result.current.setSearchQuery('Sub')
    })

    const rootIds = result.current.tree.map((n: { id: string }) => n.id)
    expect(rootIds).toContain('g-3')
  })

  it('returns empty tree when no goals match search', () => {
    const { result } = renderHook(() => useGoalManagementState(goals))

    act(() => {
      result.current.setSearchQuery('zzznomatch')
    })

    expect(result.current.tree).toHaveLength(0)
  })

  it('resets to full tree when search is cleared', () => {
    const { result } = renderHook(() => useGoalManagementState(goals))

    act(() => {
      result.current.setSearchQuery('Beta')
    })
    act(() => {
      result.current.setSearchQuery('')
    })

    const allIds = result.current.tree.flatMap((n) => [n.id, ...n.childNodes.map((c) => c.id)])
    expect(allIds).toContain('g-1')
    expect(allIds).toContain('g-2')
  })
})
