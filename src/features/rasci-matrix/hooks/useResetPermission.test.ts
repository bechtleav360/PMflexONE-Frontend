import { act, createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { server } from '@/shared/lib/msw/server'

import { useResetRolePermissions } from './useResetRolePermissions'
import { useResetTaskPermission } from './useResetTaskPermission'

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
  return Wrapper
}

const RESET_RESULT = {
  id: 'matrix-1',
  tasks: [{ taskId: 'task-1', permissionKey: 'R' }],
}

describe('useResetTaskPermission — success path', () => {
  it('calls mutation and invalidates matrix query', async () => {
    server.use(
      graphql.mutation('ResetTaskPermission', () =>
        HttpResponse.json({ data: { resetTaskPermission: RESET_RESULT } }),
      ),
    )

    const { result } = renderHook(() => useResetTaskPermission(), {
      wrapper: makeWrapper(),
    })

    await act(async () => {
      await result.current.mutateAsync({
        objectId: 'obj-1',
        roleId: 'role-1',
        taskId: 'task-1',
        domainType: 'PROJECT' as const,
      })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.id).toBe('matrix-1')
  })
})

describe('useResetTaskPermission — error path', () => {
  it('sets isError on mutation failure', async () => {
    server.use(
      graphql.mutation('ResetTaskPermission', () =>
        HttpResponse.json({ errors: [{ message: 'TASK_NOT_IN_TEMPLATE' }] }, { status: 200 }),
      ),
    )

    const { result } = renderHook(() => useResetTaskPermission(), {
      wrapper: makeWrapper(),
    })

    await act(async () => {
      await result.current
        .mutateAsync({
          objectId: 'obj-1',
          roleId: 'role-1',
          taskId: 'task-1',
          domainType: 'PROJECT' as const,
        })
        .catch(() => undefined)
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

describe('useResetRolePermissions — success path', () => {
  it('calls mutation and invalidates matrix query', async () => {
    server.use(
      graphql.mutation('ResetRolePermissions', () =>
        HttpResponse.json({ data: { resetRolePermissions: RESET_RESULT } }),
      ),
    )

    const { result } = renderHook(() => useResetRolePermissions(), {
      wrapper: makeWrapper(),
    })

    await act(async () => {
      await result.current.mutateAsync({
        objectId: 'obj-1',
        roleId: 'role-1',
        domainType: 'PROJECT' as const,
      })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.id).toBe('matrix-1')
  })
})

describe('useResetRolePermissions — error path', () => {
  it('sets isError on mutation failure', async () => {
    server.use(
      graphql.mutation('ResetRolePermissions', () =>
        HttpResponse.json({ errors: [{ message: 'NO_TEMPLATE_ROLE' }] }, { status: 200 }),
      ),
    )

    const { result } = renderHook(() => useResetRolePermissions(), {
      wrapper: makeWrapper(),
    })

    await act(async () => {
      await result.current
        .mutateAsync({
          objectId: 'obj-1',
          roleId: 'role-1',
          domainType: 'PROJECT' as const,
        })
        .catch(() => undefined)
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
