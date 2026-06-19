import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import {
  GET_PROBLEM_ENTRIES,
  getProblemEntriesResponseSchema,
  PROBLEM_ENTRIES_QUERY_KEY,
} from '../api/problemEntryApi'
import type { ScopeType } from '../types/scopeType'

/**
 * Filter parameters accepted by the problem entries list query.
 *
 * All fields except `scopeType` and `scopeId` are optional. Null or undefined
 * values are stripped before being sent to the API so the server sees only
 * truthy filter fields.
 *
 * @property scopeType - Scope context (`'Project'`, `'Program'`, or `'Portfolio'`).
 * @property scopeId - The ID of the scoped entity.
 * @property includeTerminalStatuses - When `true`, includes Resolved and Closed entries.
 * @property status - Restricts results to entries with the given status value.
 * @property pestelCategory - Restricts results to entries in the given PESTEL category.
 */
export interface ProblemEntriesFilter {
  scopeType: ScopeType
  scopeId: string
  includeTerminalStatuses?: boolean
  status?: string | null
  pestelCategory?: string | null
}

/**
 * Fetches the scoped list of problem entries by scope, with optional server-side
 * filtering by status and PESTEL category.
 *
 * The full filter object is serialised into the TanStack Query key so a new
 * fetch is triggered automatically whenever any filter field changes.
 *
 * @param filter - Filter parameters for the query including scope and optional field filters.
 * @returns TanStack Query result containing an array of {@link ProblemEntry} objects.
 */
export function useProblemEntries(filter: ProblemEntriesFilter) {
  const { scopeType, scopeId, includeTerminalStatuses = false, status, pestelCategory } = filter

  const apiFilter = useMemo(() => {
    const f: Record<string, unknown> = { scopeType, scopeId, includeTerminalStatuses }
    if (status != null) f.status = status
    if (pestelCategory != null) f.pestelCategory = pestelCategory
    return f
  }, [scopeType, scopeId, includeTerminalStatuses, status, pestelCategory])

  return useQuery({
    queryKey: [...PROBLEM_ENTRIES_QUERY_KEY(scopeType, scopeId), apiFilter],
    queryFn: async () => {
      const raw = await graphqlClient.request(GET_PROBLEM_ENTRIES, { filter: apiFilter })
      return getProblemEntriesResponseSchema.parse(raw).problemEntries
    },
    staleTime: 0,
  })
}
