import { renderHook } from '@testing-library/react'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import { useCreateProjectForm } from './useCreateProjectForm'

const { mockSubmitWithToast, mockMutateAsync } = vi.hoisted(() => ({
  mockSubmitWithToast: vi.fn(),
  mockMutateAsync: vi.fn().mockResolvedValue({}),
}))

vi.mock('./useCreateProject', () => ({
  useCreateProject: () => ({ mutateAsync: mockMutateAsync, isPending: false }),
  submitWithToast: mockSubmitWithToast,
}))

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

const validValues = {
  name: 'My Project',
  sizeClassification: 'small' as const,
  startDate: new Date('2026-04-01'),
  endDate: new Date('2026-12-31'),
  description: '',
}

describe('useCreateProjectForm', () => {
  it('calls submitWithToast when onSubmit is invoked with valid values', () => {
    const { result } = renderHook(() => useCreateProjectForm())

    result.current.onSubmit(validValues)

    expect(mockSubmitWithToast).toHaveBeenCalledWith(
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
    const { result } = renderHook(() => useCreateProjectForm())

    expect(result.current.isPending).toBe(false)
  })

  it('passes an error formatter that returns a string for any error', () => {
    const { result } = renderHook(() => useCreateProjectForm())
    result.current.onSubmit(validValues)

    const messages = mockSubmitWithToast.mock.calls.at(-1)![2] as {
      error: (err: unknown) => string
    }
    expect(typeof messages.error(new Error('GraphQL error'))).toBe('string')
  })
})
