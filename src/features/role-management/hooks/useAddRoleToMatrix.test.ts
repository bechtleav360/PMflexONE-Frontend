import { act, createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { server } from '@/shared/lib/msw/server'

import { useAddRoleToMatrix } from './useAddRoleToMatrix'

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
  return Wrapper
}

const CREATED_ROLE = {
  id: 'role-new',
  name: 'New Role',
  shortTitle: 'NR',
  description: null,
  isFixed: false,
  isDefault: false,
  groupId: 'grp-1',
  tasks: [],
}

const INPUT = {
  matrixId: 'matrix-1',
  name: 'New Role',
  shortTitle: 'NR',
  groupId: 'grp-1',
  tasks: [],
}

describe('useAddRoleToMatrix — success path', () => {
  it('calls mutation and returns created role', async () => {
    server.use(
      graphql.mutation('AddRoleToMatrix', () =>
        HttpResponse.json({ data: { addRoleToMatrix: CREATED_ROLE } }),
      ),
    )

    const { result } = renderHook(() => useAddRoleToMatrix(), {
      wrapper: makeWrapper(),
    })

    await act(async () => {
      await result.current.mutateAsync(INPUT)
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.id).toBe('role-new')
  })
})

describe('useAddRoleToMatrix — error path', () => {
  it('sets isError on mutation failure', async () => {
    server.use(
      graphql.mutation('AddRoleToMatrix', () =>
        HttpResponse.json({ errors: [{ message: 'ROLE_HAS_ASSIGNED_USERS' }] }, { status: 200 }),
      ),
    )

    const { result } = renderHook(() => useAddRoleToMatrix(), {
      wrapper: makeWrapper(),
    })

    await act(async () => {
      await result.current.mutateAsync(INPUT).catch(() => undefined)
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
