import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import { useRasciMatrixStore } from '../store/rasciMatrixStore'
import { BulkOverrideDialog } from './BulkOverrideDialog'

const mockMutateAsync = vi.fn().mockResolvedValue({})
const mockClearBulkSelection = vi.fn()

vi.mock('../hooks/useChangeObjectRolePermission', () => ({
  useChangeObjectRolePermission: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
}))

vi.mock('../store/rasciMatrixStore', () => ({
  useRasciMatrixStore: vi.fn(),
}))

const mockUseRasciMatrixStore = vi.mocked(useRasciMatrixStore)

const SELECTED_CELLS = new Map([
  ['role-1:task-1', { roleId: 'role-1', taskId: 'task-1' }],
  ['role-1:task-2', { roleId: 'role-1', taskId: 'task-2' }],
])

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
  mockUseRasciMatrixStore.mockReturnValue({
    isBulkOverrideOpen: true,
    bulkSelectedCells: SELECTED_CELLS,
    bulkContextLabel: null,
    clearBulkSelection: mockClearBulkSelection,
  } as ReturnType<typeof useRasciMatrixStore>)
})

function renderDialog() {
  const Wrapper = makeWrapper()
  render(
    createElement(
      Wrapper,
      null,
      createElement(BulkOverrideDialog, {
        objectId: 'obj-1',
        domainType: 'PROJECT' as const,
      }),
    ),
  )
}

describe('BulkOverrideDialog — visibility', () => {
  it('renders dialog when isBulkOverrideOpen is true and cells are selected', () => {
    renderDialog()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('does not render dialog when isBulkOverrideOpen is false', () => {
    mockUseRasciMatrixStore.mockReturnValue({
      isBulkOverrideOpen: false,
      bulkSelectedCells: SELECTED_CELLS,
      bulkContextLabel: null,
      clearBulkSelection: mockClearBulkSelection,
    } as ReturnType<typeof useRasciMatrixStore>)
    renderDialog()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('does not render dialog when bulkSelectedCells is empty', () => {
    mockUseRasciMatrixStore.mockReturnValue({
      isBulkOverrideOpen: true,
      bulkSelectedCells: new Map(),
      bulkContextLabel: null,
      clearBulkSelection: mockClearBulkSelection,
    } as ReturnType<typeof useRasciMatrixStore>)
    renderDialog()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows context label when bulkContextLabel is set', () => {
    mockUseRasciMatrixStore.mockReturnValue({
      isBulkOverrideOpen: true,
      bulkSelectedCells: SELECTED_CELLS,
      bulkContextLabel: 'Sprint Tasks',
      clearBulkSelection: mockClearBulkSelection,
    } as ReturnType<typeof useRasciMatrixStore>)
    renderDialog()
    expect(screen.getByText(/sprint tasks/i)).toBeInTheDocument()
  })
})

describe('BulkOverrideDialog — radio options', () => {
  it('renders all 6 RASCI permission options', () => {
    renderDialog()
    for (const id of [
      'bulk-override-perm-R',
      'bulk-override-perm-A',
      'bulk-override-perm-S',
      'bulk-override-perm-C',
      'bulk-override-perm-I',
      'bulk-override-perm-—',
    ]) {
      expect(document.getElementById(id)).toBeInTheDocument()
    }
  })

  it('defaults to — as the selected value', () => {
    renderDialog()
    expect(document.getElementById('bulk-override-perm-—')).toBeChecked()
  })
})

describe('BulkOverrideDialog — submit', () => {
  it('calls mutation for each selected cell on save', async () => {
    const user = userEvent.setup()
    renderDialog()
    await user.click(document.getElementById('bulk-override-perm-R')!)
    await user.click(screen.getByRole('button', { name: /save/i }))
    expect(mockMutateAsync).toHaveBeenCalledTimes(2)
    expect(mockMutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        objectId: 'obj-1',
        domainType: 'PROJECT',
        permissionKey: 'R',
      }),
    )
  })

  it('calls clearBulkSelection after save', async () => {
    const user = userEvent.setup()
    renderDialog()
    await user.click(screen.getByRole('button', { name: /save/i }))
    expect(mockClearBulkSelection).toHaveBeenCalled()
  })
})

describe('BulkOverrideDialog — cancel', () => {
  it('calls clearBulkSelection when Cancel is clicked', async () => {
    const user = userEvent.setup()
    renderDialog()
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(mockClearBulkSelection).toHaveBeenCalled()
    expect(mockMutateAsync).not.toHaveBeenCalled()
  })
})
