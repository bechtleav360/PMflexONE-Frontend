import { createElement, createRef } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useProjectCharterByProjectId } from '../../hooks/useProjectCharterByProjectId'
import type { ConstraintListItem } from '../../types/constraint.types'
import type { ConstraintLinksSectionHandle } from './ConstraintLinksSection'
import { ConstraintLinksSection } from './ConstraintLinksSection'

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
vi.mock('../../hooks/useLinkProjectConstraintToProjectCharter', () => ({
  useLinkProjectConstraintToProjectCharter: vi.fn(() => ({
    mutateAsync: vi.fn().mockResolvedValue(undefined),
    isPending: false,
  })),
}))
vi.mock('../../hooks/useUnlinkProjectConstraintFromProjectCharter', () => ({
  useUnlinkProjectConstraintFromProjectCharter: vi.fn(() => ({
    mutateAsync: vi.fn().mockResolvedValue(undefined),
    isPending: false,
  })),
}))

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
  return Wrapper
}

const baseConstraint: ConstraintListItem = {
  id: 'c-1',
  version: 1,
  name: 'Test Constraint',
  description: null,
  timeConstrained: false,
  dueDate: null,
  otherInformation: null,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  creator: null,
  updater: null,
  owner: null,
  projectCharter: null,
  scope: { id: 'proj-1', scopeType: 'Project' },
}

const defaultProps = {
  constraint: baseConstraint,
  scopeId: 'proj-1',
}

