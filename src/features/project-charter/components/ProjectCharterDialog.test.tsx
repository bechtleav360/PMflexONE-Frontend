import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type * as ProjectCharterModule from '@/entities/project-charter'
import { useGetProjectCharter, useGetProjectCharterByProjectId } from '@/entities/project-charter'
import type * as SharedComponentsModule from '@/shared/components'
import { showPromise } from '@/shared/components'
import { i18n } from '@/shared/lib/i18n'

import { ProjectCharterDialog } from './ProjectCharterDialog'

vi.mock('@/entities/project-charter', async (importOriginal) => {
  const actual = await importOriginal<typeof ProjectCharterModule>()
  return {
    ...actual,
    useGetProjectCharter: vi.fn(),
    useGetProjectCharterByProjectId: vi.fn(),
  }
})

vi.mock('../hooks/useCreateProjectCharter', () => ({
  useCreateProjectCharter: () => ({
    mutateAsync: vi.fn().mockResolvedValue({
      id: 'pc-new',
      version: 1,
      project: { id: 'e2e00000-0000-0000-0000-000000000001' },
    }),
    isPending: false,
  }),
}))

vi.mock('../hooks/useUpdateProjectCharter', () => ({
  useUpdateProjectCharter: () => ({
    mutateAsync: vi.fn().mockResolvedValue({
      id: 'pc-1',
      version: 2,
      project: { id: 'e2e00000-0000-0000-0000-000000000001' },
    }),
    isPending: false,
  }),
}))

vi.mock('../hooks/useSubmitProjectCharter', () => ({
  useSubmitProjectCharter: () => ({
    mutateAsync: vi.fn().mockResolvedValue({
      id: 'pc-1',
      version: 3,
      project: { id: 'e2e00000-0000-0000-0000-000000000001' },
    }),
    isPending: false,
  }),
}))

vi.mock('@/shared/components', async (importOriginal) => {
  const actual = await importOriginal<typeof SharedComponentsModule>()
  return { ...actual, showPromise: vi.fn() }
})

const mockUseGetProjectCharterByProjectId = vi.mocked(useGetProjectCharterByProjectId)
const mockUseGetProjectCharter = vi.mocked(useGetProjectCharter)
const mockShowPromise = vi.mocked(showPromise)

const DRAFT_CHARTER = {
  id: 'pc-1',
  version: 1,
  status: 'DRAFT' as const,
  projectSummary: 'Summary text',
  scopeSummary: 'Scope text',
  successCriteria: null,
  stakeholders: null,
  requirement: null,
  projectConstraint: null,
  assumption: null,
  risk: null,
  resources: null,
  operationalImplementation: null,
  createdAt: '2026-04-01T00:00:00Z',
  updatedAt: '2026-04-01T00:00:00Z',
  creator: null,
  updater: null,
  project: { id: 'e2e00000-0000-0000-0000-000000000001' },
}

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
  return Wrapper
}

