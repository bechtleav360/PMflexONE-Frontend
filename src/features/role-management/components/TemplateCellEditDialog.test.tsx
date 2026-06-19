import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type { MatrixRole } from '@/entities/role'
import { i18n } from '@/shared/lib/i18n'

import { useRoleManagementStore } from '../store/roleManagementStore'
import { TemplateCellEditDialog } from './TemplateCellEditDialog'

const mockEditMutateAsync = vi.fn().mockResolvedValue({})
const mockCloseAll = vi.fn()

vi.mock('../hooks/useEditRole', () => ({
  useEditRole: () => ({
    mutateAsync: mockEditMutateAsync,
    isPending: false,
  }),
}))

vi.mock('../store/roleManagementStore', () => ({
  useRoleManagementStore: vi.fn(),
}))

const mockUseRoleManagementStore = vi.mocked(useRoleManagementStore)

const ROLE: MatrixRole = {
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
}

const SELECTED_CELL = {
  roleId: 'role-1',
  taskId: 'task-1',
  currentValue: 'R',
}

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
  mockEditMutateAsync.mockReset().mockResolvedValue({})
  mockCloseAll.mockReset()
  mockUseRoleManagementStore.mockReturnValue({
    isTemplateCellEditOpen: true,
    selectedCell: SELECTED_CELL,
    closeAll: mockCloseAll,
  } as ReturnType<typeof useRoleManagementStore>)
})

const ALL_TASKS = [
  {
    id: 'task-1',
    name: 'Approve Budget',
    description: null,
    isFixed: false,
    resources: [],
    groupId: 'tg-1',
  },
  {
    id: 'task-2',
    name: 'Planning',
    description: null,
    isFixed: false,
    resources: [],
    groupId: 'tg-1',
  },
]

function renderDialog(
  props: { role?: MatrixRole; taskName?: string; roleName?: string; matrixId?: string } = {},
) {
  const Wrapper = makeWrapper()
  render(
    createElement(
      Wrapper,
      null,
      createElement(TemplateCellEditDialog, {
        role: props.role ?? ROLE,
        allTasks: ALL_TASKS,
        taskName: props.taskName ?? 'Approve Budget',
        roleName: props.roleName ?? 'Project Manager',
        matrixId: props.matrixId ?? 'matrix-1',
      }),
    ),
  )
}

describe('TemplateCellEditDialog — visibility', () => {
  it('renders dialog when store isTemplateCellEditOpen is true', () => {
    renderDialog()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('does not render when store is closed', () => {
    mockUseRoleManagementStore.mockReturnValue({
      isTemplateCellEditOpen: false,
      selectedCell: null,
      closeAll: mockCloseAll,
    } as ReturnType<typeof useRoleManagementStore>)
    renderDialog()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

describe('TemplateCellEditDialog — radio options', () => {
  it('renders 6 radio options: R, A, S, C, I, and —', () => {
    renderDialog()
    expect(screen.getByRole('radio', { name: 'R' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'A' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'S' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'C' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'I' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: '—' })).toBeInTheDocument()
  })

  it('pre-selects the current cell value (R)', () => {
    renderDialog()
    const radioR = screen.getByRole('radio', { name: 'R' })
    expect(radioR).toBeChecked()
  })
})

describe('TemplateCellEditDialog — submit', () => {
  it('calls useEditRole with updated tasks array on submit', async () => {
    const user = userEvent.setup()
    renderDialog()
    await user.click(screen.getByRole('radio', { name: 'A' }))
    await user.click(screen.getByRole('button', { name: /save/i }))
    expect(mockEditMutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'role-1',
        tasks: expect.arrayContaining([
          expect.objectContaining({ taskId: 'task-1', permissionKey: 'A' }),
          expect.objectContaining({ taskId: 'task-2', permissionKey: 'A' }),
        ]),
      }),
    )
  })

  it('only changes the selected task permissionKey, not others', async () => {
    const user = userEvent.setup()
    renderDialog()
    await user.click(screen.getByRole('radio', { name: 'C' }))
    await user.click(screen.getByRole('button', { name: /save/i }))
    const call = mockEditMutateAsync.mock.calls[0][0] as {
      tasks: Array<{ taskId: string; permissionKey: string }>
    }
    const task1 = call.tasks.find((t) => t.taskId === 'task-1')
    const task2 = call.tasks.find((t) => t.taskId === 'task-2')
    expect(task1?.permissionKey).toBe('C')
    expect(task2?.permissionKey).toBe('A')
  })
})

describe('TemplateCellEditDialog — cancel', () => {
  it('calls closeAll without mutation when Cancel is clicked', async () => {
    const user = userEvent.setup()
    renderDialog()
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(mockCloseAll).toHaveBeenCalled()
    expect(mockEditMutateAsync).not.toHaveBeenCalled()
  })
})
