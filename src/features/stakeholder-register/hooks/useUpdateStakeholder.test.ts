import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'

import { server } from '@/shared/lib/msw/server'

import { useUpdateStakeholder } from './useUpdateStakeholder'

vi.mock('sonner', () => ({
  toast: { promise: vi.fn(), error: vi.fn() },
}))

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

const updatedEntry = {
  id: 'e1',
  version: 2,
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
  updatedAt: '2026-01-02T00:00:00Z',
}

describe('useUpdateStakeholder', () => {
  it('resolves on success and sends version inside input', async () => {
    let captured: Record<string, unknown> | undefined
    server.use(
      graphql.mutation('UpdateStakeholderEntry', ({ variables }) => {
        captured = variables
        return HttpResponse.json({ data: { updateStakeholderEntry: updatedEntry } })
      }),
    )

    const { result } = renderHook(() => useUpdateStakeholder(), { wrapper: makeWrapper() })

    await act(async () => {
      await result.current.mutateAsync({
        id: 'e1',
        version: 1,
        input: { name: 'Alice', role: 'PM', contactGroup: 'INTERNAL' },
        scopeType: 'Project',
        scopeId: 'proj-1',
      })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(captured).toMatchObject({
      id: 'e1',
      input: { version: 1, name: 'Alice', role: 'PM', contactGroup: 'INTERNAL' },
    })
    expect(captured).not.toHaveProperty('version')
  })

  it('enters error state on GraphQL error', async () => {
    server.use(
      graphql.mutation('UpdateStakeholderEntry', () =>
        HttpResponse.json({ errors: [{ message: 'Forbidden' }] }, { status: 200 }),
      ),
    )

    const { result } = renderHook(() => useUpdateStakeholder(), { wrapper: makeWrapper() })

    await act(async () => {
      await result.current
        .mutateAsync({
          id: 'e1',
          version: 1,
          input: { name: 'Alice', role: 'PM', contactGroup: 'INTERNAL' },
          scopeType: 'Project',
          scopeId: 'proj-1',
        })
        .catch(() => undefined)
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
