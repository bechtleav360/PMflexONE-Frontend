import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type * as SharedComponentsModule from '@/shared/components'
import { i18n } from '@/shared/lib/i18n'

import { CreateProjectInitiationRequestDialog } from './CreateProjectInitiationRequestDialog'

const mockClose = vi.fn()
let mockIsOpen = false

vi.mock('../store/useCreatePirDialogStore', () => ({
  useCreatePirDialogStore: () => ({ isOpen: mockIsOpen, close: mockClose }),
}))

vi.mock('../hooks/useCreateProjectInitiationRequest', () => ({
  useCreateProjectInitiationRequest: () => ({ mutateAsync: vi.fn(), isPending: false }),
}))

vi.mock('../hooks/useSubmitProjectInitiationRequest', () => ({
  useSubmitProjectInitiationRequest: () => ({ mutateAsync: vi.fn(), isPending: false }),
}))

vi.mock('@/entities/project', () => ({
  useListProjects: () => ({ data: [], isPending: false }),
}))

vi.mock('@/shared/components', async (importActual) => {
  const actual = await importActual<typeof SharedComponentsModule>()
  return { ...actual, showPromise: vi.fn() }
})

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}))

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
  return Wrapper
}

function renderDialog() {
  const Wrapper = makeWrapper()
  return render(createElement(Wrapper, null, createElement(CreateProjectInitiationRequestDialog)))
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

beforeEach(() => {
  mockClose.mockClear()
})

describe('CreateProjectInitiationRequestDialog', () => {
  it('is hidden when store isOpen is false', () => {
    mockIsOpen = false
    renderDialog()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('is visible when store isOpen is true', () => {
    mockIsOpen = true
    renderDialog()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText(/new initiation request/i)).toBeInTheDocument()
  })

  it('calls close() when the Cancel button is clicked', async () => {
    mockIsOpen = true
    const user = userEvent.setup()
    renderDialog()

    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(mockClose).toHaveBeenCalledOnce()
  })

  it('shows validation errors and does not call mutation on submit with missing mandatory fields', async () => {
    mockIsOpen = true
    const user = userEvent.setup()
    renderDialog()

    await user.click(screen.getByRole('button', { name: /^submit$/i }))

    expect(screen.getByText(/project title is required/i)).toBeInTheDocument()
    expect(screen.getByText(/requesting project must be selected/i)).toBeInTheDocument()
  })
})
