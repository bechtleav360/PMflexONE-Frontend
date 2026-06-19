import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import { REQUIREMENTS_QUERY_KEY } from '../api/requirementApi'
import { useRequirements } from './useRequirements'

vi.mock('@/shared/lib/graphqlClient', () => ({
  graphqlClient: { request: vi.fn() },
}))

const mockRequirement = {
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
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  creator: null,
  parent: null,
  scope: { id: 'proj-1', scopeType: 'Project' },
}

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return createElement(QueryClientProvider, { client: queryClient }, children)
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useRequirements', () => {
  it('returns parsed requirements list', async () => {
    vi.mocked(graphqlClient.request).mockResolvedValue({ requirements: [mockRequirement] })
    const { result } = renderHook(() => useRequirements('Project', 'proj-1'), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(1)
    expect(result.current.data![0].id).toBe('req-1')
  })

  it('uses correct query key', () => {
    expect(REQUIREMENTS_QUERY_KEY('Project', 'proj-1')).toEqual([
      'requirements',
      'Project',
      'proj-1',
    ])
  })
})
