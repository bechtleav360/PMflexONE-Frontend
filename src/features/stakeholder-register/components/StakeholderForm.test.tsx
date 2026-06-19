import { createElement, type ReactNode } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import { StakeholderForm } from './StakeholderForm'

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

function Wrapper({ children }: { children: ReactNode }) {
  return createElement(QueryClientProvider, { client: queryClient }, children)
}

const defaultProps = {
  objectId: 'proj-1',
  onSave: vi.fn(),
  onCancel: vi.fn(),
}

describe('StakeholderForm', () => {
  it('renders mandatory fields: name, role, contactGroup', () => {
    render(<StakeholderForm {...defaultProps} />, { wrapper: Wrapper })
    expect(screen.getByRole('textbox', { name: /name/i })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /role/i })).toBeInTheDocument()
  })

  it('blocks submit when name is empty', async () => {
    const onSave = vi.fn()
    render(
      <StakeholderForm
        {...defaultProps}
        onSave={onSave}
      />,
      { wrapper: Wrapper },
    )
    const user = userEvent.setup()

    const submitBtn = screen.getByRole('button', { name: /save/i })
    await user.click(submitBtn)

    expect(onSave).not.toHaveBeenCalled()
  })

  it('blocks submit when role is empty', async () => {
    const onSave = vi.fn()
    render(
      <StakeholderForm
        {...defaultProps}
        onSave={onSave}
      />,
      { wrapper: Wrapper },
    )
    const user = userEvent.setup()

    await user.type(screen.getByRole('textbox', { name: /name/i }), 'Alice')
    await user.click(screen.getByRole('button', { name: /save/i }))

    expect(onSave).not.toHaveBeenCalled()
  })

  it('rejects name exceeding 100 characters', async () => {
    const onSave = vi.fn()
    render(
      <StakeholderForm
        {...defaultProps}
        onSave={onSave}
      />,
      { wrapper: Wrapper },
    )
    const user = userEvent.setup()

    await user.type(screen.getByRole('textbox', { name: /name/i }), 'a'.repeat(101))
    await user.type(screen.getByRole('textbox', { name: /role/i }), 'PM')
    await user.click(screen.getByRole('button', { name: /save/i }))

    expect(onSave).not.toHaveBeenCalled()
  })

  it('calls onSave with valid data when all mandatory fields filled', async () => {
    const onSave = vi.fn()
    render(
      <StakeholderForm
        {...defaultProps}
        onSave={onSave}
        defaultValues={{ name: 'Alice', role: 'PM', contactGroup: 'INTERNAL' }}
      />,
      { wrapper: Wrapper },
    )
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: /save/i }))

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Alice', role: 'PM', contactGroup: 'INTERNAL' }),
    )
  })

  it('calls onCancel when cancel button is clicked', async () => {
    const onCancel = vi.fn()
    render(
      <StakeholderForm
        {...defaultProps}
        onCancel={onCancel}
      />,
      { wrapper: Wrapper },
    )
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(onCancel).toHaveBeenCalled()
  })
})
