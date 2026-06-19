/* eslint-disable max-lines-per-function -- test describe block; line count scales with number of test cases, not logic complexity */
import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { EscalatedEntryMeasuresList } from './EscalatedEntryMeasuresList'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}))

const mockCreateMutate = vi.fn()
const mockDeleteMutate = vi.fn()

vi.mock('../../hooks/useCreateEscalationMeasure', () => ({
  useCreateEscalationMeasure: () => ({
    mutate: mockCreateMutate,
    isPending: false,
  }),
}))

vi.mock('../../hooks/useDeleteEscalationMeasure', () => ({
  useDeleteEscalationMeasure: () => ({
    mutate: mockDeleteMutate,
    isPending: false,
  }),
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

const measures = [
  {
    id: 'm-3',
    version: 1,
    content: 'Third action',
    position: 3,
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    creator: null,
  },
  {
    id: 'm-1',
    version: 1,
    content: 'First action',
    position: 1,
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    creator: null,
  },
  {
    id: 'm-2',
    version: 1,
    content: 'Second action',
    position: 2,
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    creator: null,
  },
]

describe('EscalatedEntryMeasuresList', () => {
  beforeEach(() => {
    mockCreateMutate.mockReset()
    mockDeleteMutate.mockReset()
  })

  it('renders items in ascending position order', () => {
    render(createElement(EscalatedEntryMeasuresList, { escalatedEntryId: 'ee-1', measures }), {
      wrapper: makeWrapper(),
    })
    const items = screen.getAllByRole('listitem')
    expect(items[0]).toHaveTextContent('First action')
    expect(items[1]).toHaveTextContent('Second action')
    expect(items[2]).toHaveTextContent('Third action')
  })

  it('renders empty state when measures is empty', () => {
    render(createElement(EscalatedEntryMeasuresList, { escalatedEntryId: 'ee-1', measures: [] }), {
      wrapper: makeWrapper(),
    })
    expect(screen.getByText('features.escalatedEntries.measures.empty')).toBeDefined()
  })

  it('renders add input with placeholder from t()', () => {
    render(createElement(EscalatedEntryMeasuresList, { escalatedEntryId: 'ee-1', measures }), {
      wrapper: makeWrapper(),
    })
    expect(
      screen.getByPlaceholderText('features.escalatedEntries.measures.addPlaceholder'),
    ).toBeDefined()
  })

  it('clears add input after form submission', async () => {
    mockCreateMutate.mockImplementation((_input: unknown, opts: { onSuccess?: () => void }) => {
      opts?.onSuccess?.()
    })

    const user = userEvent.setup()
    render(createElement(EscalatedEntryMeasuresList, { escalatedEntryId: 'ee-1', measures }), {
      wrapper: makeWrapper(),
    })

    const input = screen.getByPlaceholderText('features.escalatedEntries.measures.addPlaceholder')
    await user.type(input, 'New action item')
    await user.click(screen.getByRole('button', { name: 'features.escalatedEntries.measures.add' }))

    await waitFor(() => {
      expect((input as HTMLInputElement).value).toBe('')
    })
  })

  it('calls createMutate with escalatedEntryId and content', async () => {
    const user = userEvent.setup()
    render(createElement(EscalatedEntryMeasuresList, { escalatedEntryId: 'ee-1', measures }), {
      wrapper: makeWrapper(),
    })

    const input = screen.getByPlaceholderText('features.escalatedEntries.measures.addPlaceholder')
    await user.type(input, 'New action item')
    await user.click(screen.getByRole('button', { name: 'features.escalatedEntries.measures.add' }))

    expect(mockCreateMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        escalatedEntryId: 'ee-1',
        content: 'New action item',
      }),
      expect.anything(),
    )
  })

  it('calls deleteMutate with measure id when remove button clicked', async () => {
    const user = userEvent.setup()
    render(
      createElement(EscalatedEntryMeasuresList, {
        escalatedEntryId: 'ee-1',
        measures: [measures[1]],
      }),
      { wrapper: makeWrapper() },
    )

    await user.click(
      screen.getByRole('button', { name: 'features.escalatedEntries.measures.remove' }),
    )

    expect(mockDeleteMutate).toHaveBeenCalledWith('m-1')
  })

  it('does not submit when input is empty', async () => {
    const user = userEvent.setup()
    render(createElement(EscalatedEntryMeasuresList, { escalatedEntryId: 'ee-1', measures }), {
      wrapper: makeWrapper(),
    })

    await user.click(screen.getByRole('button', { name: 'features.escalatedEntries.measures.add' }))

    expect(mockCreateMutate).not.toHaveBeenCalled()
  })

  it('renders remove button label via t()', () => {
    render(
      createElement(EscalatedEntryMeasuresList, {
        escalatedEntryId: 'ee-1',
        measures: [measures[0]],
      }),
      { wrapper: makeWrapper() },
    )
    expect(
      screen.getByRole('button', { name: 'features.escalatedEntries.measures.remove' }),
    ).toBeDefined()
  })
})
