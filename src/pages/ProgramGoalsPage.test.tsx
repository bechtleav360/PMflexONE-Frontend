import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type * as PlanningObjects from '@/features/planning-objects'
import type * as Programs from '@/features/programs'
import { i18n } from '@/shared/lib/i18n'

import { ProgramGoalsPage } from './ProgramGoalsPage'

vi.mock('@/features/programs', async (importOriginal) => {
  const original = await importOriginal<typeof Programs>()
  return { ...original, useProgram: vi.fn(() => ({ data: undefined })) }
})

const goalManagementProps: Record<string, unknown> = {}

vi.mock('@/features/planning-objects', async (importOriginal) => {
  const original = await importOriginal<typeof PlanningObjects>()
  return {
    ...original,
    GoalManagement: (props: Record<string, unknown>) => {
      Object.assign(goalManagementProps, props)
      return createElement('div', { 'data-testid': 'goal-management' })
    },
  }
})

let queryClient: QueryClient

function renderPage(id = 'prog-1') {
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    createElement(
      MemoryRouter,
      { initialEntries: [`/programs/${id}/goals`] },
      createElement(
        QueryClientProvider,
        { client: queryClient },
        createElement(
          Routes,
          null,
          createElement(Route, {
            path: '/programs/:id/goals',
            element: createElement(ProgramGoalsPage),
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
  Object.keys(goalManagementProps).forEach((k) => delete goalManagementProps[k])
  const { useProgram } = await import('@/features/programs')
  vi.mocked(useProgram).mockReturnValue({ data: undefined } as ReturnType<typeof useProgram>)
})

describe('ProgramGoalsPage', () => {
  it('renders Goals heading', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: 'Goals' })).toBeInTheDocument()
  })

  it('renders GoalManagement', () => {
    renderPage()
    expect(screen.getByTestId('goal-management')).toBeInTheDocument()
  })

  it('breadcrumb shows id when program data not yet loaded', () => {
    renderPage('prog-abc')
    expect(screen.getByRole('link', { name: 'prog-abc' })).toBeInTheDocument()
  })

  it('breadcrumb shows program name when loaded', async () => {
    const { useProgram } = await import('@/features/programs')
    vi.mocked(useProgram).mockReturnValue({ data: { name: 'Alpha Program' } } as ReturnType<
      typeof useProgram
    >)

    renderPage('prog-abc')
    expect(screen.getByRole('link', { name: 'Alpha Program' })).toBeInTheDocument()
  })

  it('breadcrumb programs link points to /programs', () => {
    renderPage()
    expect(screen.getByRole('link', { name: 'Programs' })).toHaveAttribute('href', '/programs')
  })

  it('breadcrumb program link points to /programs/:id', () => {
    renderPage('prog-abc')
    expect(screen.getByRole('link', { name: 'prog-abc' })).toHaveAttribute(
      'href',
      '/programs/prog-abc',
    )
  })

  it('passes showAppliesTo=false and no portfolioId when program has no portfolio', () => {
    renderPage()
    expect(goalManagementProps.showAppliesTo).toBe(false)
    expect(goalManagementProps.portfolioId).toBeUndefined()
  })

  it('passes portfolioId and showAppliesTo=true when program has a portfolio', async () => {
    const { useProgram } = await import('@/features/programs')
    vi.mocked(useProgram).mockReturnValue({
      data: { name: 'Alpha', portfolio: { item: { id: 'port-1', name: 'My Portfolio' } } },
    } as ReturnType<typeof useProgram>)

    renderPage()
    expect(goalManagementProps.portfolioId).toBe('port-1')
    expect(goalManagementProps.showAppliesTo).toBe(true)
  })

  it('passes showAppliesTo=false when program has portfolio=null', async () => {
    const { useProgram } = await import('@/features/programs')
    vi.mocked(useProgram).mockReturnValue({
      data: { name: 'Alpha', portfolio: null },
    } as ReturnType<typeof useProgram>)

    renderPage()
    expect(goalManagementProps.showAppliesTo).toBe(false)
  })
})
