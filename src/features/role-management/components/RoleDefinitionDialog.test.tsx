import { createElement } from 'react'

import type { UseQueryResult } from '@tanstack/react-query'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type * as RoleEntityModule from '@/entities/role'
import type { MatrixDetail, RoleGroup } from '@/entities/role'
import { useMatrix, useRoleGroups } from '@/entities/role'
import { i18n } from '@/shared/lib/i18n'

import { useRoleManagementStore } from '../store/roleManagementStore'
import { RoleDefinitionDialog } from './RoleDefinitionDialog'

vi.mock('@/entities/role', async (importOriginal) => {
  const actual = await importOriginal<typeof RoleEntityModule>()
  return {
    ...actual,
    useRoleGroups: vi.fn(),
    useMatrix: vi.fn(),
  }
})

function mockQueryResult<T>(
  partial: Pick<UseQueryResult<T, Error>, 'data' | 'isPending'>,
): UseQueryResult<T, Error> {
  return partial as unknown as UseQueryResult<T, Error>
}

const mockAddMutateAsync = vi.fn().mockResolvedValue({})
const mockEditMutateAsync = vi.fn().mockResolvedValue({})

vi.mock('../hooks/useAddRoleToMatrix', () => ({
  useAddRoleToMatrix: () => ({
    mutateAsync: mockAddMutateAsync,
    isPending: false,
  }),
}))

vi.mock('../hooks/useEditRole', () => ({
  useEditRole: () => ({
    mutateAsync: mockEditMutateAsync,
    isPending: false,
  }),
}))

vi.mock('../store/roleManagementStore', () => ({
  useRoleManagementStore: vi.fn(),
}))

const mockUseRoleGroups = vi.mocked(useRoleGroups)
const mockUseMatrix = vi.mocked(useMatrix)
const mockUseRoleManagementStore = vi.mocked(useRoleManagementStore)
const mockCloseAll = vi.fn()

const ROLE_GROUPS = [{ id: 'grp-1', name: 'Management', description: null, sortOrder: 1 }]

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
  mockUseRoleGroups.mockReturnValue(
    mockQueryResult<RoleGroup[]>({ data: ROLE_GROUPS as RoleGroup[], isPending: false }),
  )
  mockUseMatrix.mockReturnValue(
    mockQueryResult<MatrixDetail>({ data: undefined as unknown as MatrixDetail, isPending: false }),
  )
  mockCloseAll.mockReset()
  mockAddMutateAsync.mockReset().mockResolvedValue({})
  mockEditMutateAsync.mockReset().mockResolvedValue({})
  mockUseRoleManagementStore.mockReturnValue({
    closeAll: mockCloseAll,
    isAddRoleOpen: true,
    isEditRoleOpen: false,
    selectedRoleId: null,
  } as ReturnType<typeof useRoleManagementStore>)
})

function renderDialog(props: { matrixId?: string; open?: boolean; roleId?: string | null } = {}) {
  const Wrapper = makeWrapper()
  render(
    createElement(
      Wrapper,
      null,
      createElement(RoleDefinitionDialog, {
        matrixId: props.matrixId ?? 'matrix-1',
        open: props.open ?? true,
        roleId: props.roleId ?? null,
      }),
    ),
  )
}

