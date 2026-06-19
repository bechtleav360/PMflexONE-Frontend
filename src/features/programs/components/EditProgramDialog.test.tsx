import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type * as SharedComponents from '@/shared/components'
import { i18n } from '@/shared/lib/i18n'

import { useEditProgramDialogStore } from '../store/useEditProgramDialogStore'
import type { Program } from '../types/program.types'
import { EditProgramDialog } from './EditProgramDialog'

const program: Program = {
  id: 'prog-1',
  version: 2,
  name: 'Alpha Program',
  status: 'active',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-02-01T00:00:00Z',
}

const fullProgram: Program = {
  ...program,
  metadata: null,
  creator: { id: 'u1', firstName: 'Alice', lastName: 'Smith' },
  updater: null,
  portfolio: null,
  projects: [],
}

vi.mock('../hooks/useProgram', () => ({
  useProgram: (id: string | null) => ({ data: id ? fullProgram : null, isPending: false }),
}))

vi.mock('../hooks/useUpdateProgram', () => ({
  useUpdateProgram: () => ({
    mutateAsync: vi.fn().mockResolvedValue({
      id: 'prog-1',
      version: 3,
      name: 'Alpha Program',
      status: 'active',
      createdAt: '',
      updatedAt: '',
    }),
    isPending: false,
  }),
}))

vi.mock('../hooks/useLookupProgramStatus', () => ({
  useLookupProgramStatus: () => ({
    data: [
      { status: 'created', description: 'Created', displayOrder: 1 },
      { status: 'active', description: 'Active', displayOrder: 2 },
    ],
  }),
}))

vi.mock('@/features/portfolios', () => ({
  usePortfolios: () => ({ data: [], isLoading: false }),
}))

vi.mock('@/shared/components', async (importOriginal) => {
  const actual = await importOriginal<typeof SharedComponents>()
  return { ...actual, showSuccess: vi.fn(), showError: vi.fn() }
})

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
  return Wrapper
}

function renderDialog() {
  const Wrapper = makeWrapper()
  return render(createElement(Wrapper, null, createElement(EditProgramDialog)))
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

beforeEach(() => {
  useEditProgramDialogStore.setState({ isOpen: false, program: null })
})

describe('EditProgramDialog — visibility', () => {
  it('does not render dialog when store is closed', () => {
    renderDialog()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders dialog with title when store is open', () => {
    useEditProgramDialogStore.setState({ isOpen: true, program })
    renderDialog()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /edit program/i })).toBeInTheDocument()
  })

  it('does not render form when program is null', () => {
    useEditProgramDialogStore.setState({ isOpen: true, program: null })
    renderDialog()
    expect(screen.queryByRole('button', { name: /save changes/i })).not.toBeInTheDocument()
  })

  it('renders form with name pre-filled once program is loaded', () => {
    useEditProgramDialogStore.setState({ isOpen: true, program })
    renderDialog()
    expect(screen.getByDisplayValue('Alpha Program')).toBeInTheDocument()
  })
})

describe('EditProgramDialog — cancel', () => {
  it('closes the dialog when Cancel is clicked', async () => {
    useEditProgramDialogStore.setState({ isOpen: true, program })
    renderDialog()
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(useEditProgramDialogStore.getState().isOpen).toBe(false)
  })

  it('closes the dialog via Escape key', async () => {
    useEditProgramDialogStore.setState({ isOpen: true, program })
    renderDialog()
    await userEvent.keyboard('{Escape}')
    expect(useEditProgramDialogStore.getState().isOpen).toBe(false)
  })
})
