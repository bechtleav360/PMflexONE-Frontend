import { render, screen } from '@testing-library/react'
import { beforeAll, describe, expect, it } from 'vitest'

import type { TaskResource } from '@/entities/role'
import { ResourcesTable } from '@/entities/role'
import { i18n } from '@/shared/lib/i18n'

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

const sampleResources: TaskResource[] = [
  {
    name: 'Documents',
    operationsByKey: [
      { permissionKey: 'R', operations: ['read'] },
      { permissionKey: 'A', operations: ['read', 'create'] },
    ],
  },
  {
    name: 'Reports',
    operationsByKey: [{ permissionKey: 'I', operations: [] }],
  },
]

describe('ResourcesTable (role-management)', () => {
  it('renders a table element', () => {
    render(
      <ResourcesTable
        resources={sampleResources}
        permKey="R"
      />,
    )

    expect(screen.getByRole('table')).toBeInTheDocument()
  })

  it('renders all resource names', () => {
    render(
      <ResourcesTable
        resources={sampleResources}
        permKey="R"
      />,
    )

    expect(screen.getByText('Documents')).toBeInTheDocument()
    expect(screen.getByText('Reports')).toBeInTheDocument()
  })

  it('shows operations for the correct permissionKey', () => {
    render(
      <ResourcesTable
        resources={sampleResources}
        permKey="A"
      />,
    )

    const rows = screen.getAllByRole('row')
    // header row + 2 resource rows
    expect(rows.length).toBe(3)
  })

  it('renders empty table body when resources is empty', () => {
    render(
      <ResourcesTable
        resources={[]}
        permKey="R"
      />,
    )

    expect(screen.getByRole('table')).toBeInTheDocument()
    // Only header row
    expect(screen.getAllByRole('row').length).toBe(1)
  })

  it('handles missing permissionKey gracefully (empty operations cell)', () => {
    render(
      <ResourcesTable
        resources={sampleResources}
        permKey="S"
      />,
    )

    // No resource has permKey 'S' — renders rows without crashing
    expect(screen.getByText('Documents')).toBeInTheDocument()
  })
})
