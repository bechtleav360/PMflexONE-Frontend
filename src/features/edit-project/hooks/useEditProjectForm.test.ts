import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'
import { proj1 } from '@/shared/test-utils/fixtures'

import { useEditProjectStore } from '../store/editProjectStore'
import { useEditProjectForm } from './useEditProjectForm'

const { mockUpdateWithToast, mockMutateAsync } = vi.hoisted(() => ({
  mockUpdateWithToast: vi.fn(),
  mockMutateAsync: vi.fn().mockResolvedValue({}),
}))

vi.mock('./useEditProject', () => ({
  useEditProject: () => ({ mutateAsync: mockMutateAsync, isPending: false }),
  updateWithToast: mockUpdateWithToast,
}))

const mockProject = {
  id: proj1,
  name: 'Basisinfrastruktur',
  description: 'A project',
  status: 'active',
  sizeClassification: 'large' as const,
  governanceStatus: null,
  startDate: '2025-01-01',
  endDate: '2027-12-31',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  version: 1,
}

const validValues = {
  name: 'Updated Name',
  sizeClassification: 'medium' as const,
  startDate: new Date('2026-01-01'),
  endDate: new Date('2026-12-31'),
  description: '',
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

beforeEach(() => {
  mockUpdateWithToast.mockClear()
  useEditProjectStore.setState({ open: true, payload: mockProject })
})

describe('useEditProjectForm', () => {
  it('calls updateWithToast when onSubmit is invoked with valid values', () => {
    const { result } = renderHook(() => useEditProjectForm())

    result.current.onSubmit(validValues)

    expect(mockUpdateWithToast).toHaveBeenCalledWith(
      mockMutateAsync,
      validValues,
      expect.objectContaining({
        loading: expect.any(String),
        success: expect.any(String),
        error: expect.any(Function),
      }),
    )
  })

  it('exposes isPending from the mutation hook', () => {
    const { result } = renderHook(() => useEditProjectForm())

    expect(result.current.isPending).toBe(false)
  })

  it('passes an error formatter that returns a string for any error', () => {
    const { result } = renderHook(() => useEditProjectForm())
    result.current.onSubmit(validValues)

    const messages = mockUpdateWithToast.mock.calls.at(-1)![2] as {
      error: (err: unknown) => string
    }
    expect(typeof messages.error(new Error('GraphQL error'))).toBe('string')
  })

  it('pre-populates form default values from the store project', () => {
    const { result } = renderHook(() => useEditProjectForm())

    expect(result.current.form.getValues('name')).toBe(mockProject.name)
    expect(result.current.form.getValues('description')).toBe(mockProject.description)
  })

  it('parses null dates as undefined in default values', () => {
    useEditProjectStore.setState({
      open: true,
      payload: { ...mockProject, startDate: null, endDate: null },
    })

    const { result } = renderHook(() => useEditProjectForm())

    expect(result.current.form.getValues('startDate')).toBeUndefined()
    expect(result.current.form.getValues('endDate')).toBeUndefined()
  })

  it('clears endDate when startDate is moved to a date after endDate', async () => {
    const { result } = renderHook(() => useEditProjectForm())

    act(() => {
      result.current.form.setValue('endDate', new Date('2026-06-01'))
    })

    act(() => {
      result.current.form.setValue('startDate', new Date('2026-09-01'))
    })

    await waitFor(() => {
      expect(result.current.form.getValues('endDate')).toBeUndefined()
    })
  })

  it('does not clear endDate when startDate is before endDate', async () => {
    const { result } = renderHook(() => useEditProjectForm())
    const endDate = new Date('2026-12-31')

    act(() => {
      result.current.form.setValue('endDate', endDate)
    })

    act(() => {
      result.current.form.setValue('startDate', new Date('2026-01-01'))
    })

    await waitFor(() => {
      expect(result.current.form.getValues('endDate')).toEqual(endDate)
    })
  })
})
