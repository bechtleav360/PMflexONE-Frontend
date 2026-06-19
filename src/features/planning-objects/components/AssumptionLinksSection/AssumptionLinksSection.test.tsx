/* eslint-disable max-lines -- comprehensive test coverage for complex component */
import { createElement, createRef } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useRiskEntries } from '@/entities/risk-entry'

import { useProjectCharterByProjectId } from '../../hooks/useProjectCharterByProjectId'
import type { AssumptionListItem } from '../../types/assumption.types'
import type { AssumptionLinksSectionHandle } from './AssumptionLinksSection'
import { AssumptionLinksSection } from './AssumptionLinksSection'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => {
      if (opts?.name) return `${key}:${String(opts.name)}`
      return key
    },
  }),
}))

vi.mock('../../hooks/useProjectCharterByProjectId', () => ({
  useProjectCharterByProjectId: vi.fn(() => ({ data: null })),
}))
vi.mock('../../hooks/useLinkAssumptionToProjectCharter', () => ({
  useLinkAssumptionToProjectCharter: vi.fn(() => ({
    mutateAsync: vi.fn().mockResolvedValue(undefined),
    isPending: false,
  })),
}))
vi.mock('../../hooks/useUnlinkAssumptionFromProjectCharter', () => ({
  useUnlinkAssumptionFromProjectCharter: vi.fn(() => ({
    mutateAsync: vi.fn().mockResolvedValue(undefined),
    isPending: false,
  })),
}))
vi.mock('../../hooks/useLinkAssumptionToRiskEntry', () => ({
  useLinkAssumptionToRiskEntry: vi.fn(() => ({
    mutateAsync: vi.fn().mockResolvedValue(undefined),
    isPending: false,
  })),
}))
vi.mock('../../hooks/useUnlinkAssumptionFromRiskEntry', () => ({
  useUnlinkAssumptionFromRiskEntry: vi.fn(() => ({
    mutateAsync: vi.fn().mockResolvedValue(undefined),
    isPending: false,
  })),
}))
vi.mock('@/entities/risk-entry', () => ({
  useRiskEntries: vi.fn(() => ({ data: [] })),
}))

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
  return Wrapper
}

const baseAssumption: AssumptionListItem = {
  id: 'a-1',
  version: 1,
  name: 'Test Assumption',
  description: null,
  dueDate: null,
  validationStatus: 'OPEN',
  isRisk: false,
  otherInformation: null,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  creator: null,
  updater: null,
  validatedBy: null,
  linkedRisk: null,
  relatedRisks: [],
  projectCharter: null,
  scope: { id: 'proj-1', scopeType: 'Project' },
}

const defaultProps = {
  assumption: baseAssumption,
  scopeId: 'proj-1',
}

