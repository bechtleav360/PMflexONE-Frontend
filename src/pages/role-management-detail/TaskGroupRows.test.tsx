import { createElement } from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import type { MatrixRole, MatrixTask, PermissionKey, TaskGroup } from '@/entities/role'
import type { BulkSelectedCell } from '@/features/role-management'
import { TooltipProvider } from '@/shared/components'
import { i18n } from '@/shared/lib/i18n'

import { TaskGroupRows } from './TaskGroupRows'

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
  tasks: [{ taskId: 'task-1', permissionKey: 'R' }],
}

const TASK_1: MatrixTask = {
  id: 'task-1',
  name: 'Planning',
  description: null,
  isFixed: false,
  groupId: null,
  resources: [],
}

const TASK_2: MatrixTask = {
  id: 'task-2',
  name: 'Execution',
  description: null,
  isFixed: false,
  groupId: null,
  resources: [],
}

const TASK_GROUP_A: TaskGroup = {
  id: 'tgrp-a',
  name: 'Phase A',
  description: null,
  sortOrder: 1,
}

interface RenderOptions {
  orderedTaskGroupIds?: (string | null)[]
  tasksByGroup?: Map<string | null, MatrixTask[]>
  ungroupedTasks?: MatrixTask[]
  taskGroupMap?: Map<string, TaskGroup>
  roles?: MatrixRole[]
  bulkSelectedCells?: Map<string, BulkSelectedCell>
  isReadOnly?: boolean
  onCellClick?: (e: React.MouseEvent, roleId: string, taskId: string, value: PermissionKey) => void
  onBulkEditForTaskGroup?: (cells: { roleId: string; taskId: string }[], groupName: string) => void
}

const DEFAULT_RENDER_OPTIONS: Required<RenderOptions> = {
  orderedTaskGroupIds: [null],
  tasksByGroup: new Map(),
  ungroupedTasks: [TASK_1],
  taskGroupMap: new Map(),
  roles: [ROLE_A],
  bulkSelectedCells: new Map(),
  isReadOnly: false,
  onCellClick: vi.fn(),
  onBulkEditForTaskGroup: vi.fn(),
}

function renderRows(opts: RenderOptions = {}) {
  const merged = { ...DEFAULT_RENDER_OPTIONS, ...opts }
  const {
    orderedTaskGroupIds,
    tasksByGroup,
    ungroupedTasks,
    taskGroupMap,
    roles,
    bulkSelectedCells,
    isReadOnly,
    onCellClick,
    onBulkEditForTaskGroup,
  } = merged

  render(
    createElement(
      TooltipProvider,
      null,
      createElement(
        'table',
        null,
        createElement(
          'tbody',
          null,
          createElement(TaskGroupRows, {
            orderedTaskGroupIds,
            tasksByGroup,
            ungroupedTasks,
            taskGroupMap,
            roles,
            bulkSelectedCells,
            isReadOnly,
            onCellClick,
            onBulkEditForTaskGroup,
          }),
        ),
      ),
    ),
  )
}

describe('TaskGroupRows — ungrouped tasks', () => {
  it('renders task name for each ungrouped task', () => {
    renderRows({ ungroupedTasks: [TASK_1, TASK_2], orderedTaskGroupIds: [null] })
    expect(screen.getByText('Planning')).toBeInTheDocument()
    expect(screen.getByText('Execution')).toBeInTheDocument()
  })

  it('renders RASCI value badge for each role/task cell', () => {
    renderRows({ ungroupedTasks: [TASK_1], orderedTaskGroupIds: [null] })
    // ROLE_A has R for task-1
    expect(screen.getByText('R')).toBeInTheDocument()
  })
})

