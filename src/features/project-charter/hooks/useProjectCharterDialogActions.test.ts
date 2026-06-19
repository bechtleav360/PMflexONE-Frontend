import { act, createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type * as SharedComponentsModule from '@/shared/components'
import { showPromise } from '@/shared/components'
import { proj1 } from '@/shared/test-utils/fixtures'

import { useCreateProjectCharter } from './useCreateProjectCharter'
import { useProjectCharterDialogActions } from './useProjectCharterDialogActions'
import { useSubmitProjectCharter } from './useSubmitProjectCharter'
import { useUpdateProjectCharter } from './useUpdateProjectCharter'

vi.mock('./useCreateProjectCharter', () => ({
  useCreateProjectCharter: vi.fn(),
}))

vi.mock('./useUpdateProjectCharter', () => ({
  useUpdateProjectCharter: vi.fn(),
}))

vi.mock('./useSubmitProjectCharter', () => ({
  useSubmitProjectCharter: vi.fn(),
}))

vi.mock('@/shared/components', async (importOriginal) => {
  const actual = await importOriginal<typeof SharedComponentsModule>()
  return { ...actual, showPromise: vi.fn() }
})

const mockUseCreateProjectCharter = vi.mocked(useCreateProjectCharter)
const mockUseUpdateProjectCharter = vi.mocked(useUpdateProjectCharter)
const mockUseSubmitProjectCharter = vi.mocked(useSubmitProjectCharter)
const mockShowPromise = vi.mocked(showPromise)

const DRAFT_PC = {
  id: 'pc-1',
  version: 1,
  status: 'DRAFT' as const,
  projectSummary: null,
  scopeSummary: null,
  successCriteria: null,
  stakeholders: null,
  requirement: null,
  projectConstraint: null,
  assumption: null,
  risk: null,
  resources: null,
  operationalImplementation: null,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  creator: null,
  updater: null,
  project: { id: proj1 },
}

const FORM_VALUES = {
  projectSummary: 'Summary',
  scopeSummary: '',
  successCriteria: '',
  stakeholders: '',
  requirement: '',
  projectConstraint: '',
  assumption: '',
  risk: '',
  resources: '',
  operationalImplementation: '',
}

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
  return Wrapper
}

beforeEach(() => {
  const createFn = vi.fn().mockResolvedValue({ id: 'pc-new', version: 1 })
  const updateFn = vi.fn().mockResolvedValue({ id: 'pc-1', version: 2 })
  const submitFn = vi.fn().mockResolvedValue({ id: 'pc-1', version: 3 })

  mockUseCreateProjectCharter.mockReturnValue({
    mutateAsync: createFn,
    isPending: false,
  } as unknown as ReturnType<typeof mockUseCreateProjectCharter>)
  mockUseUpdateProjectCharter.mockReturnValue({
    mutateAsync: updateFn,
    isPending: false,
  } as unknown as ReturnType<typeof mockUseUpdateProjectCharter>)
  mockUseSubmitProjectCharter.mockReturnValue({
    mutateAsync: submitFn,
    isPending: false,
  } as unknown as ReturnType<typeof mockUseSubmitProjectCharter>)
  mockShowPromise.mockReset()
})

describe('useProjectCharterDialogActions — derived state', () => {
  it('isSavePending is true when create is pending', () => {
    mockUseCreateProjectCharter.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: true,
    } as unknown as ReturnType<typeof mockUseCreateProjectCharter>)
    const { result } = renderHook(
      () => useProjectCharterDialogActions(proj1, null, undefined, vi.fn()),
      { wrapper: makeWrapper() },
    )
    expect(result.current.isSavePending).toBe(true)
  })

  it('isSavePending is true when update is pending', () => {
    mockUseUpdateProjectCharter.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: true,
    } as unknown as ReturnType<typeof mockUseUpdateProjectCharter>)
    const { result } = renderHook(
      () => useProjectCharterDialogActions(proj1, null, undefined, vi.fn()),
      { wrapper: makeWrapper() },
    )
    expect(result.current.isSavePending).toBe(true)
  })

  it('isSubmitPending reflects submit mutation pending state', () => {
    mockUseSubmitProjectCharter.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: true,
    } as unknown as ReturnType<typeof mockUseSubmitProjectCharter>)
    const { result } = renderHook(
      () => useProjectCharterDialogActions(proj1, null, undefined, vi.fn()),
      { wrapper: makeWrapper() },
    )
    expect(result.current.isSubmitPending).toBe(true)
  })
})

