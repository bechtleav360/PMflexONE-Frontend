import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { server } from '@/shared/lib/msw/server'
import { proj1 } from '@/shared/test-utils/fixtures'

import { getProjectCharterQueryKey } from '../types/projectCharter.types'
import { useGetProjectCharter } from './useGetProjectCharter'

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
  return Wrapper
}

const pcPayload = {
  id: 'pc-1',
  version: 1,
  status: 'DRAFT',
  projectSummary: 'Test summary',
  scopeSummary: null,
  successCriteria: null,
  stakeholders: null,
  requirement: null,
  projectConstraint: null,
  assumption: null,
  risk: null,
  resources: null,
  operationalImplementation: null,
  createdAt: '2026-04-21T10:00:00Z',
  updatedAt: '2026-04-21T10:00:00Z',
  creator: null,
  updater: null,
  project: { id: proj1 },
}

describe('useGetProjectCharter', () => {
  it('returns charter data on success', async () => {
    server.use(
      graphql.query('GetProjectCharter', () =>
        HttpResponse.json({ data: { projectCharter: pcPayload } }),
      ),
    )

    const { result } = renderHook(() => useGetProjectCharter('pc-1'), {
      wrapper: makeWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.id).toBe('pc-1')
    expect(result.current.data?.status).toBe('DRAFT')
    expect(result.current.data?.projectSummary).toBe('Test summary')
  })

  it('is disabled when id is empty', () => {
    const { result } = renderHook(() => useGetProjectCharter(''), {
      wrapper: makeWrapper(),
    })

    expect(result.current.isPending).toBe(true)
    expect(result.current.fetchStatus).toBe('idle')
  })

  it('isError when charter not found', async () => {
    server.use(
      graphql.query('GetProjectCharter', () =>
        HttpResponse.json({ errors: [{ message: 'ProjectCharter not found' }] }, { status: 200 }),
      ),
    )

    const { result } = renderHook(() => useGetProjectCharter('pc-unknown'), {
      wrapper: makeWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it('query key includes id', () => {
    expect(getProjectCharterQueryKey('pc-1')).toEqual(['projectCharter', 'pc-1'])
  })
})
