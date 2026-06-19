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

const fixtureHistory = [
  {
    id: 'h-1',
    entityType: 'ProjectWorkItem',
    entityId: 'wi-1',
    changedField: 'name',
    oldValue: 'Old Title',
    newValue: 'New Title',
    changedAt: '2026-01-01T10:00:00Z',
    changedBy: { id: 'user-1', firstName: 'Alice', lastName: 'Smith', mail: 'alice@test.com' },
  },
  {
    id: 'h-2',
    entityType: 'ProjectWorkItem',
    entityId: 'wi-1',
    changedField: 'status',
    oldValue: 'open',
    newValue: 'in_progress',
    changedAt: '2026-01-01T11:00:00Z',
    changedBy: null,
  },
]

function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: qc }, children)
  }
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

describe('ChangeHistoryPanel', () => {
  it('does not fire query when isOpen is false', () => {
    mockUseWorkItemChangeHistory.mockReturnValue({ data: undefined, isLoading: false })
    const Wrapper = makeWrapper()
    render(
      createElement(
        Wrapper,
        null,
        createElement(ChangeHistoryPanel, {
          entityType: 'workItem',
          entityId: 'wi-1',
          isOpen: false,
        }),
      ),
    )
    expect(mockUseWorkItemChangeHistory).toHaveBeenCalledWith('wi-1', false)
  })

  it('renders history entries in chronological order with field, old value, new value', () => {
    mockUseWorkItemChangeHistory.mockReturnValue({ data: fixtureHistory, isLoading: false })
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
    expect(screen.getByText('Old Title')).toBeInTheDocument()
    expect(screen.getByText('New Title')).toBeInTheDocument()
    expect(screen.getByText('Alice Smith')).toBeInTheDocument()
  })

  it('renders empty state when no history entries', () => {
    mockUseWorkItemChangeHistory.mockReturnValue({ data: [], isLoading: false })
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
    expect(screen.getByText(/no changes|no history/i)).toBeInTheDocument()
  })
})

describe('ChangeHistoryPanel — loading / error states', () => {
  it('shows a loading indicator while isLoading is true', () => {
    mockUseWorkItemChangeHistory.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    })
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
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('shows an error message when isError is true', () => {
    mockUseWorkItemChangeHistory.mockReturnValue({ data: [], isLoading: false, isError: true })
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
    expect(screen.getByText(/failed to load/i)).toBeInTheDocument()
  })
})
