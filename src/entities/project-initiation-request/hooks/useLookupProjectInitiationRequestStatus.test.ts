import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { server } from '@/shared/lib/msw/server'

import { useLookupProjectInitiationRequestStatus } from './useLookupProjectInitiationRequestStatus'

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
  return Wrapper
}

const statusPayload = [
  { value: 'draft', label: 'Draft' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'accepted', label: 'Accepted' },
]

describe('useLookupProjectInitiationRequestStatus', () => {
  it('returns status labels on success', async () => {
    server.use(
      graphql.query('LookupProjectInitiationRequestStatus', () =>
        HttpResponse.json({
          data: { lookupProjectInitiationRequestStatus: statusPayload },
        }),
      ),
    )

    const { result } = renderHook(() => useLookupProjectInitiationRequestStatus(), {
      wrapper: makeWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(3)
    expect(result.current.data?.[0]?.value).toBe('draft')
    expect(result.current.data?.[0]?.label).toBe('Draft')
  })

  it('sets isError on API failure', async () => {
    server.use(
      graphql.query('LookupProjectInitiationRequestStatus', () =>
        HttpResponse.json({ errors: [{ message: 'Unauthorized' }] }, { status: 200 }),
      ),
    )

    const { result } = renderHook(() => useLookupProjectInitiationRequestStatus(), {
      wrapper: makeWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
