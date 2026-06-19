import { act, createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { server } from '@/shared/lib/msw/server'
import { proj1 } from '@/shared/test-utils/fixtures'

import { useUpdateProjectCharter } from './useUpdateProjectCharter'

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
  return Wrapper
}

const updatedPc = {
  id: 'pc-1',
  version: 2,
  status: 'DRAFT',
  updatedAt: '2026-04-21T13:00:00Z',
  project: { id: proj1 },
}

describe('useUpdateProjectCharter', () => {
  it('updates the charter and returns the result', async () => {
    server.use(
      graphql.mutation('UpdateProjectCharter', () =>
        HttpResponse.json({ data: { updateProjectCharter: updatedPc } }),
      ),
    )

    const { result } = renderHook(() => useUpdateProjectCharter(), {
      wrapper: makeWrapper(),
    })

    await act(async () => {
      await result.current.mutateAsync({
        id: 'pc-1',
        version: 1,
        projectSummary: 'Updated summary',
      })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.id).toBe('pc-1')
    expect(result.current.data?.version).toBe(2)
  })

  it('handles null project in onSuccess without throwing', async () => {
    server.use(
      graphql.mutation('UpdateProjectCharter', () =>
        HttpResponse.json({
          data: { updateProjectCharter: { ...updatedPc, project: null } },
        }),
      ),
    )

    const { result } = renderHook(() => useUpdateProjectCharter(), {
      wrapper: makeWrapper(),
    })

    await act(async () => {
      await result.current.mutateAsync({ id: 'pc-1', version: 1 })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })

  it('sets isError on version conflict', async () => {
    server.use(
      graphql.mutation('UpdateProjectCharter', () =>
        HttpResponse.json(
          { errors: [{ message: 'Version conflict — please refresh and retry' }] },
          { status: 200 },
        ),
      ),
    )

    const { result } = renderHook(() => useUpdateProjectCharter(), {
      wrapper: makeWrapper(),
    })

    await act(async () => {
      await result.current.mutateAsync({ id: 'pc-1', version: 999 }).catch(() => undefined)
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
