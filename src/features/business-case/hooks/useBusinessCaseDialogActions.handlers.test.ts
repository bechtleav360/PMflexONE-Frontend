import { act, createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type * as BusinessCaseModule from '@/entities/business-case'
import { useGetBusinessCase, useGetBusinessCaseByProjectId } from '@/entities/business-case'
import type * as SharedComponentsModule from '@/shared/components'
import { showPromise } from '@/shared/components'
import { proj1 } from '@/shared/test-utils/fixtures'

import { useBusinessCaseDialogActions } from './useBusinessCaseDialogActions'
import { useCreateBusinessCase } from './useCreateBusinessCase'
import { useSubmitBusinessCase } from './useSubmitBusinessCase'
import { useUpdateBusinessCase } from './useUpdateBusinessCase'

vi.mock('@/entities/business-case', async (importOriginal) => {
  const actual = await importOriginal<typeof BusinessCaseModule>()
  return {
    ...actual,
    useGetBusinessCase: vi.fn(),
    useGetBusinessCaseByProjectId: vi.fn(),
  }
})

vi.mock('./useCreateBusinessCase', () => ({
  useCreateBusinessCase: vi.fn(),
}))

vi.mock('./useUpdateBusinessCase', () => ({
  useUpdateBusinessCase: vi.fn(),
}))

vi.mock('./useSubmitBusinessCase', () => ({
  useSubmitBusinessCase: vi.fn(),
}))

vi.mock('@/shared/components', async (importOriginal) => {
  const actual = await importOriginal<typeof SharedComponentsModule>()
  return { ...actual, showPromise: vi.fn() }
})

const mockUseGetBusinessCaseByProjectId = vi.mocked(useGetBusinessCaseByProjectId)
const mockUseGetBusinessCase = vi.mocked(useGetBusinessCase)
const mockUseCreateBusinessCase = vi.mocked(useCreateBusinessCase)
const mockUseUpdateBusinessCase = vi.mocked(useUpdateBusinessCase)
const mockUseSubmitBusinessCase = vi.mocked(useSubmitBusinessCase)
const mockShowPromise = vi.mocked(showPromise)

const DRAFT_BC = {
  id: 'bc-1',
  version: 1,
  status: 'draft',
  clientSummary: null,
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
  project: { id: proj1, name: 'Test' },
}

const FORM_VALUES = {
  clientSummary: 'Summary',
  projectRationale: '',
  expectedBenefit: '',
  options: '',
  investmentCalculation: '',
  keyRisks: '',
  expectedNegativeSideEffect: '',
  timeline: '',
}

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
  return Wrapper
}

beforeEach(() => {
  const createFn = vi.fn().mockResolvedValue({ id: 'bc-new', version: 1 })
  const updateFn = vi.fn().mockResolvedValue({ id: 'bc-1', version: 2 })
  const submitFn = vi.fn().mockResolvedValue({ id: 'bc-1', version: 3 })

  mockUseGetBusinessCaseByProjectId.mockReturnValue({
    data: null,
    isPending: false,
  } as unknown as ReturnType<typeof mockUseGetBusinessCaseByProjectId>)
  mockUseGetBusinessCase.mockReturnValue({
    data: undefined,
    isPending: false,
  } as unknown as ReturnType<typeof mockUseGetBusinessCase>)
  mockUseCreateBusinessCase.mockReturnValue({
    mutateAsync: createFn,
    isPending: false,
  } as unknown as ReturnType<typeof mockUseCreateBusinessCase>)
  mockUseUpdateBusinessCase.mockReturnValue({
    mutateAsync: updateFn,
    isPending: false,
  } as unknown as ReturnType<typeof mockUseUpdateBusinessCase>)
  mockUseSubmitBusinessCase.mockReturnValue({
    mutateAsync: submitFn,
    isPending: false,
  } as unknown as ReturnType<typeof mockUseSubmitBusinessCase>)
  mockShowPromise.mockReset()
})

