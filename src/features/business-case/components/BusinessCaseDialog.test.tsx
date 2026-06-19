import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type * as BusinessCaseModule from '@/entities/business-case'
import { useGetBusinessCase, useGetBusinessCaseByProjectId } from '@/entities/business-case'
import type * as SharedComponentsModule from '@/shared/components'
import { showPromise } from '@/shared/components'
import { i18n } from '@/shared/lib/i18n'

import { BusinessCaseDialog } from './BusinessCaseDialog'

vi.mock('@/entities/business-case', async (importOriginal) => {
  const actual = await importOriginal<typeof BusinessCaseModule>()
  return {
    ...actual,
    useGetBusinessCase: vi.fn(),
    useGetBusinessCaseByProjectId: vi.fn(),
    useLookupBusinessCaseStatuses: vi.fn().mockReturnValue({ data: [] }),
  }
})

vi.mock('../hooks/useCreateBusinessCase', () => ({
  useCreateBusinessCase: () => ({
    mutateAsync: vi.fn().mockResolvedValue({ id: 'bc-new', version: 1 }),
    isPending: false,
  }),
}))

vi.mock('../hooks/useUpdateBusinessCase', () => ({
  useUpdateBusinessCase: () => ({
    mutateAsync: vi.fn().mockResolvedValue({ id: 'bc-1', version: 2 }),
    isPending: false,
  }),
}))

vi.mock('../hooks/useSubmitBusinessCase', () => ({
  useSubmitBusinessCase: () => ({
    mutateAsync: vi.fn().mockResolvedValue({ id: 'bc-1', version: 3 }),
    isPending: false,
  }),
}))

vi.mock('@/shared/components', async (importOriginal) => {
  const actual = await importOriginal<typeof SharedComponentsModule>()
  return { ...actual, showPromise: vi.fn() }
})

const mockUseGetBusinessCaseByProjectId = vi.mocked(useGetBusinessCaseByProjectId)
const mockUseGetBusinessCase = vi.mocked(useGetBusinessCase)
const mockShowPromise = vi.mocked(showPromise)

const DRAFT_BC = {
  id: 'bc-1',
  version: 1,
  status: 'draft',
  clientSummary: 'Summary text',
  projectRationale: null,
  expectedBenefit: null,
  options: null,
  investmentCalculation: null,
  keyRisks: null,
  expectedNegativeSideEffect: null,
  timeline: null,
  createdAt: null,
  updatedAt: null,
  metadata: null,
  creator: null,
  updater: null,
  project: { id: 'e2e00000-0000-0000-0000-000000000001', name: 'Test' },
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
      <BusinessCaseDialog
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
  mockUseGetBusinessCaseByProjectId.mockReturnValue({
    data: null,
    isPending: false,
  } as unknown as ReturnType<typeof mockUseGetBusinessCaseByProjectId>)
  mockUseGetBusinessCase.mockReturnValue({
    data: undefined,
    isPending: false,
  } as unknown as ReturnType<typeof mockUseGetBusinessCase>)
  mockShowPromise.mockReset()
})