describe('TaskGroupRows — grouped tasks', () => {
  it('renders the task group name header', () => {
    const tasksByGroup = new Map<string | null, MatrixTask[]>([['tgrp-a', [TASK_1]]])
    const taskGroupMap = new Map<string, TaskGroup>([['tgrp-a', TASK_GROUP_A]])
    renderRows({
      orderedTaskGroupIds: ['tgrp-a'],
      tasksByGroup,
      ungroupedTasks: [],
      taskGroupMap,
    })
    expect(screen.getByText('Phase A')).toBeInTheDocument()
    expect(screen.getByText('Planning')).toBeInTheDocument()
  })

  it('renders ChevronsUpDown bulk-edit button for each role in a group header row', () => {
    const tasksByGroup = new Map<string | null, MatrixTask[]>([['tgrp-a', [TASK_1]]])
    const taskGroupMap = new Map<string, TaskGroup>([['tgrp-a', TASK_GROUP_A]])
    renderRows({
      orderedTaskGroupIds: ['tgrp-a'],
      tasksByGroup,
      ungroupedTasks: [],
      taskGroupMap,
    })
    // Button aria-label contains role shortTitle and group name
    expect(screen.getByRole('button', { name: /phase a/i })).toBeInTheDocument()
  })

  it('skips rendering group rows when the group has no tasks', () => {
    const tasksByGroup = new Map<string | null, MatrixTask[]>([['tgrp-a', []]])
    const taskGroupMap = new Map<string, TaskGroup>([['tgrp-a', TASK_GROUP_A]])
    renderRows({
      orderedTaskGroupIds: ['tgrp-a'],
      tasksByGroup,
      ungroupedTasks: [],
      taskGroupMap,
    })
    expect(screen.queryByText('Phase A')).not.toBeInTheDocument()
  })
})

describe('TaskGroupRows — cell click callback', () => {
  it('calls onCellClick when a task cell button is clicked', async () => {
    const onCellClick = vi.fn()
    const user = userEvent.setup()
    renderRows({ ungroupedTasks: [TASK_1], orderedTaskGroupIds: [null], onCellClick })
    // There is one cell button for the one role
    const buttons = screen.getAllByRole('button')
    await user.click(buttons[0])
    expect(onCellClick).toHaveBeenCalledWith(expect.anything(), 'role-a', 'task-1', 'R')
  })
})

describe('TaskGroupRows — bulk edit for task group callback', () => {
  it('calls onBulkEditForTaskGroup with cell list and group name when group button is clicked', async () => {
    const onBulkEditForTaskGroup = vi.fn()
    const user = userEvent.setup()
    const tasksByGroup = new Map<string | null, MatrixTask[]>([['tgrp-a', [TASK_1]]])
    const taskGroupMap = new Map<string, TaskGroup>([['tgrp-a', TASK_GROUP_A]])
    renderRows({
      orderedTaskGroupIds: ['tgrp-a'],
      tasksByGroup,
      ungroupedTasks: [],
      taskGroupMap,
      onBulkEditForTaskGroup,
    })
    await user.click(screen.getByRole('button', { name: /phase a/i }))
    expect(onBulkEditForTaskGroup).toHaveBeenCalledWith(
      expect.arrayContaining([{ roleId: 'role-a', taskId: 'task-1' }]),
      'Phase A',
    )
  })
})

describe('TaskGroupRows — selected cell highlight', () => {
  it('applies selected styling when cell is in bulkSelectedCells', () => {
    const bulkSelectedCells = new Map<string, BulkSelectedCell>([
      ['role-a:task-1', { roleId: 'role-a', taskId: 'task-1' }],
    ])
    renderRows({ ungroupedTasks: [TASK_1], orderedTaskGroupIds: [null], bulkSelectedCells })
    const button = screen.getByRole('button', { name: /planning/i })
    expect(button.className).toMatch(/ring-primary/)
  })
})

describe('TaskGroupRows — read-only cell styling', () => {
  it('applies read-only cursor class when isReadOnly is true', () => {
    renderRows({ ungroupedTasks: [TASK_1], orderedTaskGroupIds: [null], isReadOnly: true })
    const button = screen.getByRole('button', { name: /planning/i })
    expect(button.className).toMatch(/cursor-default/)
  })
})
