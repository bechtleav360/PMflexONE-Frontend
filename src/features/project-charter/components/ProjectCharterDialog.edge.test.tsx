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

describe('ProjectCharterDialog — guard: charter not yet loaded when hasExisting is true', () => {
  beforeEach(() => {
    // Summary is loaded but full charter query returned undefined (still resolving)
    mockUseGetProjectCharterByProjectId.mockReturnValue({
      data: { id: 'pc-1', status: 'DRAFT' },
      isPending: false,
    } as unknown as ReturnType<typeof mockUseGetProjectCharterByProjectId>)
    mockUseGetProjectCharter.mockReturnValue({
      data: undefined,
      isPending: false,
    } as unknown as ReturnType<typeof mockUseGetProjectCharter>)
  })

  it('save does not call showPromise when charter data is missing (guard branch)', async () => {
    const user = userEvent.setup()
    renderDialog()
    await user.click(screen.getByRole('button', { name: /save as draft/i }))
    expect(mockShowPromise).not.toHaveBeenCalled()
  })

  it('submit does not call showPromise when charter data is missing (guard branch)', async () => {
    const user = userEvent.setup()
    renderDialog()
    await user.click(screen.getByRole('button', { name: /^submit$/i }))
    expect(mockShowPromise).not.toHaveBeenCalled()
  })
})

describe('ProjectCharterDialog — toast error callbacks', () => {
  it('error callback in create-save toast is callable', async () => {
    const user = userEvent.setup()
    let capturedError: ((err: unknown) => unknown) | undefined
    mockShowPromise.mockImplementation((_p, opts) => {
      if (typeof opts?.error === 'function') capturedError = opts.error as (err: unknown) => unknown
      return undefined as unknown as ReturnType<typeof mockShowPromise>
    })
    renderDialog()
    await user.click(screen.getByRole('button', { name: /save as draft/i }))
    await waitFor(() => expect(capturedError).toBeDefined())
    expect(() => capturedError!(new Error('failed'))).not.toThrow()
  })

  it('error callback in update-save toast is callable', async () => {
    mockUseGetProjectCharterByProjectId.mockReturnValue({
      data: { id: 'pc-1', status: 'DRAFT' },
      isPending: false,
    } as unknown as ReturnType<typeof mockUseGetProjectCharterByProjectId>)
    mockUseGetProjectCharter.mockReturnValue({
      data: DRAFT_CHARTER,
      isPending: false,
    } as unknown as ReturnType<typeof mockUseGetProjectCharter>)
    const user = userEvent.setup()
    let capturedError: ((err: unknown) => unknown) | undefined
    mockShowPromise.mockImplementation((_p, opts) => {
      if (typeof opts?.error === 'function') capturedError = opts.error as (err: unknown) => unknown
      return undefined as unknown as ReturnType<typeof mockShowPromise>
    })
    renderDialog()
    await user.click(screen.getByRole('button', { name: /save as draft/i }))
    await waitFor(() => expect(capturedError).toBeDefined())
    expect(() => capturedError!(new Error('failed'))).not.toThrow()
  })

  it('error callback in submit toast is callable', async () => {
    const user = userEvent.setup()
    let capturedError: ((err: unknown) => unknown) | undefined
    mockShowPromise.mockImplementation((_p, opts) => {
      if (typeof opts?.error === 'function') capturedError = opts.error as (err: unknown) => unknown
      return undefined as unknown as ReturnType<typeof mockShowPromise>
    })
    renderDialog()
    await user.click(screen.getByRole('button', { name: /^submit$/i }))
    await waitFor(() => expect(capturedError).toBeDefined())
    expect(() => capturedError!(new Error('failed'))).not.toThrow()
  })
})

describe('ProjectCharterDialog — cancel', () => {
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
