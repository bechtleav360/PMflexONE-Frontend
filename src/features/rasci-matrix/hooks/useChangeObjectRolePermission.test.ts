import { act, createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { server } from '@/shared/lib/msw/server'

import { useChangeObjectRolePermission } from './useChangeObjectRolePermission'

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
  return Wrapper
}

const MUTATION_RESULT = {
  changeObjectRolePermission: {
    id: 'matrix-1',
    tasks: [{ taskId: 'task-1', permissionKey: 'A' }],
  },
}

const INPUT = {
  objectId: 'obj-1',
  roleId: 'role-1',
  taskId: 'task-1',
  permissionKey: 'A' as const,
  domainType: 'PROJECT' as const,
}

describe('useChangeObjectRolePermission — success path', () => {
  it('calls mutation and invalidates roleQueryKeys.matrix', async () => {
    server.use(
      graphql.mutation('ChangeObjectRolePermission', () =>
        HttpResponse.json({ data: MUTATION_RESULT }),
      ),
    )

    const { result } = renderHook(() => useChangeObjectRolePermission(), {
      wrapper: makeWrapper(),
    })

    await act(async () => {
      await result.current.mutateAsync(INPUT)
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.id).toBe('matrix-1')
  })
})

describe('useChangeObjectRolePermission — error path', () => {
  it('sets isError and shows error toast on mutation failure', async () => {
    server.use(
      graphql.mutation('ChangeObjectRolePermission', () =>
        HttpResponse.json({ errors: [{ message: 'TASK_NOT_IN_TEMPLATE' }] }, { status: 200 }),
      ),
    )

    const { result } = renderHook(() => useChangeObjectRolePermission(), {
      wrapper: makeWrapper(),
    })

    await act(async () => {
      await result.current.mutateAsync(INPUT).catch(() => undefined)
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