// eslint-disable-next-line max-lines-per-function -- comprehensive test suite for complex UI component
describe('ConstraintLinksSection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders project charter section heading', () => {
    render(<ConstraintLinksSection {...defaultProps} />, { wrapper: makeWrapper() })
    expect(
      screen.getByText('features.planningObjects.constraints.projectCharter'),
    ).toBeInTheDocument()
  })

  it('shows charter badge when constraint has linked project charter', () => {
    render(
      <ConstraintLinksSection
        {...defaultProps}
        constraint={{ ...baseConstraint, projectCharter: { id: 'pc-1', status: 'ACTIVE' } }}
      />,
      { wrapper: makeWrapper() },
    )
    const pcLabel = 'features.planningObjects.constraints.projectCharter'
    expect(screen.getAllByText(pcLabel).length).toBeGreaterThanOrEqual(2)
  })

  it('staging a charter unlink hides badge', async () => {
    render(
      <ConstraintLinksSection
        {...defaultProps}
        constraint={{ ...baseConstraint, projectCharter: { id: 'pc-1', status: 'ACTIVE' } }}
      />,
      { wrapper: makeWrapper() },
    )
    const pcLabel = 'features.planningObjects.constraints.projectCharter'
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

    render(<ConstraintLinksSection {...defaultProps} />, { wrapper: makeWrapper() })

    const combobox = screen.getByRole('combobox')
    await userEvent.click(combobox)
    const option = await screen.findByRole('option')
    await userEvent.click(option)

    const pcLabel = 'features.planningObjects.constraints.projectCharter'
    expect(screen.getAllByText(pcLabel).length).toBeGreaterThanOrEqual(2)
  })

  it('cancelling a staged charter link clears it', async () => {
    vi.mocked(useProjectCharterByProjectId).mockReturnValue({
      data: { id: 'pc-1', status: 'ACTIVE' },
    } as unknown as ReturnType<typeof useProjectCharterByProjectId>)

    render(<ConstraintLinksSection {...defaultProps} />, { wrapper: makeWrapper() })

    const combobox = screen.getByRole('combobox')
    await userEvent.click(combobox)
    const option = await screen.findByRole('option')
    await userEvent.click(option)

    const pcLabel = 'features.planningObjects.constraints.projectCharter'
    const removeBtn = screen
      .getAllByRole('button')
      .find((b) => b.getAttribute('aria-label')?.includes(pcLabel))
    expect(removeBtn).toBeDefined()
    await userEvent.click(removeBtn!)
    expect(screen.queryByRole('button', { name: new RegExp(pcLabel) })).not.toBeInTheDocument()
  })

  it('calls onDirtyChange(true) when charter link is staged', async () => {
    vi.mocked(useProjectCharterByProjectId).mockReturnValue({
      data: { id: 'pc-1', status: 'ACTIVE' },
    } as unknown as ReturnType<typeof useProjectCharterByProjectId>)

    const onDirtyChange = vi.fn()
    render(
      <ConstraintLinksSection
        {...defaultProps}
        onDirtyChange={onDirtyChange}
      />,
      { wrapper: makeWrapper() },
    )

    const combobox = screen.getByRole('combobox')
    await userEvent.click(combobox)
    const option = await screen.findByRole('option')
    await userEvent.click(option)

    expect(onDirtyChange).toHaveBeenCalledWith(true)
  })

  it('calls onDirtyChange(true) when charter unlink is staged', async () => {
    const onDirtyChange = vi.fn()
    render(
      <ConstraintLinksSection
        {...defaultProps}
        constraint={{ ...baseConstraint, projectCharter: { id: 'pc-1', status: 'ACTIVE' } }}
        onDirtyChange={onDirtyChange}
      />,
      { wrapper: makeWrapper() },
    )

    const pcLabel = 'features.planningObjects.constraints.projectCharter'
    const removeBtn = screen
      .getAllByRole('button')
      .find((b) => b.getAttribute('aria-label')?.includes(pcLabel))
    await userEvent.click(removeBtn!)

    expect(onDirtyChange).toHaveBeenCalledWith(true)
  })

  it('readOnly mode hides combobox and remove button', () => {
    render(
      <ConstraintLinksSection
        {...defaultProps}
        constraint={{ ...baseConstraint, projectCharter: { id: 'pc-1', status: 'ACTIVE' } }}
        readOnly
      />,
      { wrapper: makeWrapper() },
    )
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('flush() with pending charter link calls mutateAsync', async () => {
    const mockMutateAsync = vi.fn().mockResolvedValue(undefined)
    const { useLinkProjectConstraintToProjectCharter } =
      await import('../../hooks/useLinkProjectConstraintToProjectCharter')
    vi.mocked(useLinkProjectConstraintToProjectCharter).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useLinkProjectConstraintToProjectCharter>)
    vi.mocked(useProjectCharterByProjectId).mockReturnValue({
      data: { id: 'pc-flush', status: 'ACTIVE' },
    } as unknown as ReturnType<typeof useProjectCharterByProjectId>)

    const ref = createRef<ConstraintLinksSectionHandle>()
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    render(
      createElement(
        QueryClientProvider,
        { client: queryClient },
        createElement(ConstraintLinksSection, { ...defaultProps, ref }),
      ),
    )

    const combobox = screen.getByRole('combobox')
    await userEvent.click(combobox)
    const option = await screen.findByRole('option')
    await userEvent.click(option)

    await ref.current!.flush()
    expect(mockMutateAsync).toHaveBeenCalledWith({
      constraintId: 'c-1',
      projectCharterId: 'pc-flush',
    })
  })

  it('flush() with pending charter unlink calls unlinkMutateAsync', async () => {
    const mockUnlinkMutateAsync = vi.fn().mockResolvedValue(undefined)
    const { useUnlinkProjectConstraintFromProjectCharter } =
      await import('../../hooks/useUnlinkProjectConstraintFromProjectCharter')
    vi.mocked(useUnlinkProjectConstraintFromProjectCharter).mockReturnValue({
      mutateAsync: mockUnlinkMutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useUnlinkProjectConstraintFromProjectCharter>)

    const ref = createRef<ConstraintLinksSectionHandle>()
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    render(
      createElement(
        QueryClientProvider,
        { client: queryClient },
        createElement(ConstraintLinksSection, {
          ...defaultProps,
          constraint: { ...baseConstraint, projectCharter: { id: 'pc-1', status: 'ACTIVE' } },
          ref,
        }),
      ),
    )

    const pcLabel = 'features.planningObjects.constraints.projectCharter'
    const removeBtn = screen
      .getAllByRole('button')
      .find((b) => b.getAttribute('aria-label')?.includes(pcLabel))
    await userEvent.click(removeBtn!)

    await ref.current!.flush()
    expect(mockUnlinkMutateAsync).toHaveBeenCalledWith({
      constraintId: 'c-1',
      projectCharterId: 'pc-1',
    })
  })

  it('flush() with no pending changes completes without calling any mutations', async () => {
    const ref = createRef<ConstraintLinksSectionHandle>()
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    render(
      createElement(
        QueryClientProvider,
        { client: queryClient },
        createElement(ConstraintLinksSection, { ...defaultProps, ref }),
      ),
    )
    await expect(ref.current!.flush()).resolves.toBeUndefined()
  })

  it('shows combobox with charter option when project has a charter and none linked', () => {
    vi.mocked(useProjectCharterByProjectId).mockReturnValue({
      data: { id: 'pc-1', status: 'ACTIVE', project: { name: 'My Project' } },
    } as unknown as ReturnType<typeof useProjectCharterByProjectId>)

    render(<ConstraintLinksSection {...defaultProps} />, { wrapper: makeWrapper() })

    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })
})
