import { act, createRef } from 'react'

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import type * as SharedComponents from '@/shared/components'
import { i18n } from '@/shared/lib/i18n'

import type { ProjectCharterFormHandle } from './ProjectCharterForm'
import { ProjectCharterForm } from './ProjectCharterForm'

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

describe('ProjectCharterForm — fields', () => {
  it('renders all 10 editor fields', () => {
    render(
      <ProjectCharterForm
        mode="create"
        onSave={noop}
        isSavePending={false}
      />,
    )

    expect(screen.getByLabelText(/project summary/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/scope summary/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/success criteria/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/stakeholders/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/requirements/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/constraints/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/assumptions/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/risks/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/resources/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/operational implementation/i)).toBeInTheDocument()
  })

  it('pre-populates fields with defaultValues', () => {
    render(
      <ProjectCharterForm
        mode="edit"
        defaultValues={{ projectSummary: 'Pre-filled summary' }}
        onSave={noop}
        isSavePending={false}
      />,
    )

    expect(screen.getByLabelText(/project summary/i)).toHaveValue('Pre-filled summary')
  })
})

describe('ProjectCharterForm — buttons', () => {
  it('hides Submit button when onSubmit is not provided', () => {
    render(
      <ProjectCharterForm
        mode="edit"
        onSave={noop}
        isSavePending={false}
      />,
    )

    expect(screen.queryByRole('button', { name: /submit/i })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
  })

  it('shows Submit button when onSubmit is provided', () => {
    render(
      <ProjectCharterForm
        mode="edit"
        onSave={noop}
        onSubmit={noop}
        isSavePending={false}
      />,
    )

    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
  })

  it('calls onSave with form values on save click', async () => {
    const onSave = vi.fn()
    render(
      <ProjectCharterForm
        mode="create"
        onSave={onSave}
        isSavePending={false}
      />,
    )

    await userEvent.type(screen.getByLabelText(/project summary/i), 'Test summary')
    await userEvent.click(screen.getByRole('button', { name: /save/i }))

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ projectSummary: 'Test summary' }),
      expect.anything(),
    )
  })

  it('disables save button when isSavePending is true', () => {
    render(
      <ProjectCharterForm
        mode="create"
        onSave={noop}
        isSavePending
      />,
    )

    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled()
  })

  it('disables submit button when isSubmitPending is true', () => {
    render(
      <ProjectCharterForm
        mode="edit"
        onSave={noop}
        onSubmit={noop}
        isSavePending={false}
        isSubmitPending
      />,
    )

    expect(screen.getByRole('button', { name: /submit/i })).toBeDisabled()
  })

  it('calls onSubmit when Submit button is clicked', async () => {
    const onSubmit = vi.fn()
    render(
      <ProjectCharterForm
        mode="create"
        onSave={noop}
        onSubmit={onSubmit}
        isSavePending={false}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: /submit/i }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalled())
  })
})

describe('ProjectCharterForm — ref / triggerSubmit', () => {
  it('triggerSubmit is a no-op when onSubmit is not provided', () => {
    const ref = createRef<ProjectCharterFormHandle>()
    render(
      <ProjectCharterForm
        ref={ref}
        mode="create"
        onSave={noop}
        isSavePending={false}
      />,
    )

    expect(() => ref.current?.triggerSubmit()).not.toThrow()
  })

  it('triggerSubmit calls onSubmit when form is valid', async () => {
    const onSubmit = vi.fn()
    const ref = createRef<ProjectCharterFormHandle>()
    render(
      <ProjectCharterForm
        ref={ref}
        mode="create"
        onSave={noop}
        onSubmit={onSubmit}
        isSavePending={false}
      />,
    )

    await act(async () => {
      ref.current?.triggerSubmit()
    })

    await waitFor(() => expect(onSubmit).toHaveBeenCalled())
  })
})
