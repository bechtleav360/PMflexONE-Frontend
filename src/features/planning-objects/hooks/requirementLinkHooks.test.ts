import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import { useClearRequirementParent } from './useClearRequirementParent'
import { useLinkRequirements } from './useLinkRequirements'
import { useSetRequirementParent } from './useSetRequirementParent'
import { useUnlinkRequirements } from './useUnlinkRequirements'

vi.mock('@/shared/lib/graphqlClient', () => ({
  graphqlClient: { request: vi.fn() },
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

const mockParentResponse = {
  setRequirementParent: { id: 'req-1', version: 2, parent: { id: 'req-parent' } },
}

const mockClearResponse = {
  clearRequirementParent: { id: 'req-1', version: 2, parent: null },
}

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return {
    queryClient,
    wrapper: ({ children }: { children: React.ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children),
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useSetRequirementParent', () => {
  it('calls mutation and invalidates requirements query key', async () => {
    vi.mocked(graphqlClient.request).mockResolvedValue(mockParentResponse)
    const { queryClient, wrapper } = makeWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useSetRequirementParent('Project', 'proj-1'), { wrapper })

    await act(async () => {
      await result.current.mutateAsync({ id: 'req-1', version: 1, parentId: 'req-parent' })
    })

    expect(graphqlClient.request).toHaveBeenCalledOnce()
    expect(invalidateSpy).toHaveBeenCalledOnce()
  })

  it('shows toast on cycle error', async () => {
    const { toast } = await import('sonner')
    const toastErrorSpy = vi.spyOn(toast, 'error').mockImplementation(vi.fn())
    vi.mocked(graphqlClient.request).mockRejectedValue(new Error('cycle detected'))
    const { wrapper } = makeWrapper()

    const { result } = renderHook(() => useSetRequirementParent('Project', 'proj-1'), { wrapper })

    await act(async () => {
      try {
        await result.current.mutateAsync({ id: 'req-1', version: 1, parentId: 'req-parent' })
      } catch {
        // expected
      }
    })

    expect(toastErrorSpy).toHaveBeenCalledOnce()
  })
})

describe('useClearRequirementParent', () => {
  it('calls mutation and invalidates requirements query key', async () => {
    vi.mocked(graphqlClient.request).mockResolvedValue(mockClearResponse)
    const { queryClient, wrapper } = makeWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useClearRequirementParent('Project', 'proj-1'), { wrapper })

    await act(async () => {
      await result.current.mutateAsync({ id: 'req-1', version: 1 })
    })

    expect(graphqlClient.request).toHaveBeenCalledOnce()
    expect(invalidateSpy).toHaveBeenCalledOnce()
  })
})

describe('useLinkRequirements', () => {
  it('calls mutation and invalidates both requirement detail keys', async () => {
    vi.mocked(graphqlClient.request).mockResolvedValue(null)
    const { queryClient, wrapper } = makeWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useLinkRequirements(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync({ fromId: 'req-a', toId: 'req-b', linkType: 'blocks' })
    })

    expect(graphqlClient.request).toHaveBeenCalledOnce()
    expect(invalidateSpy).toHaveBeenCalledTimes(2)
  })
})

describe('useUnlinkRequirements', () => {
  it('calls mutation and refetches both requirement detail keys', async () => {
    vi.mocked(graphqlClient.request).mockResolvedValue(null)
    const { queryClient, wrapper } = makeWrapper()
    const refetchSpy = vi.spyOn(queryClient, 'refetchQueries')

    const { result } = renderHook(() => useUnlinkRequirements(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync({ fromId: 'req-a', toId: 'req-b', linkType: 'blocks' })
    })

    expect(graphqlClient.request).toHaveBeenCalledOnce()
    expect(refetchSpy).toHaveBeenCalledTimes(2)
  })
})
