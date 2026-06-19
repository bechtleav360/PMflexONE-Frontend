import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { server } from '@/shared/lib/msw/server'
import { proj1 } from '@/shared/test-utils/fixtures'

import { useListProjects } from './useListProjects'

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
  return Wrapper
}

describe('useListProjects', () => {
  it('returns an empty array when the API returns no projects', async () => {
    server.use(graphql.query('ListProjects', () => HttpResponse.json({ data: { projects: [] } })))

    const { result } = renderHook(() => useListProjects(), {
      wrapper: makeWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([])
  })

  it('returns the list of projects from the API', async () => {
    server.use(
      graphql.query('ListProjects', () =>
        HttpResponse.json({
          data: {
            projects: [
              {
                id: proj1,
                name: 'Alpha',
                status: 'active',
                sizeClassification: 'medium',
                governanceStatus: 'formal',
                startDate: '2026-01-01',
                endDate: '2026-12-31',
                createdAt: '2026-01-01T00:00:00Z',
                updatedAt: '2026-01-01T00:00:00Z',
                version: 1,
              },
            ],
          },
        }),
      ),
    )

    const { result } = renderHook(() => useListProjects(), {
      wrapper: makeWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(1)
    expect(result.current.data?.[0].name).toBe('Alpha')
    expect(result.current.data?.[0].governanceStatus).toBe('formal')
  })

  it('enters error state when the API returns a GraphQL error', async () => {
    server.use(
      graphql.query('ListProjects', () =>
        HttpResponse.json({ errors: [{ message: 'Internal Server Error' }] }, { status: 200 }),
      ),
    )

    const { result } = renderHook(() => useListProjects(), {
      wrapper: makeWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
