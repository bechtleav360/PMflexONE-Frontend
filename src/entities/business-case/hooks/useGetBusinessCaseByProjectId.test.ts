import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { server } from '@/shared/lib/msw/server'
import { proj1 } from '@/shared/test-utils/fixtures'

import { getBusinessCaseByProjectIdQueryKey } from '../types/businessCase.types'
import { useGetBusinessCaseByProjectId } from './useGetBusinessCaseByProjectId'

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
  return Wrapper
}

describe('useGetBusinessCaseByProjectId', () => {
  it('returns bc id and status when found', async () => {
    server.use(
      graphql.query('GetBusinessCaseByProjectId', () =>
        HttpResponse.json({
          data: { businessCaseByProjectId: { id: 'bc-1', status: 'draft' } },
        }),
      ),
    )

    const { result } = renderHook(() => useGetBusinessCaseByProjectId(proj1), {
      wrapper: makeWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.id).toBe('bc-1')
    expect(result.current.data?.status).toBe('draft')
  })

  it('returns null when no BC exists for project', async () => {
    server.use(
      graphql.query('GetBusinessCaseByProjectId', () =>
        HttpResponse.json({ data: { businessCaseByProjectId: null } }),
      ),
    )

    const { result } = renderHook(() => useGetBusinessCaseByProjectId('proj-no-bc'), {
      wrapper: makeWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toBeNull()
  })

  it('is disabled when projectId is empty', () => {
    const { result } = renderHook(() => useGetBusinessCaseByProjectId(''), {
      wrapper: makeWrapper(),
    })

    expect(result.current.isPending).toBe(true)
    expect(result.current.fetchStatus).toBe('idle')
  })

  it('query key includes projectId', () => {
    expect(getBusinessCaseByProjectIdQueryKey(proj1)).toEqual(['businessCaseByProjectId', proj1])
  })
})
