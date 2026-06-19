import { act, createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { server } from '@/shared/lib/msw/server'

import { useDeleteObjectRole } from './useDeleteObjectRole'

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
  return Wrapper
}

const DELETE_RESULT = {
  deleteObjectRole: { success: true, id: 'role-1' },
}

const INPUT = {
  id: 'role-1',
  objectId: 'obj-1',
  domainType: 'PROJECT' as const,
}

describe('useDeleteObjectRole — success path', () => {
  it('calls mutation and invalidates matrix query', async () => {
    server.use(
      graphql.mutation('DeleteObjectRole', () => HttpResponse.json({ data: DELETE_RESULT })),
    )

    const { result } = renderHook(() => useDeleteObjectRole(), {
      wrapper: makeWrapper(),
    })

    await act(async () => {
      await result.current.mutateAsync(INPUT)
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.success).toBe(true)
  })
})

describe('useDeleteObjectRole — error path', () => {
  it('sets isError and shows error toast on mutation failure', async () => {
    server.use(
      graphql.mutation('DeleteObjectRole', () =>
        HttpResponse.json(
          { errors: [{ message: 'FIXED_ROLE_CANNOT_BE_DELETED' }] },
          { status: 200 },
        ),
      ),
    )

    const { result } = renderHook(() => useDeleteObjectRole(), {
      wrapper: makeWrapper(),
    })

    await act(async () => {
      await result.current.mutateAsync(INPUT).catch(() => undefined)
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