describe('BusinessCaseDialog — visibility', () => {
  it('does not render dialog content when isOpen is false', () => {
    renderDialog({ isOpen: false })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders the dialog when isOpen is true', () => {
    renderDialog()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})

describe('BusinessCaseDialog — loading state', () => {
  it('shows skeleton while summary is pending and hides footer buttons', () => {
    mockUseGetBusinessCaseByProjectId.mockReturnValue({
      data: undefined,
      isPending: true,
    } as unknown as ReturnType<typeof mockUseGetBusinessCaseByProjectId>)
    renderDialog()
    expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument()
  })
})

describe('BusinessCaseDialog — create mode (no existing BC)', () => {
  it('shows "New Business Case" heading', () => {
    renderDialog()
    expect(screen.getByRole('heading', { name: /new business case/i })).toBeInTheDocument()
  })

  it('shows Save as Draft and Mark as Complete buttons', () => {
    renderDialog()
    expect(screen.getByRole('button', { name: /save as draft/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^submit$/i })).toBeInTheDocument()
  })

  it('calls showPromise when Save as Draft is clicked', async () => {
    const user = userEvent.setup()
    renderDialog()
    await user.click(screen.getByRole('button', { name: /save as draft/i }))
    await waitFor(() => expect(mockShowPromise).toHaveBeenCalled())
  })

  it('calls showPromise when Mark as Complete is clicked', async () => {
    const user = userEvent.setup()
    renderDialog()
    await user.click(screen.getByRole('button', { name: /^submit$/i }))
    await waitFor(() => expect(mockShowPromise).toHaveBeenCalled())
  })
})

describe('BusinessCaseDialog — edit mode (existing draft BC)', () => {
  beforeEach(() => {
    mockUseGetBusinessCaseByProjectId.mockReturnValue({
      data: { id: 'bc-1' },
      isPending: false,
    } as unknown as ReturnType<typeof mockUseGetBusinessCaseByProjectId>)
    mockUseGetBusinessCase.mockReturnValue({
      data: DRAFT_BC,
      isPending: false,
    } as unknown as ReturnType<typeof mockUseGetBusinessCase>)
  })

  it('shows "Business Case" heading when BC exists', () => {
    renderDialog()
    expect(screen.getByRole('heading', { name: /^business case$/i })).toBeInTheDocument()
  })

  it('shows Mark as Complete button for draft status', () => {
    renderDialog()
    expect(screen.getByRole('button', { name: /^submit$/i })).toBeInTheDocument()
  })

  it('pre-fills non-null BC fields', () => {
    renderDialog()
    expect(screen.getByLabelText(/client summary/i)).toHaveTextContent('Summary text')
  })

  it('maps null BC fields to empty strings', () => {
    renderDialog()
    expect(screen.getByLabelText(/project rationale/i)).toHaveTextContent('')
  })

  it('calls showPromise when Save as Draft is clicked in edit mode', async () => {
    const user = userEvent.setup()
    renderDialog()
    await user.click(screen.getByRole('button', { name: /save as draft/i }))
    await waitFor(() => expect(mockShowPromise).toHaveBeenCalled())
  })

  it('calls showPromise when Mark as Complete is clicked in edit mode', async () => {
    const user = userEvent.setup()
    renderDialog()
    await user.click(screen.getByRole('button', { name: /^submit$/i }))
    await waitFor(() => expect(mockShowPromise).toHaveBeenCalled())
  })
})

describe('BusinessCaseDialog — submitted BC', () => {
  it('hides Mark as Complete button when BC is submitted', () => {
    const submittedBc = { ...DRAFT_BC, status: 'submitted' }
    mockUseGetBusinessCaseByProjectId.mockReturnValue({
      data: { id: 'bc-1' },
      isPending: false,
    } as unknown as ReturnType<typeof mockUseGetBusinessCaseByProjectId>)
    mockUseGetBusinessCase.mockReturnValue({
      data: submittedBc,
      isPending: false,
    } as unknown as ReturnType<typeof mockUseGetBusinessCase>)
    renderDialog()
    expect(screen.queryByRole('button', { name: /^submit$/i })).not.toBeInTheDocument()
  })
})

describe('BusinessCaseDialog — guard: BC not yet loaded when hasExisting is true', () => {
  beforeEach(() => {
    mockUseGetBusinessCaseByProjectId.mockReturnValue({
      data: { id: 'bc-1' },
      isPending: false,
    } as unknown as ReturnType<typeof mockUseGetBusinessCaseByProjectId>)
    mockUseGetBusinessCase.mockReturnValue({
      data: undefined,
      isPending: false,
    } as unknown as ReturnType<typeof mockUseGetBusinessCase>)
  })

  it('save does not call showPromise when bc data is missing', async () => {
    const user = userEvent.setup()
    renderDialog()
    await user.click(screen.getByRole('button', { name: /save as draft/i }))
    expect(mockShowPromise).not.toHaveBeenCalled()
  })

  it('mark complete does not call showPromise when bc data is missing', async () => {
    const user = userEvent.setup()
    renderDialog()
    await user.click(screen.getByRole('button', { name: /^submit$/i }))
    expect(mockShowPromise).not.toHaveBeenCalled()
  })
})

describe('BusinessCaseDialog — cancel', () => {
  it('calls onClose when Cancel button is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderDialog({ onClose })
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose when dialog is dismissed via Escape key', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderDialog({ onClose })
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalled()
  })
})