describe('useBusinessCaseDialogActions — handleSaveDraft', () => {
  it('calls showPromise with createBC when no existing BC', () => {
    const { result } = renderHook(
      () => useBusinessCaseDialogActions({ projectId: proj1, onClose: vi.fn() }),
      { wrapper: makeWrapper() },
    )
    act(() => {
      result.current.handleSaveDraft(FORM_VALUES)
    })
    expect(mockShowPromise).toHaveBeenCalledOnce()
  })

  it('calls showPromise with updateBC when BC exists and bc is loaded', () => {
    mockUseGetBusinessCaseByProjectId.mockReturnValue({
      data: { id: 'bc-1' },
      isPending: false,
    } as unknown as ReturnType<typeof mockUseGetBusinessCaseByProjectId>)
    mockUseGetBusinessCase.mockReturnValue({
      data: DRAFT_BC,
      isPending: false,
    } as unknown as ReturnType<typeof mockUseGetBusinessCase>)
    const { result } = renderHook(
      () => useBusinessCaseDialogActions({ projectId: proj1, onClose: vi.fn() }),
      { wrapper: makeWrapper() },
    )
    act(() => {
      result.current.handleSaveDraft(FORM_VALUES)
    })
    expect(mockShowPromise).toHaveBeenCalledOnce()
  })

  it('does not call showPromise when BC exists but bc data not yet loaded (guard)', () => {
    mockUseGetBusinessCaseByProjectId.mockReturnValue({
      data: { id: 'bc-1' },
      isPending: false,
    } as unknown as ReturnType<typeof mockUseGetBusinessCaseByProjectId>)
    mockUseGetBusinessCase.mockReturnValue({
      data: undefined,
      isPending: false,
    } as unknown as ReturnType<typeof mockUseGetBusinessCase>)
    const { result } = renderHook(
      () => useBusinessCaseDialogActions({ projectId: proj1, onClose: vi.fn() }),
      { wrapper: makeWrapper() },
    )
    act(() => {
      result.current.handleSaveDraft(FORM_VALUES)
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
      () => useBusinessCaseDialogActions({ projectId: proj1, onClose: vi.fn() }),
      { wrapper: makeWrapper() },
    )
    act(() => {
      result.current.handleSaveDraft(FORM_VALUES)
    })
    expect(() => capturedError!(new Error('create failed'))).not.toThrow()
  })

  it('error callback in update-save toast is callable', () => {
    mockUseGetBusinessCaseByProjectId.mockReturnValue({
      data: { id: 'bc-1' },
      isPending: false,
    } as unknown as ReturnType<typeof mockUseGetBusinessCaseByProjectId>)
    mockUseGetBusinessCase.mockReturnValue({
      data: DRAFT_BC,
      isPending: false,
    } as unknown as ReturnType<typeof mockUseGetBusinessCase>)
    let capturedError: ((err: unknown) => unknown) | undefined
    mockShowPromise.mockImplementation((_p, opts) => {
      if (typeof opts?.error === 'function') capturedError = opts.error as (err: unknown) => unknown
      return undefined as unknown as ReturnType<typeof mockShowPromise>
    })
    const { result } = renderHook(
      () => useBusinessCaseDialogActions({ projectId: proj1, onClose: vi.fn() }),
      { wrapper: makeWrapper() },
    )
    act(() => {
      result.current.handleSaveDraft(FORM_VALUES)
    })
    expect(() => capturedError!(new Error('update failed'))).not.toThrow()
  })
})

describe('useBusinessCaseDialogActions — handleMarkComplete', () => {
  it('calls showPromise when no existing BC', () => {
    const { result } = renderHook(
      () => useBusinessCaseDialogActions({ projectId: proj1, onClose: vi.fn() }),
      { wrapper: makeWrapper() },
    )
    act(() => {
      result.current.handleMarkComplete(FORM_VALUES)
    })
    expect(mockShowPromise).toHaveBeenCalledOnce()
  })

  it('calls showPromise with update+submit when BC exists and bc is loaded', () => {
    mockUseGetBusinessCaseByProjectId.mockReturnValue({
      data: { id: 'bc-1' },
      isPending: false,
    } as unknown as ReturnType<typeof mockUseGetBusinessCaseByProjectId>)
    mockUseGetBusinessCase.mockReturnValue({
      data: DRAFT_BC,
      isPending: false,
    } as unknown as ReturnType<typeof mockUseGetBusinessCase>)
    const { result } = renderHook(
      () => useBusinessCaseDialogActions({ projectId: proj1, onClose: vi.fn() }),
      { wrapper: makeWrapper() },
    )
    act(() => {
      result.current.handleMarkComplete(FORM_VALUES)
    })
    expect(mockShowPromise).toHaveBeenCalledOnce()
  })

  it('does not call showPromise when BC exists but bc data not loaded (guard)', () => {
    mockUseGetBusinessCaseByProjectId.mockReturnValue({
      data: { id: 'bc-1' },
      isPending: false,
    } as unknown as ReturnType<typeof mockUseGetBusinessCaseByProjectId>)
    mockUseGetBusinessCase.mockReturnValue({
      data: undefined,
      isPending: false,
    } as unknown as ReturnType<typeof mockUseGetBusinessCase>)
    const { result } = renderHook(
      () => useBusinessCaseDialogActions({ projectId: proj1, onClose: vi.fn() }),
      { wrapper: makeWrapper() },
    )
    act(() => {
      result.current.handleMarkComplete(FORM_VALUES)
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
      () => useBusinessCaseDialogActions({ projectId: proj1, onClose: vi.fn() }),
      { wrapper: makeWrapper() },
    )
    act(() => {
      result.current.handleMarkComplete(FORM_VALUES)
    })
    expect(() => capturedError!(new Error('submit failed'))).not.toThrow()
  })

  it('error callback in update-submit toast is callable', () => {
    mockUseGetBusinessCaseByProjectId.mockReturnValue({
      data: { id: 'bc-1' },
      isPending: false,
    } as unknown as ReturnType<typeof mockUseGetBusinessCaseByProjectId>)
    mockUseGetBusinessCase.mockReturnValue({
      data: DRAFT_BC,
      isPending: false,
    } as unknown as ReturnType<typeof mockUseGetBusinessCase>)
    let capturedError: ((err: unknown) => unknown) | undefined
    mockShowPromise.mockImplementation((_p, opts) => {
      if (typeof opts?.error === 'function') capturedError = opts.error as (err: unknown) => unknown
      return undefined as unknown as ReturnType<typeof mockShowPromise>
    })
    const { result } = renderHook(
      () => useBusinessCaseDialogActions({ projectId: proj1, onClose: vi.fn() }),
      { wrapper: makeWrapper() },
    )
    act(() => {
      result.current.handleMarkComplete(FORM_VALUES)
    })
    expect(() => capturedError!(new Error('submit failed'))).not.toThrow()
  })
})
