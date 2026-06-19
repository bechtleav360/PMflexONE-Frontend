/** Callback invoked when an SSE event of the subscribed type is received. */
export type SseEventHandler<T = unknown> = (data: T, eventId: string) => void

/**
 * Module-level SSE endpoint used by `SseProvider` when no URL is passed to
 * `connect()`. Defaults to `VITE_SSE_ENDPOINT` (build-time) or
 * `/api/sse/subscribe` (relative, suitable for MSW and local dev).
 * Override at bootstrap time with `setSseEndpoint`.
 */
let sseEndpoint: string = import.meta.env.VITE_SSE_ENDPOINT ?? '/api/sse/subscribe'

/**
 * Returns the current module-level SSE endpoint.
 * Used by `SseProvider` to pick up any runtime override set via `setSseEndpoint`.
 *
 * @returns The current SSE endpoint URL.
 */
export function getSseEndpoint(): string {
  return sseEndpoint
}

/**
 * Updates the SSE endpoint at runtime.
 * Call this during app bootstrap with the value from `runtime-config.json`
 * before any `SseProvider` mounts.
 *
 * @param url - Absolute or relative URL for the SSE subscribe endpoint.
 */
export function setSseEndpoint(url: string): void {
  sseEndpoint = url
}

/** Manages a single SSE connection and routes typed events to registered handlers. */
export class SseClient {
  private es: EventSource | null = null
  private handlers = new Map<string, Set<SseEventHandler>>()

  /**
   * Opens the SSE connection to `url`, optionally filtering to the given event types.
   * A second call while already connected is a no-op.
   *
   * @param url - The SSE endpoint URL.
   * @param events - Optional list of event type names to subscribe to (passed as query param).
   */
  connect(url: string, events?: string[]): void {
    if (this.es) return

    const connectUrl =
      events && events.length > 0
        ? `${url}?${new URLSearchParams({ events: events.join(',') })}`
        : url

    this.es = new EventSource(connectUrl, { withCredentials: true })

    // Wire any handlers registered before connect() was called
    for (const [eventType] of this.handlers) {
      this.wireListener(eventType)
    }

    this.es.onerror = () => {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console -- intentional dev-only debug message for SSE connection errors #needsrefactor
        console.warn('[SseClient] Connection error — EventSource will retry automatically')
      }
    }
  }

  /**
   * Registers a handler for the given SSE event type.
   *
   * @param eventType - The SSE event type name to listen for.
   * @param handler - Callback invoked with the parsed event data and last event ID.
   * @returns An unsubscribe function that removes this specific handler.
   */
  on<T = unknown>(eventType: string, handler: SseEventHandler<T>): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set())
      this.wireListener(eventType)
    }
    this.handlers.get(eventType)!.add(handler as SseEventHandler)

    return () => {
      this.handlers.get(eventType)?.delete(handler as SseEventHandler)
    }
  }

  /**
   * Closes the SSE connection and removes all registered handlers.
   */
  disconnect(): void {
    this.es?.close()
    this.es = null
    this.handlers.clear()
  }

  private wireListener(eventType: string): void {
    this.es?.addEventListener(eventType, (e: MessageEvent) => {
      const data = this.parseData(e.data)
      if (data !== null) {
        this.handlers.get(eventType)?.forEach((h) => h(data, e.lastEventId))
      }
    })
  }

  private parseData<T>(raw: string): T | null {
    try {
      return JSON.parse(raw) as T
    } catch {
      return null
    }
  }
}
