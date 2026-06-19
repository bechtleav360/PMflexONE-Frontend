import { act, createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { server } from '@/shared/lib/msw/server'
import { proj1 } from '@/shared/test-utils/fixtures'

import { useCreateBusinessCase } from './useCreateBusinessCase'

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
  return Wrapper
}

const createdBc = {
  id: 'bc-99',
  version: 1,
  status: 'draft',
  updatedAt: '2026-04-21T10:00:00Z',
  createdAt: '2026-04-21T10:00:00Z',
  project: { id: proj1, name: 'Test Project' },
}

describe('useCreateBusinessCase', () => {
  it('creates a business case and returns the result', async () => {
    server.use(
      graphql.mutation('CreateBusinessCase', () =>
        HttpResponse.json({ data: { createBusinessCase: createdBc } }),
      ),
    )

    const { result } = renderHook(() => useCreateBusinessCase(), {
      wrapper: makeWrapper(),
    })

    await act(async () => {
      await result.current.mutateAsync({ projectId: proj1 })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.id).toBe('bc-99')
    expect(result.current.data?.status).toBe('draft')
  })

  it('sets isError on mutation failure', async () => {
    server.use(
      graphql.mutation('CreateBusinessCase', () =>
        HttpResponse.json(
          { errors: [{ message: 'A Business Case already exists for this project' }] },
          { status: 200 },
        ),
      ),
    )

    const { result } = renderHook(() => useCreateBusinessCase(), {
      wrapper: makeWrapper(),
    })

    await act(async () => {
      await result.current.mutateAsync({ projectId: proj1 }).catch(() => undefined)
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
