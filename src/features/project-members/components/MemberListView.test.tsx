import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type { MemberAssignment } from '@/entities/project-member'
import { i18n } from '@/shared/lib/i18n'

import { useProjectMembersStore } from '../store/projectMembersStore'
import { MemberListView } from './MemberListView'

const mockOpenEdit = vi.fn()
const mockOpenUnassign = vi.fn()

vi.mock('../store/projectMembersStore', () => ({
  useProjectMembersStore: vi.fn(),
}))

const mockUseProjectMembersStore = vi.mocked(useProjectMembersStore)

const ASSIGNMENTS: MemberAssignment[] = [
  {
    id: 'a-1',
    person: { id: 'p-1', firstName: 'Anna', lastName: 'Müller', mail: 'anna@example.com' },
    role: { id: 'r-1', name: 'Project Manager', shortTitle: 'PM' },
    initials: 'AM',
  },
  {
    id: 'a-2',
    person: { id: 'p-2', firstName: null, lastName: null, mail: 'bob@example.com' },
    role: { id: 'r-2', name: 'Developer', shortTitle: 'DEV' },
    initials: null,
  },
  {
    id: 'a-3',
    person: { id: 'p-3', firstName: null, lastName: null, mail: null },
    role: { id: 'r-1', name: 'Project Manager', shortTitle: 'PM' },
    initials: null,
  },
]

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
  mockOpenEdit.mockReset()
  mockOpenUnassign.mockReset()
  mockUseProjectMembersStore.mockReturnValue({
    openEdit: mockOpenEdit,
    openUnassign: mockOpenUnassign,
  } as ReturnType<typeof useProjectMembersStore>)
})

function renderTable(assignments = ASSIGNMENTS) {
  const Wrapper = makeWrapper()
  render(createElement(Wrapper, null, createElement(MemberListView, { assignments })))
}

describe('MemberListView — rendering', () => {
  it('renders the full name when firstName and lastName are set', () => {
    renderTable()
    expect(screen.getByText('Anna Müller')).toBeInTheDocument()
  })

  it('falls back to mail when name is empty', () => {
    renderTable()
    expect(screen.getAllByText('bob@example.com').length).toBeGreaterThan(0)
  })

  it('shows — when neither name nor mail is set', () => {
    renderTable()
    expect(screen.getAllByText('—').length).toBeGreaterThan(0)
  })

  it('renders the role name', () => {
    renderTable()
    expect(screen.getAllByText('Project Manager').length).toBeGreaterThan(0)
  })

  it('renders initials when present', () => {
    renderTable()
    expect(screen.getByText('AM')).toBeInTheDocument()
  })
})

describe('MemberListView — actions', () => {
  it('calls openEdit with the assignment when edit button is clicked', async () => {
    const user = userEvent.setup()
    renderTable()
    // aria-label is t('pages.projectMembers.editButton') = "Save"
    const editButtons = screen.getAllByRole('button', { name: /save/i })
    await user.click(editButtons[0])
    expect(mockOpenEdit).toHaveBeenCalledWith(ASSIGNMENTS[0])
  })

  it('calls openUnassign with assignment id and display name when unassign is clicked', async () => {
    const user = userEvent.setup()
    renderTable()
    // aria-label is t('pages.projectMembers.unassignButton') = "Remove"
    const unassignButtons = screen.getAllByRole('button', { name: /remove/i })
    await user.click(unassignButtons[0])
    expect(mockOpenUnassign).toHaveBeenCalledWith('a-1', 'Anna Müller')
  })

  it('uses mail as display name in openUnassign when name is empty', async () => {
    const user = userEvent.setup()
    renderTable()
    const unassignButtons = screen.getAllByRole('button', { name: /remove/i })
    await user.click(unassignButtons[1])
    expect(mockOpenUnassign).toHaveBeenCalledWith('a-2', 'bob@example.com')
  })
})
