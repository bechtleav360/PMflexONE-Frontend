import { useRef } from 'react'

import { useQuery, useQueryClient } from '@tanstack/react-query'

import {
  getWorkItemAttachments,
  getWorkItemAttachmentsSafe,
  WORK_ITEM_ATTACHMENTS_QUERY_KEY,
} from '../api/workItemApi'
import type { Attachment } from '../types/workItem.types'

/**
 * Fetches the attachments of a single work item in an isolated query.
 *
 * Keeping attachments separate from the main work-item query ensures that Spring GraphQL
 * NullValueInNonNullableField errors (raised while fileName/storageKey are null during asset
 * enrichment) cannot propagate up to `workItem: null` and blank the rest of the detail panel.
 *
 * Polls every 3 s while any attachment still has `storageKey: null` OR while the last fetch
 * returned any error (transient backend errors, enrichment race conditions, schema validation
 * mismatches). Polling stops once a fetch returns a clean list with all storageKeys present.
 *
 * @param workItemId - The work item ID.
 * @returns TanStack Query result containing the attachments, with automatic 3-second polling while any attachment is still enriching or the last fetch errored.
 */
export function useWorkItemAttachments(workItemId: string) {
  const queryClient = useQueryClient()
  // Set to true whenever the queryFn catches any error (enrichment, validation, network,
  // etc.). Cleared at the start of each attempt. Used by refetchInterval to keep polling
  // alive after a failed fetch so transient errors do not permanently hide uploaded files.
  const lastFetchErrored = useRef(false)

  return useQuery<Attachment[]>({
    queryKey: WORK_ITEM_ATTACHMENTS_QUERY_KEY(workItemId),
    queryFn: async () => {
      lastFetchErrored.current = false
      try {
        return await getWorkItemAttachments(workItemId)
      } catch {
        // Full query failed (likely NullValueInNonNullableField: backend schema has
        // fileName/storageKey as String! but they are null while asset enrichment is pending).
        // Fall back to the safe query that omits those fields so the attachment rows are
        // still visible as "Processing…" rather than hidden entirely.
        lastFetchErrored.current = true
        try {
          return await getWorkItemAttachmentsSafe(workItemId)
        } catch {
          return (
            queryClient.getQueryData<Attachment[]>(WORK_ITEM_ATTACHMENTS_QUERY_KEY(workItemId)) ??
            []
          )
        }
      }
    },
    staleTime: 0,
    enabled: Boolean(workItemId),
    // Poll every 3 s while:
    //   • any attachment is still being enriched (storageKey null), OR
    //   • the last fetch threw — keeps retrying after transient errors instead of
    //     settling on an empty list permanently.
    refetchInterval: (query) => {
      if (lastFetchErrored.current) return 3000
      const data = query.state.data
      if (data?.some((a) => !a.storageKey)) return 3000
      return false
    },
  })
}
