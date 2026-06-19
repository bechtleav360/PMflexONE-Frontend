import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { beforeAll, describe, expect, it } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import { WorkItemLinksPanel } from './WorkItemLinksPanel'

const fixtureLinks = [
  {
    edgeTypeName: 'child',
    metadata: null,
    item: {
      id: 'wi-2',
      version: 1,
      name: 'Child Task',
      description: null,
      status: 'OPEN' as const,
      dueDate: null,
      priority: null,
      archived: false,
      createdAt: '',
      updatedAt: '',
      metadata: null,
      creator: null,
      updater: null,
      assignee: null,
      boardColumn: null,
      labels: [],
      scope: null,
      comments: [],
      attachments: [],
      links: [],
    },
  },
  {
    edgeTypeName: 'related',
    metadata: null,
    item: {
      id: 'wi-3',
      version: 1,
      name: 'Related Task',
      description: null,
      status: 'IN_PROGRESS' as const,
      dueDate: null,
      priority: null,
      archived: false,
      createdAt: '',
      updatedAt: '',
      metadata: null,
      creator: null,
      updater: null,
      assignee: null,
      boardColumn: null,
      labels: [],
      scope: null,
      comments: [],
      attachments: [],
      links: [],
    },
  },
]

function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: qc }, children)
  }
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

describe('WorkItemLinksPanel', () => {
  it('renders linked task names', () => {
    const Wrapper = makeWrapper()
    render(
      createElement(
        Wrapper,
        null,
        createElement(WorkItemLinksPanel, { workItemId: 'wi-1', links: fixtureLinks }),
      ),
    )
    expect(screen.getByText('Child Task')).toBeInTheDocument()
    expect(screen.getByText('Related Task')).toBeInTheDocument()
  })

  it('groups links by link type', () => {
    const Wrapper = makeWrapper()
    render(
      createElement(
        Wrapper,
        null,
        createElement(WorkItemLinksPanel, { workItemId: 'wi-1', links: fixtureLinks }),
      ),
    )
    expect(screen.getAllByText(/child/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/related/i).length).toBeGreaterThan(0)
  })

  it('renders empty state when no links provided', () => {
    const Wrapper = makeWrapper()
    render(
      createElement(
        Wrapper,
        null,
        createElement(WorkItemLinksPanel, { workItemId: 'wi-1', links: [] }),
      ),
    )
    expect(screen.getByText(/no linked tasks/i)).toBeInTheDocument()
  })
})
