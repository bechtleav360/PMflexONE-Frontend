import { act, createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { server } from '@/shared/lib/msw/server'

import { useDeleteRole } from './useDeleteRole'

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
  return Wrapper
}

const INPUT = { id: 'role-1', matrixId: 'matrix-1' }

describe('useDeleteRole — success path', () => {
  it('calls mutation and marks success', async () => {
    server.use(
      graphql.mutation('DeleteRole', () =>
        HttpResponse.json({ data: { deleteRole: { success: true, id: 'role-1' } } }),
      ),
    )

    const { result } = renderHook(() => useDeleteRole(), {
      wrapper: makeWrapper(),
    })

    await act(async () => {
      await result.current.mutateAsync(INPUT)
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.success).toBe(true)
  })
})

describe('useDeleteRole — error path', () => {
  it('sets isError when mutation fails', async () => {
    server.use(
      graphql.mutation('DeleteRole', () =>
        HttpResponse.json(
          { errors: [{ message: 'FIXED_ROLE_CANNOT_BE_DELETED' }] },
          { status: 200 },
        ),
      ),
    )

    const { result } = renderHook(() => useDeleteRole(), {
      wrapper: makeWrapper(),
    })

    await act(async () => {
      await result.current.mutateAsync(INPUT).catch(() => undefined)
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
