import { createElement } from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import type { MatrixRole, RoleGroup } from '@/entities/role'
import { TooltipProvider } from '@/shared/components'
import { i18n } from '@/shared/lib/i18n'

import { RoleHeaderRows } from './RoleHeaderRows'

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

const ROLE_A: MatrixRole = {
  id: 'role-a',
  name: 'Project Manager',
  shortTitle: 'PM',
  description: null,
  isFixed: false,
  isDefault: false,
  groupId: 'grp-1',
  tasks: [],
}

const ROLE_B: MatrixRole = {
  id: 'role-b',
  name: 'System Admin',
  shortTitle: 'SA',
  description: null,
  isFixed: true,
  isDefault: false,
  groupId: 'grp-1',
  tasks: [],
}

const GROUP_1: RoleGroup = {
  id: 'grp-1',
  name: 'Management',
  description: null,
  sortOrder: 1,
  color: null,
}

function buildMap(...groups: RoleGroup[]): Map<string, RoleGroup> {
  return new Map(groups.map((g) => [g.id, g]))
}

interface RenderOptions {
  roles?: MatrixRole[]
  isReadOnly?: boolean
  onEditRole?: (id: string) => void
  onDeleteRole?: (id: string) => void
}

function renderRows(opts: RenderOptions = {}) {
  const {
    roles = [ROLE_A],
    isReadOnly = false,
    onEditRole = vi.fn(),
    onDeleteRole = vi.fn(),
  } = opts

  const roleGroupMap = buildMap(GROUP_1)
  const orderedGroupIds = ['grp-1']

  render(
    createElement(
      TooltipProvider,
      null,
      createElement(
        'table',
        null,
        createElement(
          'thead',
          null,
          createElement(RoleHeaderRows, {
            roles,
            orderedGroupIds,
            roleGroupMap,
            isReadOnly,
            onEditRole,
            onDeleteRole,
          }),
        ),
      ),
    ),
  )
}

describe('RoleHeaderRows — role column headers', () => {
  it('renders short title for each role', () => {
    renderRows({ roles: [ROLE_A] })
    expect(screen.getByText('PM')).toBeInTheDocument()
  })

  it('renders group name in the group span row', () => {
    renderRows({ roles: [ROLE_A] })
    expect(screen.getByText('Management')).toBeInTheDocument()
  })
})

describe('RoleHeaderRows — edit/delete buttons visibility', () => {
  it('shows edit and delete buttons when not read-only and role is not fixed', () => {
    renderRows({ roles: [ROLE_A], isReadOnly: false })
    expect(screen.getByRole('button', { name: /edit role/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /delete role/i })).toBeInTheDocument()
  })

  it('hides edit and delete buttons when isReadOnly is true', () => {
    renderRows({ roles: [ROLE_A], isReadOnly: true })
    expect(screen.queryByRole('button', { name: /edit role/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /delete role/i })).not.toBeInTheDocument()
  })

  it('hides edit and delete buttons when role is fixed (even if not read-only)', () => {
    renderRows({ roles: [ROLE_B], isReadOnly: false })
    expect(screen.queryByRole('button', { name: /edit role/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /delete role/i })).not.toBeInTheDocument()
  })
})

describe('RoleHeaderRows — callbacks', () => {
  it('calls onEditRole with the role id when edit button is clicked', async () => {
    const onEditRole = vi.fn()
    const user = userEvent.setup()
    renderRows({ roles: [ROLE_A], onEditRole })
    await user.click(screen.getByRole('button', { name: /edit role/i }))
    expect(onEditRole).toHaveBeenCalledWith('role-a')
  })

  it('calls onDeleteRole with the role id when delete button is clicked', async () => {
    const onDeleteRole = vi.fn()
    const user = userEvent.setup()
    renderRows({ roles: [ROLE_A], onDeleteRole })
    await user.click(screen.getByRole('button', { name: /delete role/i }))
    expect(onDeleteRole).toHaveBeenCalledWith('role-a')
  })
})

describe('RoleHeaderRows — group fallback label', () => {
  it('renders the groupId as label when the group is not in the map', () => {
    const roleGroupMap = new Map<string, RoleGroup>()
    render(
      createElement(
        TooltipProvider,
        null,
        createElement(
          'table',
          null,
          createElement(
            'thead',
            null,
            createElement(RoleHeaderRows, {
              roles: [ROLE_A],
              orderedGroupIds: ['grp-1'],
              roleGroupMap,
              isReadOnly: false,
              onEditRole: vi.fn(),
              onDeleteRole: vi.fn(),
            }),
          ),
        ),
      ),
    )
    expect(screen.getByText('grp-1')).toBeInTheDocument()
  })
})
