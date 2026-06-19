import { useMemo, useState } from 'react'

import type { RequirementListItem } from '../types/requirement.types'
import { buildTree } from '../utils'

/**
 * Local UI state for the requirement management view.
 *
 * Derives a scope-filtered tree from the provided requirements list.
 *
 * @param requirements - Flat list of requirements from the server.
 * @returns Filter state, counts, and the filtered requirement tree.
 */
export function useRequirementManagementState(requirements: RequirementListItem[]) {
  const [filter, setFilter] = useState<'ALL' | 'IN_SCOPE' | 'OUT_OF_SCOPE'>('ALL')

  const tree = useMemo(() => {
    const filtered =
      filter === 'ALL' ? requirements : requirements.filter((r) => r.requirementScope === filter)
    return buildTree(filtered)
  }, [requirements, filter])

  const totalCount = requirements.length
  const inScopeCount = requirements.filter((r) => r.requirementScope === 'IN_SCOPE').length
  const outOfScopeCount = requirements.filter((r) => r.requirementScope === 'OUT_OF_SCOPE').length

  return { tree, filter, setFilter, totalCount, inScopeCount, outOfScopeCount }
}
