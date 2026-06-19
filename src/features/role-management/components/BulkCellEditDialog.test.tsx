import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type { MatrixRole, MatrixTask } from '@/entities/role'
import { i18n } from '@/shared/lib/i18n'

import { useRoleManagementStore } from '../store/roleManagementStore'
import { BulkCellEditDialog } from './BulkCellEditDialog'

const mockMutateAsync = vi.fn().mockResolvedValue({})
const mockClearBulkSelection = vi.fn()

vi.mock('../hooks/useEditRole', () => ({
  useEditRole: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
}))

vi.mock('../store/roleManagementStore', () => ({
  useRoleManagementStore: vi.fn(),
}))

const mockUseRoleManagementStore = vi.mocked(useRoleManagementStore)

const ROLES: MatrixRole[] = [
  {
    id: 'role-1',
    name: 'Project Manager',
    shortTitle: 'PM',
    description: null,
    isFixed: false,
    isDefault: false,
    groupId: 'grp-1',
    tasks: [{ taskId: 'task-1', permissionKey: 'R' }],
  },
  {
    id: 'role-2',
    name: 'Developer',
    shortTitle: 'DEV',
    description: null,
    isFixed: false,
    isDefault: false,
    groupId: 'grp-1',
    tasks: [],
  },
]

const ALL_TASKS: MatrixTask[] = [
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

const SELECTED_CELLS = new Map([['role-1:task-1', { roleId: 'role-1', taskId: 'task-1' }]])

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
  mockMutateAsync.mockReset().mockResolvedValue({})
  mockClearBulkSelection.mockReset()
  mockUseRoleManagementStore.mockReturnValue({
    isBulkEditOpen: true,
    bulkSelectedCells: SELECTED_CELLS,
    bulkContextLabel: null,
    clearBulkSelection: mockClearBulkSelection,
  } as ReturnType<typeof useRoleManagementStore>)
})

function renderDialog() {
  const Wrapper = makeWrapper()
  render(
    createElement(
      Wrapper,
      null,
      createElement(BulkCellEditDialog, {
        roles: ROLES,
        allTasks: ALL_TASKS,
        matrixId: 'matrix-1',
      }),
    ),
  )
}

describe('BulkCellEditDialog — visibility', () => {
  it('renders dialog when isBulkEditOpen is true and cells are selected', () => {
    renderDialog()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('does not render dialog when isBulkEditOpen is false', () => {
    mockUseRoleManagementStore.mockReturnValue({
      isBulkEditOpen: false,
      bulkSelectedCells: SELECTED_CELLS,
      bulkContextLabel: null,
      clearBulkSelection: mockClearBulkSelection,
    } as ReturnType<typeof useRoleManagementStore>)
    renderDialog()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('does not render dialog when bulkSelectedCells is empty', () => {
    mockUseRoleManagementStore.mockReturnValue({
      isBulkEditOpen: true,
      bulkSelectedCells: new Map(),
      bulkContextLabel: null,
      clearBulkSelection: mockClearBulkSelection,
    } as ReturnType<typeof useRoleManagementStore>)
    renderDialog()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows context label when bulkContextLabel is set', () => {
    mockUseRoleManagementStore.mockReturnValue({
      isBulkEditOpen: true,
      bulkSelectedCells: SELECTED_CELLS,
      bulkContextLabel: 'Task Group Alpha',
      clearBulkSelection: mockClearBulkSelection,
    } as ReturnType<typeof useRoleManagementStore>)
    renderDialog()
    expect(screen.getByText(/task group alpha/i)).toBeInTheDocument()
  })
})

describe('BulkCellEditDialog — radio options', () => {
  it('renders all 6 RASCI permission options', () => {
    renderDialog()
    for (const id of [
      'bulk-perm-R',
      'bulk-perm-A',
      'bulk-perm-S',
      'bulk-perm-C',
      'bulk-perm-I',
      'bulk-perm-—',
    ]) {
      expect(document.getElementById(id)).toBeInTheDocument()
    }
  })

  it('defaults to — as the selected value', () => {
    renderDialog()
    expect(document.getElementById('bulk-perm-—')).toBeChecked()
  })
})

describe('BulkCellEditDialog — submit', () => {
  it('calls useEditRole with the selected permission value on save', async () => {
    const user = userEvent.setup()
    renderDialog()
    await user.click(document.getElementById('bulk-perm-A')!)
    await user.click(screen.getByRole('button', { name: /save/i }))
    expect(mockMutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'role-1',
        tasks: expect.arrayContaining([
          expect.objectContaining({ taskId: 'task-1', permissionKey: 'A' }),
        ]),
      }),
    )
  })

  it('calls clearBulkSelection after save', async () => {
    const user = userEvent.setup()
    renderDialog()
    await user.click(screen.getByRole('button', { name: /save/i }))
    expect(mockClearBulkSelection).toHaveBeenCalled()
  })

  it('filters out — tasks before sending to mutation', async () => {
    const user = userEvent.setup()
    renderDialog()
    // Default value is — so task-1 should be filtered out
    await user.click(screen.getByRole('button', { name: /save/i }))
    expect(mockMutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'role-1',
        tasks: expect.not.arrayContaining([
          expect.objectContaining({ taskId: 'task-1', permissionKey: '—' }),
        ]),
      }),
    )
  })
})

describe('BulkCellEditDialog — cancel', () => {
  it('calls clearBulkSelection when Cancel is clicked', async () => {
    const user = userEvent.setup()
    renderDialog()
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(mockClearBulkSelection).toHaveBeenCalled()
    expect(mockMutateAsync).not.toHaveBeenCalled()
  })
})
