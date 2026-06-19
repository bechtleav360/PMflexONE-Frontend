/* eslint-disable max-lines -- test file; many independent branch-coverage cases per conditional */
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import type * as SharedComponents from '@/shared/components'
import { i18n } from '@/shared/lib/i18n'

import type { RequirementDetail } from '../../types/requirement.types'
import { EditRequirementForm } from './EditRequirementForm'

vi.mock('../RequirementDependenciesSection', () => ({
  RequirementDependenciesSection: () => <div data-testid="req-deps-section" />,
}))

vi.mock('../RequirementGoalLinksSection', () => ({
  RequirementGoalLinksSection: () => <div data-testid="req-goals-section" />,
}))

vi.mock('@/shared/components', async (importOriginal) => {
  const actual = await importOriginal<typeof SharedComponents>()
  return {
    ...actual,
    MarkdownEditor: ({
      value,
      onChange,
      ariaLabel,
    }: {
      value: string
      onChange: (v: string) => void
      ariaLabel?: string
    }) => (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={ariaLabel}
      />
    ),
    Select: ({
      children,
      onValueChange: _onValueChange,
      value: _value,
    }: {
      children: React.ReactNode
      onValueChange?: (v: string) => void
      value?: string
    }) => <div data-testid="select">{children}</div>,
    SelectTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    SelectValue: () => null,
    SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    SelectItem: ({ children, value }: { children: React.ReactNode; value: string }) => (
      <div data-value={value}>{children}</div>
    ),
  }
})

