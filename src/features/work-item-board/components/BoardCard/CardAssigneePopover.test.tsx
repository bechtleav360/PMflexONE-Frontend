import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import type * as WorkItemModule from '@/entities/work-item'
import { TooltipProvider } from '@/shared/components'
import { i18n } from '@/shared/lib/i18n'

import { CardAssigneePopover } from './CardAssigneePopover'

const mockAssignMutate = vi.fn()

vi.mock('../../hooks/useAssignWorkItemPerson', () => ({
  useAssignWorkItemPerson: () => ({ mutate: mockAssignMutate }),
}))

vi.mock('@/entities/work-item', async (importOriginal) => {
  const actual = await importOriginal<typeof WorkItemModule>()
  return {
    ...actual,
    usePersons: () => ({
      data: [
        {
          id: 'person-1',
          firstName: 'Alice',
          lastName: 'Smith',
          mail: 'alice@test.com',
        },
        {
          id: 'person-2',
          firstName: 'Bob',
          lastName: 'Jones',
          mail: 'bob@test.com',
        },
      ],
    }),
  }
})

function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(
      QueryClientProvider,
      { client: qc },
      createElement(TooltipProvider, null, children),
    )
  }
}

function renderPopover(assignee: CardAssigneePopoverProps['assignee'] = null) {
  const Wrapper = makeWrapper()
  return render(
    createElement(
      Wrapper,
      null,
      createElement(CardAssigneePopover, {
        workItemId: 'wi-1',
        workItemVersion: 1,
        assignee,
      }),
    ),
  )
}

interface CardAssigneePopoverProps {
  workItemId: string
  workItemVersion: number
  assignee: {
    id: string
    firstName: string
    lastName: string
    mail: string
  } | null
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

describe('CardAssigneePopover', () => {
  it('renders an "assign person" button when no assignee is set', () => {
    renderPopover(null)
    expect(screen.getByRole('button', { name: /assign person/i })).toBeInTheDocument()
  })

  it('renders with assignee initials in avatar when assignee is set', () => {
    renderPopover({
      id: 'person-1',
      firstName: 'Alice',
      lastName: 'Smith',
      mail: 'alice@test.com',
    })
    // Avatar fallback shows initials
    expect(screen.getByText('AS')).toBeInTheDocument()
  })

  it('opens the persons list when the trigger is clicked', async () => {
    const user = userEvent.setup()
    renderPopover(null)

    await user.click(screen.getByRole('button', { name: /assign person/i }))

    expect(screen.getByText('Alice Smith')).toBeInTheDocument()
    expect(screen.getByText('Bob Jones')).toBeInTheDocument()
  })

  it('calls assignMutation.mutate when a person is selected', async () => {
    const user = userEvent.setup()
    renderPopover(null)

    await user.click(screen.getByRole('button', { name: /assign person/i }))
    await user.click(screen.getByText('Alice Smith'))

    expect(mockAssignMutate).toHaveBeenCalledWith({
      id: 'wi-1',
      version: 1,
      assigneeId: 'person-1',
    })
  })

  it('shows the unassign button when an assignee is set and popover is open', async () => {
    const user = userEvent.setup()
    renderPopover({
      id: 'person-1',
      firstName: 'Alice',
      lastName: 'Smith',
      mail: 'alice@test.com',
    })

    // The aria-label is "Assigned to Alice Smith"
    const triggerBtn = screen.getByRole('button', { name: /assigned to alice smith/i })
    await user.click(triggerBtn)

    expect(screen.getByText(/unassign/i)).toBeInTheDocument()
  })

  it('calls assignMutation.mutate with null when unassign is clicked', async () => {
    mockAssignMutate.mockClear()
    const user = userEvent.setup()
    renderPopover({
      id: 'person-1',
      firstName: 'Alice',
      lastName: 'Smith',
      mail: 'alice@test.com',
    })

    await user.click(screen.getByRole('button', { name: /assigned to alice smith/i }))
    await user.click(screen.getByText(/unassign/i))

    expect(mockAssignMutate).toHaveBeenCalledWith({
      id: 'wi-1',
      version: 1,
      assigneeId: null,
    })
  })
})
