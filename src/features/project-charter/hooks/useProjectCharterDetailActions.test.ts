import { act, createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type * as SharedComponentsModule from '@/shared/components'
import { showPromise } from '@/shared/components'
import { proj1 } from '@/shared/test-utils/fixtures'

import { useProjectCharterDetailActions } from './useProjectCharterDetailActions'
import { useSubmitProjectCharter } from './useSubmitProjectCharter'
import { useUpdateProjectCharter } from './useUpdateProjectCharter'

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
  const updateFn = vi.fn().mockResolvedValue({ id: 'pc-1', version: 2 })
  const submitFn = vi.fn().mockResolvedValue({ id: 'pc-1', version: 3 })

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

describe('useProjectCharterDetailActions — derived state', () => {
  it('isUpdating reflects update mutation pending state', () => {
    mockUseUpdateProjectCharter.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: true,
    } as unknown as ReturnType<typeof mockUseUpdateProjectCharter>)
    const { result } = renderHook(() => useProjectCharterDetailActions(DRAFT_PC), {
      wrapper: makeWrapper(),
    })
    expect(result.current.isUpdating).toBe(true)
  })

  it('isSubmitting reflects submit mutation pending state', () => {
    mockUseSubmitProjectCharter.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: true,
    } as unknown as ReturnType<typeof mockUseSubmitProjectCharter>)
    const { result } = renderHook(() => useProjectCharterDetailActions(DRAFT_PC), {
      wrapper: makeWrapper(),
    })
    expect(result.current.isSubmitting).toBe(true)
  })
})

describe('useProjectCharterDetailActions — handleSave', () => {
  it('does not call showPromise when pc is undefined (guard)', () => {
    const { result } = renderHook(() => useProjectCharterDetailActions(undefined), {
      wrapper: makeWrapper(),
    })
    act(() => {
      result.current.handleSave(FORM_VALUES)
    })
    expect(mockShowPromise).not.toHaveBeenCalled()
  })

  it('calls showPromise when pc is defined', () => {
    const { result } = renderHook(() => useProjectCharterDetailActions(DRAFT_PC), {
      wrapper: makeWrapper(),
    })
    act(() => {
      result.current.handleSave(FORM_VALUES)
    })
    expect(mockShowPromise).toHaveBeenCalledOnce()
  })

  it('error callback in save toast is callable', () => {
    let capturedError: ((err: unknown) => unknown) | undefined
    mockShowPromise.mockImplementation((_p, opts) => {
      if (typeof opts?.error === 'function') capturedError = opts.error as (err: unknown) => unknown
      return undefined as unknown as ReturnType<typeof mockShowPromise>
    })
    const { result } = renderHook(() => useProjectCharterDetailActions(DRAFT_PC), {
      wrapper: makeWrapper(),
    })
    act(() => {
      result.current.handleSave(FORM_VALUES)
    })
    expect(() => capturedError!(new Error('update failed'))).not.toThrow()
  })
})

describe('useProjectCharterDetailActions — handleSubmit', () => {
  it('does not call showPromise when pc is undefined (guard)', () => {
    const { result } = renderHook(() => useProjectCharterDetailActions(undefined), {
      wrapper: makeWrapper(),
    })
    act(() => {
      result.current.handleSubmit(FORM_VALUES)
    })
    expect(mockShowPromise).not.toHaveBeenCalled()
  })

  it('calls showPromise with update+submit chain when pc is defined', () => {
    const { result } = renderHook(() => useProjectCharterDetailActions(DRAFT_PC), {
      wrapper: makeWrapper(),
    })
    act(() => {
      result.current.handleSubmit(FORM_VALUES)
    })
    expect(mockShowPromise).toHaveBeenCalledOnce()
  })

  it('error callback in submit toast is callable', () => {
    let capturedError: ((err: unknown) => unknown) | undefined
    mockShowPromise.mockImplementation((_p, opts) => {
      if (typeof opts?.error === 'function') capturedError = opts.error as (err: unknown) => unknown
      return undefined as unknown as ReturnType<typeof mockShowPromise>
    })
    const { result } = renderHook(() => useProjectCharterDetailActions(DRAFT_PC), {
      wrapper: makeWrapper(),
    })
    act(() => {
      result.current.handleSubmit(FORM_VALUES)
    })
    expect(() => capturedError!(new Error('submit failed'))).not.toThrow()
  })
})
