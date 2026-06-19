import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type * as PlanningObjects from '@/features/planning-objects'
import type * as Portfolios from '@/features/portfolios'
import { i18n } from '@/shared/lib/i18n'

import { PortfolioGoalsPage } from './PortfolioGoalsPage'

vi.mock('@/features/portfolios', async (importOriginal) => {
  const original = await importOriginal<typeof Portfolios>()
  return { ...original, usePortfolios: vi.fn(() => ({ data: [] })) }
})

vi.mock('@/features/planning-objects', async (importOriginal) => {
  const original = await importOriginal<typeof PlanningObjects>()
  return {
    ...original,
    GoalManagement: () => createElement('div', { 'data-testid': 'goal-management' }),
  }
})

let queryClient: QueryClient

function renderPage(id = 'port-1') {
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    createElement(
      MemoryRouter,
      { initialEntries: [`/portfolios/${id}/goals`] },
      createElement(
        QueryClientProvider,
        { client: queryClient },
        createElement(
          Routes,
          null,
          createElement(Route, {
            path: '/portfolios/:id/goals',
            element: createElement(PortfolioGoalsPage),
          }),
        ),
      ),
    ),
  )
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

beforeEach(async () => {
  vi.clearAllMocks()
  const { usePortfolios } = await import('@/features/portfolios')
  vi.mocked(usePortfolios).mockReturnValue({ data: [] } as unknown as ReturnType<
    typeof usePortfolios
  >)
})

describe('PortfolioGoalsPage', () => {
  it('renders Goals heading', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: 'Goals' })).toBeInTheDocument()
  })

  it('renders GoalManagement', () => {
    renderPage()
    expect(screen.getByTestId('goal-management')).toBeInTheDocument()
  })

  it('breadcrumb shows id when portfolio data not yet loaded', () => {
    renderPage('port-abc')
    expect(screen.getByRole('link', { name: 'port-abc' })).toBeInTheDocument()
  })

  it('breadcrumb shows portfolio name when found', async () => {
    const { usePortfolios } = await import('@/features/portfolios')
    vi.mocked(usePortfolios).mockReturnValue({
      data: [{ id: 'port-abc', name: 'Alpha Portfolio' }],
    } as unknown as ReturnType<typeof usePortfolios>)

    renderPage('port-abc')
    expect(screen.getByRole('link', { name: 'Alpha Portfolio' })).toBeInTheDocument()
  })

  it('breadcrumb portfolios link points to /portfolios', () => {
    renderPage()
    expect(screen.getByRole('link', { name: 'Portfolios' })).toHaveAttribute('href', '/portfolios')
  })

  it('breadcrumb portfolio link points to /portfolios/:id', () => {
    renderPage('port-abc')
    expect(screen.getByRole('link', { name: 'port-abc' })).toHaveAttribute(
      'href',
      '/portfolios/port-abc',
    )
  })
})