describe('useProjectCharterDialogActions — handleSave', () => {
  it('calls showPromise with create when no existing charter', () => {
    const { result } = renderHook(
      () => useProjectCharterDialogActions(proj1, null, undefined, vi.fn()),
      { wrapper: makeWrapper() },
    )
    act(() => {
      result.current.handleSave(FORM_VALUES)
    })
    expect(mockShowPromise).toHaveBeenCalledOnce()
  })

  it('calls showPromise with update when charter exists and is loaded', () => {
    const { result } = renderHook(
      () => useProjectCharterDialogActions(proj1, { id: 'pc-1' }, DRAFT_PC, vi.fn()),
      { wrapper: makeWrapper() },
    )
    act(() => {
      result.current.handleSave(FORM_VALUES)
    })
    expect(mockShowPromise).toHaveBeenCalledOnce()
  })

  it('does not call showPromise when charter exists but data not yet loaded (guard)', () => {
    const { result } = renderHook(
      () => useProjectCharterDialogActions(proj1, { id: 'pc-1' }, undefined, vi.fn()),
      { wrapper: makeWrapper() },
    )
    act(() => {
      result.current.handleSave(FORM_VALUES)
    })
    expect(mockShowPromise).not.toHaveBeenCalled()
  })

  it('error callback in create-save toast is callable', () => {
    let capturedError: ((err: unknown) => unknown) | undefined
    mockShowPromise.mockImplementation((_p, opts) => {
      if (typeof opts?.error === 'function') capturedError = opts.error as (err: unknown) => unknown
      return undefined as unknown as ReturnType<typeof mockShowPromise>
    })
    const { result } = renderHook(
      () => useProjectCharterDialogActions(proj1, null, undefined, vi.fn()),
      { wrapper: makeWrapper() },
    )
    act(() => {
      result.current.handleSave(FORM_VALUES)
    })
    expect(() => capturedError!(new Error('create failed'))).not.toThrow()
  })

  it('error callback in update-save toast is callable', () => {
    let capturedError: ((err: unknown) => unknown) | undefined
    mockShowPromise.mockImplementation((_p, opts) => {
      if (typeof opts?.error === 'function') capturedError = opts.error as (err: unknown) => unknown
      return undefined as unknown as ReturnType<typeof mockShowPromise>
    })
    const { result } = renderHook(
      () => useProjectCharterDialogActions(proj1, { id: 'pc-1' }, DRAFT_PC, vi.fn()),
      { wrapper: makeWrapper() },
    )
    act(() => {
      result.current.handleSave(FORM_VALUES)
    })
    expect(() => capturedError!(new Error('update failed'))).not.toThrow()
  })
})

describe('useProjectCharterDialogActions — handleSubmit', () => {
  it('calls showPromise with create+submit when no existing charter', () => {
    const { result } = renderHook(
      () => useProjectCharterDialogActions(proj1, null, undefined, vi.fn()),
      { wrapper: makeWrapper() },
    )
    act(() => {
      result.current.handleSubmit(FORM_VALUES)
    })
    expect(mockShowPromise).toHaveBeenCalledOnce()
  })

  it('calls showPromise with update+submit when charter exists and is loaded', () => {
    const { result } = renderHook(
      () => useProjectCharterDialogActions(proj1, { id: 'pc-1' }, DRAFT_PC, vi.fn()),
      { wrapper: makeWrapper() },
    )
    act(() => {
      result.current.handleSubmit(FORM_VALUES)
    })
    expect(mockShowPromise).toHaveBeenCalledOnce()
  })

  it('does not call showPromise when charter exists but data not yet loaded (guard)', () => {
    const { result } = renderHook(
      () => useProjectCharterDialogActions(proj1, { id: 'pc-1' }, undefined, vi.fn()),
      { wrapper: makeWrapper() },
    )
    act(() => {
      result.current.handleSubmit(FORM_VALUES)
    })
    expect(mockShowPromise).not.toHaveBeenCalled()
  })

  it('error callback in create-submit toast is callable', () => {
    let capturedError: ((err: unknown) => unknown) | undefined
    mockShowPromise.mockImplementation((_p, opts) => {
      if (typeof opts?.error === 'function') capturedError = opts.error as (err: unknown) => unknown
      return undefined as unknown as ReturnType<typeof mockShowPromise>
    })
    const { result } = renderHook(
      () => useProjectCharterDialogActions(proj1, null, undefined, vi.fn()),
      { wrapper: makeWrapper() },
    )
    act(() => {
      result.current.handleSubmit(FORM_VALUES)
    })
    expect(() => capturedError!(new Error('submit failed'))).not.toThrow()
  })

  it('error callback in update-submit toast is callable', () => {
    let capturedError: ((err: unknown) => unknown) | undefined
    mockShowPromise.mockImplementation((_p, opts) => {
      if (typeof opts?.error === 'function') capturedError = opts.error as (err: unknown) => unknown
      return undefined as unknown as ReturnType<typeof mockShowPromise>
    })
    const { result } = renderHook(
      () => useProjectCharterDialogActions(proj1, { id: 'pc-1' }, DRAFT_PC, vi.fn()),
      { wrapper: makeWrapper() },
    )
    act(() => {
      result.current.handleSubmit(FORM_VALUES)
    })
    expect(() => capturedError!(new Error('submit failed'))).not.toThrow()
  })
})
