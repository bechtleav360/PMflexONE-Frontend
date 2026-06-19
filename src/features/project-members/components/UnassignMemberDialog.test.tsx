import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import { useProjectMembersStore } from '../store/projectMembersStore'
import { UnassignMemberDialog } from './UnassignMemberDialog'

const mockMutateAsync = vi.fn().mockResolvedValue({})
const mockCloseAll = vi.fn()

vi.mock('../hooks/useUnassignMember', () => ({
  useUnassignMember: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
}))

vi.mock('../store/projectMembersStore', () => ({
  useProjectMembersStore: vi.fn(),
}))

const mockUseProjectMembersStore = vi.mocked(useProjectMembersStore)

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
  return Wrapper
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

beforeEach(() => {
  mockMutateAsync.mockReset().mockResolvedValue({})
  mockCloseAll.mockReset()
  mockUseProjectMembersStore.mockReturnValue({
    pendingUnassign: { assignmentId: 'a-1', displayName: 'Anna Müller' },
    closeAll: mockCloseAll,
  } as ReturnType<typeof useProjectMembersStore>)
})

function renderDialog() {
  const Wrapper = makeWrapper()
  render(createElement(Wrapper, null, createElement(UnassignMemberDialog, { projectId: 'proj-1' })))
}

describe('UnassignMemberDialog — visibility', () => {
  it('renders dialog when pendingUnassign is set', () => {
    renderDialog()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('does not render dialog when pendingUnassign is null', () => {
    mockUseProjectMembersStore.mockReturnValue({
      pendingUnassign: null,
      closeAll: mockCloseAll,
    } as ReturnType<typeof useProjectMembersStore>)
    renderDialog()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows the member display name in the description', () => {
    renderDialog()
    expect(screen.getByText(/Anna Müller/i)).toBeInTheDocument()
  })
})

describe('UnassignMemberDialog — confirm', () => {
  it('calls useUnassignMember with the assignment id on confirm', async () => {
    const user = userEvent.setup()
    renderDialog()
    // unassignButton translation = "Remove"
    await user.click(screen.getByRole('button', { name: /remove/i }))
    expect(mockMutateAsync).toHaveBeenCalledWith('a-1')
  })

  it('calls closeAll after successful unassign', async () => {
    const user = userEvent.setup()
    renderDialog()
    await user.click(screen.getByRole('button', { name: /remove/i }))
    expect(mockCloseAll).toHaveBeenCalled()
  })
})

describe('UnassignMemberDialog — cancel', () => {
  it('calls closeAll when Cancel is clicked', async () => {
    const user = userEvent.setup()
    renderDialog()
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(mockCloseAll).toHaveBeenCalled()
    expect(mockMutateAsync).not.toHaveBeenCalled()
  })
})
