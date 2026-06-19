import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import type * as WorkItemEntities from '@/entities/work-item'
import { i18n } from '@/shared/lib/i18n'

import type { WorkItemFormValues } from '../../utils/workItemFormSchema'
import { WorkItemSelectFields } from './WorkItemSelectFields'

// ── mocks ─────────────────────────────────────────────────────────────────────

const mockUseLabels = vi.fn().mockReturnValue({ data: [] })
const mockUsePersons = vi.fn().mockReturnValue({ data: [] })

const makeLabel = (id: string, name: string, color: string | null) => ({
  id,
  name,
  color,
  version: 1,
  createdAt: '',
  updatedAt: '',
  metadata: null,
  creator: null,
  updater: null,
  scope: null,
})

vi.mock('@/entities/work-item', async (importOriginal) => {
  const actual = await importOriginal<typeof WorkItemEntities>()
  return {
    ...actual,
    useLabels: (...args: unknown[]) => mockUseLabels(...args),
    usePersons: (...args: unknown[]) => mockUsePersons(...args),
  }
})

// ── helpers ───────────────────────────────────────────────────────────────────

function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: qc }, children)
  }
}

interface RenderOptions {
  showStatus?: boolean
  disableStatus?: boolean
  isPending?: boolean
  scopeType?: 'Project' | 'Program' | 'Portfolio'
  scopeId?: string
  defaultValues?: Partial<WorkItemFormValues>
}

function ControlledWrapper({
  showStatus = false,
  disableStatus = false,
  isPending = false,
  scopeType,
  scopeId,
  defaultValues = {},
}: RenderOptions) {
  const methods = useForm<WorkItemFormValues>({ defaultValues })
  return (
    <FormProvider {...methods}>
      <WorkItemSelectFields
        control={methods.control}
        isPending={isPending}
        showStatus={showStatus}
        disableStatus={disableStatus}
        scopeType={scopeType}
        scopeId={scopeId}
      />
    </FormProvider>
  )
}

function renderFields(opts: RenderOptions = {}) {
  const Wrapper = makeWrapper()
  return render(createElement(Wrapper, null, createElement(ControlledWrapper, opts)))
}

// ── setup ─────────────────────────────────────────────────────────────────────

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

// ── tests ─────────────────────────────────────────────────────────────────────

describe('WorkItemSelectFields — priority field', () => {
  it('renders the Priority label', () => {
    renderFields()
    expect(screen.getByText('Priority')).toBeInTheDocument()
  })

  it('renders the priority select trigger with placeholder', () => {
    renderFields()
    expect(screen.getByText('Select priority')).toBeInTheDocument()
  })

  it('is disabled when isPending is true', () => {
    renderFields({ isPending: true })
    // The Select trigger button should be disabled (aria-disabled or disabled attr)
    const trigger = screen.getByRole('combobox', { name: /priority/i })
    expect(trigger).toBeDisabled()
  })
})

describe('WorkItemSelectFields — assignee field', () => {
  it('renders the Assignee label', () => {
    renderFields()
    expect(screen.getByText('Assignee')).toBeInTheDocument()
  })

  it('shows "No assignee" option when persons list is empty', () => {
    mockUsePersons.mockReturnValue({ data: [] })
    renderFields()
    expect(screen.getByText('No assignee')).toBeInTheDocument()
  })

  it('passes persons data to combobox options', () => {
    mockUsePersons.mockReturnValue({
      data: [{ id: 'p-1', firstName: 'Alice', lastName: 'Smith', mail: 'alice@test.com' }],
    })
    renderFields()
    // combobox renders with "No assignee" as default display since value is null
    expect(screen.getByText('No assignee')).toBeInTheDocument()
    mockUsePersons.mockReturnValue({ data: [] })
  })
})

describe('WorkItemSelectFields — status field', () => {
  it('does NOT render the status field when showStatus is false', () => {
    renderFields({ showStatus: false })
    expect(screen.queryByText('Status')).not.toBeInTheDocument()
  })

  it('renders the status field when showStatus is true', () => {
    renderFields({ showStatus: true })
    expect(screen.getByText('Status')).toBeInTheDocument()
  })

  it('disables the status select when disableStatus is true', () => {
    renderFields({ showStatus: true, disableStatus: true })
    const trigger = screen.getByRole('combobox', { name: /^status$/i })
    expect(trigger).toBeDisabled()
  })

  it('does NOT disable the status select when disableStatus is false', () => {
    renderFields({ showStatus: true, disableStatus: false })
    const trigger = screen.getByRole('combobox', { name: /^status$/i })
    expect(trigger).not.toBeDisabled()
  })

  it('renders the rejected option when currentStatus is "rejected"', () => {
    // defaultValues type cast needed because 'rejected' is not in the schema enum
    renderFields({
      showStatus: true,
      defaultValues: { status: 'rejected' } as unknown as Partial<WorkItemFormValues>,
    })
    expect(screen.getByText('Rejected')).toBeInTheDocument()
  })

  it('does NOT render the rejected option when currentStatus is "open"', () => {
    renderFields({
      showStatus: true,
      defaultValues: { status: 'open' } as unknown as Partial<WorkItemFormValues>,
    })
    expect(screen.queryByText('Rejected')).not.toBeInTheDocument()
  })
})

