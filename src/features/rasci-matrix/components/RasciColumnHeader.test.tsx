import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type { MatrixRole } from '@/entities/role'
import { TooltipProvider } from '@/shared/components'
import { i18n } from '@/shared/lib/i18n'

import { RasciColumnHeader } from './RasciColumnHeader'

const mockOpenResetColumnDialog = vi.fn()
const mockOpenDeleteObjectRoleDialog = vi.fn()

vi.mock('../store/rasciMatrixStore', () => ({
  useRasciMatrixStore: vi.fn(() => ({
    openResetColumnDialog: mockOpenResetColumnDialog,
    openDeleteObjectRoleDialog: mockOpenDeleteObjectRoleDialog,
    openEditObjectRoleDialog: vi.fn(),
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
  mockOpenResetColumnDialog.mockReset()
  mockOpenDeleteObjectRoleDialog.mockReset()
})

const ROLE: MatrixRole = {
  id: 'role-1',
  name: 'Project Manager',
  shortTitle: 'PM',
  description: null,
  isFixed: false,
  isDefault: false,
  groupId: 'grp-1',
  tasks: [],
}

function renderHeader(
  props: { role?: MatrixRole; hasAnyOverride?: boolean; isCustomRole?: boolean } = {},
) {
  const Wrapper = makeWrapper()
  render(
    createElement(
      Wrapper,
      null,
      createElement(
        'table',
        null,
        createElement(
          'thead',
          null,
          createElement(
            'tr',
            null,
            createElement(RasciColumnHeader, {
              role: props.role ?? ROLE,
              hasAnyOverride: props.hasAnyOverride ?? false,
              isCustomRole: props.isCustomRole ?? false,
              paletteClass: 'bg-muted',
            }),
          ),
        ),
      ),
    ),
  )
}

describe('RasciColumnHeader — role title', () => {
  it('renders the role shortTitle', () => {
    renderHeader()
    expect(screen.getByText('PM')).toBeInTheDocument()
  })
})

describe('RasciColumnHeader — reset column button', () => {
  it('Reset Column button is visible when hasAnyOverride is true', () => {
    renderHeader({ hasAnyOverride: true })
    expect(screen.getByRole('button', { name: /reset column/i })).toBeInTheDocument()
  })

  it('Reset Column button is NOT visible when hasAnyOverride is false', () => {
    renderHeader({ hasAnyOverride: false })
    expect(screen.queryByRole('button', { name: /reset column/i })).not.toBeInTheDocument()
  })

  it('Reset Column button calls store.openResetColumnDialog when clicked', async () => {
    const user = userEvent.setup()
    renderHeader({ hasAnyOverride: true })
    await user.click(screen.getByRole('button', { name: /reset column/i }))
    expect(mockOpenResetColumnDialog).toHaveBeenCalledWith('role-1')
  })
})

describe('RasciColumnHeader — delete button', () => {
  it('Delete button is visible when isCustomRole is true', () => {
    renderHeader({ isCustomRole: true })
    expect(screen.getByRole('button', { name: /delete role/i })).toBeInTheDocument()
  })

  it('Delete button is NOT visible when isCustomRole is false', () => {
    renderHeader({ isCustomRole: false })
    expect(screen.queryByRole('button', { name: /delete role/i })).not.toBeInTheDocument()
  })

  it('Delete button calls store.openDeleteObjectRoleDialog when clicked', async () => {
    const user = userEvent.setup()
    renderHeader({ isCustomRole: true })
    await user.click(screen.getByRole('button', { name: /delete role/i }))
    expect(mockOpenDeleteObjectRoleDialog).toHaveBeenCalledWith('role-1')
  })
})
