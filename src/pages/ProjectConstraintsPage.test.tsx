import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type * as EntityProject from '@/entities/project'
import type * as PlanningObjects from '@/features/planning-objects'
import { i18n } from '@/shared/lib/i18n'

import { ProjectConstraintsPage } from './ProjectConstraintsPage'

vi.mock('@/entities/project', async (importOriginal) => {
  const original = await importOriginal<typeof EntityProject>()
  return { ...original, useGetProject: vi.fn(() => ({ data: undefined })) }
})

vi.mock('@/features/planning-objects', async (importOriginal) => {
  const original = await importOriginal<typeof PlanningObjects>()
  return {
    ...original,
    ConstraintManagement: () => createElement('div', { 'data-testid': 'constraint-management' }),
  }
})

let queryClient: QueryClient

function renderPage(id = 'proj-1') {
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    createElement(
      MemoryRouter,
      { initialEntries: [`/projects/${id}/constraints`] },
      createElement(
        QueryClientProvider,
        { client: queryClient },
        createElement(
          Routes,
          null,
          createElement(Route, {
            path: '/projects/:id/constraints',
            element: createElement(ProjectConstraintsPage),
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
  const { useGetProject } = await import('@/entities/project')
  vi.mocked(useGetProject).mockReturnValue({ data: undefined } as ReturnType<typeof useGetProject>)
})

describe('ProjectConstraintsPage', () => {
  it('renders Constraints heading', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: 'Constraints' })).toBeInTheDocument()
  })

  it('renders ConstraintManagement', () => {
    renderPage()
    expect(screen.getByTestId('constraint-management')).toBeInTheDocument()
  })

  it('breadcrumb shows id when project data not yet loaded', () => {
    renderPage('proj-abc')
    expect(screen.getByRole('link', { name: 'proj-abc' })).toBeInTheDocument()
  })

  it('breadcrumb shows project name when loaded', async () => {
    const { useGetProject } = await import('@/entities/project')
    vi.mocked(useGetProject).mockReturnValue({ data: { name: 'Delta Project' } } as ReturnType<
      typeof useGetProject
    >)

    renderPage('proj-abc')
    expect(screen.getByRole('link', { name: 'Delta Project' })).toBeInTheDocument()
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
})