describe('WorkItemSelectFields — labels field', () => {
  it('does NOT render the labels section when there are no available labels', () => {
    mockUseLabels.mockReturnValue({ data: [] })
    renderFields({ scopeType: 'Project', scopeId: 'proj-1' })
    expect(screen.queryByRole('group', { name: /labels/i })).not.toBeInTheDocument()
  })

  it('renders label toggle buttons when labels are available', () => {
    mockUseLabels.mockReturnValue({
      data: [makeLabel('lbl-1', 'Bug', '#ff0000'), makeLabel('lbl-2', 'Feature', null)],
    })
    renderFields({ scopeType: 'Project', scopeId: 'proj-1' })
    expect(screen.getByText('Bug')).toBeInTheDocument()
    expect(screen.getByText('Feature')).toBeInTheDocument()
    mockUseLabels.mockReturnValue({ data: [] })
  })

  it('renders a color swatch for labels that have a short hex color', () => {
    mockUseLabels.mockReturnValue({ data: [makeLabel('lbl-1', 'Bug', '#FF0000')] })
    renderFields({ scopeType: 'Project', scopeId: 'proj-1' })
    const swatch = document.querySelector('span[style*="background-color"]')
    expect(swatch).not.toBeNull()
    mockUseLabels.mockReturnValue({ data: [] })
  })

  it('renders a swatch span for a label with a 9-char hex color (#AARRGGBB)', () => {
    // 9-char hex (length >= 9) triggers the rgba() conversion branch in WorkItemSelectFields.
    // jsdom does not validate rgba() values, so we assert the swatch element is rendered.
    mockUseLabels.mockReturnValue({ data: [makeLabel('lbl-1', 'Rgba Label', '#FF112233')] })
    renderFields({ scopeType: 'Project', scopeId: 'proj-1' })
    expect(screen.getByRole('button', { name: 'Rgba Label' })).toBeInTheDocument()
    const swatches = document.querySelectorAll('span[style]')
    expect(swatches.length).toBeGreaterThan(0)
    mockUseLabels.mockReturnValue({ data: [] })
  })

  it('toggles label selection on click — inactive → active', async () => {
    const user = userEvent.setup()
    mockUseLabels.mockReturnValue({ data: [makeLabel('lbl-1', 'Bug', null)] })
    renderFields({ scopeType: 'Project', scopeId: 'proj-1' })
    const bugBtn = screen.getByRole('button', { name: 'Bug' })
    expect(bugBtn).toHaveAttribute('aria-pressed', 'false')
    await user.click(bugBtn)
    expect(bugBtn).toHaveAttribute('aria-pressed', 'true')
    mockUseLabels.mockReturnValue({ data: [] })
  })

  it('deselects a label when clicked a second time — active → inactive', async () => {
    const user = userEvent.setup()
    mockUseLabels.mockReturnValue({ data: [makeLabel('lbl-1', 'Bug', null)] })
    // pre-select the label via defaultValues
    renderFields({
      scopeType: 'Project',
      scopeId: 'proj-1',
      defaultValues: { labelIds: ['lbl-1'] },
    })
    const bugBtn = screen.getByRole('button', { name: 'Bug' })
    expect(bugBtn).toHaveAttribute('aria-pressed', 'true')
    await user.click(bugBtn)
    expect(bugBtn).toHaveAttribute('aria-pressed', 'false')
    mockUseLabels.mockReturnValue({ data: [] })
  })

  it('label toggle button is disabled when isPending is true', () => {
    mockUseLabels.mockReturnValue({ data: [makeLabel('lbl-1', 'Bug', null)] })
    renderFields({ scopeType: 'Project', scopeId: 'proj-1', isPending: true })
    expect(screen.getByRole('button', { name: 'Bug' })).toBeDisabled()
    mockUseLabels.mockReturnValue({ data: [] })
  })

  it('uses "Project" as default scopeType when none is provided', () => {
    mockUseLabels.mockReturnValue({ data: [] })
    renderFields({ scopeId: 'proj-1' })
    expect(mockUseLabels).toHaveBeenCalledWith('Project', 'proj-1')
  })

  it('passes empty string for scopeId when not provided', () => {
    mockUseLabels.mockReturnValue({ data: [] })
    renderFields({ scopeType: 'Project' })
    expect(mockUseLabels).toHaveBeenCalledWith('Project', '')
  })
})