describe('RoleDefinitionDialog — visibility', () => {
  it('renders dialog when open is true', () => {
    renderDialog({ open: true })
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('does not render dialog content when open is false', () => {
    renderDialog({ open: false })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

describe('RoleDefinitionDialog — Add mode', () => {
  it('shows "Add Role" title in add mode', () => {
    renderDialog({ roleId: null })
    expect(screen.getByRole('heading', { name: /add role/i })).toBeInTheDocument()
  })

  it('renders name field in add mode', () => {
    renderDialog({ roleId: null })
    expect(screen.getByLabelText(/^name/i)).toBeInTheDocument()
  })

  it('renders shortTitle field', () => {
    renderDialog({ roleId: null })
    expect(screen.getByLabelText(/short title/i)).toBeInTheDocument()
  })
})

describe('RoleDefinitionDialog — validation', () => {
  it('shows validation error when name is empty on submit', async () => {
    const user = userEvent.setup()
    renderDialog()
    await user.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => {
      expect(screen.getAllByText(/too small|required|invalid|characters/i).length).toBeGreaterThan(
        0,
      )
    })
  })

  it('shows validation error when shortTitle exceeds 10 characters', async () => {
    const user = userEvent.setup()
    renderDialog()
    await user.type(screen.getByLabelText(/^name/i), 'Test Role')
    await user.type(screen.getByLabelText(/short title/i), 'TOOLONGSTRING')
    await user.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => {
      expect(screen.getByText(/10/i)).toBeInTheDocument()
    })
  })
})

describe('RoleDefinitionDialog — cancel', () => {
  it('calls closeAll when Cancel is clicked', async () => {
    const user = userEvent.setup()
    renderDialog()
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(mockCloseAll).toHaveBeenCalled()
  })
})

describe('RoleDefinitionDialog — Edit mode', () => {
  beforeEach(() => {
    mockUseMatrix.mockReturnValue(
      mockQueryResult<MatrixDetail>({
        data: {
          id: 'matrix-1',
          roles: [
            {
              id: 'role-1',
              name: 'Project Manager',
              shortTitle: 'PM',
              description: 'Manages the project',
              isFixed: false,
              isDefault: false,
              groupId: 'grp-1',
              tasks: [],
            },
          ],
          tasks: [],
          domainType: 'PROJECT',
          objectId: null,
        },
        isPending: false,
      }),
    )
  })

  it('shows "Edit Role" title in edit mode', () => {
    renderDialog({ roleId: 'role-1' })
    expect(screen.getByRole('heading', { name: /edit role/i })).toBeInTheDocument()
  })

  it('pre-fills the name field with the existing role name', () => {
    renderDialog({ roleId: 'role-1' })
    expect(screen.getByDisplayValue('Project Manager')).toBeInTheDocument()
  })

  it('calls editRole mutation on submit in edit mode', async () => {
    const user = userEvent.setup()
    renderDialog({ roleId: 'role-1' })
    await user.clear(screen.getByLabelText(/^name/i))
    await user.type(screen.getByLabelText(/^name/i), 'Updated Manager')
    await user.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => expect(mockEditMutateAsync).toHaveBeenCalled())
    expect(mockAddMutateAsync).not.toHaveBeenCalled()
  })

  it('calls closeAll after successful edit submit', async () => {
    const user = userEvent.setup()
    renderDialog({ roleId: 'role-1' })
    await user.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => expect(mockCloseAll).toHaveBeenCalled())
  })
})

describe('RoleDefinitionDialog — Add mode submit', () => {
  it('calls addRole mutation on submit (no description)', async () => {
    const user = userEvent.setup()
    renderDialog({ roleId: null })
    // Submit the form-level button directly — RoleDefinitionForm validates and calls onSubmit
    // We trigger via the dialog Save button which submits the form by id
    await user.type(screen.getByLabelText(/^name/i), 'New Role')
    await user.type(screen.getByLabelText(/short title/i), 'NR')
    // Set groupId via keyboard on the combobox (Radix blocks pointer events after open in jsdom)
    const trigger = screen.getByRole('combobox', { name: /role group/i })
    trigger.focus()
    await user.keyboard(' ')
    await waitFor(() => screen.findByRole('option', { name: 'Management' }))
    await user.keyboard('{ArrowDown}{Enter}')
    await user.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => expect(mockAddMutateAsync).toHaveBeenCalled(), { timeout: 3000 })
    expect(mockEditMutateAsync).not.toHaveBeenCalled()
  })

  it('calls addRole mutation on submit with description', async () => {
    const user = userEvent.setup()
    renderDialog({ roleId: null })
    await user.type(screen.getByLabelText(/^name/i), 'New Role')
    await user.type(screen.getByLabelText(/short title/i), 'NR')
    await user.type(screen.getByLabelText(/description/i), 'A description')
    const trigger = screen.getByRole('combobox', { name: /role group/i })
    trigger.focus()
    await user.keyboard(' ')
    await waitFor(() => screen.findByRole('option', { name: 'Management' }))
    await user.keyboard('{ArrowDown}{Enter}')
    await user.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => expect(mockAddMutateAsync).toHaveBeenCalled(), { timeout: 3000 })
  })

  it('calls closeAll after successful add submit', async () => {
    const user = userEvent.setup()
    renderDialog({ roleId: null })
    await user.type(screen.getByLabelText(/^name/i), 'New Role')
    await user.type(screen.getByLabelText(/short title/i), 'NR')
    const trigger = screen.getByRole('combobox', { name: /role group/i })
    trigger.focus()
    await user.keyboard(' ')
    await waitFor(() => screen.findByRole('option', { name: 'Management' }))
    await user.keyboard('{ArrowDown}{Enter}')
    await user.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => expect(mockCloseAll).toHaveBeenCalled(), { timeout: 3000 })
  })
})

describe('RoleDefinitionDialog — onOpenChange', () => {
  it('calls closeAll when dialog is closed via onOpenChange', async () => {
    const user = userEvent.setup()
    renderDialog({ open: true })
    await user.keyboard('{Escape}')
    await waitFor(() => expect(mockCloseAll).toHaveBeenCalled())
  })
})