function makeReqDetail(overrides: Partial<RequirementDetail> = {}): RequirementDetail {
  return {
    id: 'req-1',
    version: 1,
    sortOrder: 0,
    name: 'Test Requirement',
    requirementScope: 'IN_SCOPE',
    source: 'INTERNAL',
    estimatedEffortMin: null,
    estimatedEffortMax: null,
    type: 'FUNCTIONAL',
    priority: 'MUST_HAVE',
    status: 'NEW',
    description: null,
    acceptanceCriteria: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    creator: null,
    updater: null,
    parent: null,
    dependencies: [],
    linkedGoals: [],
    ...overrides,
  }
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

// eslint-disable-next-line max-lines-per-function -- many independent test cases covering branches
describe('EditRequirementForm', () => {
  it('renders form with correct id', () => {
    const { container } = render(
      <EditRequirementForm
        requirementDetail={makeReqDetail()}
        onSubmit={vi.fn()}
        scopeId="proj-1"
      />,
    )
    expect(container.querySelector('#edit-requirement-form')).toBeInTheDocument()
  })

  it('pre-populates name field', () => {
    const { container } = render(
      <EditRequirementForm
        requirementDetail={makeReqDetail({ name: 'My Req' })}
        onSubmit={vi.fn()}
        scopeId="proj-1"
      />,
    )
    expect(container.querySelector('#edit-req-name')).toHaveValue('My Req')
  })

  it('shows validation error when name is cleared and form submitted', async () => {
    const { container } = render(
      <EditRequirementForm
        requirementDetail={makeReqDetail()}
        onSubmit={vi.fn()}
        scopeId="proj-1"
      />,
    )
    await userEvent.clear(container.querySelector('#edit-req-name')!)
    fireEvent.submit(container.querySelector('#edit-requirement-form')!)
    expect(await screen.findByRole('alert')).toBeInTheDocument()
  })

  it('calls onSubmit when form is valid', async () => {
    const onSubmit = vi.fn()
    const { container } = render(
      <EditRequirementForm
        requirementDetail={makeReqDetail()}
        onSubmit={onSubmit}
        scopeId="proj-1"
      />,
    )
    fireEvent.submit(container.querySelector('#edit-requirement-form')!)
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledOnce())
  })

  it('hides effort fields when readOnly and both effort values are null', () => {
    const { container } = render(
      <EditRequirementForm
        requirementDetail={makeReqDetail({ estimatedEffortMin: null, estimatedEffortMax: null })}
        onSubmit={vi.fn()}
        scopeId="proj-1"
        readOnly
      />,
    )
    expect(container.querySelector('#edit-req-effort-min')).not.toBeInTheDocument()
    expect(container.querySelector('#edit-req-effort-max')).not.toBeInTheDocument()
  })

  it('shows effort fields when readOnly and estimatedEffortMin has value', () => {
    const { container } = render(
      <EditRequirementForm
        requirementDetail={makeReqDetail({ estimatedEffortMin: 3, estimatedEffortMax: null })}
        onSubmit={vi.fn()}
        scopeId="proj-1"
        readOnly
      />,
    )
    expect(container.querySelector('#edit-req-effort-min')).toBeInTheDocument()
  })

  it('shows effort fields when readOnly and estimatedEffortMax has value', () => {
    const { container } = render(
      <EditRequirementForm
        requirementDetail={makeReqDetail({ estimatedEffortMin: null, estimatedEffortMax: 8 })}
        onSubmit={vi.fn()}
        scopeId="proj-1"
        readOnly
      />,
    )
    expect(container.querySelector('#edit-req-effort-max')).toBeInTheDocument()
  })

  it('shows effort fields when not readOnly', () => {
    const { container } = render(
      <EditRequirementForm
        requirementDetail={makeReqDetail()}
        onSubmit={vi.fn()}
        scopeId="proj-1"
      />,
    )
    expect(container.querySelector('#edit-req-effort-min')).toBeInTheDocument()
    expect(container.querySelector('#edit-req-effort-max')).toBeInTheDocument()
  })

  it('hides description when readOnly and description is null', () => {
    render(
      <EditRequirementForm
        requirementDetail={makeReqDetail({ description: null })}
        onSubmit={vi.fn()}
        scopeId="proj-1"
        readOnly
      />,
    )
    expect(screen.queryByLabelText(/description/i)).not.toBeInTheDocument()
  })

  it('shows description when readOnly and description has value', () => {
    render(
      <EditRequirementForm
        requirementDetail={makeReqDetail({ description: 'Some desc' })}
        onSubmit={vi.fn()}
        scopeId="proj-1"
        readOnly
      />,
    )
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
  })

  it('shows description when not readOnly', () => {
    render(
      <EditRequirementForm
        requirementDetail={makeReqDetail()}
        onSubmit={vi.fn()}
        scopeId="proj-1"
      />,
    )
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
  })

  it('hides acceptance criteria when readOnly and null', () => {
    render(
      <EditRequirementForm
        requirementDetail={makeReqDetail({ acceptanceCriteria: null })}
        onSubmit={vi.fn()}
        scopeId="proj-1"
        readOnly
      />,
    )
    expect(screen.queryByLabelText(/acceptance/i)).not.toBeInTheDocument()
  })

  it('shows acceptance criteria when readOnly and has value', () => {
    render(
      <EditRequirementForm
        requirementDetail={makeReqDetail({ acceptanceCriteria: 'Must pass' })}
        onSubmit={vi.fn()}
        scopeId="proj-1"
        readOnly
      />,
    )
    expect(screen.getByLabelText(/acceptance/i)).toBeInTheDocument()
  })

  it('shows acceptance criteria when not readOnly', () => {
    render(
      <EditRequirementForm
        requirementDetail={makeReqDetail()}
        onSubmit={vi.fn()}
        scopeId="proj-1"
      />,
    )
    expect(screen.getByLabelText(/acceptance/i)).toBeInTheDocument()
  })

  it('hides links section when readOnly, no dependencies, no linkedGoals', () => {
    render(
      <EditRequirementForm
        requirementDetail={makeReqDetail({ dependencies: [], linkedGoals: [] })}
        onSubmit={vi.fn()}
        scopeId="proj-1"
        readOnly
      />,
    )
    expect(screen.queryByTestId('req-deps-section')).not.toBeInTheDocument()
    expect(screen.queryByTestId('req-goals-section')).not.toBeInTheDocument()
  })

  it('shows links section when readOnly and dependencies present', () => {
    render(
      <EditRequirementForm
        requirementDetail={makeReqDetail({
          dependencies: [
            {
              edgeTypeName: 'blocks',
              requirement: { id: 'r-2', name: 'Other', status: 'NEW' },
            },
          ],
        })}
        onSubmit={vi.fn()}
        scopeId="proj-1"
        readOnly
      />,
    )
    expect(screen.getByTestId('req-deps-section')).toBeInTheDocument()
  })

  it('shows links section when readOnly and linkedGoals present', () => {
    render(
      <EditRequirementForm
        requirementDetail={makeReqDetail({
          linkedGoals: [{ id: 'g-1', name: 'Goal One' }],
        })}
        onSubmit={vi.fn()}
        scopeId="proj-1"
        readOnly
      />,
    )
    expect(screen.getByTestId('req-goals-section')).toBeInTheDocument()
  })

  it('shows links section when not readOnly', () => {
    render(
      <EditRequirementForm
        requirementDetail={makeReqDetail()}
        onSubmit={vi.fn()}
        scopeId="proj-1"
      />,
    )
    expect(screen.getByTestId('req-deps-section')).toBeInTheDocument()
    expect(screen.getByTestId('req-goals-section')).toBeInTheDocument()
  })

  it('calls onDirtyChange when name changes', async () => {
    const onDirtyChange = vi.fn()
    const { container } = render(
      <EditRequirementForm
        requirementDetail={makeReqDetail()}
        onSubmit={vi.fn()}
        scopeId="proj-1"
        onDirtyChange={onDirtyChange}
      />,
    )
    await userEvent.type(container.querySelector('#edit-req-name')!, 'x')
    expect(onDirtyChange).toHaveBeenCalledWith(true)
  })

  it('disables name input when readOnly', () => {
    const { container } = render(
      <EditRequirementForm
        requirementDetail={makeReqDetail()}
        onSubmit={vi.fn()}
        scopeId="proj-1"
        readOnly
      />,
    )
    expect(container.querySelector('#edit-req-name')).toBeDisabled()
  })
})
