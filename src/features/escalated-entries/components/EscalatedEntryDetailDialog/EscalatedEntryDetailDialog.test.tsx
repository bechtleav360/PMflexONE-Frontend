import { createElement } from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'
import { makeQueryWrapper } from '@/shared/test-utils/makeQueryWrapper'

import { useEscalatedEntryDetailStore } from '../../store/useEscalatedEntryDetailStore'
import { EscalatedEntryDetailDialog } from './EscalatedEntryDetailDialog'

const mockEntry = {
  id: 'ee-1',
  version: 1,
  sourceEntryType: 'RISK' as const,
  sourceEntryId: 'r-1',
  scopeId: 'prog-1',
  scopeType: 'Program' as const,
  escalationChain: null,
  status: 'ACTIVE' as const,
  entryNumber: 'R-001',
  name: 'Budget Risk',
  description: null,
  pestelCategory: null,
  sourceStatus: null,
  probability: 3,
  impact: 4,
  riskLevel: 12,
  targetProbability: null,
  targetImpact: null,
  escalatedAt: '2024-01-15T00:00:00Z',
  returnedAt: null,
  createdAt: '2024-01-15T00:00:00Z',
  updatedAt: '2024-01-15T00:00:00Z',
  creator: null,
  updater: null,
  escalationProtocol: [],
  measures: [],
}

vi.mock('../../hooks/useEscalatedEntry', () => ({
  useEscalatedEntry: vi.fn(() => ({ data: undefined })),
}))

vi.mock('../EscalatedEntryDetail/EscalatedEntryDetail', () => ({
  EscalatedEntryDetail: ({ showMeasures }: { showMeasures?: boolean }) =>
    createElement('div', {
      'data-testid': 'escalated-entry-detail',
      'data-show-measures': String(showMeasures ?? true),
    }),
}))

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

beforeEach(() => {
  useEscalatedEntryDetailStore.setState({
    isOpen: false,
    selectedId: null,
    showMeasures: true,
  })
})

describe('EscalatedEntryDetailDialog', () => {
  it('renders nothing when store is closed', () => {
    render(createElement(EscalatedEntryDetailDialog), { wrapper: makeQueryWrapper() })
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('renders dialog when store is open', () => {
    useEscalatedEntryDetailStore.setState({ isOpen: true, selectedId: 'ee-1', showMeasures: true })
    render(createElement(EscalatedEntryDetailDialog), { wrapper: makeQueryWrapper() })
    expect(screen.getByRole('dialog')).toBeDefined()
  })

  it('does not render entry detail when entry data is not yet loaded', () => {
    useEscalatedEntryDetailStore.setState({ isOpen: true, selectedId: 'ee-1', showMeasures: true })
    render(createElement(EscalatedEntryDetailDialog), { wrapper: makeQueryWrapper() })
    expect(screen.queryByTestId('escalated-entry-detail')).toBeNull()
  })

  it('renders entry detail when entry data is loaded', async () => {
    const { useEscalatedEntry } = await import('../../hooks/useEscalatedEntry')
    vi.mocked(useEscalatedEntry).mockReturnValue({ data: mockEntry } as unknown as ReturnType<
      typeof useEscalatedEntry
    >)

    useEscalatedEntryDetailStore.setState({ isOpen: true, selectedId: 'ee-1', showMeasures: true })
    render(createElement(EscalatedEntryDetailDialog), { wrapper: makeQueryWrapper() })
    expect(screen.getByTestId('escalated-entry-detail')).toBeDefined()
  })

  it('passes showMeasures=false to detail when store has showMeasures=false', async () => {
    const { useEscalatedEntry } = await import('../../hooks/useEscalatedEntry')
    vi.mocked(useEscalatedEntry).mockReturnValue({ data: mockEntry } as unknown as ReturnType<
      typeof useEscalatedEntry
    >)

    useEscalatedEntryDetailStore.setState({ isOpen: true, selectedId: 'ee-1', showMeasures: false })
    render(createElement(EscalatedEntryDetailDialog), { wrapper: makeQueryWrapper() })
    expect(screen.getByTestId('escalated-entry-detail').dataset.showMeasures).toBe('false')
  })

  it('does not mount content when selectedId is null even if isOpen is true', () => {
    useEscalatedEntryDetailStore.setState({ isOpen: true, selectedId: null, showMeasures: true })
    render(createElement(EscalatedEntryDetailDialog), { wrapper: makeQueryWrapper() })
    expect(screen.queryByTestId('escalated-entry-detail')).toBeNull()
  })

  it('calls close when Escape key closes the dialog (onOpenChange branch)', async () => {
    const user = userEvent.setup()
    useEscalatedEntryDetailStore.setState({ isOpen: true, selectedId: 'ee-1', showMeasures: true })
    render(createElement(EscalatedEntryDetailDialog), { wrapper: makeQueryWrapper() })

    await user.keyboard('{Escape}')

    expect(useEscalatedEntryDetailStore.getState().isOpen).toBe(false)
  })
})
