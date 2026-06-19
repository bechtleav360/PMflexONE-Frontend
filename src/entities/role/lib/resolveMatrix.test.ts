import { describe, expect, it } from 'vitest'

import type { MatrixDetail, RoleGroup } from '../model/role.types'
import { resolveMatrix } from './resolveMatrix'

const makeRole = (
  id: string,
  tasks: Array<{ taskId: string; permissionKey: string }>,
): MatrixDetail['roles'][number] => ({
  id,
  name: `Role ${id}`,
  shortTitle: id,
  description: null,
  isFixed: false,
  isDefault: false,
  groupId: 'group-1',
  tasks,
})

const makeTask = (id: string): MatrixDetail['tasks'][number] => ({
  id,
  name: `Task ${id}`,
  description: null,
  isFixed: false,
  resources: [],
  groupId: null,
})

const baseMatrix = (roles: MatrixDetail['roles']): MatrixDetail => ({
  id: 'matrix-1',
  domainType: 'PROJECT',
  objectId: 'obj-1',
  roles,
  tasks: [makeTask('task-1'), makeTask('task-2')],
})

const templateMatrix = baseMatrix([
  makeRole('role-1', [
    { taskId: 'task-1', permissionKey: 'R' },
    { taskId: 'task-2', permissionKey: 'A' },
  ]),
])

const roleGroups: RoleGroup[] = [
  { id: 'group-1', name: 'Group 1', description: null, sortOrder: 0, color: null },
]

describe('resolveMatrix', () => {
  it('marks cells as not overridden when they match the template', () => {
    const objectMatrix = baseMatrix([
      makeRole('role-1', [
        { taskId: 'task-1', permissionKey: 'R' },
        { taskId: 'task-2', permissionKey: 'A' },
      ]),
    ])

    const columns = resolveMatrix(objectMatrix, templateMatrix, roleGroups)

    expect(columns).toHaveLength(1)
    expect(columns[0].cells[0].isOverridden).toBe(false)
    expect(columns[0].cells[1].isOverridden).toBe(false)
  })

  it('marks cells as overridden when they differ from the template', () => {
    const objectMatrix = baseMatrix([
      makeRole('role-1', [
        { taskId: 'task-1', permissionKey: 'S' }, // differs from template 'R'
        { taskId: 'task-2', permissionKey: 'A' },
      ]),
    ])

    const columns = resolveMatrix(objectMatrix, templateMatrix, roleGroups)

    expect(columns[0].cells[0].isOverridden).toBe(true)
    expect(columns[0].cells[1].isOverridden).toBe(false)
  })

  it('marks roles absent in template as isCustomRole: true', () => {
    const objectMatrix = baseMatrix([
      makeRole('custom-role', [{ taskId: 'task-1', permissionKey: 'I' }]),
    ])

    const columns = resolveMatrix(objectMatrix, templateMatrix, roleGroups)

    expect(columns[0].isCustomRole).toBe(true)
  })

  it('sets templateValue to null for isCustomRole cells', () => {
    const objectMatrix = baseMatrix([
      makeRole('custom-role', [{ taskId: 'task-1', permissionKey: 'I' }]),
    ])

    const columns = resolveMatrix(objectMatrix, templateMatrix, roleGroups)

    expect(columns[0].cells[0].templateValue).toBeNull()
  })

  it('sets hasAnyOverride: true when at least one cell is overridden', () => {
    const objectMatrix = baseMatrix([
      makeRole('role-1', [
        { taskId: 'task-1', permissionKey: 'C' }, // differs from 'R'
        { taskId: 'task-2', permissionKey: 'A' },
      ]),
    ])

    const columns = resolveMatrix(objectMatrix, templateMatrix, roleGroups)

    expect(columns[0].hasAnyOverride).toBe(true)
  })

  it('sets hasAnyOverride: false when no cells are overridden', () => {
    const objectMatrix = baseMatrix([
      makeRole('role-1', [
        { taskId: 'task-1', permissionKey: 'R' },
        { taskId: 'task-2', permissionKey: 'A' },
      ]),
    ])

    const columns = resolveMatrix(objectMatrix, templateMatrix, roleGroups)

    expect(columns[0].hasAnyOverride).toBe(false)
  })

  it('uses ID-based lookup only — roles with same name but different ID are custom', () => {
    const objectMatrix = baseMatrix([
      makeRole('different-id', [{ taskId: 'task-1', permissionKey: 'R' }]),
    ])
    // The template role has id 'role-1', not 'different-id'
    const columns = resolveMatrix(objectMatrix, templateMatrix, roleGroups)

    expect(columns[0].isCustomRole).toBe(true)
  })
})
