import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  useGetProjectInitiationRequest,
  useGetProjectInitiationRequestByProjectId,
} from '@/entities/project-initiation-request'
import type * as SharedComponentsModule from '@/shared/components'
import { showPromise } from '@/shared/components'
import { i18n } from '@/shared/lib/i18n'
import { proj1 } from '@/shared/test-utils/fixtures'

import { useCreateProjectInitiationRequest } from './useCreateProjectInitiationRequest'
import { useProjectInitiationRequestDialog } from './useProjectInitiationRequestDialog'
import { useSubmitProjectInitiationRequest } from './useSubmitProjectInitiationRequest'
import { useUpdateProjectInitiationRequest } from './useUpdateProjectInitiationRequest'

vi.mock('@/entities/project-initiation-request', () => ({
  useGetProjectInitiationRequestByProjectId: vi.fn(),
  useGetProjectInitiationRequest: vi.fn(),
  getProjectInitiationRequestQueryKey: (id: string) => ['pir', id],
  listProjectInitiationRequestsQueryKey: ['pirs'],
}))

vi.mock('./useCreateProjectInitiationRequest', () => ({
  useCreateProjectInitiationRequest: vi.fn(),
}))

vi.mock('./useSubmitProjectInitiationRequest', () => ({
  useSubmitProjectInitiationRequest: vi.fn(),
}))

vi.mock('./useUpdateProjectInitiationRequest', () => ({
  useUpdateProjectInitiationRequest: vi.fn(),
}))

vi.mock('@/shared/components', async (importActual) => {
  const actual = await importActual<typeof SharedComponentsModule>()
  return { ...actual, showPromise: vi.fn() }
})

const mockCreateMutateAsync = vi.fn()
const mockSubmitMutateAsync = vi.fn()
const mockUpdateMutateAsync = vi.fn()

const draftPir = {
  id: 'pir-1',
  version: 1,
  name: 'Test PIR',
  documentVersion: '1.0',
  status: 'draft',
  projectInitiator: 'Max',
  projectOwner: null,
  organizationalUnit: null,
  solutionProvider: null,
  approvalAuthority: null,
  requestDate: '2026-04-01',
  estimatedEffort: 120,
  estimatedEffortComment: null,
  targetDeliveryDate: null,
  deliveryType: 'internal',
  requestingProject: { item: { id: proj1, name: 'Project', status: 'active' } },
}

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
  return Wrapper
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

beforeEach(() => {
  vi.mocked(useCreateProjectInitiationRequest).mockReturnValue({
    mutateAsync: mockCreateMutateAsync,
    isPending: false,
  } as unknown as ReturnType<typeof useCreateProjectInitiationRequest>)

  vi.mocked(useSubmitProjectInitiationRequest).mockReturnValue({
    mutateAsync: mockSubmitMutateAsync,
    isPending: false,
  } as unknown as ReturnType<typeof useSubmitProjectInitiationRequest>)

  vi.mocked(useUpdateProjectInitiationRequest).mockReturnValue({
    mutateAsync: mockUpdateMutateAsync,
    isPending: false,
  } as unknown as ReturnType<typeof useUpdateProjectInitiationRequest>)

  vi.mocked(useGetProjectInitiationRequestByProjectId).mockReturnValue({
    data: undefined,
    isPending: false,
  } as ReturnType<typeof useGetProjectInitiationRequestByProjectId>)

  vi.mocked(useGetProjectInitiationRequest).mockReturnValue({
    data: undefined,
    isPending: false,
  } as ReturnType<typeof useGetProjectInitiationRequest>)

  mockCreateMutateAsync.mockResolvedValue({ id: 'pir-new', version: 1 })
  mockSubmitMutateAsync.mockResolvedValue({
    id: 'pir-new',
    version: 2,
    status: 'accepted',
    name: 'Test',
    updatedAt: '2026-04-01T00:00:00Z',
  })
  mockUpdateMutateAsync.mockResolvedValue({
    id: 'pir-1',
    version: 2,
    status: 'draft',
    name: 'Test',
    documentVersion: null,
    updatedAt: '2026-04-01T00:00:00Z',
  })

  vi.mocked(showPromise).mockClear()
})