// eslint-disable-next-line max-lines-per-function -- comprehensive test suite
describe('AssumptionLinksSection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders project charter section heading', () => {
    render(<AssumptionLinksSection {...defaultProps} />, { wrapper: makeWrapper() })
    expect(
      screen.getByText('features.planningObjects.assumptions.projectCharterLabel'),
    ).toBeInTheDocument()
  })

  it('renders related risks section heading', () => {
    render(<AssumptionLinksSection {...defaultProps} />, { wrapper: makeWrapper() })
    expect(
      screen.getByText('features.planningObjects.assumptions.relatedRisksLabel'),
    ).toBeInTheDocument()
  })

  it('shows project charter badge when assumption has linked charter', () => {
    render(
      <AssumptionLinksSection
        {...defaultProps}
        assumption={{ ...baseAssumption, projectCharter: { id: 'pc-1', status: 'ACTIVE' } }}
      />,
      { wrapper: makeWrapper() },
    )
    const pcLabel = 'features.planningObjects.assumptions.projectCharterLabel'
    expect(screen.getAllByText(pcLabel).length).toBeGreaterThanOrEqual(2)
  })

  it('staging a charter unlink hides badge', async () => {
    render(
      <AssumptionLinksSection
        {...defaultProps}
        assumption={{ ...baseAssumption, projectCharter: { id: 'pc-1', status: 'ACTIVE' } }}
      />,
      { wrapper: makeWrapper() },
    )
    const pcLabel = 'features.planningObjects.assumptions.projectCharterLabel'
    const removeBtn = screen
      .getAllByRole('button')
      .find((b) => b.getAttribute('aria-label')?.includes(pcLabel))
    expect(removeBtn).toBeDefined()
    await userEvent.click(removeBtn!)
    expect(screen.queryByRole('button', { name: new RegExp(pcLabel) })).not.toBeInTheDocument()
  })

  it('staging a charter link via combobox shows badge', async () => {
    vi.mocked(useProjectCharterByProjectId).mockReturnValue({
      data: { id: 'pc-1', status: 'ACTIVE' },
    } as unknown as ReturnType<typeof useProjectCharterByProjectId>)

    render(<AssumptionLinksSection {...defaultProps} />, { wrapper: makeWrapper() })

    const pcLabel = 'features.planningObjects.assumptions.projectCharterLabel'
    const charterSection = screen
      .getAllByRole('region')
      .find((s) => s.getAttribute('aria-label') === pcLabel)
    expect(charterSection).toBeDefined()
    const combobox = charterSection!.querySelector('[role="combobox"]')
    expect(combobox).not.toBeNull()
    await userEvent.click(combobox!)
    const option = await screen.findByRole('option')
    await userEvent.click(option)

    expect(screen.getAllByText(pcLabel).length).toBeGreaterThanOrEqual(2)
  })

  it('cancelling a staged charter link (clicking X on staged badge) clears it', async () => {
    vi.mocked(useProjectCharterByProjectId).mockReturnValue({
      data: { id: 'pc-1', status: 'ACTIVE' },
    } as unknown as ReturnType<typeof useProjectCharterByProjectId>)

    render(<AssumptionLinksSection {...defaultProps} />, { wrapper: makeWrapper() })

    const pcLabel = 'features.planningObjects.assumptions.projectCharterLabel'
    const charterSection = screen
      .getAllByRole('region')
      .find((s) => s.getAttribute('aria-label') === pcLabel)
    const combobox = charterSection!.querySelector('[role="combobox"]')
    await userEvent.click(combobox!)
    const option = await screen.findByRole('option')
    await userEvent.click(option)

    const removeBtn = screen
      .getAllByRole('button')
      .find((b) => b.getAttribute('aria-label')?.includes(pcLabel))
    expect(removeBtn).toBeDefined()
    await userEvent.click(removeBtn!)
    expect(screen.queryByRole('button', { name: new RegExp(pcLabel) })).not.toBeInTheDocument()
  })

  it('shows risk badge for persisted related risks', () => {
    render(
      <AssumptionLinksSection
        {...defaultProps}
        assumption={{ ...baseAssumption, relatedRisks: [{ id: 'r-1', name: 'Risk Alpha' }] }}
      />,
      { wrapper: makeWrapper() },
    )
    expect(screen.getByText('Risk Alpha')).toBeInTheDocument()
  })

  it('staging a risk unlink hides risk badge', async () => {
    render(
      <AssumptionLinksSection
        {...defaultProps}
        assumption={{ ...baseAssumption, relatedRisks: [{ id: 'r-1', name: 'Risk Alpha' }] }}
      />,
      { wrapper: makeWrapper() },
    )
    const removeBtn = screen
      .getAllByRole('button')
      .find((b) => b.getAttribute('aria-label')?.includes('Risk Alpha'))
    expect(removeBtn).toBeDefined()
    await userEvent.click(removeBtn!)
    expect(screen.queryByText('Risk Alpha')).not.toBeInTheDocument()
  })

  it('staging a risk link via combobox shows staged badge', async () => {
    vi.mocked(useRiskEntries).mockReturnValue({
      data: [{ id: 'r-2', entryNumber: 'R-002', name: 'Risk Beta' }],
    } as unknown as ReturnType<typeof useRiskEntries>)

    render(<AssumptionLinksSection {...defaultProps} />, { wrapper: makeWrapper() })

    const sections = screen.getAllByRole('region')
    const riskSection = sections.find((s) =>
      s.getAttribute('aria-label')?.includes('relatedRisksLabel'),
    )
    const combobox = riskSection?.querySelector('[role="combobox"]')
    expect(combobox).not.toBeNull()
    await userEvent.click(combobox!)
    const option = await screen.findByText('R-002 Risk Beta')
    await userEvent.click(option)

    expect(screen.getByText('R-002 Risk Beta')).toBeInTheDocument()
  })

  it('staged risk link can be removed before flush', async () => {
    vi.mocked(useRiskEntries).mockReturnValue({
      data: [{ id: 'r-2', entryNumber: 'R-002', name: 'Risk Beta' }],
    } as unknown as ReturnType<typeof useRiskEntries>)

    render(<AssumptionLinksSection {...defaultProps} />, { wrapper: makeWrapper() })

    const sections = screen.getAllByRole('region')
    const riskSection = sections.find((s) =>
      s.getAttribute('aria-label')?.includes('relatedRisksLabel'),
    )
    const combobox = riskSection?.querySelector('[role="combobox"]')
    await userEvent.click(combobox!)
    const option = await screen.findByText('R-002 Risk Beta')
    await userEvent.click(option)

    const removeBtn = screen
      .getAllByRole('button')
      .find((b) => b.getAttribute('aria-label')?.includes('R-002 Risk Beta'))
    expect(removeBtn).toBeDefined()
    await userEvent.click(removeBtn!)
    expect(screen.queryByText('R-002 Risk Beta')).not.toBeInTheDocument()
  })

  it('calls onDirtyChange(true) when charter link is staged', async () => {
    vi.mocked(useProjectCharterByProjectId).mockReturnValue({
      data: { id: 'pc-1', status: 'ACTIVE' },
    } as unknown as ReturnType<typeof useProjectCharterByProjectId>)

    const onDirtyChange = vi.fn()
    render(
      <AssumptionLinksSection
        {...defaultProps}
        onDirtyChange={onDirtyChange}
      />,
      { wrapper: makeWrapper() },
    )

    const pcLabel = 'features.planningObjects.assumptions.projectCharterLabel'
    const charterSection = screen
      .getAllByRole('region')
      .find((s) => s.getAttribute('aria-label') === pcLabel)
    const combobox = charterSection!.querySelector('[role="combobox"]')
    await userEvent.click(combobox!)
    const option = await screen.findByRole('option')
    await userEvent.click(option)

    expect(onDirtyChange).toHaveBeenCalledWith(true)
  })

  it('calls onDirtyChange(true) when charter unlink is staged', async () => {
    const onDirtyChange = vi.fn()
    render(
      <AssumptionLinksSection
        {...defaultProps}
        assumption={{ ...baseAssumption, projectCharter: { id: 'pc-1', status: 'ACTIVE' } }}
        onDirtyChange={onDirtyChange}
      />,
      { wrapper: makeWrapper() },
    )

    const pcLabel = 'features.planningObjects.assumptions.projectCharterLabel'
    const removeBtn = screen
      .getAllByRole('button')
      .find((b) => b.getAttribute('aria-label')?.includes(pcLabel))
    await userEvent.click(removeBtn!)

    expect(onDirtyChange).toHaveBeenCalledWith(true)
  })

  it('in readOnly mode hides comboboxes and remove buttons', () => {
    render(
      <AssumptionLinksSection
        {...defaultProps}
        assumption={{ ...baseAssumption, projectCharter: { id: 'pc-1', status: 'ACTIVE' } }}
        readOnly
      />,
      { wrapper: makeWrapper() },
    )
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('in readOnly mode with no links, related risks section is hidden', () => {
    render(
      <AssumptionLinksSection
        {...defaultProps}
        readOnly
      />,
      { wrapper: makeWrapper() },
    )
    const sections = screen.queryAllByRole('region')
    const riskSection = sections.find((s) =>
      s.getAttribute('aria-label')?.includes('relatedRisksLabel'),
    )
    expect(riskSection).toBeUndefined()
  })

  it('flush() with pending charter link calls mutateAsync', async () => {
    const mockMutateAsync = vi.fn().mockResolvedValue(undefined)
    const { useLinkAssumptionToProjectCharter } =
      await import('../../hooks/useLinkAssumptionToProjectCharter')
    vi.mocked(useLinkAssumptionToProjectCharter).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useLinkAssumptionToProjectCharter>)
    vi.mocked(useProjectCharterByProjectId).mockReturnValue({
      data: { id: 'pc-flush', status: 'ACTIVE' },
    } as unknown as ReturnType<typeof useProjectCharterByProjectId>)

    const ref = createRef<AssumptionLinksSectionHandle>()
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    render(
      createElement(
        QueryClientProvider,
        { client: queryClient },
        createElement(AssumptionLinksSection, { ...defaultProps, ref }),
      ),
    )

    const pcLabel = 'features.planningObjects.assumptions.projectCharterLabel'
    const charterSection = screen
      .getAllByRole('region')
      .find((s) => s.getAttribute('aria-label') === pcLabel)
    const combobox = charterSection!.querySelector('[role="combobox"]')
    await userEvent.click(combobox!)
    const option = await screen.findByRole('option')
    await userEvent.click(option)

    await ref.current!.flush()
    expect(mockMutateAsync).toHaveBeenCalledWith({
      assumptionId: 'a-1',
      projectCharterId: 'pc-flush',
    })
  })

  it('flush() with pending charter unlink calls unlinkMutateAsync', async () => {
    const mockUnlinkMutateAsync = vi.fn().mockResolvedValue(undefined)
    const { useUnlinkAssumptionFromProjectCharter } =
      await import('../../hooks/useUnlinkAssumptionFromProjectCharter')
    vi.mocked(useUnlinkAssumptionFromProjectCharter).mockReturnValue({
      mutateAsync: mockUnlinkMutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useUnlinkAssumptionFromProjectCharter>)

    const ref = createRef<AssumptionLinksSectionHandle>()
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    render(
      createElement(
        QueryClientProvider,
        { client: queryClient },
        createElement(AssumptionLinksSection, {
          ...defaultProps,
          assumption: { ...baseAssumption, projectCharter: { id: 'pc-1', status: 'ACTIVE' } },
          ref,
        }),
      ),
    )

    const pcLabel = 'features.planningObjects.assumptions.projectCharterLabel'
    const removeBtn = screen
      .getAllByRole('button')
      .find((b) => b.getAttribute('aria-label')?.includes(pcLabel))
    await userEvent.click(removeBtn!)

    await ref.current!.flush()
    expect(mockUnlinkMutateAsync).toHaveBeenCalledWith({
      assumptionId: 'a-1',
      projectCharterId: 'pc-1',
    })
  })

  it('flush() with pending risk link calls linkToRiskEntry.mutateAsync', async () => {
    const mockRiskLinkMutateAsync = vi.fn().mockResolvedValue(undefined)
    const { useLinkAssumptionToRiskEntry } =
      await import('../../hooks/useLinkAssumptionToRiskEntry')
    vi.mocked(useLinkAssumptionToRiskEntry).mockReturnValue({
      mutateAsync: mockRiskLinkMutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useLinkAssumptionToRiskEntry>)
    vi.mocked(useRiskEntries).mockReturnValue({
      data: [{ id: 'r-flush', entryNumber: 'R-100', name: 'Flush Risk' }],
    } as unknown as ReturnType<typeof useRiskEntries>)

    const ref = createRef<AssumptionLinksSectionHandle>()
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    render(
      createElement(
        QueryClientProvider,
        { client: queryClient },
        createElement(AssumptionLinksSection, { ...defaultProps, ref }),
      ),
    )

    const sections = screen.getAllByRole('region')
    const riskSection = sections.find((s) =>
      s.getAttribute('aria-label')?.includes('relatedRisksLabel'),
    )
    const combobox = riskSection?.querySelector('[role="combobox"]')
    await userEvent.click(combobox!)
    const option = await screen.findByText('R-100 Flush Risk')
    await userEvent.click(option)

    await ref.current!.flush()
    expect(mockRiskLinkMutateAsync).toHaveBeenCalledWith({
      assumptionId: 'a-1',
      riskEntryId: 'r-flush',
    })
  })

  it('flush() with pending risk unlink calls unlinkFromRiskEntry.mutateAsync', async () => {
    const mockRiskUnlinkMutateAsync = vi.fn().mockResolvedValue(undefined)
    const { useUnlinkAssumptionFromRiskEntry } =
      await import('../../hooks/useUnlinkAssumptionFromRiskEntry')
    vi.mocked(useUnlinkAssumptionFromRiskEntry).mockReturnValue({
      mutateAsync: mockRiskUnlinkMutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useUnlinkAssumptionFromRiskEntry>)

    const ref = createRef<AssumptionLinksSectionHandle>()
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    render(
      createElement(
        QueryClientProvider,
        { client: queryClient },
        createElement(AssumptionLinksSection, {
          ...defaultProps,
          assumption: { ...baseAssumption, relatedRisks: [{ id: 'r-1', name: 'Risk Alpha' }] },
          ref,
        }),
      ),
    )

    const removeBtn = screen
      .getAllByRole('button')
      .find((b) => b.getAttribute('aria-label')?.includes('Risk Alpha'))
    await userEvent.click(removeBtn!)

    await ref.current!.flush()
    expect(mockRiskUnlinkMutateAsync).toHaveBeenCalledWith({
      assumptionId: 'a-1',
      riskEntryId: 'r-1',
    })
  })

  it('available risk options exclude already linked and linkedRisk risks', () => {
    vi.mocked(useRiskEntries).mockReturnValue({
      data: [
        { id: 'r-1', entryNumber: 'R-001', name: 'Risk One' },
        { id: 'r-2', entryNumber: 'R-002', name: 'Risk Two' },
        { id: 'r-3', entryNumber: 'R-003', name: 'Risk Three' },
      ],
    } as unknown as ReturnType<typeof useRiskEntries>)

    render(
      <AssumptionLinksSection
        {...defaultProps}
        assumption={{
          ...baseAssumption,
          relatedRisks: [{ id: 'r-1', name: 'Risk One' }],
          linkedRisk: { id: 'r-2', name: 'Risk Two', status: 'OPEN' },
        }}
      />,
      { wrapper: makeWrapper() },
    )

    const sections = screen.getAllByRole('region')
    const riskSection = sections.find((s) =>
      s.getAttribute('aria-label')?.includes('relatedRisksLabel'),
    )
    const combobox = riskSection?.querySelector('[role="combobox"]')
    expect(combobox).not.toBeNull()
    userEvent.click(combobox!)
    expect(screen.queryByText('R-001 Risk One')).not.toBeInTheDocument()
    expect(screen.queryByText('R-002 Risk Two')).not.toBeInTheDocument()
  })
})
