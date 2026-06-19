import { act, createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { server } from '@/shared/lib/msw/server'
import { proj1 } from '@/shared/test-utils/fixtures'

import { useCreateProjectInitiationRequest } from './useCreateProjectInitiationRequest'

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
  return Wrapper
}

const createdPir = {
  id: 'pir-new',
  version: 1,
  name: 'Test PIR',
  documentVersion: null,
  status: 'draft',
  updatedAt: '2026-04-01T00:00:00Z',
  createdAt: '2026-04-01T00:00:00Z',
}

describe('useCreateProjectInitiationRequest', () => {
  it('creates a PIR and returns the result', async () => {
    server.use(
      graphql.mutation('CreateProjectInitiationRequest', () =>
        HttpResponse.json({ data: { createProjectInitiationRequest: createdPir } }),
      ),
    )

    const { result } = renderHook(() => useCreateProjectInitiationRequest(), {
      wrapper: makeWrapper(),
    })

    await act(async () => {
      await result.current.mutateAsync({
        name: 'Test PIR',
        requestingProjectId: proj1,
        scopeId: 'prog-1',
        scopeType: 'Program',
      })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.id).toBe('pir-new')
    expect(result.current.data?.status).toBe('draft')
  })

  it('sets isError on mutation failure', async () => {
    server.use(
      graphql.mutation('CreateProjectInitiationRequest', () =>
        HttpResponse.json({ errors: [{ message: 'Server error' }] }, { status: 200 }),
      ),
    )

    const { result } = renderHook(() => useCreateProjectInitiationRequest(), {
      wrapper: makeWrapper(),
    })

    await act(async () => {
      await result.current
        .mutateAsync({
          name: 'Fail',
          requestingProjectId: proj1,
          scopeId: 'prog-1',
          scopeType: 'Program',
        })
        .catch(() => undefined)
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
