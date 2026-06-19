import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import { useDeleteRequirement } from './useDeleteRequirement'

vi.mock('@/shared/lib/graphqlClient', () => ({
  graphqlClient: { request: vi.fn() },
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useDeleteRequirement', () => {
  it('calls mutation and invalidates requirements query key', async () => {
    vi.mocked(graphqlClient.request).mockResolvedValue(null)
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useDeleteRequirement('Project', 'proj-1'), {
      wrapper: ({ children }: { children: React.ReactNode }) =>
        createElement(QueryClientProvider, { client: queryClient }, children),
    })

    await act(async () => {
      await result.current.mutateAsync({ id: 'req-1', version: 1, cascade: false })
    })

    expect(graphqlClient.request).toHaveBeenCalledOnce()
    expect(invalidateSpy).toHaveBeenCalledOnce()
  })
})
