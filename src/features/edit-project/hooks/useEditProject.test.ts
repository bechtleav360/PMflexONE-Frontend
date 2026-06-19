import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { toast } from 'sonner'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { server } from '@/shared/lib/msw/server'

import { useEditProjectStore } from '../store/editProjectStore'
import { updateWithToast, useEditProject } from './useEditProject'

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

const mockProject = {
  id: 'e2e00000-0000-0000-0000-000000000001',
  name: 'Basisinfrastruktur',
  description: null,
  status: 'active',
  sizeClassification: 'large' as const,
  governanceStatus: null,
  startDate: '2025-01-01',
  endDate: '2027-12-31',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  version: 1,
}

const validFormValues = {
  name: 'Updated Name',
  sizeClassification: 'medium' as const,
  startDate: new Date('2026-01-01'),
  endDate: new Date('2026-12-31'),
  description: '',
}

beforeEach(() => {
  useEditProjectStore.setState({ open: true, payload: mockProject })
})

describe('useEditProject - mutation states', () => {
  it('closes the modal on success', async () => {
    const { result } = renderHook(() => useEditProject(), { wrapper: makeWrapper() })

    await act(async () => {
      await result.current.mutateAsync(validFormValues)
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(useEditProjectStore.getState().open).toBe(false)
  })

  it('is in pending state while the mutation is in-flight', async () => {
    server.use(graphql.mutation('UpdateProject', () => new Promise(() => undefined)))

    const { result } = renderHook(() => useEditProject(), { wrapper: makeWrapper() })

    act(() => {
      result.current.mutate(validFormValues)
    })

    await waitFor(() => expect(result.current.isPending).toBe(true))
  })

  it('enters error state on server error', async () => {
    server.use(
      graphql.mutation('UpdateProject', () =>
        HttpResponse.json({ errors: [{ message: 'Conflict' }] }, { status: 200 }),
      ),
    )

    const { result } = renderHook(() => useEditProject(), { wrapper: makeWrapper() })

    await act(async () => {
      await result.current.mutateAsync(validFormValues).catch(() => undefined)
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it('does not close the modal on error', async () => {
    server.use(
      graphql.mutation('UpdateProject', () =>
        HttpResponse.json({ errors: [{ message: 'Server error' }] }, { status: 200 }),
      ),
    )

    const { result } = renderHook(() => useEditProject(), { wrapper: makeWrapper() })

    await act(async () => {
      await result.current.mutateAsync(validFormValues).catch(() => undefined)
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(useEditProjectStore.getState().open).toBe(true)
  })
})

describe('useEditProject - mutation payload', () => {
  it('includes description in the mutation payload when provided', async () => {
    let capturedInput: Record<string, unknown> | undefined
    server.use(
      graphql.mutation('UpdateProject', ({ variables }) => {
        capturedInput = (variables as { id: string; input: Record<string, unknown> }).input
        return HttpResponse.json({
          data: {
            updateProject: {
              ...mockProject,
              description: 'A new description',
              version: 2,
            },
          },
        })
      }),
    )

    const { result } = renderHook(() => useEditProject(), { wrapper: makeWrapper() })

    await act(async () => {
      await result.current.mutateAsync({ ...validFormValues, description: 'A new description' })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(capturedInput?.description).toBe('A new description')
  })

  it('omits description from the payload when empty', async () => {
    let capturedInput: Record<string, unknown> | undefined
    server.use(
      graphql.mutation('UpdateProject', ({ variables }) => {
        capturedInput = (variables as { id: string; input: Record<string, unknown> }).input
        return HttpResponse.json({ data: { updateProject: { ...mockProject, version: 2 } } })
      }),
    )

    const { result } = renderHook(() => useEditProject(), { wrapper: makeWrapper() })

    await act(async () => {
      await result.current.mutateAsync({ ...validFormValues, description: '' })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(capturedInput).not.toHaveProperty('description')
  })
})

describe('updateWithToast', () => {
  it('fires a promise toast with the provided messages', () => {
    const mutateAsync = vi.fn().mockResolvedValue({})

    updateWithToast(mutateAsync, validFormValues, {
      loading: 'Saving…',
      success: 'Project saved!',
      error: 'Something went wrong',
    })

    expect(vi.mocked(toast.promise)).toHaveBeenCalledWith(
      expect.any(Promise),
      expect.objectContaining({
        loading: 'Saving…',
        success: 'Project saved!',
        error: 'Something went wrong',
      }),
    )
  })

  it('accepts an error formatter function', () => {
    const mutateAsync = vi.fn().mockResolvedValue({})
    const errorFn = (err: unknown) => `Error: ${String(err)}`

    updateWithToast(mutateAsync, validFormValues, {
      loading: 'Saving…',
      success: 'Done',
      error: errorFn,
    })

    expect(vi.mocked(toast.promise)).toHaveBeenCalledWith(
      expect.any(Promise),
      expect.objectContaining({ error: errorFn }),
    )
  })
})
