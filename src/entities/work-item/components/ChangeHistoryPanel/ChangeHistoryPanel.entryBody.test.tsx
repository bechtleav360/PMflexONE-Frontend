import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import type * as WorkItemEntities from '@/entities/work-item'
import { ChangeHistoryPanel } from '@/entities/work-item'
import { i18n } from '@/shared/lib/i18n'

const mockUseWorkItemChangeHistory = vi.fn()

vi.mock('@/entities/work-item', async (importOriginal) => {
  const actual = await importOriginal<typeof WorkItemEntities>()
  return { ...actual }
})

vi.mock('@/entities/work-item/hooks/useChangeHistory', () => ({
  useWorkItemChangeHistory: (id: string, isOpen: boolean) =>
    mockUseWorkItemChangeHistory(id, isOpen),
  useLabelChangeHistory: () => ({ data: [], isLoading: false, isError: false }),
  useBoardChangeHistory: () => ({ data: [], isLoading: false, isError: false }),
  useBoardColumnChangeHistory: () => ({ data: [], isLoading: false, isError: false }),
  useCommentChangeHistory: () => ({ data: [], isLoading: false, isError: false }),
}))

function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: qc }, children)
  }
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

type TestEntry = {
  id: string
  entityType?: string
  entityId: string
  changedField: string | null
  oldValue: string | null
  newValue: string | null
  changedAt: string
  changedBy: { id: string; firstName: string; lastName: string; mail: string } | null
}

function renderWithHistory(
  entries: TestEntry[],
  extra?: Partial<Parameters<typeof ChangeHistoryPanel>[0]>,
) {
  mockUseWorkItemChangeHistory.mockReturnValue({ data: entries, isLoading: false, isError: false })
  const Wrapper = makeWrapper()
  render(
    createElement(
      Wrapper,
      null,
      createElement(ChangeHistoryPanel, {
        entityType: 'workItem',
        entityId: 'wi-1',
        isOpen: true,
        ...extra,
      }),
    ),
  )
}

describe('ChangeHistoryPanel — entry body — null and label fields', () => {
  it('renders "Created" for an entry with null changedField', () => {
    renderWithHistory([
      {
        id: 'h-3',
        entityType: 'ProjectWorkItem',
        entityId: 'wi-1',
        changedField: null,
        oldValue: null,
        newValue: null,
        changedAt: '2026-01-01T09:00:00Z',
        changedBy: null,
      },
    ])
    expect(screen.getByText('Created')).toBeInTheDocument()
  })

  it('renders "Label added" for a label link entry (newValue not null)', () => {
    renderWithHistory(
      [
        {
          id: 'h-4',
          entityType: 'ProjectWorkItem',
          entityId: 'wi-1',
          changedField: 'label',
          oldValue: null,
          newValue: 'lbl-1',
          changedAt: '2026-01-01T09:00:00Z',
          changedBy: null,
        },
      ],
      { labelMap: { 'lbl-1': 'Bug' } },
    )
    expect(screen.getByText(/label added/i)).toBeInTheDocument()
    expect(screen.getByText('Bug')).toBeInTheDocument()
  })

  it('renders "Label removed" for a label unlink entry (newValue null)', () => {
    renderWithHistory(
      [
        {
          id: 'h-5',
          entityType: 'ProjectWorkItem',
          entityId: 'wi-1',
          changedField: 'label',
          oldValue: 'lbl-2',
          newValue: null,
          changedAt: '2026-01-01T09:00:00Z',
          changedBy: null,
        },
      ],
      { labelMap: { 'lbl-2': 'Feature' } },
    )
    expect(screen.getByText(/label removed/i)).toBeInTheDocument()
    expect(screen.getByText('Feature')).toBeInTheDocument()
  })

  it('renders "Unassigned" for an assignee entry with newValue null', () => {
    renderWithHistory([
      {
        id: 'h-6',
        entityType: 'ProjectWorkItem',
        entityId: 'wi-1',
        changedField: 'assignee',
        oldValue: 'user-1',
        newValue: null,
        changedAt: '2026-01-01T09:00:00Z',
        changedBy: null,
      },
    ])
    expect(screen.getByText(/unassigned/i)).toBeInTheDocument()
  })
})

describe('ChangeHistoryPanel — entry body — maps and heading', () => {
  it('resolves assignee UUID to name using assigneeMap', () => {
    renderWithHistory(
      [
        {
          id: 'h-7',
          entityType: 'ProjectWorkItem',
          entityId: 'wi-1',
          changedField: 'assignee',
          oldValue: null,
          newValue: 'user-2',
          changedAt: '2026-01-01T09:00:00Z',
          changedBy: null,
        },
      ],
      { assigneeMap: { 'user-2': 'Bob Jones' } },
    )
    expect(screen.getByText('Bob Jones')).toBeInTheDocument()
  })

  it('resolves column UUID to name using columnMap', () => {
    renderWithHistory(
      [
        {
          id: 'h-8',
          entityType: 'ProjectWorkItem',
          entityId: 'wi-1',
          changedField: 'column',
          oldValue: 'col-1',
          newValue: 'col-2',
          changedAt: '2026-01-01T09:00:00Z',
          changedBy: null,
        },
      ],
      { columnMap: { 'col-1': 'Open', 'col-2': 'Done' } },
    )
    expect(screen.getByText('Open')).toBeInTheDocument()
    expect(screen.getByText('Done')).toBeInTheDocument()
  })

  it('renders raw UUID when labelMap does not have an entry for the label id', () => {
    renderWithHistory(
      [
        {
          id: 'h-9',
          entityType: 'ProjectWorkItem',
          entityId: 'wi-1',
          changedField: 'label',
          oldValue: null,
          newValue: 'unknown-uuid',
          changedAt: '2026-01-01T09:00:00Z',
          changedBy: null,
        },
      ],
      { labelMap: {} },
    )
    expect(screen.getByText('unknown-uuid')).toBeInTheDocument()
  })

  it('renders the Change History panel heading', () => {
    mockUseWorkItemChangeHistory.mockReturnValue({ data: [], isLoading: false, isError: false })
    const Wrapper = makeWrapper()
    render(
      createElement(
        Wrapper,
        null,
        createElement(ChangeHistoryPanel, {
          entityType: 'workItem',
          entityId: 'wi-1',
          isOpen: true,
        }),
      ),
    )
    expect(screen.getByRole('heading', { name: /change history/i })).toBeInTheDocument()
  })
})
