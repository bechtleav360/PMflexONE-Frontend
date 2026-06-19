import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { server } from '@/shared/lib/msw/server'

import { getProjectInitiationRequestQueryKey } from '../types/projectInitiationRequest.types'
import { useGetProjectInitiationRequest } from './useGetProjectInitiationRequest'

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
  return Wrapper
}

const pirPayload = {
  id: 'pir-1',
  version: 1,
  name: 'Digitalisierung Rechnungswesen',
  documentVersion: null,
  status: 'draft',
  projectInitiator: null,
  projectOwner: null,
  organizationalUnit: null,
  solutionProvider: null,
  approvalAuthority: null,
  requestDate: null,
  estimatedEffort: null,
  estimatedEffortComment: null,
  targetDeliveryDate: null,
  deliveryType: null,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-02T00:00:00Z',
  creator: null,
  updater: null,
  requestingProject: null,
  scope: null,
}

describe('useGetProjectInitiationRequest', () => {
  it('returns PIR data on success', async () => {
    server.use(
      graphql.query('GetProjectInitiationRequest', () =>
        HttpResponse.json({ data: { projectInitiationRequest: pirPayload } }),
      ),
    )

    const { result } = renderHook(() => useGetProjectInitiationRequest('pir-1'), {
      wrapper: makeWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.id).toBe('pir-1')
    expect(result.current.data?.name).toBe('Digitalisierung Rechnungswesen')
  })

  it('is disabled when id is empty', () => {
    const { result } = renderHook(() => useGetProjectInitiationRequest(''), {
      wrapper: makeWrapper(),
    })

    expect(result.current.isPending).toBe(true)
    expect(result.current.fetchStatus).toBe('idle')
  })

  it('sets isError on API failure', async () => {
    server.use(
      graphql.query('GetProjectInitiationRequest', () =>
        HttpResponse.json({ errors: [{ message: 'Not found' }] }, { status: 200 }),
      ),
    )

    const { result } = renderHook(() => useGetProjectInitiationRequest('pir-x'), {
      wrapper: makeWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it('query key includes the id', () => {
    expect(getProjectInitiationRequestQueryKey('pir-1')).toEqual([
      'projectInitiationRequest',
      'pir-1',
    ])
  })
})
