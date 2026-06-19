import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useProgramDetailPage } from './useProgramDetailPage'

const mockOpen = vi.fn()

vi.mock('react-router-dom', () => ({
  useParams: vi.fn(() => ({ id: 'prog-1' })),
}))

vi.mock('@/features/programs', () => ({
  useProgram: vi.fn(() => ({
    data: {
      id: 'prog-1',
      version: 1,
      name: 'Alpha Program',
      status: 'active',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-02-01T00:00:00Z',
      portfolio: { item: { id: 'port-1', name: 'Main Portfolio' } },
    },
    isPending: false,
    isError: false,
    refetch: vi.fn(),
  })),
  useEditProgramDialogStore: vi.fn((selector) => selector({ open: mockOpen })),
}))

vi.mock('@/entities/program-initiation-request', () => ({
  useGetProgramInitiationRequestByProgramId: vi.fn(() => ({
    data: { id: 'pir-1', status: 'DRAFT' },
  })),
}))

// eslint-disable-next-line max-lines-per-function -- test describe block; splitting individual it() callbacks hurts readability
describe('useProgramDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockOpen.mockReset()
  })

  it('returns id from useParams', () => {
    const { result } = renderHook(() => useProgramDetailPage())
    expect(result.current.id).toBe('prog-1')
  })

  it('returns an empty string id when useParams returns undefined', async () => {
    const { useParams } = await import('react-router-dom')
    vi.mocked(useParams).mockReturnValueOnce({})
    const { result } = renderHook(() => useProgramDetailPage())
    expect(result.current.id).toBe('')
  })

  it('returns program data from useProgram', () => {
    const { result } = renderHook(() => useProgramDetailPage())
    expect(result.current.data?.name).toBe('Alpha Program')
  })

  it('returns isPending from useProgram', () => {
    const { result } = renderHook(() => useProgramDetailPage())
    expect(result.current.isPending).toBe(false)
  })

  it('returns isError from useProgram', () => {
    const { result } = renderHook(() => useProgramDetailPage())
    expect(result.current.isError).toBe(false)
  })

  it('derives portfolioId from program data', () => {
    const { result } = renderHook(() => useProgramDetailPage())
    expect(result.current.portfolioId).toBe('port-1')
  })

  it('derives programName from program data', () => {
    const { result } = renderHook(() => useProgramDetailPage())
    expect(result.current.programName).toBe('Alpha Program')
  })

  it('returns empty string portfolioId when portfolio is absent', async () => {
    const programs = await import('@/features/programs')
    vi.mocked(programs.useProgram).mockReturnValueOnce({
      data: {
        id: 'prog-1',
        version: 1,
        name: 'No Portfolio',
        status: null,
        createdAt: '',
        updatedAt: '',
        portfolio: null,
      },
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof programs.useProgram>)
    const { result } = renderHook(() => useProgramDetailPage())
    expect(result.current.portfolioId).toBe('')
  })

  it('returns empty string programName when data is undefined', async () => {
    const programs = await import('@/features/programs')
    vi.mocked(programs.useProgram).mockReturnValueOnce({
      data: undefined,
      isPending: true,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof programs.useProgram>)
    const { result } = renderHook(() => useProgramDetailPage())
    expect(result.current.programName).toBe('')
  })

  it('returns pirSummary from useGetProgramInitiationRequestByProgramId', () => {
    const { result } = renderHook(() => useProgramDetailPage())
    expect(result.current.pirSummary?.id).toBe('pir-1')
  })

  it('initialises isPIRDialogOpen as false', () => {
    const { result } = renderHook(() => useProgramDetailPage())
    expect(result.current.isPIRDialogOpen).toBe(false)
  })

  it('setIsPIRDialogOpen toggles isPIRDialogOpen to true', () => {
    const { result } = renderHook(() => useProgramDetailPage())
    act(() => result.current.setIsPIRDialogOpen(true))
    expect(result.current.isPIRDialogOpen).toBe(true)
  })

  it('setIsPIRDialogOpen toggles isPIRDialogOpen back to false', () => {
    const { result } = renderHook(() => useProgramDetailPage())
    act(() => result.current.setIsPIRDialogOpen(true))
    act(() => result.current.setIsPIRDialogOpen(false))
    expect(result.current.isPIRDialogOpen).toBe(false)
  })

  it('exposes openEdit from the dialog store', () => {
    const { result } = renderHook(() => useProgramDetailPage())
    expect(result.current.openEdit).toBe(mockOpen)
  })
})
