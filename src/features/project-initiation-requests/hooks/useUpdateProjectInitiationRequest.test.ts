import { act, createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { server } from '@/shared/lib/msw/server'

import { useUpdateProjectInitiationRequest } from './useUpdateProjectInitiationRequest'

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
  return Wrapper
}

const updatedPir = {
  id: 'pir-1',
  version: 2,
  name: 'Updated PIR',
  documentVersion: null,
  status: 'draft',
  updatedAt: '2026-04-02T00:00:00Z',
}

describe('useUpdateProjectInitiationRequest', () => {
  it('updates a PIR and returns the result', async () => {
    server.use(
      graphql.mutation('UpdateProjectInitiationRequest', () =>
        HttpResponse.json({ data: { updateProjectInitiationRequest: updatedPir } }),
      ),
    )

    const { result } = renderHook(() => useUpdateProjectInitiationRequest(), {
      wrapper: makeWrapper(),
    })

    await act(async () => {
      await result.current.mutateAsync({ id: 'pir-1', input: { version: 1, name: 'Updated PIR' } })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.id).toBe('pir-1')
    expect(result.current.data?.name).toBe('Updated PIR')
    expect(result.current.data?.version).toBe(2)
  })

  it('sets isError on mutation failure', async () => {
    server.use(
      graphql.mutation('UpdateProjectInitiationRequest', () =>
        HttpResponse.json({ errors: [{ message: 'Version conflict' }] }, { status: 200 }),
      ),
    )

    const { result } = renderHook(() => useUpdateProjectInitiationRequest(), {
      wrapper: makeWrapper(),
    })

    await act(async () => {
      await result.current
        .mutateAsync({ id: 'pir-x', input: { version: 999 } })
        .catch(() => undefined)
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
