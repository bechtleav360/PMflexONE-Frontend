import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import { ProgramInitiationRequestDialog } from './ProgramInitiationRequestDialog'

let mockIsLoading = false
let mockMode: 'create' | 'edit' | 'view' = 'create'
let mockPirStatus: string | null = null
const mockOnFormSubmit = vi.fn()
const mockOnFormSaveDraft = vi.fn()

vi.mock('../hooks/useProgramInitiationRequestDialog', () => ({
  useProgramInitiationRequestDialog: () => ({
    isLoading: mockIsLoading,
    isMutating: false,
    mode: mockMode,
    dialogTitle:
      mockMode === 'view'
        ? 'Program Initiation Request'
        : mockMode === 'edit'
          ? 'Edit Program Initiation Request'
          : 'New Program Initiation Request',
    pirStatus: mockPirStatus,
    portfolioName: null,
    defaultValues: { requestingProgramId: 'prog-1' },
    onFormSubmit: mockOnFormSubmit,
    onFormSaveDraft: mockMode === 'view' ? undefined : mockOnFormSaveDraft,
  }),
}))

vi.mock('@/features/portfolios', () => ({
  usePortfolios: () => ({ data: [], isPending: false }),
}))

vi.mock('@/features/project-initiation-requests', () => ({
  ProjectInitiationRequestStatusBadge: ({ status }: { status: string }) =>
    createElement('span', { 'data-testid': 'pir-status-badge' }, status),
}))

function wrapper({ children }: { children: React.ReactNode }) {
  return createElement(
    QueryClientProvider,
    { client: new QueryClient({ defaultOptions: { queries: { retry: false } } }) },
    children,
  )
}

function renderDialog(
  props?: Partial<React.ComponentProps<typeof ProgramInitiationRequestDialog>>,
) {
  return render(
    createElement(ProgramInitiationRequestDialog, {
      programId: 'prog-1',
      portfolioId: 'port-1',
      programName: 'Alpha Program',
      isOpen: true,
      onClose: vi.fn(),
      ...props,
    }),
    { wrapper },
  )
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

beforeEach(() => {
  mockIsLoading = false
  mockMode = 'create'
  mockPirStatus = null
  mockOnFormSubmit.mockClear()
  mockOnFormSaveDraft.mockClear()
})

describe('ProgramInitiationRequestDialog', () => {
  it('is not in the DOM when isOpen is false', () => {
    renderDialog({ isOpen: false })

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders the dialog with its title in create mode', () => {
    renderDialog()

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('New Program Initiation Request')).toBeInTheDocument()
  })

  it('shows create description in create mode', () => {
    renderDialog()

    expect(screen.getByText(/formal program initiation request/i)).toBeInTheDocument()
  })

  it('shows skeleton loaders while data is loading', () => {
    mockIsLoading = true
    renderDialog()

    expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument()
  })

  it('shows Save as Draft and Submit buttons in create mode', () => {
    renderDialog()

    expect(screen.getByRole('button', { name: /save as draft/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^submit$/i })).toBeInTheDocument()
  })

  it('hides Save as Draft and Submit buttons in view mode', () => {
    mockMode = 'view'
    renderDialog()

    expect(screen.queryByRole('button', { name: /save as draft/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^submit$/i })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('shows Save as Draft and Submit in edit mode', () => {
    mockMode = 'edit'
    renderDialog()

    expect(screen.getByRole('button', { name: /save as draft/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^submit$/i })).toBeInTheDocument()
  })

  it('shows PIR status badge when pirStatus is set', () => {
    mockMode = 'view'
    mockPirStatus = 'draft'
    renderDialog()

    expect(screen.getByTestId('pir-status-badge')).toBeInTheDocument()
  })

  it('does not show PIR status badge when pirStatus is null', () => {
    mockPirStatus = null
    renderDialog()

    expect(screen.queryByTestId('pir-status-badge')).not.toBeInTheDocument()
  })

  it('calls onClose when the Cancel button is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderDialog({ onClose })

    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(onClose).toHaveBeenCalledOnce()
  })
})
