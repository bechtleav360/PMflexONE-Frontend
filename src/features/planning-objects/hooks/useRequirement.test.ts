import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import { useRequirement } from './useRequirement'

vi.mock('@/shared/lib/graphqlClient', () => ({
  graphqlClient: { request: vi.fn() },
}))

const mockDetail = {
  id: 'req-1',
  version: 1,
  sortOrder: 0,
  name: 'Req 1',
  requirementScope: 'IN_SCOPE',
  source: 'INTERNAL',
  estimatedEffortMin: null,
  estimatedEffortMax: null,
  type: 'FUNCTIONAL',
  priority: 'MUST_HAVE',
  status: 'NEW',
  description: null,
  acceptanceCriteria: null,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  creator: null,
  updater: null,
  parent: null,
  scope: { id: 'proj-1', scopeType: 'Project' },
  dependencies: [],
  linkedGoals: [],
}

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return createElement(QueryClientProvider, { client: queryClient }, children)
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useRequirement', () => {
  it('is disabled when id is empty', () => {
    const { result } = renderHook(() => useRequirement(''), { wrapper })
    expect(result.current.fetchStatus).toBe('idle')
  })

  it('fetches and returns requirement detail', async () => {
    vi.mocked(graphqlClient.request).mockResolvedValue({ requirement: mockDetail })
    const { result } = renderHook(() => useRequirement('req-1'), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.id).toBe('req-1')
  })
})
