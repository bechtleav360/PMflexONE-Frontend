import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import type { MatrixTask, ResolvedMatrixColumn, RoleGroup, TaskGroup } from '@/entities/role'
import { TooltipProvider } from '@/shared/components'
import { i18n } from '@/shared/lib/i18n'

import { RasciMatrix } from './RasciMatrix'

vi.mock('../store/rasciMatrixStore', () => ({
  useRasciMatrixStore: vi.fn(() => ({
    openOverrideDialog: vi.fn(),
    openResetColumnDialog: vi.fn(),
    openDeleteObjectRoleDialog: vi.fn(),
    openEditObjectRoleDialog: vi.fn(),
    openObjectRoleDialog: vi.fn(),
    bulkSelectedCells: new Map(),
    isBulkMode: false,
    toggleBulkMode: vi.fn(),
    isBulkOverrideOpen: false,
    openBulkOverride: vi.fn(),
    openBulkOverrideForTaskGroup: vi.fn(),
    clearBulkSelection: vi.fn(),
    toggleBulkCell: vi.fn(),
  })),
}))

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(TooltipProvider, null, children),
    )
  }
  return Wrapper
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

const ROLE_GROUP: RoleGroup = {
  id: 'grp-1',
  name: 'Management',
  description: null,
  sortOrder: 1,
  color: null,
}

const TASK_GROUP: TaskGroup = { id: 'tg-1', name: 'Phase 1', description: null, sortOrder: 1 }

const TASKS: MatrixTask[] = [
  {
    id: 'task-1',
    name: 'Planning',
    description: null,
    isFixed: false,
    resources: [],
    groupId: 'tg-1',
  },
  {
    id: 'task-2',
    name: 'Execution',
    description: null,
    isFixed: false,
    resources: [],
    groupId: 'tg-1',
  },
]

const COLUMNS: ResolvedMatrixColumn[] = [
  {
    role: {
      id: 'role-1',
      name: 'Project Manager',
      shortTitle: 'PM',
      description: null,
      isFixed: false,
      isDefault: false,
      groupId: 'grp-1',
      tasks: [
        { taskId: 'task-1', permissionKey: 'R' },
        { taskId: 'task-2', permissionKey: 'A' },
      ],
    },
    group: ROLE_GROUP,
    cells: [
      {
        roleId: 'role-1',
        taskId: 'task-1',
        currentValue: 'R',
        templateValue: 'R',
        isOverridden: false,
      },
      {
        roleId: 'role-1',
        taskId: 'task-2',
        currentValue: 'A',
        templateValue: 'A',
        isOverridden: false,
      },
    ],
    hasAnyOverride: false,
    isCustomRole: false,
  },
  {
    role: {
      id: 'role-2',
      name: 'Sponsor',
      shortTitle: 'SP',
      description: null,
      isFixed: false,
      isDefault: false,
      groupId: 'grp-1',
      tasks: [
        { taskId: 'task-1', permissionKey: 'I' },
        { taskId: 'task-2', permissionKey: 'C' },
      ],
    },
    group: ROLE_GROUP,
    cells: [
      {
        roleId: 'role-2',
        taskId: 'task-1',
        currentValue: 'I',
        templateValue: 'R',
        isOverridden: true,
      },
      {
        roleId: 'role-2',
        taskId: 'task-2',
        currentValue: 'C',
        templateValue: 'C',
        isOverridden: false,
      },
    ],
    hasAnyOverride: true,
    isCustomRole: false,
  },
]

const DEFAULT_PROPS = {
  columns: COLUMNS,
  tasks: TASKS,
  taskGroups: [TASK_GROUP],
  roleGroups: [ROLE_GROUP],
  objectId: 'obj-1',
  domainType: 'PROJECT' as const,
  canEdit: true,
  canAddRole: true,
}

function renderMatrix(props: Partial<typeof DEFAULT_PROPS> = {}) {
  const Wrapper = makeWrapper()
  const merged = { ...DEFAULT_PROPS, ...props }
  render(createElement(Wrapper, null, createElement(RasciMatrix, merged)))
}

describe('RasciMatrix — column headers', () => {
  it('renders column headers for each ResolvedMatrixColumn', () => {
    renderMatrix()
    expect(screen.getByText('PM')).toBeInTheDocument()
    expect(screen.getByText('SP')).toBeInTheDocument()
  })
})

describe('RasciMatrix — task rows', () => {
  it('renders task rows in the tbody', () => {
    renderMatrix()
    expect(screen.getByText('Planning')).toBeInTheDocument()
    expect(screen.getByText('Execution')).toBeInTheDocument()
  })
})

describe('RasciMatrix — canEdit gating', () => {
  it('when canEdit is false, cell buttons are disabled', () => {
    renderMatrix({ canEdit: false })
    const buttons = screen.getAllByRole('button')
    // Filter out header buttons (reset column, delete)
    const cellButtons = buttons.filter(
      (btn) =>
        btn.getAttribute('aria-label')?.includes('Planning') ||
        btn.getAttribute('aria-label')?.includes('Execution'),
    )
    expect(cellButtons.length).toBeGreaterThan(0)
    cellButtons.forEach((btn) => {
      expect(btn).toBeDisabled()
    })
  })

  it('when canEdit is true, cell buttons are enabled', () => {
    renderMatrix({ canEdit: true })
    const buttons = screen.getAllByRole('button')
    const cellButtons = buttons.filter(
      (btn) =>
        btn.getAttribute('aria-label')?.includes('Planning') ||
        btn.getAttribute('aria-label')?.includes('Execution'),
    )
    expect(cellButtons.length).toBeGreaterThan(0)
    cellButtons.forEach((btn) => {
      expect(btn).not.toBeDisabled()
    })
  })
})
