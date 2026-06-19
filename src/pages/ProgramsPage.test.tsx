import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type * as ProgramsFeature from '@/features/programs'
import { i18n } from '@/shared/lib/i18n'

import { ProgramsPage } from './ProgramsPage'

const mockOpenCreate = vi.fn()

vi.mock('@/features/programs', async (importOriginal) => {
  const original = await importOriginal<typeof ProgramsFeature>()
  return {
    ...original,
    usePrograms: () => ({ data: [], isPending: false, isError: false }),
    useCreateProgramDialogStore: (
      selector: (s: { open: () => void; isOpen: boolean; defaultPortfolioId: null }) => unknown,
    ) => selector({ open: mockOpenCreate, isOpen: false, defaultPortfolioId: null }),
    useEditProgramDialogStore: (
      selector: (s: { open: () => void; isOpen: boolean; program: null }) => unknown,
    ) => selector({ open: vi.fn(), isOpen: false, program: null }),
    CreateProgramDialog: () => null,
    EditProgramDialog: () => null,
    ProgramList: () => createElement('div', { 'data-testid': 'program-list' }),
  }
})

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(
      MemoryRouter,
      { initialEntries: ['/programs'] },
      createElement(QueryClientProvider, { client: queryClient }, children),
    )
  }
  return Wrapper
}

function renderPage() {
  const Wrapper = makeWrapper()
  return render(createElement(Wrapper, null, createElement(ProgramsPage)))
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

beforeEach(() => {
  mockOpenCreate.mockReset()
})

describe('ProgramsPage — rendering', () => {
  it('renders the page heading', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: /programs/i })).toBeInTheDocument()
  })

  it('renders the New Program button', () => {
    renderPage()
    expect(screen.getByRole('button', { name: /new program/i })).toBeInTheDocument()
  })

  it('renders the program list', () => {
    renderPage()
    expect(screen.getByTestId('program-list')).toBeInTheDocument()
  })
})

describe('ProgramsPage — create dialog', () => {
  it('opens the create dialog when New Program is clicked', async () => {
    renderPage()
    await userEvent.click(screen.getByRole('button', { name: /new program/i }))
    expect(mockOpenCreate).toHaveBeenCalledOnce()
  })
})
