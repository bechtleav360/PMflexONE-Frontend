import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

import { i18n } from '@/shared/lib/i18n'

import { StrategyDescriptionsEditForm } from './StrategyDescriptionsEditForm'

const mockIsPending = { value: false }
const mockSubmitFn = vi.fn()

vi.mock('../hooks/useUpsertStrategyDescriptionForm', () => ({
  useUpsertStrategyDescriptionForm: ({ onSuccess }: { onSuccess: () => void }) => ({
    submit: mockSubmitFn.mockImplementation(async () => {
      onSuccess()
    }),
    isPending: mockIsPending.value,
  }),
  strategyDescriptionsFormSchema: z.object({
    monitor: z.string(),
    keepInformed: z.string(),
    keepSatisfied: z.string(),
    manageClosely: z.string(),
  }),
}))

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

const defaultProps = {
  scopeType: 'Project' as const,
  scopeId: 'proj-1',
  onSuccess: vi.fn(),
}

describe('StrategyDescriptionsEditForm — rendering', () => {
  it('renders all 4 quadrant textarea fields', () => {
    render(<StrategyDescriptionsEditForm {...defaultProps} />)

    expect(screen.getByRole('textbox', { name: /monitor/i })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /keep informed/i })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /keep satisfied/i })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /manage closely/i })).toBeInTheDocument()
  })

  it('renders submit button', () => {
    render(<StrategyDescriptionsEditForm {...defaultProps} />)

    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
  })

  it('pre-fills fields from initialValues', () => {
    render(
      <StrategyDescriptionsEditForm
        {...defaultProps}
        initialValues={{
          id: 'sd-1',
          version: 1,
          monitor: 'Monitor text',
          keepInformed: 'Keep informed text',
          keepSatisfied: 'Keep satisfied text',
          manageClosely: 'Manage closely text',
          scope: { id: 'proj-1', name: 'Project proj-1', scopeType: 'Project' },
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z',
        }}
      />,
    )

    expect(screen.getByDisplayValue('Monitor text')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Keep informed text')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Keep satisfied text')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Manage closely text')).toBeInTheDocument()
  })
})

describe('StrategyDescriptionsEditForm — save button interaction', () => {
  it('calls onSuccess when save button clicked', async () => {
    mockIsPending.value = false
    const user = userEvent.setup()
    const onSuccess = vi.fn()
    render(
      <StrategyDescriptionsEditForm
        {...defaultProps}
        onSuccess={onSuccess}
      />,
    )

    await user.click(screen.getByRole('button', { name: /save/i }))

    expect(onSuccess).toHaveBeenCalled()
  })

  it('save button is enabled when isPending=false', () => {
    mockIsPending.value = false
    render(<StrategyDescriptionsEditForm {...defaultProps} />)

    expect(screen.getByRole('button', { name: /save/i })).not.toBeDisabled()
  })

  it('save button is disabled when isPending=true', () => {
    mockIsPending.value = true
    render(<StrategyDescriptionsEditForm {...defaultProps} />)

    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled()

    // Reset for subsequent tests
    mockIsPending.value = false
  })
})
