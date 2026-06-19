import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { EscalatedEntryDetail } from './EscalatedEntryDetail'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}))

const mockMutate = vi.fn()

vi.mock('../../hooks/useUpdateEscalatedEntry', () => ({
  useUpdateEscalatedEntry: () => ({
    mutate: mockMutate,
    isPending: false,
    isSuccess: false,
  }),
}))

vi.mock('../../hooks/useCreateEscalationMeasure', () => ({
  useCreateEscalationMeasure: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}))

vi.mock('../../hooks/useDeleteEscalationMeasure', () => ({
  useDeleteEscalationMeasure: () => ({
    mutate: vi.fn(),
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

const sampleEntry = {
  id: 'ee-1',
  version: 1,
  sourceEntryType: 'RISK' as const,
  sourceEntryId: 'r-1',
  scope: { id: 'prog-1', name: 'Test Program', scopeType: 'Program' as const },
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
  creator: { id: 'u-1', firstName: 'Alice', lastName: 'Smith', mail: 'alice@example.com' },
  updater: null,
  escalationProtocol: [],
  measures: [
    {
      id: 'm-1',
      version: 1,
      content: 'Reduce scope',
      position: 1,
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z',
      creator: null,
    },
  ],
}

describe('EscalatedEntryDetail', () => {
  beforeEach(() => {
    mockMutate.mockReset()
    vi.clearAllMocks()
  })

  it('renders section 1: source snapshot fields (read-only)', () => {
    render(createElement(EscalatedEntryDetail, { escalatedEntry: sampleEntry }), {
      wrapper: makeWrapper(),
    })
    expect(screen.getByText('features.escalatedEntries.detail.sourceFields.title')).toBeDefined()
    expect(screen.getByText('Budget Risk')).toBeDefined()
    expect(screen.getByText('R-001')).toBeDefined()
  })

  it('source snapshot section has no editable form inputs', () => {
    render(createElement(EscalatedEntryDetail, { escalatedEntry: sampleEntry }), {
      wrapper: makeWrapper(),
    })
    const sourceSection = screen
      .getByText('features.escalatedEntries.detail.sourceFields.title')
      .closest('section')
    expect(sourceSection?.querySelector('input')).toBeNull()
    expect(sourceSection?.querySelector('textarea')).toBeNull()
  })

  it('renders section 2: assessment form with editable fields', () => {
    render(createElement(EscalatedEntryDetail, { escalatedEntry: sampleEntry }), {
      wrapper: makeWrapper(),
    })
    expect(screen.getByText('features.escalatedEntries.detail.assessment.title')).toBeDefined()
    expect(
      screen.getByLabelText('features.escalatedEntries.detail.assessment.targetProbability'),
    ).toBeDefined()
    expect(
      screen.getByLabelText('features.escalatedEntries.detail.assessment.targetImpact'),
    ).toBeDefined()
  })

  it('renders section 3: measures list when showMeasures is true', async () => {
    const user = userEvent.setup()
    render(
      createElement(EscalatedEntryDetail, { escalatedEntry: sampleEntry, showMeasures: true }),
      { wrapper: makeWrapper() },
    )
    await user.click(
      screen.getByRole('tab', { name: 'features.escalatedEntries.detail.tabs.measures' }),
    )
    expect(screen.getByText('Reduce scope')).toBeDefined()
  })

  it('hides section 3 when showMeasures is false', () => {
    render(
      createElement(EscalatedEntryDetail, { escalatedEntry: sampleEntry, showMeasures: false }),
      { wrapper: makeWrapper() },
    )
    expect(
      screen.queryByRole('tab', { name: 'features.escalatedEntries.detail.tabs.measures' }),
    ).toBeNull()
    expect(screen.queryByText('Reduce scope')).toBeNull()
  })

  it('shows measures by default when showMeasures prop is omitted', async () => {
    const user = userEvent.setup()
    render(createElement(EscalatedEntryDetail, { escalatedEntry: sampleEntry }), {
      wrapper: makeWrapper(),
    })
    await user.click(
      screen.getByRole('tab', { name: 'features.escalatedEntries.detail.tabs.measures' }),
    )
    expect(screen.getByText('Reduce scope')).toBeDefined()
  })

  it('renders add control in measures section', async () => {
    const user = userEvent.setup()
    render(createElement(EscalatedEntryDetail, { escalatedEntry: sampleEntry }), {
      wrapper: makeWrapper(),
    })
    await user.click(
      screen.getByRole('tab', { name: 'features.escalatedEntries.detail.tabs.measures' }),
    )
    expect(
      screen.getByPlaceholderText('features.escalatedEntries.measures.addPlaceholder'),
    ).toBeDefined()
  })

  it('renders remove button for each measure', async () => {
    const user = userEvent.setup()
    render(createElement(EscalatedEntryDetail, { escalatedEntry: sampleEntry }), {
      wrapper: makeWrapper(),
    })
    await user.click(
      screen.getByRole('tab', { name: 'features.escalatedEntries.detail.tabs.measures' }),
    )
    expect(
      screen.getByRole('button', { name: 'features.escalatedEntries.measures.remove' }),
    ).toBeDefined()
  })
})
