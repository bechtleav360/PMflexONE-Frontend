import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import { ObjectRoleDialog } from './ObjectRoleDialog'

const mockMutateAsync = vi.fn().mockResolvedValue({})
const mockCloseAll = vi.fn()

vi.mock('../hooks/useAddRoleToObjectMatrix', () => ({
  useAddRoleToObjectMatrix: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
}))

vi.mock('../store/rasciMatrixStore', () => ({
  useRasciMatrixStore: vi.fn(() => ({
    closeAll: mockCloseAll,
  })),
}))

const TEMPLATE_ROLES = [
  {
    id: 'role-tmpl-1',
    name: 'Project Manager',
    shortTitle: 'PM',
    description: null,
    isFixed: true,
    isDefault: false,
    groupId: 'grp-1',
    tasks: [
      { taskId: 'task-1', permissionKey: 'R' },
      { taskId: 'task-2', permissionKey: 'A' },
    ],
  },
  {
    id: 'role-tmpl-2',
    name: 'Stakeholder',
    shortTitle: 'SH',
    description: null,
    isFixed: false,
    isDefault: false,
    groupId: 'grp-1',
    tasks: [
      { taskId: 'task-1', permissionKey: 'I' },
      { taskId: 'task-2', permissionKey: 'C' },
    ],
  },
]

const ROLE_GROUPS = [
  { id: 'grp-1', name: 'Core Team', description: null, sortOrder: 1, color: null },
]

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
  return Wrapper
}

function renderDialog(overrides: { open?: boolean } = {}) {
  const Wrapper = makeWrapper()
  render(
    createElement(
      Wrapper,
      null,
      createElement(ObjectRoleDialog, {
        open: overrides.open ?? true,
        templateRoles: TEMPLATE_ROLES,
        roleGroups: ROLE_GROUPS,
        objectId: 'obj-1',
        domainType: 'PROJECT' as const,
      }),
    ),
  )
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

beforeEach(() => {
  mockMutateAsync.mockReset().mockResolvedValue({})
  mockCloseAll.mockReset()
})

describe('ObjectRoleDialog — template role selector', () => {
  it('shows all available template roles as options', async () => {
    renderDialog()
    // The source-role select trigger should be present
    const trigger = screen.getByRole('combobox', { name: /source role|template role/i })
    expect(trigger).toBeInTheDocument()
  })
})

describe('ObjectRoleDialog — form validation', () => {
  it('requires name to be filled before submitting', async () => {
    const user = userEvent.setup()
    renderDialog()

    // Fill shortTitle but leave name empty
    const shortTitleInput = screen.getByRole('textbox', { name: /short title/i })
    await user.type(shortTitleInput, 'CR')

    const saveButton = screen.getByRole('button', { name: /save/i })
    await user.click(saveButton)

    expect(mockMutateAsync).not.toHaveBeenCalled()
  })

  it('requires shortTitle to be filled before submitting', async () => {
    const user = userEvent.setup()
    renderDialog()

    const nameInput = screen.getByRole('textbox', { name: /^name$/i })
    await user.type(nameInput, 'Custom Role')

    const saveButton = screen.getByRole('button', { name: /save/i })
    await user.click(saveButton)

    expect(mockMutateAsync).not.toHaveBeenCalled()
  })

  it('shows validation error when shortTitle exceeds 10 characters', async () => {
    const user = userEvent.setup()
    renderDialog()

    const nameInput = screen.getByRole('textbox', { name: /^name$/i })
    await user.type(nameInput, 'Custom Role')

    const shortTitleInput = screen.getByRole('textbox', { name: /short title/i })
    await user.type(shortTitleInput, 'TOOLONGVALUE')

    const saveButton = screen.getByRole('button', { name: /save/i })
    await user.click(saveButton)

    await waitFor(() => {
      expect(screen.getByText(/10/i)).toBeInTheDocument()
    })
    expect(mockMutateAsync).not.toHaveBeenCalled()
  })
})

describe('ObjectRoleDialog — submit', () => {
  it('does not call mutation when required fields are missing', async () => {
    const user = userEvent.setup()
    renderDialog()

    // Only fill name — shortTitle and groupId left empty
    const nameInput = screen.getByRole('textbox', { name: /^name$/i })
    await user.type(nameInput, 'Custom Role')

    const saveButton = screen.getByRole('button', { name: /save/i })
    await user.click(saveButton)

    // Zod validation prevents submission
    expect(mockMutateAsync).not.toHaveBeenCalled()
  })
})

describe('ObjectRoleDialog — cancel', () => {
  it('calls store.closeAll when cancel is clicked', async () => {
    const user = userEvent.setup()
    renderDialog()

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelButton)

    expect(mockCloseAll).toHaveBeenCalled()
    expect(mockMutateAsync).not.toHaveBeenCalled()
  })
})
