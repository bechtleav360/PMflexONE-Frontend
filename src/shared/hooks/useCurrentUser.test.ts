import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { makeQueryWrapperWithClient } from '@/shared/test-utils/makeQueryWrapper'

import { useCurrentUser } from './useCurrentUser'

function makeFetchResponse(ok: boolean, body: object | null = null): Response {
  return {
    ok,
    json: () => Promise.resolve(body),
  } as unknown as Response
}

describe('useCurrentUser', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('returns null when the response is not ok', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(makeFetchResponse(false))
    const { Wrapper } = makeQueryWrapperWithClient()
    const { result } = renderHook(() => useCurrentUser(), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toBeNull()
  })

  it('returns null when body has no id', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      makeFetchResponse(true, { firstName: 'Alice', lastName: 'Smith', mail: 'a@b.com' }),
    )
    const { Wrapper } = makeQueryWrapperWithClient()
    const { result } = renderHook(() => useCurrentUser(), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toBeNull()
  })

  it('returns null when body is null', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(makeFetchResponse(true, null))
    const { Wrapper } = makeQueryWrapperWithClient()
    const { result } = renderHook(() => useCurrentUser(), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toBeNull()
  })

  it('maps firstName, lastName and mail from JSON body', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      makeFetchResponse(true, {
        id: '00000000-0000-0000-0000-000000000001',
        firstName: 'Alice',
        lastName: 'Smith',
        mail: 'alice.smith@example.com',
        displayName: 'Alice Smith',
        profileImage: null,
      }),
    )
    const { Wrapper } = makeQueryWrapperWithClient()
    const { result } = renderHook(() => useCurrentUser(), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.firstName).toBe('Alice')
    expect(result.current.data?.lastName).toBe('Smith')
    expect(result.current.data?.mail).toBe('alice.smith@example.com')
    expect(result.current.data?.id).toBe('00000000-0000-0000-0000-000000000001')
  })

  it('handles empty lastName', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      makeFetchResponse(true, {
        id: 'abc',
        firstName: 'Bob',
        lastName: '',
        mail: 'bob@example.com',
        displayName: 'Bob',
        profileImage: null,
      }),
    )
    const { Wrapper } = makeQueryWrapperWithClient()
    const { result } = renderHook(() => useCurrentUser(), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.firstName).toBe('Bob')
    expect(result.current.data?.lastName).toBe('')
  })

  it('enters error state when fetch rejects', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'))
    const { Wrapper } = makeQueryWrapperWithClient()
    const { result } = renderHook(() => useCurrentUser(), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