describe('useProjectInitiationRequestDialog mode derivation', () => {
  it('derives create mode when no PIR exists for the project', () => {
    const { result } = renderHook(() => useProjectInitiationRequestDialog(proj1, vi.fn()), {
      wrapper: makeWrapper(),
    })

    expect(result.current.mode).toBe('create')
    expect(result.current.defaultValues).toEqual({ requestingProjectId: proj1 })
    expect(result.current.pirStatus).toBeNull()
  })

  it('derives edit mode when the PIR status is draft', () => {
    vi.mocked(useGetProjectInitiationRequestByProjectId).mockReturnValue({
      data: { id: 'pir-1' },
      isPending: false,
    } as ReturnType<typeof useGetProjectInitiationRequestByProjectId>)

    vi.mocked(useGetProjectInitiationRequest).mockReturnValue({
      data: draftPir,
      isPending: false,
    } as ReturnType<typeof useGetProjectInitiationRequest>)

    const { result } = renderHook(() => useProjectInitiationRequestDialog(proj1, vi.fn()), {
      wrapper: makeWrapper(),
    })

    expect(result.current.mode).toBe('edit')
    expect(result.current.pirStatus).toBe('draft')
    expect(result.current.defaultValues).toMatchObject({
      name: 'Test PIR',
      requestingProjectId: proj1,
    })
    expect(result.current.onFormSaveDraft).toBeDefined()
  })

  it('derives view mode when the PIR status is accepted', () => {
    vi.mocked(useGetProjectInitiationRequestByProjectId).mockReturnValue({
      data: { id: 'pir-2' },
      isPending: false,
    } as ReturnType<typeof useGetProjectInitiationRequestByProjectId>)

    vi.mocked(useGetProjectInitiationRequest).mockReturnValue({
      data: { ...draftPir, id: 'pir-2', status: 'accepted' },
      isPending: false,
    } as ReturnType<typeof useGetProjectInitiationRequest>)

    const { result } = renderHook(() => useProjectInitiationRequestDialog(proj1, vi.fn()), {
      wrapper: makeWrapper(),
    })

    expect(result.current.mode).toBe('view')
    expect(result.current.onFormSaveDraft).toBeUndefined()
  })
})

describe('useProjectInitiationRequestDialog loading state', () => {
  it('isLoading is true while the PIR summary is being fetched', () => {
    vi.mocked(useGetProjectInitiationRequestByProjectId).mockReturnValue({
      data: undefined,
      isPending: true,
    } as ReturnType<typeof useGetProjectInitiationRequestByProjectId>)

    const { result } = renderHook(() => useProjectInitiationRequestDialog(proj1, vi.fn()), {
      wrapper: makeWrapper(),
    })

    expect(result.current.isLoading).toBe(true)
  })

  it('isLoading is true while the PIR detail is being fetched after summary resolves', () => {
    vi.mocked(useGetProjectInitiationRequestByProjectId).mockReturnValue({
      data: { id: 'pir-1' },
      isPending: false,
    } as ReturnType<typeof useGetProjectInitiationRequestByProjectId>)

    vi.mocked(useGetProjectInitiationRequest).mockReturnValue({
      data: undefined,
      isPending: true,
    } as ReturnType<typeof useGetProjectInitiationRequest>)

    const { result } = renderHook(() => useProjectInitiationRequestDialog(proj1, vi.fn()), {
      wrapper: makeWrapper(),
    })

    expect(result.current.isLoading).toBe(true)
  })
})

describe('useProjectInitiationRequestDialog form handlers', () => {
  it('onFormSubmit in create mode invokes showPromise', () => {
    const { result } = renderHook(() => useProjectInitiationRequestDialog(proj1, vi.fn()), {
      wrapper: makeWrapper(),
    })

    result.current.onFormSubmit({
      name: 'Test',
      requestingProjectId: proj1,
    } as Parameters<typeof result.current.onFormSubmit>[0])

    expect(showPromise).toHaveBeenCalled()
  })

  it('onFormSaveDraft in create mode invokes showPromise', () => {
    const { result } = renderHook(() => useProjectInitiationRequestDialog(proj1, vi.fn()), {
      wrapper: makeWrapper(),
    })

    result.current.onFormSaveDraft!({
      name: 'Draft',
      requestingProjectId: proj1,
    } as Parameters<NonNullable<typeof result.current.onFormSaveDraft>>[0])

    expect(showPromise).toHaveBeenCalled()
  })

  it('onFormSaveDraft in edit mode invokes showPromise', () => {
    vi.mocked(useGetProjectInitiationRequestByProjectId).mockReturnValue({
      data: { id: 'pir-1' },
      isPending: false,
    } as ReturnType<typeof useGetProjectInitiationRequestByProjectId>)

    vi.mocked(useGetProjectInitiationRequest).mockReturnValue({
      data: draftPir,
      isPending: false,
    } as ReturnType<typeof useGetProjectInitiationRequest>)

    const { result } = renderHook(() => useProjectInitiationRequestDialog(proj1, vi.fn()), {
      wrapper: makeWrapper(),
    })

    result.current.onFormSaveDraft!({
      name: 'Updated Draft',
      requestingProjectId: proj1,
    } as Parameters<NonNullable<typeof result.current.onFormSaveDraft>>[0])

    expect(showPromise).toHaveBeenCalled()
  })

  it('onFormSubmit in edit mode invokes showPromise', () => {
    vi.mocked(useGetProjectInitiationRequestByProjectId).mockReturnValue({
      data: { id: 'pir-1' },
      isPending: false,
    } as ReturnType<typeof useGetProjectInitiationRequestByProjectId>)

    vi.mocked(useGetProjectInitiationRequest).mockReturnValue({
      data: draftPir,
      isPending: false,
    } as ReturnType<typeof useGetProjectInitiationRequest>)

    const { result } = renderHook(() => useProjectInitiationRequestDialog(proj1, vi.fn()), {
      wrapper: makeWrapper(),
    })

    result.current.onFormSubmit({
      name: 'Submit PIR',
      requestingProjectId: proj1,
    } as Parameters<typeof result.current.onFormSubmit>[0])

    expect(showPromise).toHaveBeenCalled()
  })
})
