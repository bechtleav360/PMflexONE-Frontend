import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { toast } from 'sonner'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { graphqlClient } from '@/shared/lib/graphqlClient'

import { useClearGoalParent } from './useClearGoalParent'
import { useClearParentLevelGoal } from './useClearParentLevelGoal'
import { useLinkGoals } from './useLinkGoals'
import { useLinkGoalToRequirement } from './useLinkGoalToRequirement'
import { useSetGoalParent } from './useSetGoalParent'
import { useSetParentLevelGoal } from './useSetParentLevelGoal'
import { useUnlinkGoalFromRequirement } from './useUnlinkGoalFromRequirement'
import { useUnlinkGoals } from './useUnlinkGoals'

vi.mock('@/shared/lib/graphqlClient', () => ({
  graphqlClient: { request: vi.fn() },
}))

vi.mock('sonner', () => ({
  toast: { error: vi.fn() },
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}))

const mockRequest = vi.mocked(graphqlClient.request)

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
  return { Wrapper, queryClient }
}

beforeEach(() => {
  mockRequest.mockReset()
  vi.mocked(toast.error).mockReset()
})

// ---------------------------------------------------------------------------
// useSetGoalParent
// ---------------------------------------------------------------------------

describe('useSetGoalParent', () => {
  it('calls mutationFn with correct args', async () => {
    mockRequest.mockResolvedValue({
      setGoalParent: { id: 'g-1', version: 2, parent: { id: 'g-0' } },
    })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useSetGoalParent('Project', 'proj-1'), { wrapper: Wrapper })

    result.current.mutate({ id: 'g-1', version: 1, parentId: 'g-0' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockRequest).toHaveBeenCalledWith(expect.anything(), {
      goalId: 'g-1',
      parentId: 'g-0',
      version: 1,
    })
  })

  it('invalidates goals query on success', async () => {
    mockRequest.mockResolvedValue({ setGoalParent: { id: 'g-1', version: 2, parent: null } })
    const { Wrapper, queryClient } = makeWrapper()
    const spy = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useSetGoalParent('Project', 'proj-1'), { wrapper: Wrapper })

    result.current.mutate({ id: 'g-1', version: 1, parentId: 'g-0' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    const keys = spy.mock.calls.map((c) => (c[0] as { queryKey: unknown }).queryKey)
    expect(keys.some((k) => Array.isArray(k) && k[0] === 'goals')).toBe(true)
  })

  it('shows cycle toast on cycle error', async () => {
    mockRequest.mockRejectedValue(new Error('This would create a cycle in the goal hierarchy'))
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useSetGoalParent('Project', 'proj-1'), { wrapper: Wrapper })

    result.current.mutate({ id: 'g-1', version: 1, parentId: 'g-2' })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(toast.error).toHaveBeenCalledWith('features.planningObjects.errors.cycleDetected')
  })

  it('does not show cycle toast for non-cycle errors', async () => {
    mockRequest.mockRejectedValue(new Error('Network error'))
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useSetGoalParent('Project', 'proj-1'), { wrapper: Wrapper })

    result.current.mutate({ id: 'g-1', version: 1, parentId: 'g-2' })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(toast.error).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// useClearGoalParent
// ---------------------------------------------------------------------------

describe('useClearGoalParent', () => {
  it('calls mutationFn with correct args', async () => {
    mockRequest.mockResolvedValue({ clearGoalParent: { id: 'g-1', version: 2, parent: null } })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useClearGoalParent('Project', 'proj-1'), {
      wrapper: Wrapper,
    })

    result.current.mutate({ id: 'g-1', version: 1 })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockRequest).toHaveBeenCalledWith(expect.anything(), { goalId: 'g-1', version: 1 })
  })

  it('invalidates goals query on success', async () => {
    mockRequest.mockResolvedValue({ clearGoalParent: { id: 'g-1', version: 2, parent: null } })
    const { Wrapper, queryClient } = makeWrapper()
    const spy = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useClearGoalParent('Project', 'proj-1'), {
      wrapper: Wrapper,
    })

    result.current.mutate({ id: 'g-1', version: 1 })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    const keys = spy.mock.calls.map((c) => (c[0] as { queryKey: unknown }).queryKey)
    expect(keys.some((k) => Array.isArray(k) && k[0] === 'goals')).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// useSetParentLevelGoal
// ---------------------------------------------------------------------------

describe('useSetParentLevelGoal', () => {
  it('calls mutationFn with correct args', async () => {
    mockRequest.mockResolvedValue({
      setParentLevelGoal: {
        id: 'g-1',
        version: 2,
        parentLevelGoal: { id: 'pg-1', name: 'Program Goal' },
        parentLevelGoalName: 'Program Goal',
      },
    })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useSetParentLevelGoal('Project', 'proj-1'), {
      wrapper: Wrapper,
    })

    result.current.mutate({ id: 'g-1', version: 1, parentLevelGoalId: 'pg-1' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockRequest).toHaveBeenCalledWith(expect.anything(), {
      goalId: 'g-1',
      parentLevelGoalId: 'pg-1',
      version: 1,
    })
  })

  it('invalidates both GOAL_QUERY_KEY and GOALS_QUERY_KEY on success', async () => {
    mockRequest.mockResolvedValue({
      setParentLevelGoal: {
        id: 'g-1',
        version: 2,
        parentLevelGoal: null,
        parentLevelGoalName: null,
      },
    })
    const { Wrapper, queryClient } = makeWrapper()
    const spy = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useSetParentLevelGoal('Project', 'proj-1'), {
      wrapper: Wrapper,
    })

    result.current.mutate({ id: 'g-1', version: 1, parentLevelGoalId: 'pg-1' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    const keys = spy.mock.calls.map((c) => (c[0] as { queryKey: unknown }).queryKey)
    expect(keys.some((k) => Array.isArray(k) && k[0] === 'goal')).toBe(true)
    expect(keys.some((k) => Array.isArray(k) && k[0] === 'goals')).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// useClearParentLevelGoal
// ---------------------------------------------------------------------------

describe('useClearParentLevelGoal', () => {
  it('invalidates both GOAL_QUERY_KEY and GOALS_QUERY_KEY on success', async () => {
    mockRequest.mockResolvedValue({
      clearParentLevelGoal: {
        id: 'g-1',
        version: 2,
        parentLevelGoal: null,
        parentLevelGoalName: null,
      },
    })
    const { Wrapper, queryClient } = makeWrapper()
    const spy = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useClearParentLevelGoal('Project', 'proj-1'), {
      wrapper: Wrapper,
    })

    result.current.mutate({ id: 'g-1', version: 1 })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    const keys = spy.mock.calls.map((c) => (c[0] as { queryKey: unknown }).queryKey)
    expect(keys.some((k) => Array.isArray(k) && k[0] === 'goal')).toBe(true)
    expect(keys.some((k) => Array.isArray(k) && k[0] === 'goals')).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// useLinkGoals
// ---------------------------------------------------------------------------

describe('useLinkGoals', () => {
  it('calls mutationFn with correct args', async () => {
    mockRequest.mockResolvedValue({ linkGoals: true })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useLinkGoals(), { wrapper: Wrapper })

    result.current.mutate({ fromId: 'g-1', toId: 'g-2' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockRequest).toHaveBeenCalledWith(expect.anything(), {
      goalId: 'g-1',
      relatedGoalId: 'g-2',
    })
  })

  it('invalidates detail keys for both goals on success', async () => {
    mockRequest.mockResolvedValue({ linkGoals: true })
    const { Wrapper, queryClient } = makeWrapper()
    const spy = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useLinkGoals(), { wrapper: Wrapper })

    result.current.mutate({ fromId: 'g-1', toId: 'g-2' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    const keys = spy.mock.calls.map((c) => (c[0] as { queryKey: unknown }).queryKey)
    expect(keys.some((k) => Array.isArray(k) && k[1] === 'g-1')).toBe(true)
    expect(keys.some((k) => Array.isArray(k) && k[1] === 'g-2')).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// useUnlinkGoals
// ---------------------------------------------------------------------------

describe('useUnlinkGoals', () => {
  it('calls mutationFn with correct args', async () => {
    mockRequest.mockResolvedValue({ unlinkGoals: true })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useUnlinkGoals(), { wrapper: Wrapper })

    result.current.mutate({ fromId: 'g-1', toId: 'g-2' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockRequest).toHaveBeenCalledWith(expect.anything(), {
      goalId: 'g-1',
      relatedGoalId: 'g-2',
    })
  })

  it('invalidates detail keys for both goals on success', async () => {
    mockRequest.mockResolvedValue({ unlinkGoals: true })
    const { Wrapper, queryClient } = makeWrapper()
    const spy = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useUnlinkGoals(), { wrapper: Wrapper })

    result.current.mutate({ fromId: 'g-1', toId: 'g-2' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    const keys = spy.mock.calls.map((c) => (c[0] as { queryKey: unknown }).queryKey)
    expect(keys.some((k) => Array.isArray(k) && k[1] === 'g-1')).toBe(true)
    expect(keys.some((k) => Array.isArray(k) && k[1] === 'g-2')).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// useLinkGoalToRequirement
// ---------------------------------------------------------------------------

describe('useLinkGoalToRequirement', () => {
  it('calls mutationFn with correct args', async () => {
    mockRequest.mockResolvedValue({ linkGoalToRequirement: true })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useLinkGoalToRequirement(), { wrapper: Wrapper })

    result.current.mutate({ goalId: 'g-1', requirementId: 'r-1' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockRequest).toHaveBeenCalledWith(expect.anything(), {
      goalId: 'g-1',
      requirementId: 'r-1',
    })
  })

  it('invalidates goal and requirement detail keys on success', async () => {
    mockRequest.mockResolvedValue({ linkGoalToRequirement: true })
    const { Wrapper, queryClient } = makeWrapper()
    const spy = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useLinkGoalToRequirement(), { wrapper: Wrapper })

    result.current.mutate({ goalId: 'g-1', requirementId: 'r-1' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    const keys = spy.mock.calls.map((c) => (c[0] as { queryKey: unknown }).queryKey)
    expect(keys.some((k) => Array.isArray(k) && k[0] === 'goal' && k[1] === 'g-1')).toBe(true)
    expect(keys.some((k) => Array.isArray(k) && k[0] === 'requirement' && k[1] === 'r-1')).toBe(
      true,
    )
  })
})

// ---------------------------------------------------------------------------
// useUnlinkGoalFromRequirement
// ---------------------------------------------------------------------------

describe('useUnlinkGoalFromRequirement', () => {
  it('calls mutationFn with correct args', async () => {
    mockRequest.mockResolvedValue({ unlinkGoalFromRequirement: true })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useUnlinkGoalFromRequirement(), { wrapper: Wrapper })

    result.current.mutate({ goalId: 'g-1', requirementId: 'r-1' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockRequest).toHaveBeenCalledWith(expect.anything(), {
      goalId: 'g-1',
      requirementId: 'r-1',
    })
  })

  it('invalidates goal and requirement detail keys on success', async () => {
    mockRequest.mockResolvedValue({ unlinkGoalFromRequirement: true })
    const { Wrapper, queryClient } = makeWrapper()
    const spy = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useUnlinkGoalFromRequirement(), { wrapper: Wrapper })

    result.current.mutate({ goalId: 'g-1', requirementId: 'r-1' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    const keys = spy.mock.calls.map((c) => (c[0] as { queryKey: unknown }).queryKey)
    expect(keys.some((k) => Array.isArray(k) && k[0] === 'goal' && k[1] === 'g-1')).toBe(true)
    expect(keys.some((k) => Array.isArray(k) && k[0] === 'requirement' && k[1] === 'r-1')).toBe(
      true,
    )
  })
})
