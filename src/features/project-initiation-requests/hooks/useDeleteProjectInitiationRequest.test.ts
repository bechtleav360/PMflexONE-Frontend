import { act, createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { toast } from 'sonner'
import { describe, expect, it, vi } from 'vitest'

import { server } from '@/shared/lib/msw/server'

import {
  deletePIRWithToast,
  useDeleteProjectInitiationRequest,
} from './useDeleteProjectInitiationRequest'

vi.mock('sonner', () => ({
  toast: { promise: vi.fn() },
}))

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
  return Wrapper
}

describe('useDeleteProjectInitiationRequest', () => {
  it('deletes a PIR successfully', async () => {
    server.use(
      graphql.mutation('DeleteProjectInitiationRequest', () =>
        HttpResponse.json({ data: { deleteProjectInitiationRequest: true } }),
      ),
    )

    const { result } = renderHook(() => useDeleteProjectInitiationRequest(), {
      wrapper: makeWrapper(),
    })

    await act(async () => {
      await result.current.mutateAsync('pir-1')
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })

  it('sets isError on mutation failure', async () => {
    server.use(
      graphql.mutation('DeleteProjectInitiationRequest', () =>
        HttpResponse.json({ errors: [{ message: 'Not found' }] }, { status: 200 }),
      ),
    )

    const { result } = renderHook(() => useDeleteProjectInitiationRequest(), {
      wrapper: makeWrapper(),
    })

    await act(async () => {
      await result.current.mutateAsync('pir-x').catch(() => undefined)
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

describe('deletePIRWithToast', () => {
  it('calls toast.promise with the mutateAsync promise and provided messages', () => {
    const mutateAsync = vi.fn().mockResolvedValue(undefined)
    const messages = { loading: 'Deleting…', success: 'Deleted', error: 'Error' }

    deletePIRWithToast(
      mutateAsync as ReturnType<typeof useDeleteProjectInitiationRequest>['mutateAsync'],
      'pir-1',
      messages,
    )

    expect(mutateAsync).toHaveBeenCalledWith('pir-1')
    expect(toast.promise).toHaveBeenCalledWith(expect.any(Promise), {
      loading: 'Deleting…',
      success: 'Deleted',
      error: 'Error',
    })
  })
})
