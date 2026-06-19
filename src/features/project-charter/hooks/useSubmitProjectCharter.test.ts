import { act, createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'

import { server } from '@/shared/lib/msw/server'
import { proj1 } from '@/shared/test-utils/fixtures'

import { useSubmitProjectCharter } from './useSubmitProjectCharter'

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
  return Wrapper
}

const acceptedPc = {
  id: 'pc-1',
  version: 2,
  status: 'ACCEPTED',
  updatedAt: '2026-04-21T14:00:00Z',
  project: { id: proj1 },
}

describe('useSubmitProjectCharter', () => {
  it('transitions status to ACCEPTED', async () => {
    server.use(
      graphql.mutation('SubmitProjectCharter', () =>
        HttpResponse.json({ data: { submitProjectCharter: acceptedPc } }),
      ),
    )

    const { result } = renderHook(() => useSubmitProjectCharter(), {
      wrapper: makeWrapper(),
    })

    await act(async () => {
      await result.current.mutateAsync({ id: 'pc-1', version: 1 })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.status).toBe('ACCEPTED')
    expect(result.current.data?.version).toBe(2)
  })

  it('handles null project in onSuccess without throwing', async () => {
    server.use(
      graphql.mutation('SubmitProjectCharter', () =>
        HttpResponse.json({
          data: { submitProjectCharter: { ...acceptedPc, project: null } },
        }),
      ),
    )

    const { result } = renderHook(() => useSubmitProjectCharter(), {
      wrapper: makeWrapper(),
    })

    await act(async () => {
      await result.current.mutateAsync({ id: 'pc-1', version: 1 })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })

  it('sets isError on version conflict', async () => {
    server.use(
      graphql.mutation('SubmitProjectCharter', () =>
        HttpResponse.json(
          { errors: [{ message: 'Version conflict — please refresh and retry' }] },
          { status: 200 },
        ),
      ),
    )

    const { result } = renderHook(() => useSubmitProjectCharter(), {
      wrapper: makeWrapper(),
    })

    await act(async () => {
      await result.current.mutateAsync({ id: 'pc-1', version: 999 }).catch(() => undefined)
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it('invalidates three query keys on success', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    server.use(
      graphql.mutation('SubmitProjectCharter', () =>
        HttpResponse.json({ data: { submitProjectCharter: acceptedPc } }),
      ),
    )

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children)

    const { result } = renderHook(() => useSubmitProjectCharter(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync({ id: 'pc-1', version: 1 })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const keys = invalidateSpy.mock.calls.map((call) => (call[0] as { queryKey: unknown }).queryKey)
    expect(keys).toContainEqual(['projectCharter', 'pc-1'])
    expect(keys).toContainEqual(['projectCharterByProjectId', proj1])
    expect(keys).toContainEqual(['getProject', proj1])
  })
})
