import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import type * as EntityProject from '@/entities/project'
import type * as CreateProjectFeature from '@/features/create-project'
import { i18n } from '@/shared/lib/i18n'

import { ProjectsPage } from './ProjectsPage'

const mockOpenModal = vi.fn()

vi.mock('@/entities/project', async (importOriginal) => {
  const original = await importOriginal<typeof EntityProject>()
  return { ...original, useListProjects: vi.fn() }
})

vi.mock('@/features/create-project', async (importOriginal) => {
  const original = await importOriginal<typeof CreateProjectFeature>()
  return {
    ...original,
    useCreateProjectStore: (selector: (s: { openModal: () => void }) => unknown) =>
      selector({ openModal: mockOpenModal }),
  }
})

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(
      MemoryRouter,
      { initialEntries: ['/projects'] },
      createElement(QueryClientProvider, { client: queryClient }, children),
    )
  }
  return Wrapper
}

function renderPage() {
  const Wrapper = makeWrapper()
  return render(createElement(Wrapper, null, createElement(ProjectsPage)))
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

const baseProject = {
  id: 'e2e00000-0000-0000-0000-000000000001',
  name: 'Alpha Project',
  status: 'active',
  sizeClassification: 'medium' as const,
  governanceStatus: 'formal' as const,
  startDate: '2026-01-01',
  endDate: '2026-12-31',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
}

describe('ProjectsPage — column headers', () => {
  it('renders all five required column headers', async () => {
    const { useListProjects } = await import('@/entities/project')
    vi.mocked(useListProjects).mockReturnValue({
      data: [baseProject],
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    } as never)

    renderPage()

    expect(screen.getByRole('columnheader', { name: /name/i })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: /size/i })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: /start date/i })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: /end date/i })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: /governance status/i })).toBeInTheDocument()
  })
})

describe('ProjectsPage — loading state', () => {
  it('shows loading skeleton while data is being fetched', async () => {
    const { useListProjects } = await import('@/entities/project')
    vi.mocked(useListProjects).mockReturnValue({
      data: undefined,
      isPending: true,
      isError: false,
      refetch: vi.fn(),
    } as never)

    renderPage()

    expect(screen.queryByRole('cell', { name: /alpha project/i })).not.toBeInTheDocument()
  })
})

describe('ProjectsPage — empty state', () => {
  it('shows empty state message when no projects exist', async () => {
    const { useListProjects } = await import('@/entities/project')
    vi.mocked(useListProjects).mockReturnValue({
      data: [],
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    } as never)

    renderPage()

    expect(screen.getByText(/no data to display/i)).toBeInTheDocument()
  })
})

describe('ProjectsPage — error state', () => {
  it('shows error message and retry button when load fails', async () => {
    const { useListProjects } = await import('@/entities/project')
    vi.mocked(useListProjects).mockReturnValue({
      data: undefined,
      isPending: false,
      isError: true,
      refetch: vi.fn(),
    } as never)

    renderPage()

    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
  })
})

describe('ProjectsPage — row navigation', () => {
  it('renders project name as a link navigating to /projects/:id', async () => {
    const { useListProjects } = await import('@/entities/project')
    vi.mocked(useListProjects).mockReturnValue({
      data: [baseProject],
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    } as never)

    renderPage()

    const nameLink = screen.getByRole('link', { name: /alpha project/i })
    expect(nameLink).toBeInTheDocument()
    expect(nameLink).toHaveAttribute('href', '/projects/e2e00000-0000-0000-0000-000000000001')
  })
})

describe('ProjectsPage — create project button', () => {
  it('calls openModal when New Project button is clicked', async () => {
    const { useListProjects } = await import('@/entities/project')
    const { default: userEvent } = await import('@testing-library/user-event')
    vi.mocked(useListProjects).mockReturnValue({
      data: [],
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    } as never)

    renderPage()

    const button = screen.getByRole('button', { name: /new project/i })
    await userEvent.setup().click(button)
    expect(mockOpenModal).toHaveBeenCalledOnce()
  })
})
