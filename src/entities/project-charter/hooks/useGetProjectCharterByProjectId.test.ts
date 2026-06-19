import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { server } from '@/shared/lib/msw/server'
import { proj1 } from '@/shared/test-utils/fixtures'

import { getProjectCharterByProjectIdQueryKey } from '../types/projectCharter.types'
import { useGetProjectCharterByProjectId } from './useGetProjectCharterByProjectId'

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
  return Wrapper
}

describe('useGetProjectCharterByProjectId', () => {
  it('returns charter id and status when found', async () => {
    server.use(
      graphql.query('GetProjectCharterByProjectId', () =>
        HttpResponse.json({
          data: { projectCharterByProjectId: { id: 'pc-1', status: 'DRAFT' } },
        }),
      ),
    )

    const { result } = renderHook(() => useGetProjectCharterByProjectId(proj1), {
      wrapper: makeWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.id).toBe('pc-1')
    expect(result.current.data?.status).toBe('DRAFT')
  })

  it('returns null when no charter exists for project', async () => {
    server.use(
      graphql.query('GetProjectCharterByProjectId', () =>
        HttpResponse.json({ data: { projectCharterByProjectId: null } }),
      ),
    )

    const { result } = renderHook(() => useGetProjectCharterByProjectId('proj-no-pc'), {
      wrapper: makeWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toBeNull()
  })

  it('is disabled when projectId is empty', () => {
    const { result } = renderHook(() => useGetProjectCharterByProjectId(''), {
      wrapper: makeWrapper(),
    })

    expect(result.current.isPending).toBe(true)
    expect(result.current.fetchStatus).toBe('idle')
  })

  it('query key includes projectId', () => {
    expect(getProjectCharterByProjectIdQueryKey(proj1)).toEqual([
      'projectCharterByProjectId',
      proj1,
    ])
  })
})
