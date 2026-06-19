import { act, createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { server } from '@/shared/lib/msw/server'

import { useSubmitBusinessCase } from './useSubmitBusinessCase'

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
  return Wrapper
}

const submittedBc = {
  id: 'bc-1',
  version: 2,
  status: 'submitted',
  updatedAt: '2026-04-21T13:00:00Z',
  project: { id: 'proj-2', name: 'Modernisierung Portal' },
}

describe('useSubmitBusinessCase', () => {
  it('transitions status to submitted', async () => {
    server.use(
      graphql.mutation('SubmitBusinessCase', () =>
        HttpResponse.json({ data: { submitBusinessCase: submittedBc } }),
      ),
    )

    const { result } = renderHook(() => useSubmitBusinessCase(), {
      wrapper: makeWrapper(),
    })

    await act(async () => {
      await result.current.mutateAsync({ id: 'bc-1', version: 1 })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.status).toBe('submitted')
    expect(result.current.data?.version).toBe(2)
  })

  it('sets isError on version conflict', async () => {
    server.use(
      graphql.mutation('SubmitBusinessCase', () =>
        HttpResponse.json(
          { errors: [{ message: 'Version conflict — please refresh and retry' }] },
          { status: 200 },
        ),
      ),
    )

    const { result } = renderHook(() => useSubmitBusinessCase(), {
      wrapper: makeWrapper(),
    })

    await act(async () => {
      await result.current.mutateAsync({ id: 'bc-1', version: 999 }).catch(() => undefined)
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
