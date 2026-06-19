import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { server } from '@/shared/lib/msw/server'
import { proj1 } from '@/shared/test-utils/fixtures'

import { useGetProjectInitiationRequestByProjectId } from './useGetProjectInitiationRequestByProjectId'

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
  return Wrapper
}

const pirWithProject = {
  id: 'pir-1',
  version: 1,
  name: 'Digitalisierung Rechnungswesen',
  status: 'draft',
  updatedAt: '2026-04-20T10:00:00Z',
  createdAt: '2026-04-01T09:00:00Z',
  requestingProject: { item: { id: proj1, name: 'Alpha' } },
}

const pirWithoutProject = {
  id: 'pir-2',
  version: 1,
  name: 'Standalone PIR',
  status: 'draft',
  updatedAt: '2026-04-20T10:00:00Z',
  createdAt: '2026-04-01T09:00:00Z',
  requestingProject: null,
}

describe('useGetProjectInitiationRequestByProjectId', () => {
  it('returns the matching PIR when one is linked to the project', async () => {
    server.use(
      graphql.query('GetProjectInitiationRequests', () =>
        HttpResponse.json({
          data: { projectInitiationRequests: [pirWithProject, pirWithoutProject] },
        }),
      ),
    )

    const { result } = renderHook(() => useGetProjectInitiationRequestByProjectId(proj1), {
      wrapper: makeWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.id).toBe('pir-1')
  })

  it('returns null when no PIR is linked to the project', async () => {
    server.use(
      graphql.query('GetProjectInitiationRequests', () =>
        HttpResponse.json({
          data: { projectInitiationRequests: [pirWithProject] },
        }),
      ),
    )

    const { result } = renderHook(() => useGetProjectInitiationRequestByProjectId('proj-99'), {
      wrapper: makeWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toBeNull()
  })

  it('is disabled when projectId is empty', () => {
    const { result } = renderHook(() => useGetProjectInitiationRequestByProjectId(''), {
      wrapper: makeWrapper(),
    })

    expect(result.current.isPending).toBe(true)
    expect(result.current.fetchStatus).toBe('idle')
  })

  it('sets isError on API failure', async () => {
    server.use(
      graphql.query('GetProjectInitiationRequests', () =>
        HttpResponse.json({ errors: [{ message: 'Internal Server Error' }] }, { status: 200 }),
      ),
    )

    const { result } = renderHook(() => useGetProjectInitiationRequestByProjectId(proj1), {
      wrapper: makeWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
