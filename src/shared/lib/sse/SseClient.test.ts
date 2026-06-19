import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { getSseEndpoint, setSseEndpoint, SseClient } from './SseClient'

class FakeEventSource {
  static lastInstance: FakeEventSource | null = null

  readonly url: string
  readonly withCredentials: boolean
  onerror: (() => void) | null = null
  close = vi.fn()

  private listeners: Record<string, ((e: MessageEvent) => void)[]> = {}

  constructor(url: string, init?: EventSourceInit) {
    this.url = url
    this.withCredentials = init?.withCredentials ?? false
    FakeEventSource.lastInstance = this
  }

  addEventListener(type: string, cb: (e: MessageEvent) => void): void {
    if (!this.listeners[type]) this.listeners[type] = []
    this.listeners[type].push(cb)
  }

  /**
   * Test helper — dispatch a fake SSE event to registered listeners.
   * @param type - SSE event type string
   * @param data - Raw JSON string payload
   * @param lastEventId - Optional last event ID
   */
  dispatch(type: string, data: string, lastEventId = ''): void {
    const event = { data, lastEventId } as MessageEvent
    this.listeners[type]?.forEach((cb) => cb(event))
  }
}

vi.stubGlobal('EventSource', FakeEventSource)

// eslint-disable-next-line max-lines-per-function -- test describe block; splitting individual it() callbacks hurts readability
describe('SseClient', () => {
  let client: SseClient

  beforeEach(() => {
    FakeEventSource.lastInstance = null
    client = new SseClient()
  })

  afterEach(() => {
    client.disconnect()
    vi.restoreAllMocks()
  })

  it('connect_noEvents_usesPlainUrl', () => {
    client.connect('/api/sse/subscribe')

    expect(FakeEventSource.lastInstance?.url).toBe('/api/sse/subscribe')
  })

  it('connect_withEvents_appendsEventsQueryParam', () => {
    client.connect('/api/sse/subscribe', ['notification.agent.taskCompleted.v1'])

    expect(FakeEventSource.lastInstance?.url).toBe(
      '/api/sse/subscribe?events=notification.agent.taskCompleted.v1',
    )
  })

  it('connect_multipleEvents_includesAllEventTypes', () => {
    client.connect('/api/sse/subscribe', ['type.a.v1', 'type.b.v1'])

    const url = FakeEventSource.lastInstance?.url ?? ''
    // URLSearchParams encodes commas as %2C — both forms are equivalent
    const decoded = decodeURIComponent(url)
    expect(decoded).toContain('events=type.a.v1,type.b.v1')
  })

  it('connect_withCredentials_isTrue', () => {
    client.connect('/api/sse/subscribe')

    expect(FakeEventSource.lastInstance?.withCredentials).toBe(true)
  })

  it('connect_alreadyConnected_doesNotCreateSecondEventSource', () => {
    client.connect('/api/sse/subscribe')
    const first = FakeEventSource.lastInstance

    client.connect('/api/sse/subscribe')

    expect(FakeEventSource.lastInstance).toBe(first)
  })

  it('on_registersHandlerAndCallsItOnEvent', () => {
    client.connect('/api/sse/subscribe')
    const handler = vi.fn()
    client.on('notification.agent.taskCompleted.v1', handler)

    FakeEventSource.lastInstance!.dispatch(
      'notification.agent.taskCompleted.v1',
      '{"epicId":"42"}',
      'event-id-1',
    )

    expect(handler).toHaveBeenCalledOnce()
    expect(handler).toHaveBeenCalledWith({ epicId: '42' }, 'event-id-1')
  })

  it('on_parsesJsonData_passesObjectToHandler', () => {
    client.connect('/api/sse/subscribe')
    const handler = vi.fn()
    client.on('some.event.v1', handler)

    FakeEventSource.lastInstance!.dispatch('some.event.v1', '{"key":"value"}')

    expect(handler).toHaveBeenCalledWith({ key: 'value' }, '')
  })

  it('on_invalidJson_doesNotCallHandler', () => {
    client.connect('/api/sse/subscribe')
    const handler = vi.fn()
    client.on('some.event.v1', handler)

    FakeEventSource.lastInstance!.dispatch('some.event.v1', 'not-json')

    expect(handler).not.toHaveBeenCalled()
  })

  it('on_returnsUnsubscribeFn_removesHandler', () => {
    client.connect('/api/sse/subscribe')
    const handler = vi.fn()
    const unsubscribe = client.on('some.event.v1', handler)

    unsubscribe()
    FakeEventSource.lastInstance!.dispatch('some.event.v1', '{}')

    expect(handler).not.toHaveBeenCalled()
  })

  it('disconnect_closesEventSourceAndClearsHandlers', () => {
    client.connect('/api/sse/subscribe')
    const fake = FakeEventSource.lastInstance!
    const handler = vi.fn()
    client.on('some.event.v1', handler)

    client.disconnect()
    fake.dispatch('some.event.v1', '{}')

    expect(fake.close).toHaveBeenCalledOnce()
    expect(handler).not.toHaveBeenCalled()
  })

  it('on_beforeConnect_handlerFiredAfterConnect', () => {
    const handler = vi.fn()
    // Register handler BEFORE connecting
    client.on('some.event.v1', handler)

    client.connect('/api/sse/subscribe')
    FakeEventSource.lastInstance!.dispatch('some.event.v1', '{"x":1}')

    expect(handler).toHaveBeenCalledOnce()
    expect(handler).toHaveBeenCalledWith({ x: 1 }, '')
  })
})

describe('getSseEndpoint / setSseEndpoint', () => {
  const DEFAULT_ENDPOINT = '/api/sse/subscribe'

  afterEach(() => {
    setSseEndpoint(DEFAULT_ENDPOINT)
  })

  it('getSseEndpoint_default_returnsDefaultEndpoint', () => {
    expect(getSseEndpoint()).toBe(DEFAULT_ENDPOINT)
  })

  it('setSseEndpoint_updatesValueReturnedByGetSseEndpoint', () => {
    setSseEndpoint('https://api.example.com/api/sse/subscribe')

    expect(getSseEndpoint()).toBe('https://api.example.com/api/sse/subscribe')
  })
})
