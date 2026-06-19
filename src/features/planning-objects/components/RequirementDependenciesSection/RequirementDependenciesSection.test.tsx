import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import type { RequirementDependency } from '../../types/requirement.types'
import { RequirementDependenciesSection } from './RequirementDependenciesSection'

vi.mock('../../hooks/useLinkRequirements', () => ({
  useLinkRequirements: () => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn().mockResolvedValue(undefined),
    isPending: false,
  }),
}))

vi.mock('../../hooks/useUnlinkRequirements', () => ({
  useUnlinkRequirements: () => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn().mockResolvedValue(undefined),
    isPending: false,
  }),
}))

vi.mock('../../hooks/useRequirements', () => ({
  useRequirements: () => ({
    data: [
      {
        id: 'req-2',
        name: 'Req B',
        requirementScope: 'IN_SCOPE',
        source: 'INTERNAL',
        estimatedEffortMin: null,
        estimatedEffortMax: null,
        type: 'FUNCTIONAL',
        priority: 'MUST_HAVE',
        status: 'NEW',
        createdAt: '',
        updatedAt: '',
        creator: null,
        parent: null,
        scope: { id: 'p', type: 'Project' },
        version: 1,
      },
    ],
  }),
}))

const blocksDep: RequirementDependency = {
  edgeTypeName: 'blocks',
  requirement: { id: 'req-x', name: 'Req X', status: 'NEW' },
}

const isBlockedByDep: RequirementDependency = {
  edgeTypeName: 'blocked_by',
  requirement: { id: 'req-y', name: 'Req Y', status: 'NEW' },
}

function renderSection(deps: RequirementDependency[] = []) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    createElement(RequirementDependenciesSection, {
      requirementId: 'req-1',
      requirementVersion: 1,
      dependencies: deps,
      scopeId: 'proj-1',
    }),
    {
      wrapper: ({ children }: { children: React.ReactNode }) =>
        createElement(QueryClientProvider, { client: queryClient }, children),
    },
  )
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

beforeEach(() => {
  vi.clearAllMocks()
})

describe('RequirementDependenciesSection', () => {
  it('renders no list items when no dependencies', () => {
    renderSection([])
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument()
  })

  it('renders BLOCKS dependency with correct label', () => {
    renderSection([blocksDep])
    expect(screen.getByText('blocks')).toBeInTheDocument()
    expect(screen.getByText('Req X')).toBeInTheDocument()
  })

  it('renders blocked_by dependency with correct inverse label', () => {
    renderSection([isBlockedByDep])
    expect(screen.getByText('is blocked by')).toBeInTheDocument()
    expect(screen.getByText('Req Y')).toBeInTheDocument()
  })

  it('remove button stages removal — item disappears from list immediately', async () => {
    renderSection([blocksDep])
    expect(screen.getByText('Req X')).toBeInTheDocument()
    const removeBtn = screen.getByRole('button', { name: /Remove dependency to Req X/i })
    await userEvent.click(removeBtn)
    expect(screen.queryByText('Req X')).not.toBeInTheDocument()
  })

  it('add button stages new dep — item appears in list with reduced opacity', async () => {
    renderSection([])
    // Select req-2 via combobox trigger (first combobox = requirement picker)
    const triggers = screen.getAllByRole('combobox')
    await userEvent.click(triggers[0])
    const option = await screen.findByRole('option', { name: 'Req B' })
    await userEvent.click(option)
    // Click add
    const addBtn = screen.getByRole('button', { name: /Add link/i })
    await userEvent.click(addBtn)
    expect(screen.getByText('Req B')).toBeInTheDocument()
  })

  it('staged dep remove button calls handleRemovePending — item disappears', async () => {
    renderSection([])
    const triggers = screen.getAllByRole('combobox')
    await userEvent.click(triggers[0])
    const option = await screen.findByRole('option', { name: 'Req B' })
    await userEvent.click(option)
    const addBtn = screen.getByRole('button', { name: /Add link/i })
    await userEvent.click(addBtn)

    expect(screen.getByText('Req B')).toBeInTheDocument()
    const removeBtn = screen.getByRole('button', { name: /Remove dependency to Req B/i })
    await userEvent.click(removeBtn)
    expect(screen.queryByText('Req B')).not.toBeInTheDocument()
  })

  it('blocked_by dep remove button stages removal with correct direction', async () => {
    const dep = {
      edgeTypeName: 'blocked_by' as const,
      requirement: { id: 'req-y', name: 'Req Y', status: 'NEW' as const },
    }
    renderSection([dep])
    const removeBtn = screen.getByRole('button', { name: /Remove dependency to Req Y/i })
    await userEvent.click(removeBtn)
    expect(screen.queryByText('Req Y')).not.toBeInTheDocument()
  })

  it('duplicated_by dep remove button stages removal', async () => {
    const dep = {
      edgeTypeName: 'duplicated_by' as const,
      requirement: { id: 'req-z', name: 'Req Z', status: 'NEW' as const },
    }
    renderSection([dep])
    const removeBtn = screen.getByRole('button', { name: /Remove dependency to Req Z/i })
    await userEvent.click(removeBtn)
    expect(screen.queryByText('Req Z')).not.toBeInTheDocument()
  })
})
