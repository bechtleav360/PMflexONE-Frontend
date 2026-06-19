import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type * as WorkItemEntities from '@/entities/work-item'
import { i18n } from '@/shared/lib/i18n'
import type { ScopeType } from '@/shared/types/scopeType'

import { useCreateWorkItemDialogStore } from '../../store/workItemDialogStores'
import { CreateWorkItemDialog } from './CreateWorkItemDialog'

const mockMutateAsync = vi.fn().mockResolvedValue({})

vi.mock('../../hooks/useCreateProjectWorkItem', () => ({
  useCreateProjectWorkItem: () => ({ mutateAsync: mockMutateAsync, isPending: false }),
}))

vi.mock('@/entities/work-item', async (importOriginal) => {
  const actual = await importOriginal<typeof WorkItemEntities>()
  return {
    ...actual,
    useWorkItemPriorityLookup: () => ({ data: [], isLoading: false }),
    useLabels: () => ({ data: [], isLoading: false }),
  }
})

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
  return Wrapper
}

function renderDialog(scopeType: ScopeType = 'Project', scopeId = 'proj-1') {
  const Wrapper = makeWrapper()
  return render(
    createElement(Wrapper, null, createElement(CreateWorkItemDialog, { scopeType, scopeId })),
  )
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

beforeEach(() => {
  mockMutateAsync.mockClear()
  useCreateWorkItemDialogStore.setState({ open: false })
})

describe('CreateWorkItemDialog', () => {
  it('does not render dialog content when store is closed', () => {
    renderDialog()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders the dialog with a name field when store is open', () => {
    useCreateWorkItemDialogStore.setState({ open: true })
    renderDialog()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /name/i })).toBeInTheDocument()
  })

  it('submits valid form data and calls mutation with scope', async () => {
    useCreateWorkItemDialogStore.setState({ open: true })
    renderDialog('Project', 'proj-42')
    const user = userEvent.setup()

    await user.type(screen.getByRole('textbox', { name: /name/i }), 'Test task')
    await user.click(screen.getByRole('button', { name: /create|save|submit/i }))

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledOnce()
    })

    const callArg = mockMutateAsync.mock.calls[0][0] as { input: Record<string, unknown> }
    expect(callArg.input.name).toBe('Test task')
    expect(callArg.input.scopeId).toBe('proj-42')
    expect(callArg.input.scopeType).toBe('Project')
  })

  it('closes the dialog on successful submission', async () => {
    useCreateWorkItemDialogStore.setState({ open: true })
    renderDialog()
    const user = userEvent.setup()

    await user.type(screen.getByRole('textbox', { name: /name/i }), 'Task name')
    await user.click(screen.getByRole('button', { name: /create|save|submit/i }))

    await waitFor(() => {
      expect(useCreateWorkItemDialogStore.getState().open).toBe(false)
    })
  })

  it('does not submit when name field is empty', async () => {
    useCreateWorkItemDialogStore.setState({ open: true })
    renderDialog()
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: /create|save|submit/i }))

    expect(mockMutateAsync).not.toHaveBeenCalled()
  })
})
