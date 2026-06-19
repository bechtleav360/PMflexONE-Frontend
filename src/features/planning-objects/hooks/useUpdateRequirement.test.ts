import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import { useUpdateRequirement } from './useUpdateRequirement'

vi.mock('@/shared/lib/graphqlClient', () => ({
  graphqlClient: { request: vi.fn() },
}))

const mockRequirement = {
  id: 'req-1',
  version: 2,
  name: 'Updated Req',
  requirementScope: 'IN_SCOPE',
  source: 'INTERNAL',
  estimatedEffortMin: null,
  estimatedEffortMax: null,
  type: 'FUNCTIONAL',
  priority: 'MUST_HAVE',
  status: 'NEW',
  updatedAt: '2024-01-02T00:00:00Z',
  createdAt: '2024-01-01T00:00:00Z',
  creator: null,
  parent: null,
  scope: { id: 'proj-1', scopeType: 'Project' },
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useUpdateRequirement', () => {
  it('calls mutation and invalidates both query keys', async () => {
    vi.mocked(graphqlClient.request).mockResolvedValue({ updateRequirement: mockRequirement })
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useUpdateRequirement('Project', 'proj-1'), {
      wrapper: ({ children }: { children: React.ReactNode }) =>
        createElement(QueryClientProvider, { client: queryClient }, children),
    })

    await act(async () => {
      await result.current.mutateAsync({ id: 'req-1', input: { version: 1, name: 'Updated Req' } })
    })

    expect(graphqlClient.request).toHaveBeenCalledOnce()
    expect(invalidateSpy).toHaveBeenCalledTimes(2)
  })
})
