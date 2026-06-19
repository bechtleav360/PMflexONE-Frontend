/**
 * TanStack Query key factory for the scoped risk entries list cache.
 *
 * @param scopeType - Scope context (`'Project'`, `'Program'`, or `'Portfolio'`).
 * @param scopeId - The domain entity ID.
 * @returns A readonly tuple used as the TanStack Query cache key.
 */
export const RISK_ENTRIES_QUERY_KEY = (scopeType: string, scopeId: string) =>
  ['riskEntries', scopeType, scopeId] as const
