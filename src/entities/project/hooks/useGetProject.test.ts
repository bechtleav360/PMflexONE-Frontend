import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { server } from '@/shared/lib/msw/server'
import { proj1 } from '@/shared/test-utils/fixtures'

import { useGetProject } from './useGetProject'

const projectFixture = {
  id: proj1,
  name: 'Alpha',
  description: null,
  status: 'active',
  sizeClassification: 'medium',
  governanceStatus: 'formal',
  startDate: '2026-01-01',
  endDate: '2026-12-31',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  version: 1,
}

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
  return Wrapper
}

describe('useGetProject', () => {
  it('returns project data on success', async () => {
    server.use(
      graphql.query('GetProject', () => HttpResponse.json({ data: { project: projectFixture } })),
    )

    const { result } = renderHook(() => useGetProject(proj1), {
      wrapper: makeWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.id).toBe(proj1)
    expect(result.current.data?.name).toBe('Alpha')
  })

  it('enters error state when the API returns a GraphQL error', async () => {
    server.use(
      graphql.query('GetProject', () =>
        HttpResponse.json({ errors: [{ message: 'Not found' }] }, { status: 200 }),
      ),
    )

    const { result } = renderHook(() => useGetProject('proj-x'), {
      wrapper: makeWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
