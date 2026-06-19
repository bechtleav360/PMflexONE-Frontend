import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import {
  GET_RISK_ENTRIES,
  getRiskEntriesResponseSchema,
  RISK_ENTRIES_QUERY_KEY,
} from '../api/riskEntryApi'
import type { ScopeType } from '../types/scopeType'

/**
 * Filter parameters accepted by the risk entries list query.
 *
 * All fields except `scopeType` and `scopeId` are optional. Null or undefined
 * values are stripped before being sent to the API so the server sees only
 * truthy filter fields.
 *
 * @property scopeType - Scope context (`'Project'`, `'Program'`, or `'Portfolio'`).
 * @property scopeId - The ID of the scoped entity.
 * @property includeTerminalStatuses - When `true`, also fetches rejected/closed entries.
 * @property type - Restricts results to `'RISK'` or `'OPPORTUNITY'`. Omit for both.
 * @property status - Restricts results to entries with the given status value.
 * @property pestelCategory - Restricts results to entries in the given PESTEL category.
 */
export interface RiskEntriesFilter {
  scopeType: ScopeType
  scopeId: string
  includeTerminalStatuses?: boolean
  type?: 'RISK' | 'OPPORTUNITY' | null
  status?: string | null
  pestelCategory?: string | null
}

/**
 * Fetches the scoped list of risk/opportunity entries by scope, with optional
 * server-side filtering by type, status, and PESTEL category.
 *
 * The full filter object is serialised into the TanStack Query key so a new
 * fetch is triggered automatically whenever any filter field changes.
 *
 * @param filter - Filter parameters for the query including scope and optional field filters.
 * @returns TanStack Query result containing an array of {@link RiskEntry} objects.
 */
export function useRiskEntries(filter: RiskEntriesFilter) {
  const {
    scopeType,
    scopeId,
    includeTerminalStatuses = false,
    type,
    status,
    pestelCategory,
  } = filter

  const apiFilter = useMemo(() => {
    const f: Record<string, unknown> = { scopeType, scopeId, includeTerminalStatuses }
    if (type != null) f.type = type
    if (status != null) f.status = status
    if (pestelCategory != null) f.pestelCategory = pestelCategory
    return f
  }, [scopeType, scopeId, includeTerminalStatuses, type, status, pestelCategory])

  return useQuery({
    queryKey: [...RISK_ENTRIES_QUERY_KEY(scopeType, scopeId), apiFilter],
    queryFn: async () => {
      const raw = await graphqlClient.request(GET_RISK_ENTRIES, { filter: apiFilter })
      return getRiskEntriesResponseSchema.parse(raw).riskEntries
    },
    staleTime: 0,
  })
}
