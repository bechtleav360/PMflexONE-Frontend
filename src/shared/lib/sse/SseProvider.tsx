import { useEffect, useMemo } from 'react'
import type { ReactNode } from 'react'

import { getSseEndpoint, SseClient } from './SseClient'
import { SseContext } from './SseContext'

interface Props {
  children: ReactNode
  /** Restrict connection to specific event types. Omit to receive all configured types. */
  events?: string[]
}

/**
 * Mounts an SSE connection for the subtree. Remount to change subscribed event types.
 * @param props - Component props
 * @param props.children - Child nodes rendered inside the provider
 * @param props.events - Restrict connection to specific event types. Omit to receive all.
 * @returns Provider wrapping children with the active SseClient
 */
export function SseProvider({ children, events }: Props) {
  const client = useMemo(() => new SseClient(), [])

  useEffect(() => {
    client.connect(getSseEndpoint(), events)
    return () => client.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- events intentionally excluded: changing the prop does not reconnect; remount the provider to change subscriptions
  }, [client])

  return <SseContext.Provider value={client}>{children}</SseContext.Provider>
}
