import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { toast } from 'sonner'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { server } from '@/shared/lib/msw/server'
import { proj1 } from '@/shared/test-utils/fixtures'

import { useDeleteProjectStore } from '../store/deleteProjectStore'
import { deleteWithToast, useDeleteProject } from './useDeleteProject'

vi.mock('sonner', () => ({
  toast: { promise: vi.fn((_p: Promise<unknown>, opts: Record<string, unknown>) => opts) },
}))

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
  return Wrapper
}

beforeEach(() => {
  useDeleteProjectStore.setState({ open: false, payload: null })
})

describe('useDeleteProject', () => {
  it('closes the modal on success', async () => {
    useDeleteProjectStore.setState({ open: true, payload: proj1 })

    const { result } = renderHook(() => useDeleteProject(), { wrapper: makeWrapper() })

    await act(async () => {
      await result.current.mutateAsync(proj1)
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(useDeleteProjectStore.getState().open).toBe(false)
  })

  it('is in pending state while the mutation is in-flight', async () => {
    server.use(graphql.mutation('DeleteProject', () => new Promise(() => undefined)))

    const { result } = renderHook(() => useDeleteProject(), { wrapper: makeWrapper() })

    act(() => {
      result.current.mutate(proj1)
    })

    await waitFor(() => expect(result.current.isPending).toBe(true))
  })

  it('enters error state on server error', async () => {
    server.use(
      graphql.mutation('DeleteProject', () =>
        HttpResponse.json({ errors: [{ message: 'Not found' }] }, { status: 200 }),
      ),
    )

    const { result } = renderHook(() => useDeleteProject(), { wrapper: makeWrapper() })

    await act(async () => {
      await result.current.mutateAsync('proj-x').catch(() => undefined)
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

describe('deleteWithToast', () => {
  it('fires a promise toast with the provided messages', () => {
    const mutateAsync = vi.fn().mockResolvedValue(undefined)

    deleteWithToast(mutateAsync, proj1, {
      loading: 'Deleting…',
      success: 'Project deleted!',
      error: 'Something went wrong',
    })

    expect(vi.mocked(toast.promise)).toHaveBeenCalledWith(
      expect.any(Promise),
      expect.objectContaining({
        loading: 'Deleting…',
        success: 'Project deleted!',
        error: 'Something went wrong',
      }),
    )
  })

  it('accepts an error formatter function', () => {
    const mutateAsync = vi.fn().mockResolvedValue(undefined)
    const errorFn = (err: unknown) => `Error: ${String(err)}`

    deleteWithToast(mutateAsync, proj1, {
      loading: 'Deleting…',
      success: 'Done',
      error: errorFn,
    })

    expect(vi.mocked(toast.promise)).toHaveBeenCalledWith(
      expect.any(Promise),
      expect.objectContaining({ error: errorFn }),
    )
  })
})
