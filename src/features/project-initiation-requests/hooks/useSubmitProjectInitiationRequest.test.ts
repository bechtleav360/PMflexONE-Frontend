import { act, createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { server } from '@/shared/lib/msw/server'

import { useSubmitProjectInitiationRequest } from './useSubmitProjectInitiationRequest'

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
  return Wrapper
}

const submittedPir = {
  id: 'pir-1',
  version: 2,
  name: 'Test PIR',
  status: 'accepted',
  updatedAt: '2026-04-02T00:00:00Z',
}

describe('useSubmitProjectInitiationRequest', () => {
  it('submits a PIR and returns the updated record', async () => {
    server.use(
      graphql.mutation('SubmitProjectInitiationRequest', () =>
        HttpResponse.json({ data: { submitProjectInitiationRequest: submittedPir } }),
      ),
    )

    const { result } = renderHook(() => useSubmitProjectInitiationRequest(), {
      wrapper: makeWrapper(),
    })

    await act(async () => {
      await result.current.mutateAsync({ id: 'pir-1', version: 1 })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.id).toBe('pir-1')
    expect(result.current.data?.status).toBe('accepted')
  })

  it('sets isError on mutation failure', async () => {
    server.use(
      graphql.mutation('SubmitProjectInitiationRequest', () =>
        HttpResponse.json({ errors: [{ message: 'Version conflict' }] }, { status: 200 }),
      ),
    )

    const { result } = renderHook(() => useSubmitProjectInitiationRequest(), {
      wrapper: makeWrapper(),
    })

    await act(async () => {
      await result.current.mutateAsync({ id: 'pir-x', version: 999 }).catch(() => undefined)
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
