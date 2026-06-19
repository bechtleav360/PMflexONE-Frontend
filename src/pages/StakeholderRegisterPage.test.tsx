import { createElement, type FC } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { MemoryRouter } from 'react-router-dom'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'
import { server } from '@/shared/lib/msw/server'

import {
  StakeholderRegisterPage,
  type StakeholderRegisterPageProps,
} from './StakeholderRegisterPage'

vi.mock('@/features/stakeholder-register', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>()
  return {
    ...actual,
    StakeholderDialog: () => null,
    DeleteStakeholderDialog: () => null,
  }
})

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

const strategyDescription = {
  id: 'strategy-1',
  version: 1,
  monitor: null,
  keepInformed: null,
  keepSatisfied: null,
  manageClosely: null,
  scope: { id: 'proj-1', name: 'Project proj-1', scopeType: 'Project' },
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
}

function renderPage(options?: { entriesError?: boolean }) {
  server.use(
    graphql.query('GetStakeholderEntries', () =>
      options?.entriesError
        ? HttpResponse.json({ errors: [{ message: 'Forbidden' }] }, { status: 200 })
        : HttpResponse.json({ data: { stakeholderEntries: [] } }),
    ),
    graphql.query('GetStakeholderStrategyDescription', () =>
      HttpResponse.json({ data: { stakeholderStrategyDescription: strategyDescription } }),
    ),
  )

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return render(
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(
        MemoryRouter,
        null,
        createElement(StakeholderRegisterPage as FC<StakeholderRegisterPageProps>, {
          scopeType: 'Project',
          scopeId: 'proj-1',
        }),
      ),
    ),
  )
}

describe('StakeholderRegisterPage', () => {
  it('renders access denied view when the entries query errors', async () => {
    renderPage({ entriesError: true })
    await screen.findByRole('alert')
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('shows the "New stakeholder" button once loaded', async () => {
    renderPage()
    await screen.findByRole('button', { name: /new stakeholder/i })
    expect(screen.getByRole('button', { name: /new stakeholder/i })).toBeInTheDocument()
  })
})
