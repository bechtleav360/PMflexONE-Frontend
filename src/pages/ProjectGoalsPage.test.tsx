import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type * as EntityProject from '@/entities/project'
import type * as PlanningObjects from '@/features/planning-objects'
import type * as Programs from '@/features/programs'
import { i18n } from '@/shared/lib/i18n'

import { ProjectGoalsPage } from './ProjectGoalsPage'

type GoalManagementProps = {
  scopeType?: string
  scopeId?: string
  programId?: string | null
  portfolioId?: string | null
  showAppliesTo?: boolean
}

vi.mock('@/entities/project', async (importOriginal) => {
  const original = await importOriginal<typeof EntityProject>()
  return { ...original, useGetProject: vi.fn(() => ({ data: undefined })) }
})

let capturedGoalManagementProps: GoalManagementProps = {}

vi.mock('@/features/planning-objects', async (importOriginal) => {
  const original = await importOriginal<typeof PlanningObjects>()
  return {
    ...original,
    GoalManagement: (props: GoalManagementProps) => {
      capturedGoalManagementProps = props
      return createElement('div', { 'data-testid': 'goal-management' })
    },
  }
})

vi.mock('@/features/programs', async (importOriginal) => {
  const original = await importOriginal<typeof Programs>()
  return { ...original, usePrograms: vi.fn(() => ({ data: [] })) }
})

let queryClient: QueryClient

function renderPage(id = 'proj-1') {
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    createElement(
      MemoryRouter,
      { initialEntries: [`/projects/${id}/goals`] },
      createElement(
        QueryClientProvider,
        { client: queryClient },
        createElement(
          Routes,
          null,
          createElement(Route, {
            path: '/projects/:id/goals',
            element: createElement(ProjectGoalsPage),
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
  capturedGoalManagementProps = {}
  const { useGetProject } = await import('@/entities/project')
  vi.mocked(useGetProject).mockReturnValue({ data: undefined } as ReturnType<typeof useGetProject>)
})

describe('ProjectGoalsPage', () => {
  it('renders Goals heading', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: 'Goals' })).toBeInTheDocument()
  })

  it('renders GoalManagement', () => {
    renderPage()
    expect(screen.getByTestId('goal-management')).toBeInTheDocument()
  })

  it('breadcrumb shows id when project data not yet loaded', () => {
    renderPage('proj-abc')
    expect(screen.getByRole('link', { name: 'proj-abc' })).toBeInTheDocument()
  })

  it('breadcrumb shows project name when loaded', async () => {
    const { useGetProject } = await import('@/entities/project')
    vi.mocked(useGetProject).mockReturnValue({ data: { name: 'Alpha Project' } } as ReturnType<
      typeof useGetProject
    >)

    renderPage('proj-abc')
    expect(screen.getByRole('link', { name: 'Alpha Project' })).toBeInTheDocument()
  })

  it('breadcrumb projects link points to /projects', () => {
    renderPage()
    expect(screen.getByRole('link', { name: 'Projects' })).toHaveAttribute('href', '/projects')
  })

  it('breadcrumb project link points to /projects/:id', () => {
    renderPage('proj-abc')
    expect(screen.getByRole('link', { name: 'proj-abc' })).toHaveAttribute(
      'href',
      '/projects/proj-abc',
    )
  })

  it('passes null programId and portfolioId when project is not in any program', async () => {
    const { usePrograms } = await import('@/features/programs')
    vi.mocked(usePrograms).mockReturnValue({
      data: [],
    } as unknown as ReturnType<typeof usePrograms>)

    renderPage('proj-1')
    expect(capturedGoalManagementProps.programId).toBeNull()
    expect(capturedGoalManagementProps.portfolioId).toBeNull()
  })

  it('derives programId and portfolioId from usePrograms when project is found', async () => {
    const { usePrograms } = await import('@/features/programs')
    vi.mocked(usePrograms).mockReturnValue({
      data: [
        {
          id: 'prog-1',
          portfolio: { item: { id: 'port-1' } },
          projects: [{ item: { id: 'proj-1' } }],
        },
      ],
    } as ReturnType<typeof usePrograms>)

    renderPage('proj-1')
    expect(capturedGoalManagementProps.programId).toBe('prog-1')
    expect(capturedGoalManagementProps.portfolioId).toBe('port-1')
  })

  it('passes null portfolioId when program has no portfolio', async () => {
    const { usePrograms } = await import('@/features/programs')
    vi.mocked(usePrograms).mockReturnValue({
      data: [
        {
          id: 'prog-2',
          portfolio: null,
          projects: [{ item: { id: 'proj-1' } }],
        },
      ],
    } as ReturnType<typeof usePrograms>)

    renderPage('proj-1')
    expect(capturedGoalManagementProps.programId).toBe('prog-2')
    expect(capturedGoalManagementProps.portfolioId).toBeNull()
  })
})
