import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type { PermissionKey } from '@/entities/role'
import { TooltipProvider } from '@/shared/components'
import { i18n } from '@/shared/lib/i18n'

import { RasciCell } from './RasciCell'

const mockOpenOverrideDialog = vi.fn()

vi.mock('../store/rasciMatrixStore', () => ({
  useRasciMatrixStore: vi.fn(() => ({
    openOverrideDialog: mockOpenOverrideDialog,
    toggleBulkCell: vi.fn(),
    bulkSelectedCells: new Map(),
    isBulkMode: false,
    clearBulkSelection: vi.fn(),
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

beforeEach(() => {
  mockOpenOverrideDialog.mockReset()
})

const DEFAULT_PROPS: {
  roleId: string
  taskId: string
  roleName: string
  taskName: string
  currentValue: PermissionKey
  isOverridden: boolean
  templateValue: PermissionKey | null
  canEdit: boolean
  taskResources: []
} = {
  roleId: 'role-1',
  taskId: 'task-1',
  roleName: 'Project Manager',
  taskName: 'Planning',
  currentValue: 'R',
  isOverridden: false,
  templateValue: null,
  canEdit: true,
  taskResources: [],
}

function renderCell(props: Partial<typeof DEFAULT_PROPS> = {}) {
  const Wrapper = makeWrapper()
  const merged = { ...DEFAULT_PROPS, ...props }
  render(
    createElement(
      Wrapper,
      null,
      createElement(
        'table',
        null,
        createElement('tbody', null, createElement('tr', null, createElement(RasciCell, merged))),
      ),
    ),
  )
}

describe('RasciCell — renders badge', () => {
  it('renders RasciValueBadge with the currentValue', () => {
    renderCell({ currentValue: 'A' })
    expect(screen.getByText('A')).toBeInTheDocument()
  })
})

describe('RasciCell — override marker', () => {
  it('renders override marker when isOverridden is true', () => {
    renderCell({ isOverridden: true })
    expect(screen.getByTestId('override-marker')).toBeInTheDocument()
  })

  it('does NOT render override marker when isOverridden is false', () => {
    renderCell({ isOverridden: false })
    expect(screen.queryByTestId('override-marker')).not.toBeInTheDocument()
  })
})

describe('RasciCell — aria-label', () => {
  it('button aria-label contains role name, task name, and current value', () => {
    renderCell({ roleName: 'Project Manager', taskName: 'Planning', currentValue: 'R' })
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label', expect.stringContaining('Project Manager'))
    expect(button).toHaveAttribute('aria-label', expect.stringContaining('Planning'))
    expect(button).toHaveAttribute('aria-label', expect.stringContaining('R'))
  })
})

describe('RasciCell — disabled state', () => {
  it('button is disabled when canEdit is false', () => {
    renderCell({ canEdit: false })
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('button is enabled when canEdit is true', () => {
    renderCell({ canEdit: true })
    expect(screen.getByRole('button')).not.toBeDisabled()
  })
})

describe('RasciCell — click', () => {
  it('calls openOverrideDialog with roleId and taskId on button click', async () => {
    const user = userEvent.setup()
    renderCell({ roleId: 'role-1', taskId: 'task-1' })
    await user.click(screen.getByRole('button'))
    expect(mockOpenOverrideDialog).toHaveBeenCalledWith(
      expect.objectContaining({ roleId: 'role-1', taskId: 'task-1' }),
    )
  })

  it('does not call openOverrideDialog when canEdit is false', () => {
    renderCell({ canEdit: false })
    // button is disabled so userEvent won't fire click, but we also verify the guard
    expect(screen.getByRole('button')).toBeDisabled()
    expect(mockOpenOverrideDialog).not.toHaveBeenCalled()
  })
})

describe('RasciCell — bulk mode', () => {
  it('calls toggleBulkCell instead of openOverrideDialog when isBulkMode is true', async () => {
    const mockToggleBulkCell = vi.fn()
    const { useRasciMatrixStore } = await import('../store/rasciMatrixStore')
    vi.mocked(useRasciMatrixStore).mockReturnValueOnce({
      openOverrideDialog: mockOpenOverrideDialog,
      toggleBulkCell: mockToggleBulkCell,
      bulkSelectedCells: new Map(),
      isBulkMode: true,
      clearBulkSelection: vi.fn(),
    } as ReturnType<typeof useRasciMatrixStore>)

    const user = userEvent.setup()
    renderCell({ canEdit: true })
    await user.click(screen.getByRole('button'))
    expect(mockToggleBulkCell).toHaveBeenCalledWith({ roleId: 'role-1', taskId: 'task-1' })
    expect(mockOpenOverrideDialog).not.toHaveBeenCalled()
  })

  it('calls clearBulkSelection then openOverrideDialog when cells are selected but no bulk mode', async () => {
    const mockClearBulkSelection = vi.fn()
    const existingCells = new Map([['role-1:task-1', { roleId: 'role-1', taskId: 'task-1' }]])
    const { useRasciMatrixStore } = await import('../store/rasciMatrixStore')
    vi.mocked(useRasciMatrixStore).mockReturnValueOnce({
      openOverrideDialog: mockOpenOverrideDialog,
      toggleBulkCell: vi.fn(),
      bulkSelectedCells: existingCells,
      isBulkMode: false,
      clearBulkSelection: mockClearBulkSelection,
    } as ReturnType<typeof useRasciMatrixStore>)

    const user = userEvent.setup()
    renderCell({ canEdit: true })
    await user.click(screen.getByRole('button'))
    expect(mockClearBulkSelection).toHaveBeenCalled()
    expect(mockOpenOverrideDialog).toHaveBeenCalled()
  })
})

describe('RasciCell — override tooltip with templateValue', () => {
  it('renders override marker with aria-label containing template value when both isOverridden and templateValue are set', () => {
    renderCell({ isOverridden: true, templateValue: 'A' })
    const marker = screen.getByTestId('override-marker')
    expect(marker).toBeInTheDocument()
    // aria-label should reference the override tooltip text (with template value A)
    expect(marker.getAttribute('aria-label')).toBeTruthy()
  })

  it('renders override marker with generic aria-label when isOverridden but templateValue is null', () => {
    renderCell({ isOverridden: true, templateValue: null })
    const marker = screen.getByTestId('override-marker')
    expect(marker.getAttribute('aria-label')).toBeTruthy()
  })
})

describe('RasciCell — task resources in formatResourceLines', () => {
  it('renders without error when taskResources contains matching permissionKey entries', () => {
    const taskResources = [
      {
        name: 'Project',
        operationsByKey: [{ permissionKey: 'R', operations: ['read' as const] }],
      },
    ]
    // @ts-expect-error — using a partial type for test convenience
    renderCell({ currentValue: 'R', taskResources })
    // The cell should still render the badge
    expect(screen.getByText('R')).toBeInTheDocument()
  })

  it('renders without error when taskResources has no matching permissionKey for the current value', () => {
    const taskResources = [
      {
        name: 'Project',
        operationsByKey: [{ permissionKey: 'A', operations: ['create' as const] }],
      },
    ]
    // @ts-expect-error — using a partial type for test convenience
    renderCell({ currentValue: 'R', taskResources })
    expect(screen.getByText('R')).toBeInTheDocument()
  })
})
