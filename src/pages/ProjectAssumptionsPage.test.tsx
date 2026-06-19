import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type * as EntityProject from '@/entities/project'
import type * as PlanningObjects from '@/features/planning-objects'
import type * as RiskRegister from '@/features/risk-register'
import { i18n } from '@/shared/lib/i18n'

import { ProjectAssumptionsPage } from './ProjectAssumptionsPage'

vi.mock('@/entities/project', async (importOriginal) => {
  const original = await importOriginal<typeof EntityProject>()
  return { ...original, useGetProject: vi.fn(() => ({ data: undefined })) }
})

let capturedAssumptionManagementProps: {
  scopeId?: string
  onOpenRiskEntry?: (id: string) => void
} = {}

vi.mock('@/features/planning-objects', async (importOriginal) => {
  const original = await importOriginal<typeof PlanningObjects>()
  return {
    ...original,
    AssumptionManagement: (props: { scopeId?: string; onOpenRiskEntry?: (id: string) => void }) => {
      capturedAssumptionManagementProps = props
      return createElement('div', { 'data-testid': 'assumption-management' })
    },
  }
})

const mockOpenRiskEntry = vi.fn()
vi.mock('@/features/risk-register', async (importOriginal) => {
  const original = await importOriginal<typeof RiskRegister>()
  return {
    ...original,
    useEditRiskEntryDialogStore: (selector: (s: { open: typeof mockOpenRiskEntry }) => unknown) =>
      selector({ open: mockOpenRiskEntry }),
  }
})

let queryClient: QueryClient

function renderPage(id = 'proj-1') {
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    createElement(
      MemoryRouter,
      { initialEntries: [`/projects/${id}/assumptions`] },
      createElement(
        QueryClientProvider,
        { client: queryClient },
        createElement(
          Routes,
          null,
          createElement(Route, {
            path: '/projects/:id/assumptions',
            element: createElement(ProjectAssumptionsPage),
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
  capturedAssumptionManagementProps = {}
  const { useGetProject } = await import('@/entities/project')
  vi.mocked(useGetProject).mockReturnValue({ data: undefined } as ReturnType<typeof useGetProject>)
})

describe('ProjectAssumptionsPage', () => {
  it('renders Assumptions heading', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: 'Assumptions' })).toBeInTheDocument()
  })

  it('renders AssumptionManagement', () => {
    renderPage()
    expect(screen.getByTestId('assumption-management')).toBeInTheDocument()
  })

  it('breadcrumb shows id when project data not yet loaded', () => {
    renderPage('proj-abc')
    expect(screen.getByRole('link', { name: 'proj-abc' })).toBeInTheDocument()
  })

  it('breadcrumb shows project name when loaded', async () => {
    const { useGetProject } = await import('@/entities/project')
    vi.mocked(useGetProject).mockReturnValue({ data: { name: 'Beta Project' } } as ReturnType<
      typeof useGetProject
    >)

    renderPage('proj-abc')
    expect(screen.getByRole('link', { name: 'Beta Project' })).toBeInTheDocument()
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

  it('passes the risk register open function as onOpenRiskEntry to AssumptionManagement', () => {
    renderPage()
    expect(capturedAssumptionManagementProps.onOpenRiskEntry).toBe(mockOpenRiskEntry)
  })

  it('passes the route scopeId to AssumptionManagement', () => {
    renderPage('proj-xyz')
    expect(capturedAssumptionManagementProps.scopeId).toBe('proj-xyz')
  })
})
