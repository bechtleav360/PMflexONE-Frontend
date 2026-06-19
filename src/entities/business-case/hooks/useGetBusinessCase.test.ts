import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { server } from '@/shared/lib/msw/server'

import { getBusinessCaseQueryKey } from '../types/businessCase.types'
import { useGetBusinessCase } from './useGetBusinessCase'

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
  return Wrapper
}

const bcPayload = {
  id: 'bc-1',
  version: 1,
  status: 'draft',
  clientSummary: 'Test summary',
  projectRationale: null,
  expectedBenefit: null,
  options: null,
  investmentCalculation: null,
  keyRisks: null,
  expectedNegativeSideEffect: null,
  timeline: null,
  createdAt: '2026-04-21T10:00:00Z',
  updatedAt: '2026-04-21T10:00:00Z',
  metadata: null,
  creator: null,
  updater: null,
  project: { id: 'proj-2', name: 'Modernisierung Portal' },
}

describe('useGetBusinessCase', () => {
  it('returns business case data on success', async () => {
    server.use(
      graphql.query('GetBusinessCase', () =>
        HttpResponse.json({ data: { businessCase: bcPayload } }),
      ),
    )

    const { result } = renderHook(() => useGetBusinessCase('bc-1'), {
      wrapper: makeWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.id).toBe('bc-1')
    expect(result.current.data?.status).toBe('draft')
    expect(result.current.data?.clientSummary).toBe('Test summary')
  })

  it('is disabled when id is empty', () => {
    const { result } = renderHook(() => useGetBusinessCase(''), {
      wrapper: makeWrapper(),
    })

    expect(result.current.isPending).toBe(true)
    expect(result.current.fetchStatus).toBe('idle')
  })

  it('isError when business case not found', async () => {
    server.use(
      graphql.query('GetBusinessCase', () =>
        HttpResponse.json({ errors: [{ message: 'BusinessCase not found' }] }, { status: 200 }),
      ),
    )

    const { result } = renderHook(() => useGetBusinessCase('bc-unknown'), {
      wrapper: makeWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it('query key includes id', () => {
    expect(getBusinessCaseQueryKey('bc-1')).toEqual(['businessCase', 'bc-1'])
  })
})
