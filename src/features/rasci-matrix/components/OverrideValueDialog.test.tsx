import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import { OverrideValueDialog } from './OverrideValueDialog'

const mockMutateAsync = vi.fn().mockResolvedValue({})
const mockResetTaskMutateAsync = vi.fn().mockResolvedValue({})
const mockCloseAll = vi.fn()

vi.mock('../hooks/useChangeObjectRolePermission', () => ({
  useChangeObjectRolePermission: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
}))

vi.mock('../hooks/useResetTaskPermission', () => ({
  useResetTaskPermission: () => ({
    mutateAsync: mockResetTaskMutateAsync,
    isPending: false,
  }),
}))

vi.mock('../store/rasciMatrixStore', () => ({
  useRasciMatrixStore: vi.fn(() => ({
    selectedCell: {
      roleId: 'role-1',
      taskId: 'task-1',
      currentValue: 'R',
      isOverridden: false,
    },
    isOverrideDialogOpen: true,
    closeAll: mockCloseAll,
  })),
}))

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
  mockResetTaskMutateAsync.mockReset().mockResolvedValue({})
  mockCloseAll.mockReset()
})

function renderDialog(
  props: {
    open?: boolean
    objectId?: string
    domainType?: 'PROJECT' | 'PROGRAM' | 'PORTFOLIO'
  } = {},
) {
  const Wrapper = makeWrapper()
  render(
    createElement(
      Wrapper,
      null,
      createElement(OverrideValueDialog, {
        open: props.open ?? true,
        objectId: props.objectId ?? 'obj-1',
        domainType: props.domainType ?? 'PROJECT',
        tasks: [],
      }),
    ),
  )
}

describe('OverrideValueDialog — radio options', () => {
  it('renders 6 radio options (R, A, S, C, I, —)', () => {
    renderDialog()
    const radios = screen.getAllByRole('radio')
    expect(radios).toHaveLength(6)
  })

  it('pre-selects the current value (R)', () => {
    renderDialog()
    const radioR = screen.getByRole('radio', { name: 'R' })
    expect(radioR).toBeChecked()
  })
})

describe('OverrideValueDialog — legend labels', () => {
  it('shows Responsible label for R option', () => {
    renderDialog()
    expect(screen.getByText('Responsible')).toBeInTheDocument()
  })

  it('shows Informed label for I option', () => {
    renderDialog()
    expect(screen.getByText('Informed')).toBeInTheDocument()
  })

  it('shows No involvement label for — option', () => {
    renderDialog()
    expect(screen.getByText('No involvement')).toBeInTheDocument()
  })
})

describe('OverrideValueDialog — actions', () => {
  it('submit button calls onSubmit with selected value', async () => {
    const user = userEvent.setup()
    renderDialog()
    await user.click(screen.getByRole('button', { name: /save/i }))
    expect(mockMutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        objectId: 'obj-1',
        roleId: 'role-1',
        taskId: 'task-1',
        permissionKey: 'R',
      }),
    )
  })

  it('cancel calls closeAll', async () => {
    const user = userEvent.setup()
    renderDialog()
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(mockCloseAll).toHaveBeenCalled()
    expect(mockMutateAsync).not.toHaveBeenCalled()
  })
})
