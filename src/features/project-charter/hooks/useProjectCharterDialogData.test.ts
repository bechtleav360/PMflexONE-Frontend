import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type * as ProjectCharterModule from '@/entities/project-charter'
import { useGetProjectCharter, useGetProjectCharterByProjectId } from '@/entities/project-charter'
import { proj1 } from '@/shared/test-utils/fixtures'

import { useProjectCharterDialogData } from './useProjectCharterDialogData'

vi.mock('@/entities/project-charter', async (importOriginal) => {
  const actual = await importOriginal<typeof ProjectCharterModule>()
  return {
    ...actual,
    useGetProjectCharter: vi.fn(),
    useGetProjectCharterByProjectId: vi.fn(),
  }
})

const mockUseGetProjectCharterByProjectId = vi.mocked(useGetProjectCharterByProjectId)
const mockUseGetProjectCharter = vi.mocked(useGetProjectCharter)

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

const ACCEPTED_PC = { ...DRAFT_PC, status: 'ACCEPTED' as const }

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
  return Wrapper
}

beforeEach(() => {
  mockUseGetProjectCharterByProjectId.mockReturnValue({
    data: null,
    isPending: false,
  } as unknown as ReturnType<typeof mockUseGetProjectCharterByProjectId>)
  mockUseGetProjectCharter.mockReturnValue({
    data: undefined,
    isPending: false,
  } as unknown as ReturnType<typeof mockUseGetProjectCharter>)
})

describe('useProjectCharterDialogData — hasExisting', () => {
  it('is false when no charter summary exists', () => {
    const { result } = renderHook(() => useProjectCharterDialogData(proj1), {
      wrapper: makeWrapper(),
    })
    expect(result.current.hasExisting).toBe(false)
  })

  it('is true when charter summary exists', () => {
    mockUseGetProjectCharterByProjectId.mockReturnValue({
      data: { id: 'pc-1', status: 'DRAFT' },
      isPending: false,
    } as unknown as ReturnType<typeof mockUseGetProjectCharterByProjectId>)
    const { result } = renderHook(() => useProjectCharterDialogData(proj1), {
      wrapper: makeWrapper(),
    })
    expect(result.current.hasExisting).toBe(true)
  })
})

describe('useProjectCharterDialogData — isAccepted', () => {
  it('is false for DRAFT status', () => {
    mockUseGetProjectCharterByProjectId.mockReturnValue({
      data: { id: 'pc-1', status: 'DRAFT' },
      isPending: false,
    } as unknown as ReturnType<typeof mockUseGetProjectCharterByProjectId>)
    mockUseGetProjectCharter.mockReturnValue({
      data: DRAFT_PC,
      isPending: false,
    } as unknown as ReturnType<typeof mockUseGetProjectCharter>)
    const { result } = renderHook(() => useProjectCharterDialogData(proj1), {
      wrapper: makeWrapper(),
    })
    expect(result.current.isAccepted).toBe(false)
  })

  it('is true for ACCEPTED status', () => {
    mockUseGetProjectCharterByProjectId.mockReturnValue({
      data: { id: 'pc-1', status: 'ACCEPTED' },
      isPending: false,
    } as unknown as ReturnType<typeof mockUseGetProjectCharterByProjectId>)
    mockUseGetProjectCharter.mockReturnValue({
      data: ACCEPTED_PC,
      isPending: false,
    } as unknown as ReturnType<typeof mockUseGetProjectCharter>)
    const { result } = renderHook(() => useProjectCharterDialogData(proj1), {
      wrapper: makeWrapper(),
    })
    expect(result.current.isAccepted).toBe(true)
  })
})

describe('useProjectCharterDialogData — isLoading', () => {
  it('is true when summary query is pending', () => {
    mockUseGetProjectCharterByProjectId.mockReturnValue({
      data: undefined,
      isPending: true,
    } as unknown as ReturnType<typeof mockUseGetProjectCharterByProjectId>)
    const { result } = renderHook(() => useProjectCharterDialogData(proj1), {
      wrapper: makeWrapper(),
    })
    expect(result.current.isLoading).toBe(true)
  })

  it('is true when summary has id and charter query is pending', () => {
    mockUseGetProjectCharterByProjectId.mockReturnValue({
      data: { id: 'pc-1', status: 'DRAFT' },
      isPending: false,
    } as unknown as ReturnType<typeof mockUseGetProjectCharterByProjectId>)
    mockUseGetProjectCharter.mockReturnValue({
      data: undefined,
      isPending: true,
    } as unknown as ReturnType<typeof mockUseGetProjectCharter>)
    const { result } = renderHook(() => useProjectCharterDialogData(proj1), {
      wrapper: makeWrapper(),
    })
    expect(result.current.isLoading).toBe(true)
  })

  it('is false when no summary exists and charter query is pending (no charter expected)', () => {
    mockUseGetProjectCharterByProjectId.mockReturnValue({
      data: null,
      isPending: false,
    } as unknown as ReturnType<typeof mockUseGetProjectCharterByProjectId>)
    mockUseGetProjectCharter.mockReturnValue({
      data: undefined,
      isPending: true,
    } as unknown as ReturnType<typeof mockUseGetProjectCharter>)
    const { result } = renderHook(() => useProjectCharterDialogData(proj1), {
      wrapper: makeWrapper(),
    })
    expect(result.current.isLoading).toBe(false)
  })
})
