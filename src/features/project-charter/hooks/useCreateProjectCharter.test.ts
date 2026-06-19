import { act, createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { server } from '@/shared/lib/msw/server'
import { proj1 } from '@/shared/test-utils/fixtures'

import { useCreateProjectCharter } from './useCreateProjectCharter'

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
  return Wrapper
}

const createdPc = {
  id: 'pc-99',
  version: 1,
  status: 'DRAFT',
  project: { id: proj1 },
}

describe('useCreateProjectCharter', () => {
  it('creates a project charter and returns the result', async () => {
    server.use(
      graphql.mutation('CreateProjectCharter', () =>
        HttpResponse.json({ data: { createProjectCharter: createdPc } }),
      ),
    )

    const { result } = renderHook(() => useCreateProjectCharter(), {
      wrapper: makeWrapper(),
    })

    await act(async () => {
      await result.current.mutateAsync({ projectId: proj1 })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.id).toBe('pc-99')
    expect(result.current.data?.status).toBe('DRAFT')
  })

  it('handles null project in onSuccess without throwing', async () => {
    server.use(
      graphql.mutation('CreateProjectCharter', () =>
        HttpResponse.json({
          data: { createProjectCharter: { ...createdPc, project: null } },
        }),
      ),
    )

    const { result } = renderHook(() => useCreateProjectCharter(), {
      wrapper: makeWrapper(),
    })

    await act(async () => {
      await result.current.mutateAsync({ projectId: proj1 })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })

  it('sets isError on mutation failure', async () => {
    server.use(
      graphql.mutation('CreateProjectCharter', () =>
        HttpResponse.json(
          { errors: [{ message: 'A Project Charter already exists for this project' }] },
          { status: 200 },
        ),
      ),
    )

    const { result } = renderHook(() => useCreateProjectCharter(), {
      wrapper: makeWrapper(),
    })

    await act(async () => {
      await result.current.mutateAsync({ projectId: proj1 }).catch(() => undefined)
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
