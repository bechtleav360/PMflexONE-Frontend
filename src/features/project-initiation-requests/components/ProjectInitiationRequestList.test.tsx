import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import type * as PIRModule from '@/entities/project-initiation-request'
import type { ProjectInitiationRequest } from '@/entities/project-initiation-request'
import { i18n } from '@/shared/lib/i18n'

import { deletePIRWithToast } from '../hooks/useDeleteProjectInitiationRequest'
import { ProjectInitiationRequestList } from './ProjectInitiationRequestList'

vi.mock('../hooks/useDeleteProjectInitiationRequest', () => ({
  useDeleteProjectInitiationRequest: () => ({ mutateAsync: vi.fn() }),
  deletePIRWithToast: vi.fn(),
}))

vi.mock('@/entities/project-initiation-request', async (importActual) => {
  const actual = await importActual<typeof PIRModule>()
  return {
    ...actual,
    useLookupProjectInitiationRequestStatus: () => ({
      data: [
        { value: 'draft', label: 'Draft' },
        { value: 'submitted', label: 'Submitted' },
        { value: 'accepted', label: 'Accepted' },
      ],
      isPending: false,
    }),
  }
})

const draftRequest: ProjectInitiationRequest = {
  id: 'pir-1',
  version: 1,
  name: 'Digitalisierung Rechnungswesen',
  status: 'draft',
  documentVersion: null,
  requestingProject: null,
  projectInitiator: null,
  projectOwner: null,
  organizationalUnit: null,
  solutionProvider: null,
  approvalAuthority: null,
  requestDate: null,
  estimatedEffort: null,
  estimatedEffortComment: null,
  targetDeliveryDate: null,
  deliveryType: null,
  updatedAt: '2026-04-20T10:00:00Z',
  createdAt: '2026-04-01T09:00:00Z',
  creator: null,
  updater: null,
  scope: null,
}

const acceptedRequest: ProjectInitiationRequest = {
  ...draftRequest,
  id: 'pir-2',
  name: 'Digitalisierung Rechnungswesen',
  status: 'accepted',
  updatedAt: '2026-04-19T08:00:00Z',
}

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(MemoryRouter, null, children),
    )
  }
  return Wrapper
}

function renderList(props: React.ComponentProps<typeof ProjectInitiationRequestList>) {
  const Wrapper = makeWrapper()
  return render(createElement(Wrapper, null, createElement(ProjectInitiationRequestList, props)))
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

describe('ProjectInitiationRequestList', () => {
  it('renders correct rows for draft and accepted items', () => {
    renderList({ requests: [draftRequest, acceptedRequest], isPending: false, isError: false })

    const links = screen.getAllByRole('link', { name: /digitalisierung rechnungswesen/i })
    expect(links).toHaveLength(2)
    expect(links[0]).toHaveAttribute('href', '/initiation-requests/pir-1')
    expect(links[1]).toHaveAttribute('href', '/initiation-requests/pir-2')
  })

  it('renders status badge for each row', () => {
    renderList({ requests: [draftRequest, acceptedRequest], isPending: false, isError: false })

    expect(screen.getByText('Draft')).toBeInTheDocument()
    expect(screen.getByText('Accepted')).toBeInTheDocument()
  })

  it('accepted row name link has muted styling', () => {
    renderList({ requests: [acceptedRequest], isPending: false, isError: false })

    const link = screen.getByRole('link', { name: /digitalisierung rechnungswesen/i })
    expect(link.className).toContain('text-muted-foreground')
    expect(link.className).toContain('opacity-75')
  })

  it('shows empty state when requests list is empty', () => {
    renderList({ requests: [], isPending: false, isError: false })

    expect(screen.getByText(/no data to display/i)).toBeInTheDocument()
  })

  it('shows loading skeleton when isPending is true', () => {
    renderList({ requests: [], isPending: true, isError: false })

    // The Table component renders skeleton rows — content should be hidden
    expect(screen.queryByText(/no initiation requests yet/i)).not.toBeInTheDocument()
  })

  it('shows empty state when isError is true and list is empty', () => {
    renderList({ requests: [], isPending: false })

    expect(screen.getByText(/no data to display/i)).toBeInTheDocument()
  })

  it('clicking the delete button triggers deletePIRWithToast with the row id', async () => {
    const user = userEvent.setup()
    renderList({ requests: [draftRequest], isPending: false, isError: false })

    await user.click(screen.getByRole('button', { name: /delete initiation request/i }))

    expect(vi.mocked(deletePIRWithToast)).toHaveBeenCalledWith(
      expect.any(Function),
      'pir-1',
      expect.any(Object),
    )
  })

  it('clicking a sortable column header sorts rows ascending', async () => {
    const user = userEvent.setup()
    const requestAlpha = { ...draftRequest, id: 'pir-a', name: 'Alpha Project' }
    const requestZeta = { ...draftRequest, id: 'pir-z', name: 'Zeta Project' }

    renderList({ requests: [requestZeta, requestAlpha], isPending: false, isError: false })

    const links = screen.getAllByRole('link')
    expect(links[0]).toHaveTextContent('Zeta Project')

    await user.click(screen.getByRole('button', { name: /sort by project title/i }))

    const sortedLinks = screen.getAllByRole('link')
    expect(sortedLinks[0]).toHaveTextContent('Alpha Project')
  })
})
