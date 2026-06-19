import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import { useDeleteProjectStore } from '../store/deleteProjectStore'
import { DeleteProjectDialog } from './DeleteProjectDialog'

const mockDeleteWithToast = vi.hoisted(() => vi.fn())

vi.mock('../hooks/useDeleteProject', () => ({
  useDeleteProject: () => ({ mutateAsync: vi.fn(), isPending: false }),
  deleteWithToast: mockDeleteWithToast,
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

function renderDialog() {
  const Wrapper = makeWrapper()
  return render(createElement(Wrapper, null, createElement(DeleteProjectDialog)))
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

beforeEach(() => {
  mockDeleteWithToast.mockClear()
  useDeleteProjectStore.setState({ open: false, payload: null })
})

describe('DeleteProjectDialog', () => {
  it('does not render dialog content when the store is closed', () => {
    renderDialog()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders dialog content when the store is open', () => {
    useDeleteProjectStore.setState({ open: true, payload: 'e2e00000-0000-0000-0000-000000000001' })
    renderDialog()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('calls deleteWithToast when confirm is clicked with a payload', async () => {
    useDeleteProjectStore.setState({ open: true, payload: 'e2e00000-0000-0000-0000-000000000001' })
    renderDialog()
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: /^delete$/i }))

    expect(mockDeleteWithToast).toHaveBeenCalledWith(
      expect.any(Function),
      'e2e00000-0000-0000-0000-000000000001',
      expect.objectContaining({ loading: expect.any(String) }),
    )
  })

  it('does not call deleteWithToast when confirm is clicked without a payload', async () => {
    useDeleteProjectStore.setState({ open: true, payload: null })
    renderDialog()
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: /^delete$/i }))

    expect(mockDeleteWithToast).not.toHaveBeenCalled()
  })

  it('closes the dialog when cancel is clicked', async () => {
    useDeleteProjectStore.setState({ open: true, payload: 'e2e00000-0000-0000-0000-000000000001' })
    renderDialog()
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(useDeleteProjectStore.getState().open).toBe(false)
  })

  it('closes the dialog when the Radix close button is triggered', async () => {
    useDeleteProjectStore.setState({ open: true, payload: 'e2e00000-0000-0000-0000-000000000001' })
    renderDialog()
    const user = userEvent.setup()

    const closeButton = screen.getByRole('button', { name: /close/i })
    await user.click(closeButton)

    expect(useDeleteProjectStore.getState().open).toBe(false)
  })
})
