import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type { MatrixRole, RoleGroup } from '@/entities/role'
import { i18n } from '@/shared/lib/i18n'

import { useRoleManagementStore } from '../store/roleManagementStore'
import { RoleList } from './RoleList'

vi.mock('../store/roleManagementStore', () => ({
  useRoleManagementStore: vi.fn(),
}))

const mockOpenAddRole = vi.fn()
const mockOpenEditRole = vi.fn()
const mockOpenDeleteRole = vi.fn()

const mockUseRoleManagementStore = vi.mocked(useRoleManagementStore)

const ROLE_GROUPS: RoleGroup[] = [
  { id: 'grp-1', name: 'Management', description: null, sortOrder: 1, color: null },
  { id: 'grp-2', name: 'Operations', description: null, sortOrder: 2, color: null },
]

const ROLES: MatrixRole[] = [
  {
    id: 'role-1',
    name: 'Project Manager',
    shortTitle: 'PM',
    description: null,
    isFixed: false,
    isDefault: false,
    groupId: 'grp-1',
    tasks: [],
  },
  {
    id: 'role-2',
    name: 'System Role',
    shortTitle: 'SYS',
    description: null,
    isFixed: true,
    isDefault: false,
    groupId: 'grp-1',
    tasks: [],
  },
  {
    id: 'role-3',
    name: 'Developer',
    shortTitle: 'DEV',
    description: null,
    isFixed: false,
    isDefault: false,
    groupId: 'grp-2',
    tasks: [],
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
  mockUseRoleManagementStore.mockReturnValue({
    openAddRole: mockOpenAddRole,
    openEditRole: mockOpenEditRole,
    openDeleteRole: mockOpenDeleteRole,
  } as ReturnType<typeof useRoleManagementStore>)
  mockOpenAddRole.mockReset()
  mockOpenEditRole.mockReset()
  mockOpenDeleteRole.mockReset()
})

function renderRoleList(roles = ROLES, roleGroups = ROLE_GROUPS) {
  const Wrapper = makeWrapper()
  render(createElement(Wrapper, null, createElement(RoleList, { roles, roleGroups })))
}

describe('RoleList — structure', () => {
  it('renders role list with roles grouped by role group', () => {
    renderRoleList()
    expect(screen.getByText('Management')).toBeInTheDocument()
    expect(screen.getByText('Operations')).toBeInTheDocument()
    expect(screen.getByText('Project Manager')).toBeInTheDocument()
    expect(screen.getByText('Developer')).toBeInTheDocument()
  })

  it('shows Add Role button when roles exist', () => {
    renderRoleList()
    expect(screen.getByRole('button', { name: /add role/i })).toBeInTheDocument()
  })

  it('shows Add Role button when list is empty', () => {
    renderRoleList([], ROLE_GROUPS)
    expect(screen.getByRole('button', { name: /add role/i })).toBeInTheDocument()
  })
})

describe('RoleList — isFixed behaviour', () => {
  it('hides Edit/Delete buttons for roles where isFixed is true', () => {
    renderRoleList()
    // System Role is isFixed=true — delete should not exist
    const editButtons = screen.getAllByRole('button', { name: /edit/i })
    // Only 2 edit buttons: PM and Developer (not SYS)
    expect(editButtons).toHaveLength(2)
  })

  it('shows Edit button for isFixed: false roles', () => {
    renderRoleList()
    expect(screen.getAllByRole('button', { name: /edit/i })).toHaveLength(2)
  })

  it('shows Delete button only for isFixed: false roles', () => {
    renderRoleList()
    expect(screen.getAllByRole('button', { name: /delete/i })).toHaveLength(2)
  })
})

describe('RoleList — empty state', () => {
  it('renders empty-state message when no roles are defined', () => {
    renderRoleList([], ROLE_GROUPS)
    expect(screen.getByText(/no roles defined yet/i)).toBeInTheDocument()
  })

  it('still shows Add Role button in empty state', () => {
    renderRoleList([], ROLE_GROUPS)
    expect(screen.getByRole('button', { name: /add role/i })).toBeInTheDocument()
  })
})

describe('RoleList — interactions', () => {
  it('calls openAddRole when Add Role is clicked', async () => {
    const user = userEvent.setup()
    renderRoleList()
    await user.click(screen.getByRole('button', { name: /add role/i }))
    expect(mockOpenAddRole).toHaveBeenCalledOnce()
  })

  it('calls openEditRole with role id when Edit is clicked', async () => {
    const user = userEvent.setup()
    renderRoleList()
    const editButtons = screen.getAllByRole('button', { name: /edit/i })
    await user.click(editButtons[0])
    expect(mockOpenEditRole).toHaveBeenCalledWith(expect.any(String))
  })

  it('calls openDeleteRole with role id when Delete is clicked', async () => {
    const user = userEvent.setup()
    renderRoleList()
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
    await user.click(deleteButtons[0])
    expect(mockOpenDeleteRole).toHaveBeenCalledWith(expect.any(String))
  })
})

describe('RoleList — ungrouped roles', () => {
  const UNGROUPED_ROLE: MatrixRole = {
    id: 'role-ungrouped',
    name: 'Ungrouped Role',
    shortTitle: 'UGR',
    description: null,
    isFixed: false,
    isDefault: false,
    groupId: 'grp-nonexistent',
    tasks: [],
  }

  const FIXED_UNGROUPED_ROLE: MatrixRole = {
    id: 'role-ungrouped-fixed',
    name: 'Fixed Ungrouped',
    shortTitle: 'FUG',
    description: null,
    isFixed: true,
    isDefault: false,
    groupId: 'grp-nonexistent',
    tasks: [],
  }

  it('renders ungrouped roles section when roles have no matching group', () => {
    renderRoleList([UNGROUPED_ROLE], ROLE_GROUPS)
    expect(screen.getByText('Ungrouped Role')).toBeInTheDocument()
  })

  it('shows Edit/Delete for non-fixed ungrouped roles', async () => {
    const user = userEvent.setup()
    renderRoleList([UNGROUPED_ROLE], ROLE_GROUPS)
    const editButtons = screen.getAllByRole('button', { name: /edit/i })
    await user.click(editButtons[0])
    expect(mockOpenEditRole).toHaveBeenCalledWith('role-ungrouped')
  })

  it('hides Edit/Delete for fixed ungrouped roles', () => {
    renderRoleList([FIXED_UNGROUPED_ROLE], ROLE_GROUPS)
    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument()
  })

  it('calls openDeleteRole for ungrouped non-fixed role', async () => {
    const user = userEvent.setup()
    renderRoleList([UNGROUPED_ROLE], ROLE_GROUPS)
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
    await user.click(deleteButtons[0])
    expect(mockOpenDeleteRole).toHaveBeenCalledWith('role-ungrouped')
  })
})
