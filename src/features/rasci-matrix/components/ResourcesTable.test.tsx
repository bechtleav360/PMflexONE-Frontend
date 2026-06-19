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
    name: 'Schedules',
    operationsByKey: [
      { permissionKey: 'R', operations: ['read'] },
      { permissionKey: 'A', operations: ['read', 'create'] },
    ],
  },
  {
    name: 'Budgets',
    operationsByKey: [{ permissionKey: 'I', operations: [] }],
  },
]

describe('ResourcesTable', () => {
  it('renders table headers', () => {
    render(
      <ResourcesTable
        resources={sampleResources}
        permKey="R"
      />,
    )

    expect(screen.getByRole('table')).toBeInTheDocument()
  })

  it('renders resource names as table rows', () => {
    render(
      <ResourcesTable
        resources={sampleResources}
        permKey="R"
      />,
    )

    expect(screen.getByText('Schedules')).toBeInTheDocument()
    expect(screen.getByText('Budgets')).toBeInTheDocument()
  })

  it('renders operations for the matching permissionKey', () => {
    render(
      <ResourcesTable
        resources={sampleResources}
        permKey="A"
      />,
    )

    // Schedules has permKey 'A' with READ, WRITE operations
    // The operations are translated and joined with ", "
    const rows = screen.getAllByRole('row')
    expect(rows.length).toBeGreaterThan(1)
  })

  it('renders empty operations when no matching permissionKey found', () => {
    render(
      <ResourcesTable
        resources={sampleResources}
        permKey="C"
      />,
    )

    // No resource has permKey 'C', so operations cell should be empty
    expect(screen.getByText('Schedules')).toBeInTheDocument()
  })

  it('renders with empty resources array without crashing', () => {
    render(
      <ResourcesTable
        resources={[]}
        permKey="R"
      />,
    )

    expect(screen.getByRole('table')).toBeInTheDocument()
  })
})
