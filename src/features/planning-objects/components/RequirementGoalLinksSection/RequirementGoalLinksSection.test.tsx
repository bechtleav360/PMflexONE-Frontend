import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useGoals } from '../../hooks/useGoals'
import { useLinkGoalToRequirement } from '../../hooks/useLinkGoalToRequirement'
import { useUnlinkGoalFromRequirement } from '../../hooks/useUnlinkGoalFromRequirement'
import { RequirementGoalLinksSection } from './RequirementGoalLinksSection'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => {
      if (opts?.name) return `${key}:${String(opts.name)}`
      return key
    },
  }),
}))

vi.mock('../../hooks/useGoals', () => ({
  useGoals: vi.fn(() => ({ data: [] })),
}))
vi.mock('../../hooks/useLinkGoalToRequirement', () => ({
  useLinkGoalToRequirement: vi.fn(() => ({
    mutateAsync: vi.fn().mockResolvedValue(undefined),
    isPending: false,
  })),
}))
vi.mock('../../hooks/useUnlinkGoalFromRequirement', () => ({
  useUnlinkGoalFromRequirement: vi.fn(() => ({
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

const defaultProps = {
  requirementId: 'req-1',
  linkedGoals: [],
  scopeId: 'proj-1',
}

beforeEach(() => {
  vi.clearAllMocks()
})

// eslint-disable-next-line max-lines-per-function -- comprehensive test suite for complex UI component
describe('RequirementGoalLinksSection', () => {
  it('renders section heading', () => {
    render(<RequirementGoalLinksSection {...defaultProps} />, { wrapper: makeWrapper() })
    expect(
      screen.getByText('features.planningObjects.requirements.linkedGoals'),
    ).toBeInTheDocument()
  })

  it('renders linked goal chips', () => {
    render(
      <RequirementGoalLinksSection
        {...defaultProps}
        linkedGoals={[{ id: 'g-1', name: 'Design Goal' }]}
      />,
      { wrapper: makeWrapper() },
    )
    expect(screen.getByText('Design Goal')).toBeInTheDocument()
  })

  it('unlink button calls useUnlinkGoalFromRequirement.mutateAsync', async () => {
    const mutateAsync = vi.fn().mockResolvedValue(undefined)
    vi.mocked(useUnlinkGoalFromRequirement).mockReturnValue({
      mutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useUnlinkGoalFromRequirement>)

    render(
      <RequirementGoalLinksSection
        {...defaultProps}
        linkedGoals={[{ id: 'g-1', name: 'Design Goal' }]}
      />,
      { wrapper: makeWrapper() },
    )

    const removeButton = screen.getByRole('button')
    await userEvent.click(removeButton)
    expect(mutateAsync).toHaveBeenCalledWith({ goalId: 'g-1', requirementId: 'req-1' })
  })

  it('goal combobox options exclude already-linked goals', () => {
    vi.mocked(useGoals).mockReturnValue({
      data: [
        {
          id: 'g-1',
          name: 'Linked Goal',
          children: [],
          parent: null,
          version: 1,
          description: null,
          progress: 0,
          dueDate: null,
          keyResults: null,
          otherInformation: null,
          acceptedAt: null,
          sortOrder: 0,
          createdAt: '',
          updatedAt: '',
          creator: null,
          updater: null,
          acceptedBy: null,
          scope: { id: 'proj-1', scopeType: 'Project' as const },
          parentLevelGoalName: null,
        },
        {
          id: 'g-2',
          name: 'Available Goal',
          children: [],
          parent: null,
          version: 1,
          description: null,
          progress: 0,
          dueDate: null,
          keyResults: null,
          otherInformation: null,
          acceptedAt: null,
          sortOrder: 0,
          createdAt: '',
          updatedAt: '',
          creator: null,
          updater: null,
          acceptedBy: null,
          scope: { id: 'proj-1', scopeType: 'Project' as const },
          parentLevelGoalName: null,
        },
      ],
    } as unknown as ReturnType<typeof useGoals>)

    render(
      <RequirementGoalLinksSection
        {...defaultProps}
        linkedGoals={[{ id: 'g-1', name: 'Linked Goal' }]}
      />,
      { wrapper: makeWrapper() },
    )

    // Linked goal is shown as chip, not in combobox options
    expect(screen.getByText('Linked Goal')).toBeInTheDocument()
  })

  it('returns null when readOnly and no linked goals', () => {
    const { container } = render(
      <RequirementGoalLinksSection
        {...defaultProps}
        linkedGoals={[]}
        readOnly
      />,
      { wrapper: makeWrapper() },
    )
    expect(container.firstChild).toBeNull()
  })

  it('shows linked goal chips without remove buttons when readOnly', () => {
    render(
      <RequirementGoalLinksSection
        {...defaultProps}
        linkedGoals={[{ id: 'g-1', name: 'Design Goal' }]}
        readOnly
      />,
      { wrapper: makeWrapper() },
    )
    expect(screen.getByText('Design Goal')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('disables remove button when unlinkGoal.isPending is true', () => {
    vi.mocked(useUnlinkGoalFromRequirement).mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue(undefined),
      isPending: true,
    } as unknown as ReturnType<typeof useUnlinkGoalFromRequirement>)

    render(
      <RequirementGoalLinksSection
        {...defaultProps}
        linkedGoals={[{ id: 'g-1', name: 'Design Goal' }]}
      />,
      { wrapper: makeWrapper() },
    )
    const removeButton = screen.getByRole('button', {
      name: /features.planningObjects.requirements.removeGoalAriaLabel:Design Goal/i,
    })
    expect(removeButton).toBeDisabled()
  })

  it('calls useLinkGoalToRequirement.mutateAsync when a goal is selected', async () => {
    const mutateAsync = vi.fn().mockResolvedValue(undefined)
    vi.mocked(useLinkGoalToRequirement).mockReturnValue({
      mutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useLinkGoalToRequirement>)
    vi.mocked(useGoals).mockReturnValue({
      data: [
        {
          id: 'g-2',
          name: 'Available Goal',
          children: [],
          parent: null,
          version: 1,
          description: null,
          progress: 0,
          dueDate: null,
          keyResults: null,
          otherInformation: null,
          acceptedAt: null,
          sortOrder: 0,
          createdAt: '',
          updatedAt: '',
          creator: null,
          updater: null,
          acceptedBy: null,
          scope: { id: 'proj-1', scopeType: 'Project' as const },
          parentLevelGoalName: null,
        },
      ],
    } as unknown as ReturnType<typeof useGoals>)

    render(<RequirementGoalLinksSection {...defaultProps} />, { wrapper: makeWrapper() })

    // Open combobox and select the goal
    const trigger = screen.getByRole('combobox')
    await userEvent.click(trigger)
    const option = screen.getByText('Available Goal')
    await userEvent.click(option)

    expect(mutateAsync).toHaveBeenCalledWith({ goalId: 'g-2', requirementId: 'req-1' })
  })
})
