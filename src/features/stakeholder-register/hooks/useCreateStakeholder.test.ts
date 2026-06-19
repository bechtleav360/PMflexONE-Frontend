import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'

import { server } from '@/shared/lib/msw/server'

import { useCreateStakeholder } from './useCreateStakeholder'

vi.mock('sonner', () => ({
  toast: { promise: vi.fn() },
}))

function makeWrapper(queryClient?: QueryClient) {
  const client =
    queryClient ??
    new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client }, children)
  }
  return Wrapper
}

const createdEntry = {
  id: 'entry-1',
  version: 1,
  name: 'Alice',
  role: 'PM',
  contactGroup: 'INTERNAL',
  email: null,
  email2: null,
  email3: null,
  phone: null,
  phone2: null,
  phone3: null,
  preferredCommunicationType: null,
  matrixPosition: null,
  typeOfAffectedness: null,
  conflictPotential: null,
  expectations: null,
  responsible: null,
  inclusionMeasures: null,
  linkedMember: null,
  behaviouralStrategy: null,
  scope: { id: 'proj-1', name: 'Project proj-1', scopeType: 'Project' },
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
}

const validInput = {
  scopeType: 'Project' as const,
  scopeId: 'proj-1',
  name: 'Alice',
  role: 'PM',
  contactGroup: 'INTERNAL' as const,
}

describe('useCreateStakeholder', () => {
  it('resolves on success', async () => {
    server.use(
      graphql.mutation('CreateStakeholderEntry', () =>
        HttpResponse.json({ data: { createStakeholderEntry: createdEntry } }),
      ),
    )

    const { result } = renderHook(() => useCreateStakeholder(), { wrapper: makeWrapper() })

    await act(async () => {
      await result.current.mutateAsync(validInput)
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })

  it('enters error state on GraphQL error', async () => {
    server.use(
      graphql.mutation('CreateStakeholderEntry', () =>
        HttpResponse.json({ errors: [{ message: 'Forbidden' }] }, { status: 200 }),
      ),
    )

    const { result } = renderHook(() => useCreateStakeholder(), { wrapper: makeWrapper() })

    await act(async () => {
      await result.current.mutateAsync(validInput).catch(() => undefined)
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it('invalidates the stakeholder register query on success', async () => {
    server.use(
      graphql.mutation('CreateStakeholderEntry', () =>
        HttpResponse.json({ data: { createStakeholderEntry: createdEntry } }),
      ),
    )

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useCreateStakeholder(), {
      wrapper: makeWrapper(queryClient),
    })

    await act(async () => {
      await result.current.mutateAsync(validInput)
    })

    await waitFor(() =>
      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: expect.arrayContaining(['stakeholderEntries']),
        }),
      ),
    )
  })
})
