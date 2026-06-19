import { createRef } from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import type * as SharedComponents from '@/shared/components'
import { i18n } from '@/shared/lib/i18n'

import type { BusinessCaseFormHandle } from './BusinessCaseForm'
import { BusinessCaseForm } from './BusinessCaseForm'

vi.mock('@/shared/components', async (importOriginal) => {
  const actual = await importOriginal<typeof SharedComponents>()
  return {
    ...actual,
    MarkdownEditor: ({
      value,
      onChange,
      ariaLabel,
      placeholder,
    }: {
      value: string
      onChange: (v: string) => void
      ariaLabel?: string
      placeholder?: string
    }) => (
      <textarea
        aria-label={ariaLabel}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    ),
  }
})

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

const noop = vi.fn()

describe('BusinessCaseForm — fields', () => {
  it('renders all 8 editor fields', () => {
    render(
      <BusinessCaseForm
        mode="create"
        onSaveDraft={noop}
        isSavePending={false}
      />,
    )

    expect(screen.getByLabelText(/client summary/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/project rationale/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/expected benefit/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/options/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/investment calculation/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/key risks/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/expected negative side effects/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/timeline/i)).toBeInTheDocument()
  })

  it('pre-populates fields with defaultValues', () => {
    render(
      <BusinessCaseForm
        mode="edit"
        defaultValues={{ clientSummary: 'Pre-filled summary' }}
        onSaveDraft={noop}
        isSavePending={false}
      />,
    )

    expect(screen.getByLabelText(/client summary/i)).toHaveValue('Pre-filled summary')
  })
})

describe('BusinessCaseForm — buttons', () => {
  it('hides "Mark as Complete" when onMarkComplete is not provided', () => {
    render(
      <BusinessCaseForm
        mode="edit"
        onSaveDraft={noop}
        isSavePending={false}
      />,
    )

    expect(screen.queryByRole('button', { name: /submit/i })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
  })

  it('shows "Submit" when onMarkComplete is provided', () => {
    render(
      <BusinessCaseForm
        mode="edit"
        onSaveDraft={noop}
        onMarkComplete={noop}
        isSavePending={false}
      />,
    )

    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save as draft/i })).toBeInTheDocument()
  })

  it('calls onSaveDraft with form values on save click', async () => {
    const onSaveDraft = vi.fn()
    render(
      <BusinessCaseForm
        mode="create"
        onSaveDraft={onSaveDraft}
        isSavePending={false}
      />,
    )

    await userEvent.type(screen.getByLabelText(/client summary/i), 'Test summary')
    await userEvent.click(screen.getByRole('button', { name: /save/i }))

    expect(onSaveDraft).toHaveBeenCalledWith(
      expect.objectContaining({ clientSummary: 'Test summary' }),
      expect.anything(),
    )
  })

  it('disables save button when isSavePending is true', () => {
    render(
      <BusinessCaseForm
        mode="create"
        onSaveDraft={noop}
        isSavePending
      />,
    )

    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled()
  })

  it('disables submit button when isSubmitPending is true', () => {
    render(
      <BusinessCaseForm
        mode="edit"
        onSaveDraft={noop}
        onMarkComplete={noop}
        isSavePending={false}
        isSubmitPending
      />,
    )

    expect(screen.getByRole('button', { name: /submit/i })).toBeDisabled()
  })

  it('calls onMarkComplete via inline onClick on the submit button', async () => {
    const onMarkComplete = vi.fn()
    render(
      <BusinessCaseForm
        mode="create"
        onSaveDraft={noop}
        onMarkComplete={onMarkComplete}
        isSavePending={false}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: /submit/i }))

    expect(onMarkComplete).toHaveBeenCalled()
  })
})

describe('BusinessCaseForm — ref handle', () => {
  it('triggerMarkComplete calls onMarkComplete when provided', async () => {
    const onMarkComplete = vi.fn()
    const ref = createRef<BusinessCaseFormHandle>()
    render(
      <BusinessCaseForm
        ref={ref}
        mode="create"
        onSaveDraft={noop}
        onMarkComplete={onMarkComplete}
        isSavePending={false}
        hideActions
      />,
    )

    ref.current?.triggerMarkComplete()

    await vi.waitFor(() => expect(onMarkComplete).toHaveBeenCalled())
  })

  it('triggerMarkComplete is a no-op when onMarkComplete is not provided', () => {
    const ref = createRef<BusinessCaseFormHandle>()
    render(
      <BusinessCaseForm
        ref={ref}
        mode="create"
        onSaveDraft={noop}
        isSavePending={false}
        hideActions
      />,
    )

    expect(() => ref.current?.triggerMarkComplete()).not.toThrow()
  })
})
