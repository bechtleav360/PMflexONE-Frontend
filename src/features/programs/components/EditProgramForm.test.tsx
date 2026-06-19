import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ClientError } from 'graphql-request'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type * as SharedComponents from '@/shared/components'
import { showError, showSuccess } from '@/shared/components'
import { i18n } from '@/shared/lib/i18n'

import { useEditProgramDialogStore } from '../store/useEditProgramDialogStore'
import type { Program } from '../types/program.types'
import { EditProgramForm } from './EditProgramForm'

const mockMutateAsync = vi.fn()

vi.mock('../hooks/useUpdateProgram', () => ({
  useUpdateProgram: () => ({ mutateAsync: mockMutateAsync, isPending: false }),
}))

vi.mock('../hooks/useLookupProgramStatus', () => ({
  useLookupProgramStatus: () => ({
    data: [
      { status: 'created', description: 'Created', displayOrder: 1 },
      { status: 'active', description: 'Active', displayOrder: 2 },
      { status: 'completed', description: 'Completed', displayOrder: 3 },
      { status: 'archived', description: 'Archived', displayOrder: 4 },
    ],
  }),
}))

vi.mock('@/features/portfolios', () => ({
  usePortfolios: () => ({
    data: [{ id: 'port-1', name: 'Portfolio A', version: 1, createdAt: '', updatedAt: '' }],
    isLoading: false,
  }),
}))

vi.mock('@/shared/components', async (importOriginal) => {
  const actual = await importOriginal<typeof SharedComponents>()
  return { ...actual, showSuccess: vi.fn(), showError: vi.fn() }
})

const mockShowSuccess = vi.mocked(showSuccess)
const mockShowError = vi.mocked(showError)

const program: Program = {
  id: 'prog-1',
  version: 2,
  name: 'Alpha Program',
  status: 'active',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-02-01T00:00:00Z',
  metadata: null,
  creator: { id: 'u1', firstName: 'Alice', lastName: 'Smith' },
  updater: { id: 'u2', firstName: 'Bob', lastName: 'Jones' },
  portfolio: { item: { id: 'port-1', name: 'Portfolio A' } },
  projects: [],
}

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
  return Wrapper
}

function renderForm(p = program, onVersionConflict?: () => void) {
  const Wrapper = makeWrapper()
  return render(
    createElement(Wrapper, null, createElement(EditProgramForm, { program: p, onVersionConflict })),
  )
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

beforeEach(() => {
  useEditProgramDialogStore.setState({ isOpen: true, program })
  mockShowSuccess.mockReset()
  mockShowError.mockReset()
  mockMutateAsync.mockResolvedValue({
    id: 'prog-1',
    version: 3,
    name: 'Alpha Program',
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
  })
})

describe('EditProgramForm — rendering', () => {
  it('pre-fills the name field with the program name', () => {
    renderForm()
    expect(screen.getByDisplayValue('Alpha Program')).toBeInTheDocument()
  })

  it('renders Cancel and Save Changes buttons', () => {
    renderForm()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument()
  })

  it('shows creator name in the audit section', () => {
    renderForm()
    expect(screen.getByText(/alice smith/i)).toBeInTheDocument()
  })

  it('shows updater name in the audit section', () => {
    renderForm()
    expect(screen.getByText(/bob jones/i)).toBeInTheDocument()
  })

  it('shows no-projects message when projects array is empty', () => {
    renderForm()
    expect(screen.getByText(/no projects assigned/i)).toBeInTheDocument()
  })
})

describe('EditProgramForm — validation', () => {
  it('shows required error when name is cleared and form is submitted', async () => {
    renderForm()
    await userEvent.clear(screen.getByLabelText(/name/i))
    await userEvent.click(screen.getByRole('button', { name: /save changes/i }))
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
  })
})

describe('EditProgramForm — submit', () => {
  it('calls mutateAsync with version from program prop', async () => {
    renderForm()
    await userEvent.click(screen.getByRole('button', { name: /save changes/i }))
    await waitFor(() =>
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'prog-1',
          input: expect.objectContaining({ version: 2 }),
        }),
      ),
    )
  })

  it('shows success toast and closes dialog on success', async () => {
    renderForm()
    await userEvent.click(screen.getByRole('button', { name: /save changes/i }))
    await waitFor(() => expect(mockShowSuccess).toHaveBeenCalledOnce())
    expect(useEditProgramDialogStore.getState().isOpen).toBe(false)
  })

  it('calls onVersionConflict callback on optimistic lock error', async () => {
    const onVersionConflict = vi.fn()
    const err = new ClientError(
      {
        errors: [{ message: 'Version conflict', extensions: { code: 'VERSION_CONFLICT' } }],
        status: 409,
      } as unknown as ConstructorParameters<typeof ClientError>[0],
      { query: '' },
    )
    mockMutateAsync.mockRejectedValue(err)
    renderForm(program, onVersionConflict)
    await userEvent.click(screen.getByRole('button', { name: /save changes/i }))
    await waitFor(() => expect(onVersionConflict).toHaveBeenCalledOnce())
    expect(mockShowError).not.toHaveBeenCalled()
  })

  it('shows error toast for non-conflict errors', async () => {
    mockMutateAsync.mockRejectedValue(new Error('Network error'))
    renderForm()
    await userEvent.click(screen.getByRole('button', { name: /save changes/i }))
    await waitFor(() => expect(mockShowError).toHaveBeenCalledOnce())
  })
})

describe('EditProgramForm — cancel', () => {
  it('closes the dialog when Cancel is clicked', async () => {
    renderForm()
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(useEditProgramDialogStore.getState().isOpen).toBe(false)
  })
})
