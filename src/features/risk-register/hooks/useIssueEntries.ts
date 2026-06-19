import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import {
  GET_ISSUE_ENTRIES,
  getIssueEntriesResponseSchema,
  ISSUE_ENTRIES_QUERY_KEY,
} from '../api/issueEntryApi'
import type { ScopeType } from '../types/scopeType'

/**
 * Filter parameters accepted by the issue entries list query.
 *
 * All fields except `scopeType` and `scopeId` are optional. Null or undefined
 * values are stripped before being sent to the API so the server sees only
 * truthy filter fields.
 *
 * @property scopeType - Scope context (`'Project'`, `'Program'`, or `'Portfolio'`).
 * @property scopeId - The ID of the scoped entity.
 * @property includeTerminalStatuses - When `true`, also fetches resolved/closed entries.
 * @property status - Restricts results to entries with the given status value.
 * @property pestelCategory - Restricts results to entries in the given PESTEL category.
 */
export interface IssueEntriesFilter {
  scopeType: ScopeType
  scopeId: string
  includeTerminalStatuses?: boolean
  status?: string | null
  pestelCategory?: string | null
}

/**
 * Fetches the scoped list of issue entries by scope, with optional server-side
 * filtering by status and PESTEL category.
 *
 * The full filter object is serialised into the TanStack Query key so a new
 * fetch is triggered automatically whenever any filter field changes.
 *
 * @param filter - Filter parameters for the query including scope and optional field filters.
 * @returns TanStack Query result containing an array of {@link IssueEntry} objects.
 */
export function useIssueEntries(filter: IssueEntriesFilter) {
  const { scopeType, scopeId, includeTerminalStatuses = false, status, pestelCategory } = filter

  const apiFilter = useMemo(() => {
    const f: Record<string, unknown> = { scopeType, scopeId, includeTerminalStatuses }
    if (status != null) f.status = status
    if (pestelCategory != null) f.pestelCategory = pestelCategory
    return f
  }, [scopeType, scopeId, includeTerminalStatuses, status, pestelCategory])

  return useQuery({
    queryKey: [...ISSUE_ENTRIES_QUERY_KEY(scopeType, scopeId), apiFilter],
    queryFn: async () => {
      const raw = await graphqlClient.request(GET_ISSUE_ENTRIES, { filter: apiFilter })
      return getIssueEntriesResponseSchema.parse(raw).issueEntries
    },
    staleTime: 0,
  })
}
