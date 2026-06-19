import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import { useCreateRequirement } from './useCreateRequirement'

vi.mock('@/shared/lib/graphqlClient', () => ({
  graphqlClient: { request: vi.fn() },
}))

const mockRequirement = {
  id: 'req-new',
  version: 1,
  name: 'New Req',
  requirementScope: 'IN_SCOPE',
  source: 'INTERNAL',
  estimatedEffortMin: null,
  estimatedEffortMax: null,
  type: 'FUNCTIONAL',
  priority: 'MUST_HAVE',
  status: 'NEW',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  creator: null,
  parent: null,
}

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return createElement(QueryClientProvider, { client: queryClient }, children)
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useCreateRequirement', () => {
  it('calls mutation and returns created requirement', async () => {
    vi.mocked(graphqlClient.request).mockResolvedValue({ createRequirement: mockRequirement })
    const { result } = renderHook(() => useCreateRequirement('Project', 'proj-1'), { wrapper })

    let created: { id: string } | undefined
    await act(async () => {
      created = await result.current.mutateAsync({
        name: 'New Req',
        requirementScope: 'IN_SCOPE',
        source: 'INTERNAL',
        type: 'FUNCTIONAL',
        priority: 'MUST_HAVE',
        status: 'NEW',
      })
    })

    expect(graphqlClient.request).toHaveBeenCalledOnce()
    expect(created?.id).toBe('req-new')
  })
})
