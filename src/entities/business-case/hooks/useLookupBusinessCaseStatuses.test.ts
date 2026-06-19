import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { server } from '@/shared/lib/msw/server'

import { useLookupBusinessCaseStatuses } from './useLookupBusinessCaseStatuses'

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
  return Wrapper
}

const statusesPayload = [
  { status: 'draft', description: 'Draft', displayOrder: 1 },
  { status: 'submitted', description: 'Complete', displayOrder: 2 },
]

describe('useLookupBusinessCaseStatuses', () => {
  it('returns statuses on success', async () => {
    server.use(
      graphql.query('BusinessCaseStatuses', () =>
        HttpResponse.json({ data: { businessCaseStatuses: statusesPayload } }),
      ),
    )

    const { result } = renderHook(() => useLookupBusinessCaseStatuses(), {
      wrapper: makeWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(2)
    expect(result.current.data?.[0]?.status).toBe('draft')
  })

  it('sets isError on failure', async () => {
    server.use(
      graphql.query('BusinessCaseStatuses', () =>
        HttpResponse.json({ errors: [{ message: 'Unauthorized' }] }, { status: 200 }),
      ),
    )

    const { result } = renderHook(() => useLookupBusinessCaseStatuses(), {
      wrapper: makeWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
