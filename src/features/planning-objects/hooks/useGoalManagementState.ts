import { useMemo, useState } from 'react'

import type { GoalListItem } from '../types/goal.types'
import { buildTree } from '../utils'

/**
 * Local UI state for the goal management view.
 *
 * Derives a filtered tree from the provided goals list. Orphan nodes caused
 * by the search filter become roots — this is intentional.
 *
 * @param goals - Flat list of goals from the server.
 * @returns Search query state and the filtered goal tree.
 */
export function useGoalManagementState(goals: GoalListItem[]) {
  const [searchQuery, setSearchQuery] = useState('')

  const tree = useMemo(() => {
    const filtered = searchQuery
      ? goals.filter((g) => g.name.toLowerCase().includes(searchQuery.toLowerCase()))
      : goals
    return buildTree(filtered)
  }, [goals, searchQuery])

  return { tree, searchQuery, setSearchQuery }
}
