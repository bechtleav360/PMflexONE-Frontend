import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import { useCreateProjectStore } from '../store/createProjectStore'
import { CreateProjectModal } from './CreateProjectModal'

vi.mock('../hooks/useCreateProject', () => ({
  useCreateProject: () => ({ mutate: vi.fn(), isPending: false }),
  submitWithToast: vi.fn(),
}))

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}))

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
  return Wrapper
}

function renderModal() {
  const Wrapper = makeWrapper()
  return render(createElement(Wrapper, null, createElement(CreateProjectModal)))
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

beforeEach(() => {
  // Reset store state before each test
  useCreateProjectStore.setState({ open: false })
})

describe('CreateProjectModal', () => {
  it('does not render the dialog content when the store is closed', () => {
    renderModal()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders the dialog with form when the store is open', async () => {
    useCreateProjectStore.setState({ open: true })
    renderModal()

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText(/new project/i)).toBeInTheDocument()
  })

  it('closes the dialog when the user triggers the close action', async () => {
    useCreateProjectStore.setState({ open: true })
    renderModal()
    const user = userEvent.setup()

    expect(screen.getByRole('dialog')).toBeInTheDocument()

    // Close via the dialog's built-in close button (Radix Dialog renders one)
    const closeButton = screen.getByRole('button', { name: /close/i })
    await user.click(closeButton)

    expect(useCreateProjectStore.getState().open).toBe(false)
  })
})
