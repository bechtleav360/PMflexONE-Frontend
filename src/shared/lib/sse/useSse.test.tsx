import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { SseClient, SseEventHandler } from './SseClient'
import { SseContext } from './SseContext'
import { useSse } from './useSse'

function wrapper(client: SseClient | null) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <SseContext.Provider value={client}>{children}</SseContext.Provider>
  }
  return Wrapper
}

describe('useSse', () => {
  it('on_calledWithEventType_registersHandler', () => {
    const mockClient = {
      on: vi.fn().mockReturnValue(vi.fn()),
    } as unknown as SseClient

    renderHook(() => useSse('notification.agent.taskCompleted.v1', vi.fn()), {
      wrapper: wrapper(mockClient),
    })

    expect(mockClient.on).toHaveBeenCalledWith(
      'notification.agent.taskCompleted.v1',
      expect.any(Function),
    )
  })

  it('on_callbackFires_invokesHandler', () => {
    let capturedHandler: SseEventHandler | undefined
    const mockClient = {
      on: vi.fn().mockImplementation((_type: string, h: SseEventHandler) => {
        capturedHandler = h
        return vi.fn()
      }),
    } as unknown as SseClient

    const handler = vi.fn()
    renderHook(() => useSse('some.event.v1', handler), { wrapper: wrapper(mockClient) })

    capturedHandler?.({ epicId: '1' }, 'event-id-1')

    expect(handler).toHaveBeenCalledWith({ epicId: '1' }, 'event-id-1')
  })

  it('unmount_callsUnsubscribe', () => {
    const unsubscribe = vi.fn()
    const mockClient = {
      on: vi.fn().mockReturnValue(unsubscribe),
    } as unknown as SseClient

    const { unmount } = renderHook(() => useSse('some.event.v1', vi.fn()), {
      wrapper: wrapper(mockClient),
    })

    unmount()

    expect(unsubscribe).toHaveBeenCalledOnce()
  })

  it('noClient_render_doesNotThrow', () => {
    expect(() =>
      renderHook(() => useSse('some.event.v1', vi.fn()), { wrapper: wrapper(null) }),
    ).not.toThrow()
  })
})
