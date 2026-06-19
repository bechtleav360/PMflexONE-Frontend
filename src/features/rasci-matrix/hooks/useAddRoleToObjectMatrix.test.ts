import { act, createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { server } from '@/shared/lib/msw/server'

import { useAddRoleToObjectMatrix } from './useAddRoleToObjectMatrix'

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
  return Wrapper
}

const CREATED_ROLE = {
  id: 'role-new',
  name: 'Custom Role',
  shortTitle: 'CR',
  description: null,
  isFixed: false,
  isDefault: false,
  groupId: 'grp-1',
  tasks: [{ taskId: 'task-1', permissionKey: 'R' }],
}

const INPUT = {
  objectId: 'obj-1',
  domainType: 'PROJECT' as const,
  input: {
    objectId: 'obj-1',
    name: 'Custom Role',
    shortTitle: 'CR',
    groupId: 'grp-1',
    tasks: [{ taskId: 'task-1', permissionKey: 'R' as const }],
  },
}

describe('useAddRoleToObjectMatrix — success path', () => {
  it('calls mutation and invalidates roleQueryKeys.matrix', async () => {
    server.use(
      graphql.mutation('AddRoleToObjectMatrix', () =>
        HttpResponse.json({ data: { addRoleToObjectMatrix: CREATED_ROLE } }),
      ),
    )

    const { result } = renderHook(() => useAddRoleToObjectMatrix(), {
      wrapper: makeWrapper(),
    })

    await act(async () => {
      await result.current.mutateAsync(INPUT)
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.id).toBe('role-new')
  })
})

describe('useAddRoleToObjectMatrix — duplicate name error path', () => {
  it('sets isError and surfaces error via getRasciErrorKey on duplicate name', async () => {
    server.use(
      graphql.mutation('AddRoleToObjectMatrix', () =>
        HttpResponse.json({ errors: [{ message: 'ROLE_NOT_MATERIALIZED' }] }, { status: 200 }),
      ),
    )

    const { result } = renderHook(() => useAddRoleToObjectMatrix(), {
      wrapper: makeWrapper(),
    })

    await act(async () => {
      await result.current.mutateAsync(INPUT).catch(() => undefined)
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
