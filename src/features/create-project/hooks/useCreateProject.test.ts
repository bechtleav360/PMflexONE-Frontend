import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { toast } from 'sonner'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { server } from '@/shared/lib/msw/server'

import { submitWithToast, useCreateProject } from './useCreateProject'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}))

beforeEach(() => {
  mockNavigate.mockClear()
})

// Silence sonner toast in tests
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

const validInput = {
  name: 'My Project',
  sizeClassification: 'small' as const,
  startDate: new Date('2026-04-01'),
  endDate: new Date('2026-12-31'),
  description: '',
}

describe('useCreateProject', () => {
  it('navigates to /projects on success', async () => {
    const { result } = renderHook(() => useCreateProject(), { wrapper: makeWrapper() })

    await act(async () => {
      result.current.mutate(validInput)
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockNavigate).toHaveBeenCalledWith('/projects')
  })

  it('is in pending state while the mutation is in-flight', async () => {
    // Use a never-resolving promise so we can inspect the loading state
    server.use(graphql.mutation('CreateProject', () => new Promise(() => undefined)))

    const { result } = renderHook(() => useCreateProject(), { wrapper: makeWrapper() })

    act(() => {
      result.current.mutate(validInput)
    })

    await waitFor(() => expect(result.current.isPending).toBe(true))
  })

  it('remains idle (not navigating) on server error', async () => {
    server.use(
      graphql.mutation('CreateProject', () =>
        HttpResponse.json({ errors: [{ message: 'Internal Server Error' }] }, { status: 200 }),
      ),
    )

    const { result } = renderHook(() => useCreateProject(), { wrapper: makeWrapper() })

    await act(async () => {
      result.current.mutate(validInput)
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(mockNavigate).not.toHaveBeenCalledWith('/projects')
  })

  it('includes description in the mutation payload when provided', async () => {
    let capturedInput: Record<string, unknown> | undefined
    server.use(
      graphql.mutation('CreateProject', ({ variables }) => {
        capturedInput = (variables as { input: Record<string, unknown> }).input
        return HttpResponse.json({
          data: {
            createProject: {
              id: 'proj-new',
              name: 'My Project',
              description: 'A detailed description',
              status: 'active',
              sizeClassification: 'small',
              governanceStatus: null,
              startDate: '2026-04-01',
              endDate: '2026-12-31',
              createdAt: '2026-04-01T00:00:00Z',
              updatedAt: '2026-04-01T00:00:00Z',
              version: 1,
            },
          },
        })
      }),
    )

    const { result } = renderHook(() => useCreateProject(), { wrapper: makeWrapper() })

    await act(async () => {
      result.current.mutate({ ...validInput, description: 'A detailed description' })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(capturedInput?.description).toBe('A detailed description')
  })
})

describe('submitWithToast', () => {
  it('fires a promise toast with the provided messages', () => {
    const mutateAsync = vi.fn().mockResolvedValue({})

    submitWithToast(mutateAsync, validInput, {
      loading: 'Creating…',
      success: 'Project created!',
      error: 'Something went wrong',
    })

    expect(vi.mocked(toast.promise)).toHaveBeenCalledWith(
      expect.any(Promise),
      expect.objectContaining({
        loading: 'Creating…',
        success: 'Project created!',
        error: 'Something went wrong',
      }),
    )
  })
})
