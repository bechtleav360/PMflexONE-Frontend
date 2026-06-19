import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import { useDeliverableFormState } from '../../hooks/useDeliverableFormState'
import { DeliverableFormModal } from './DeliverableFormModal'

vi.mock('../../hooks/useDeliverableFormState')
vi.mock('./DeliverableFormFields', () => ({
  DeliverableFormFields: () => <div data-testid="deliverable-form-fields" />,
}))

const mockUseDeliverableFormState = vi.mocked(useDeliverableFormState)

const MOCK_FORM = {
  handleSubmit: (fn: (values: object) => void) => (e: React.FormEvent) => {
    e.preventDefault()
    fn({})
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- partial mock; UseFormReturn has ~40 fields; only the rendered subset is needed here
  control: {} as any,
  formState: { isDirty: false },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- partial mock; UseFormReturn has ~40 fields; only the rendered subset is needed here
} as any

function makeDefaultState(overrides: object = {}) {
  return {
    form: MOCK_FORM,
    isOpen: true,
    mode: 'create' as const,
    isReadOnly: false,
    isSaving: false,
    personsLoading: false,
    parentOptions: [],
    ownerOptions: [],
    showSkeleton: false,
    titleKey: 'features.deliverablesManagement.actions.create',
    handleClose: vi.fn(),
    onSubmit: vi.fn(),
    unsavedChangesOpen: false,
    handleConfirmDiscard: vi.fn(),
    handleCancelDiscard: vi.fn(),
    inactiveOwnerName: null,
    inactiveSuffix: 'inactive',
    ...overrides,
  }
}

function renderModal() {
  render(<DeliverableFormModal projectId="proj-1" />)
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

beforeEach(() => {
  mockUseDeliverableFormState.mockReturnValue(makeDefaultState())
})

describe('DeliverableFormModal — visibility', () => {
  it('does not render a dialog when isOpen is false', () => {
    mockUseDeliverableFormState.mockReturnValue(makeDefaultState({ isOpen: false }))
    renderModal()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders a dialog when isOpen is true', () => {
    renderModal()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})

describe('DeliverableFormModal — create mode', () => {
  it('shows the "Create deliverable" heading', () => {
    renderModal()
    expect(screen.getByRole('heading', { name: /create deliverable/i })).toBeInTheDocument()
  })

  it('renders the form fields', () => {
    renderModal()
    expect(screen.getByTestId('deliverable-form-fields')).toBeInTheDocument()
  })

  it('shows Save and Cancel buttons', () => {
    renderModal()
    expect(screen.getByRole('button', { name: /^save$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^cancel$/i })).toBeInTheDocument()
  })
})

describe('DeliverableFormModal — read-only mode', () => {
  it('hides the Save button', () => {
    mockUseDeliverableFormState.mockReturnValue(
      makeDefaultState({ isReadOnly: true, mode: 'read' as const }),
    )
    renderModal()
    expect(screen.queryByRole('button', { name: /^save$/i })).not.toBeInTheDocument()
  })

  it('still shows the Cancel button', () => {
    mockUseDeliverableFormState.mockReturnValue(
      makeDefaultState({ isReadOnly: true, mode: 'read' as const }),
    )
    renderModal()
    expect(screen.getByRole('button', { name: /^cancel$/i })).toBeInTheDocument()
  })
})

describe('DeliverableFormModal — skeleton state', () => {
  it('hides the form fields and shows skeletons while loading', () => {
    mockUseDeliverableFormState.mockReturnValue(makeDefaultState({ showSkeleton: true }))
    renderModal()
    expect(screen.queryByTestId('deliverable-form-fields')).not.toBeInTheDocument()
  })
})

describe('DeliverableFormModal — unsaved changes dialog', () => {
  // Render with isOpen:false so only the unsaved-changes dialog is open.
  // When both dialogs are open Radix marks the lower one aria-hidden, making
  // its elements inaccessible to testing-library's accessibility queries.
  it('shows the "Discard changes?" dialog when unsavedChangesOpen is true', () => {
    mockUseDeliverableFormState.mockReturnValue(
      makeDefaultState({ isOpen: false, unsavedChangesOpen: true }),
    )
    renderModal()
    expect(screen.getByRole('heading', { name: /discard changes/i })).toBeInTheDocument()
  })

  it('calls handleConfirmDiscard when Discard is clicked', async () => {
    const handleConfirmDiscard = vi.fn()
    mockUseDeliverableFormState.mockReturnValue(
      makeDefaultState({ isOpen: false, unsavedChangesOpen: true, handleConfirmDiscard }),
    )
    const user = userEvent.setup()
    renderModal()
    await user.click(screen.getByRole('button', { name: /^discard$/i }))
    expect(handleConfirmDiscard).toHaveBeenCalled()
  })

  it('calls handleCancelDiscard when Keep editing is clicked', async () => {
    const handleCancelDiscard = vi.fn()
    mockUseDeliverableFormState.mockReturnValue(
      makeDefaultState({ isOpen: false, unsavedChangesOpen: true, handleCancelDiscard }),
    )
    const user = userEvent.setup()
    renderModal()
    await user.click(screen.getByRole('button', { name: /keep editing/i }))
    expect(handleCancelDiscard).toHaveBeenCalled()
  })
})

describe('DeliverableFormModal — close actions', () => {
  it('calls handleClose when Cancel is clicked', async () => {
    const handleClose = vi.fn()
    mockUseDeliverableFormState.mockReturnValue(makeDefaultState({ handleClose }))
    const user = userEvent.setup()
    renderModal()
    await user.click(screen.getByRole('button', { name: /^cancel$/i }))
    expect(handleClose).toHaveBeenCalled()
  })
})
