import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import { ProjectInitiationRequestDialog } from './ProjectInitiationRequestDialog'

let mockIsLoading = false
let mockMode: 'create' | 'edit' | 'view' = 'create'
let mockPirStatus: string | null = null
const mockOnFormSubmit = vi.fn()
const mockOnFormSaveDraft = vi.fn()

vi.mock('../hooks/useProjectInitiationRequestDialog', () => ({
  useProjectInitiationRequestDialog: () => ({
    isLoading: mockIsLoading,
    isMutating: false,
    mode: mockMode,
    dialogTitle:
      mockMode === 'view'
        ? 'Initiation Request'
        : mockMode === 'edit'
          ? 'Edit Initiation Request'
          : 'New Initiation Request',
    pirStatus: mockPirStatus,
    defaultValues: { requestingProjectId: 'e2e00000-0000-0000-0000-000000000001' },
    onFormSubmit: mockOnFormSubmit,
    onFormSaveDraft: mockMode === 'view' ? undefined : mockOnFormSaveDraft,
  }),
}))

vi.mock('@/entities/project', () => ({
  useListProjects: () => ({ data: [], isPending: false }),
}))

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
  return Wrapper
}

function renderDialog(
  props?: Partial<React.ComponentProps<typeof ProjectInitiationRequestDialog>>,
) {
  const Wrapper = makeWrapper()
  return render(
    createElement(
      Wrapper,
      null,
      createElement(ProjectInitiationRequestDialog, {
        projectId: 'e2e00000-0000-0000-0000-000000000001',
        isOpen: true,
        onClose: vi.fn(),
        ...props,
      }),
    ),
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

describe('ProjectInitiationRequestDialog', () => {
  it('is not in the DOM when isOpen is false', () => {
    renderDialog({ isOpen: false })

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders the dialog with its title in create mode', () => {
    renderDialog()

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('New Initiation Request')).toBeInTheDocument()
  })

  it('hides the form and footer while data is loading', () => {
    mockIsLoading = true
    renderDialog()

    expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/project title/i)).not.toBeInTheDocument()
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

  it('calls onClose when the Cancel button is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderDialog({ onClose })

    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(onClose).toHaveBeenCalledOnce()
  })
})
