import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { showError, showSuccess } from '@/shared/components'

import { useEntrySubmit } from './useEntrySubmit'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}))

vi.mock('@/shared/components', () => ({
  showSuccess: vi.fn(),
  showError: vi.fn(),
}))

vi.mock('@/shared/lib/utils', () => ({
  getGraphQLErrorMessage: (_err: unknown, fallback: string) => fallback,
}))

const mockShowSuccess = vi.mocked(showSuccess)
const mockShowError = vi.mocked(showError)

beforeEach(() => {
  mockShowSuccess.mockReset()
  mockShowError.mockReset()
})

describe('useEntrySubmit', () => {
  it('calls buildInput with form values', async () => {
    const buildInput = vi.fn((v: { name: string }) => ({ name: v.name }))
    const mutateAsync = vi.fn().mockResolvedValue(undefined)
    const close = vi.fn()

    const { result } = renderHook(() =>
      useEntrySubmit({
        mutateAsync,
        isPending: false,
        close,
        successKey: 'success.key',
        errorKey: 'error.key',
        buildInput,
      }),
    )

    await result.current.onSubmit({ name: 'Test' })

    expect(buildInput).toHaveBeenCalledWith({ name: 'Test' })
    expect(mutateAsync).toHaveBeenCalledWith({ name: 'Test' })
  })

  it('calls close and showSuccess on success', async () => {
    const mutateAsync = vi.fn().mockResolvedValue(undefined)
    const close = vi.fn()

    const { result } = renderHook(() =>
      useEntrySubmit({
        mutateAsync,
        isPending: false,
        close,
        successKey: 'success.key',
        errorKey: 'error.key',
        buildInput: (v: unknown) => v,
      }),
    )

    await result.current.onSubmit({})

    expect(close).toHaveBeenCalledOnce()
    expect(mockShowSuccess).toHaveBeenCalledWith('success.key')
  })

  it('calls showError and does NOT call close on failure', async () => {
    const mutateAsync = vi.fn().mockRejectedValue(new Error('Network error'))
    const close = vi.fn()

    const { result } = renderHook(() =>
      useEntrySubmit({
        mutateAsync,
        isPending: false,
        close,
        successKey: 'success.key',
        errorKey: 'error.key',
        buildInput: (v: unknown) => v,
      }),
    )

    await result.current.onSubmit({})

    expect(mockShowError).toHaveBeenCalledWith('error.key')
    expect(close).not.toHaveBeenCalled()
    expect(mockShowSuccess).not.toHaveBeenCalled()
  })

  it('passes through isPending and close', () => {
    const { result } = renderHook(() =>
      useEntrySubmit({
        mutateAsync: vi.fn(),
        isPending: true,
        close: vi.fn(),
        successKey: 'k',
        errorKey: 'e',
        buildInput: (v: unknown) => v,
      }),
    )

    expect(result.current.isPending).toBe(true)
    expect(typeof result.current.close).toBe('function')
  })
})
