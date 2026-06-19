import { useContext, useEffect } from 'react'
import type { DependencyList } from 'react'

import type { SseEventHandler } from './SseClient'
import { SseContext } from './SseContext'

/**
 * Subscribe to an SSE event type. Re-subscribes when eventType or deps change.
 * @param eventType - SSE event type string, e.g. `notification.agent.taskCompleted.v1`
 * @param handler - Callback invoked with parsed data and event ID. Must be stable — wrap in useCallback if inline.
 * @param deps - Additional deps that trigger re-subscription when changed.
 */
export function useSse<T = unknown>(
  eventType: string,
  handler: SseEventHandler<T>,
  deps: DependencyList = [],
): void {
  const client = useContext(SseContext)

  useEffect(() => {
    if (!client) return
    const unsubscribe = client.on<T>(eventType, handler)
    return unsubscribe
    // eslint-disable-next-line react-hooks/exhaustive-deps -- handler excluded: caller spreads stable deps via deps array; including handler directly would cause infinite reconnect loops
  }, [client, eventType, ...deps])
}
