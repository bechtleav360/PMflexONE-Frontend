import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import { AssignMemberDialog } from './AssignMemberDialog'

const mockAssignMutateAsync = vi.fn().mockResolvedValue({})
const mockCloseAll = vi.fn()

vi.mock('../hooks/useAssignMember', () => ({
  useAssignMember: () => ({
    mutateAsync: mockAssignMutateAsync,
    isPending: false,
  }),
}))

vi.mock('../store/projectMembersStore', () => ({
  useProjectMembersStore: vi.fn(() => ({
    closeAll: mockCloseAll,
  })),
}))

vi.mock('@/entities/role', () => ({
  useMatrix: () => ({ data: { roles: [{ id: 'r-1', name: 'Project Manager' }] } }),
}))

vi.mock('@/entities/project-member', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>()
  return {
    ...actual,
    searchPersons: vi.fn().mockResolvedValue([]),
  }
})

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
  mockAssignMutateAsync.mockReset().mockResolvedValue({})
  mockCloseAll.mockReset()
})

function renderDialog(open = true) {
  const Wrapper = makeWrapper()
  render(
    createElement(
      Wrapper,
      null,
      createElement(AssignMemberDialog, {
        open,
        projectId: 'proj-1',
      }),
    ),
  )
}

describe('AssignMemberDialog — visibility', () => {
  it('renders dialog when open is true', () => {
    renderDialog(true)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('does not render dialog when open is false', () => {
    renderDialog(false)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders the Assign button', () => {
    renderDialog()
    expect(screen.getByRole('button', { name: /assign/i })).toBeInTheDocument()
  })

  it('renders the Cancel button', () => {
    renderDialog()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })
})
