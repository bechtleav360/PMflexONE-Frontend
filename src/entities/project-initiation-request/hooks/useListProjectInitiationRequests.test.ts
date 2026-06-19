import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { server } from '@/shared/lib/msw/server'

import { listProjectInitiationRequestsQueryKey } from '../types/projectInitiationRequest.types'
import { useListProjectInitiationRequests } from './useListProjectInitiationRequests'

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
  return Wrapper
}

const pirPayload = {
  id: 'pir-1',
  version: 1,
  name: 'Digitalisierung Rechnungswesen',
  status: 'draft',
  documentVersion: null,
  updatedAt: '2026-04-20T10:00:00Z',
  createdAt: '2026-04-01T09:00:00Z',
  requestingProject: null,
}

describe('useListProjectInitiationRequests', () => {
  it('returns data from the MSW handler on success', async () => {
    server.use(
      graphql.query('GetProjectInitiationRequests', () =>
        HttpResponse.json({
          data: { projectInitiationRequests: [pirPayload] },
        }),
      ),
    )

    const { result } = renderHook(() => useListProjectInitiationRequests(), {
      wrapper: makeWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(1)
    expect(result.current.data?.[0].name).toBe('Digitalisierung Rechnungswesen')
  })

  it('isPending is true while loading', () => {
    const { result } = renderHook(() => useListProjectInitiationRequests(), {
      wrapper: makeWrapper(),
    })

    expect(result.current.isPending).toBe(true)
  })

  it('isError is true on network error', async () => {
    server.use(
      graphql.query('GetProjectInitiationRequests', () =>
        HttpResponse.json({ errors: [{ message: 'Internal Server Error' }] }, { status: 200 }),
      ),
    )

    const { result } = renderHook(() => useListProjectInitiationRequests(), {
      wrapper: makeWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it('query key is stable across calls', () => {
    const key1 = listProjectInitiationRequestsQueryKey
    const key2 = listProjectInitiationRequestsQueryKey
    expect(key1).toBe(key2)
    expect(key1).toEqual(['projectInitiationRequests'])
  })
})