function renderDialog(props: { isOpen?: boolean; projectId?: string; onClose?: () => void } = {}) {
  const Wrapper = makeWrapper()
  render(
    <Wrapper>
      <ProjectCharterDialog
        projectId={props.projectId ?? 'e2e00000-0000-0000-0000-000000000001'}
        isOpen={props.isOpen ?? true}
        onClose={props.onClose ?? vi.fn()}
      />
    </Wrapper>,
  )
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

beforeEach(() => {
  mockUseGetProjectCharterByProjectId.mockReturnValue({
    data: null,
    isPending: false,
  } as unknown as ReturnType<typeof mockUseGetProjectCharterByProjectId>)
  mockUseGetProjectCharter.mockReturnValue({
    data: undefined,
    isPending: false,
  } as unknown as ReturnType<typeof mockUseGetProjectCharter>)
  mockShowPromise.mockReset()
})

describe('ProjectCharterDialog — visibility', () => {
  it('does not render dialog content when isOpen is false', () => {
    renderDialog({ isOpen: false })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders the dialog when isOpen is true', () => {
    renderDialog()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})

describe('ProjectCharterDialog — loading state', () => {
  it('shows loading skeleton while summary is pending', () => {
    mockUseGetProjectCharterByProjectId.mockReturnValue({
      data: undefined,
      isPending: true,
    } as unknown as ReturnType<typeof mockUseGetProjectCharterByProjectId>)
    renderDialog()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument()
  })
})

describe('ProjectCharterDialog — create mode (no existing charter)', () => {
  it('shows "New Project Charter" heading', () => {
    renderDialog()
    expect(screen.getByRole('heading', { name: /new project charter/i })).toBeInTheDocument()
  })

  it('shows Submit button in create mode', () => {
    renderDialog()
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument()
  })

  it('shows Save as Draft button', () => {
    renderDialog()
    expect(screen.getByRole('button', { name: /save as draft/i })).toBeInTheDocument()
  })

  it('calls showPromise when Save as Draft is clicked', async () => {
    const user = userEvent.setup()
    renderDialog()
    await user.click(screen.getByRole('button', { name: /save as draft/i }))
    await waitFor(() => expect(mockShowPromise).toHaveBeenCalled())
  })

  it('calls showPromise when Submit is clicked', async () => {
    const user = userEvent.setup()
    renderDialog()
    await user.click(screen.getByRole('button', { name: /^submit$/i }))
    await waitFor(() => expect(mockShowPromise).toHaveBeenCalled())
  })
})

describe('ProjectCharterDialog — edit mode (existing DRAFT charter)', () => {
  beforeEach(() => {
    mockUseGetProjectCharterByProjectId.mockReturnValue({
      data: { id: 'pc-1', status: 'DRAFT' },
      isPending: false,
    } as unknown as ReturnType<typeof mockUseGetProjectCharterByProjectId>)
    mockUseGetProjectCharter.mockReturnValue({
      data: DRAFT_CHARTER,
      isPending: false,
    } as unknown as ReturnType<typeof mockUseGetProjectCharter>)
  })

  it('shows "Project Charter" heading when charter exists', () => {
    renderDialog()
    expect(screen.getByRole('heading', { name: /^project charter$/i })).toBeInTheDocument()
  })

  it('shows status badge', () => {
    renderDialog()
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('shows Submit button for DRAFT status', () => {
    renderDialog()
    expect(screen.getByRole('button', { name: /^submit$/i })).toBeInTheDocument()
  })

  it('pre-fills non-null charter fields and converts null fields to empty strings', () => {
    renderDialog()
    expect(screen.getByLabelText(/project summary/i)).toHaveTextContent('Summary text')
    expect(screen.getByLabelText(/scope summary/i)).toHaveTextContent('Scope text')
    // null fields map to '' via toFormValues
    expect(screen.getByLabelText(/success criteria/i)).toHaveTextContent('')
  })

  it('converts null scopeSummary to empty string and renders non-null successCriteria', () => {
    const variantCharter = {
      ...DRAFT_CHARTER,
      scopeSummary: null,
      successCriteria: 'Pass all tests',
    }
    mockUseGetProjectCharterByProjectId.mockReturnValue({
      data: { id: 'pc-1', status: 'DRAFT' },
      isPending: false,
    } as unknown as ReturnType<typeof mockUseGetProjectCharterByProjectId>)
    mockUseGetProjectCharter.mockReturnValue({
      data: variantCharter,
      isPending: false,
    } as unknown as ReturnType<typeof mockUseGetProjectCharter>)
    renderDialog()
    expect(screen.getByLabelText(/scope summary/i)).toHaveTextContent('')
    expect(screen.getByLabelText(/success criteria/i)).toHaveTextContent('Pass all tests')
  })

  it('calls showPromise when Save as Draft is clicked', async () => {
    const user = userEvent.setup()
    renderDialog()
    await user.click(screen.getByRole('button', { name: /save as draft/i }))
    await waitFor(() => expect(mockShowPromise).toHaveBeenCalled())
  })

  it('calls showPromise when Submit is clicked in edit mode', async () => {
    const user = userEvent.setup()
    renderDialog()
    await user.click(screen.getByRole('button', { name: /^submit$/i }))
    await waitFor(() => expect(mockShowPromise).toHaveBeenCalled())
  })
})

describe('ProjectCharterDialog — accepted charter', () => {
  it('hides Submit button when charter is ACCEPTED', () => {
    const acceptedCharter = { ...DRAFT_CHARTER, status: 'ACCEPTED' as const }
    mockUseGetProjectCharterByProjectId.mockReturnValue({
      data: { id: 'pc-1', status: 'ACCEPTED' },
      isPending: false,
    } as unknown as ReturnType<typeof mockUseGetProjectCharterByProjectId>)
    mockUseGetProjectCharter.mockReturnValue({
      data: acceptedCharter,
      isPending: false,
    } as unknown as ReturnType<typeof mockUseGetProjectCharter>)
    renderDialog()
    expect(screen.queryByRole('button', { name: /^submit$/i })).not.toBeInTheDocument()
  })
})
