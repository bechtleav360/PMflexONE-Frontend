import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type * as WorkItemEntities from '@/entities/work-item'
import { i18n } from '@/shared/lib/i18n'

import { LabelManager } from './LabelManager'

const mockCreateLabel = vi
  .fn()
  .mockResolvedValue({ id: 'label-new', version: 1, name: 'New Label', color: '#FF0000FF' })
const mockUpdateLabel = vi.fn().mockResolvedValue({ id: 'label-1', version: 2, name: 'Updated' })
const mockDeleteLabel = vi.fn().mockResolvedValue(true)

vi.mock('../../hooks/useCreateLabel', () => ({
  useCreateLabel: () => ({ mutateAsync: mockCreateLabel, isPending: false }),
}))

vi.mock('../../hooks/useUpdateLabel', () => ({
  useUpdateLabel: () => ({ mutateAsync: mockUpdateLabel, isPending: false }),
}))

vi.mock('../../hooks/useDeleteLabel', () => ({
  useDeleteLabel: () => ({ mutateAsync: mockDeleteLabel, isPending: false }),
}))

vi.mock('../../store/labelDialogStores', () => ({
  useCreateLabelDialogStore: Object.assign(
    (selector: (s: { open: boolean; openModal: () => void; closeModal: () => void }) => unknown) =>
      selector({ open: false, openModal: vi.fn(), closeModal: vi.fn() }),
    {
      getState: () => ({ open: false, openModal: vi.fn(), closeModal: vi.fn() }),
      setState: vi.fn(),
    },
  ),
  useEditLabelDialogStore: Object.assign(
    (
      selector: (s: {
        open: boolean
        payload: null
        openModal: (p: { labelId: string }) => void
        closeModal: () => void
      }) => unknown,
    ) => selector({ open: false, payload: null, openModal: vi.fn(), closeModal: vi.fn() }),
    {
      getState: () => ({ open: false, payload: null, openModal: vi.fn(), closeModal: vi.fn() }),
      setState: vi.fn(),
    },
  ),
}))

const fixtureLabels = [
  {
    id: 'label-1',
    version: 1,
    name: 'Blocker',
    color: '#FFFF0000',
    createdAt: '',
    updatedAt: '',
    metadata: null,
    creator: null,
    updater: null,
    scope: null,
  },
  {
    id: 'label-2',
    version: 1,
    name: 'Enhancement',
    color: '#FF0077CC',
    createdAt: '',
    updatedAt: '',
    metadata: null,
    creator: null,
    updater: null,
    scope: null,
  },
]

vi.mock('@/entities/work-item', async (importOriginal) => {
  const actual = await importOriginal<typeof WorkItemEntities>()
  return {
    ...actual,
    useLabels: () => ({ data: fixtureLabels, isLoading: false }),
  }
})

function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: qc }, children)
  }
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

beforeEach(() => {
  mockCreateLabel.mockClear()
  mockUpdateLabel.mockClear()
  mockDeleteLabel.mockClear()
})

describe('LabelManager', () => {
  it('renders label names', () => {
    const Wrapper = makeWrapper()
    render(
      createElement(
        Wrapper,
        null,
        createElement(LabelManager, { scopeType: 'Project', scopeId: 'proj-1' }),
      ),
    )
    expect(screen.getByText('Blocker')).toBeInTheDocument()
    expect(screen.getByText('Enhancement')).toBeInTheDocument()
  })

  it('renders a create label button', () => {
    const Wrapper = makeWrapper()
    render(
      createElement(
        Wrapper,
        null,
        createElement(LabelManager, { scopeType: 'Project', scopeId: 'proj-1' }),
      ),
    )
    expect(screen.getByRole('button', { name: /create|new label/i })).toBeInTheDocument()
  })

  it('calls deleteLabel with correct id when delete is clicked', async () => {
    const Wrapper = makeWrapper()
    render(
      createElement(
        Wrapper,
        null,
        createElement(LabelManager, { scopeType: 'Project', scopeId: 'proj-1' }),
      ),
    )
    const user = userEvent.setup()
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
    await user.click(deleteButtons[0])

    await waitFor(() => {
      expect(mockDeleteLabel).toHaveBeenCalledOnce()
    })

    const callArg = mockDeleteLabel.mock.calls[0][0] as { id: string; version: number }
    expect(callArg.id).toBe('label-1')
  })
})
