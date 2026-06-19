import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import { useEditProjectStore } from '../store/editProjectStore'
import { EditProjectModal } from './EditProjectModal'

vi.mock('../hooks/useEditProject', () => ({
  useEditProject: () => ({ mutateAsync: vi.fn(), isPending: false }),
  updateWithToast: vi.fn(),
}))

const mockProject = {
  id: 'e2e00000-0000-0000-0000-000000000001',
  name: 'Basisinfrastruktur',
  description: null,
  status: 'active',
  sizeClassification: 'large' as const,
  governanceStatus: null,
  startDate: '2025-01-01',
  endDate: '2027-12-31',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  version: 1,
}

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
  return render(createElement(Wrapper, null, createElement(EditProjectModal)))
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

beforeEach(() => {
  useEditProjectStore.setState({ open: false, payload: null })
})

describe('EditProjectModal', () => {
  it('does not render dialog content when the store is closed', () => {
    renderModal()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders the dialog with form when the store is open', () => {
    useEditProjectStore.setState({ open: true, payload: mockProject })
    renderModal()

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText(/edit project/i)).toBeInTheDocument()
  })

  it('closes the dialog when the Radix close button is triggered', async () => {
    useEditProjectStore.setState({ open: true, payload: mockProject })
    renderModal()
    const user = userEvent.setup()

    const closeButton = screen.getByRole('button', { name: /close/i })
    await user.click(closeButton)

    expect(useEditProjectStore.getState().open).toBe(false)
  })

  it('closes the dialog when the cancel button inside the form is clicked', async () => {
    useEditProjectStore.setState({ open: true, payload: mockProject })
    renderModal()
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(useEditProjectStore.getState().open).toBe(false)
  })
})
