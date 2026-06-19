import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type * as SharedComponents from '@/shared/components'
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
    data: [{ status: 'active', description: 'Active', displayOrder: 1 }],
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

const program: Program = {
  id: 'prog-1',
  version: 1,
  name: 'Alpha Program',
  status: 'active',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  portfolio: { item: { id: 'port-1', name: 'Portfolio A' } },
  projects: [],
}

const programWithoutPortfolio: Program = {
  ...program,
  portfolio: undefined,
}

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
  return Wrapper
}

function renderForm(p = program) {
  const Wrapper = makeWrapper()
  return render(createElement(Wrapper, null, createElement(EditProgramForm, { program: p })))
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

beforeEach(() => {
  useEditProgramDialogStore.setState({ isOpen: true, program })
  mockMutateAsync.mockResolvedValue({
    id: 'prog-1',
    version: 2,
    name: 'Alpha Program',
    status: 'active',
    createdAt: '',
    updatedAt: '',
  })
})

describe('EditProgramForm — portfolio assignment', () => {
  it('passes portfolioId from pre-selected portfolio on submit', async () => {
    renderForm()
    await userEvent.click(screen.getByRole('button', { name: /save changes/i }))
    await waitFor(() =>
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({ portfolioId: 'port-1' }),
        }),
      ),
    )
  })

  it('passes portfolioId: null when program has no portfolio', async () => {
    renderForm(programWithoutPortfolio)
    await userEvent.click(screen.getByRole('button', { name: /save changes/i }))
    await waitFor(() =>
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({ portfolioId: null }),
        }),
      ),
    )
  })
})
