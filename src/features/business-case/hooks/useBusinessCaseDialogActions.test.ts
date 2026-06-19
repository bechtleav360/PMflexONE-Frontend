import { createElement } from 'react'

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

const SUBMITTED_BC = { ...DRAFT_BC, status: 'submitted' }

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

describe('useBusinessCaseDialogActions — derived state', () => {
  it('hasExisting is false when no summary', () => {
    const { result } = renderHook(
      () => useBusinessCaseDialogActions({ projectId: proj1, onClose: vi.fn() }),
      { wrapper: makeWrapper() },
    )
    expect(result.current.hasExisting).toBe(false)
  })

  it('hasExisting is true when summary exists', () => {
    mockUseGetBusinessCaseByProjectId.mockReturnValue({
      data: { id: 'bc-1' },
      isPending: false,
    } as unknown as ReturnType<typeof mockUseGetBusinessCaseByProjectId>)
    const { result } = renderHook(
      () => useBusinessCaseDialogActions({ projectId: proj1, onClose: vi.fn() }),
      { wrapper: makeWrapper() },
    )
    expect(result.current.hasExisting).toBe(true)
  })

  it('isSubmitted is false for draft status', () => {
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
    expect(result.current.isSubmitted).toBe(false)
  })

  it('isSubmitted is true when status is not draft', () => {
    mockUseGetBusinessCaseByProjectId.mockReturnValue({
      data: { id: 'bc-1' },
      isPending: false,
    } as unknown as ReturnType<typeof mockUseGetBusinessCaseByProjectId>)
    mockUseGetBusinessCase.mockReturnValue({
      data: SUBMITTED_BC,
      isPending: false,
    } as unknown as ReturnType<typeof mockUseGetBusinessCase>)
    const { result } = renderHook(
      () => useBusinessCaseDialogActions({ projectId: proj1, onClose: vi.fn() }),
      { wrapper: makeWrapper() },
    )
    expect(result.current.isSubmitted).toBe(true)
  })

  it('isLoading reflects summary pending state', () => {
    mockUseGetBusinessCaseByProjectId.mockReturnValue({
      data: undefined,
      isPending: true,
    } as unknown as ReturnType<typeof mockUseGetBusinessCaseByProjectId>)
    const { result } = renderHook(
      () => useBusinessCaseDialogActions({ projectId: proj1, onClose: vi.fn() }),
      { wrapper: makeWrapper() },
    )
    expect(result.current.isLoading).toBe(true)
  })
})
