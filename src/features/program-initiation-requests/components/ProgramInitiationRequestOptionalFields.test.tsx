import { createElement, useMemo } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { beforeAll, describe, expect, it } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import type { ProgramInitiationRequestFormValues } from '../utils/programInitiationRequestSchema'
import { ProgramInitiationRequestOptionalFields } from './ProgramInitiationRequestOptionalFields'

interface HarnessProps {
  disabled?: boolean
  isView?: boolean
}

function FieldHarness({ disabled = false, isView = false }: HarnessProps) {
  const queryClient = useMemo(
    () => new QueryClient({ defaultOptions: { queries: { retry: false } } }),
    [],
  )
  const {
    register,
    control,
    formState: { errors },
  } = useForm<ProgramInitiationRequestFormValues>()
  return createElement(
    QueryClientProvider,
    { client: queryClient },
    createElement(ProgramInitiationRequestOptionalFields, {
      register,
      control,
      errors,
      disabled,
      isView,
    }),
  )
}

function renderFields(props?: HarnessProps) {
  return render(createElement(FieldHarness, props ?? {}))
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

describe('ProgramInitiationRequestOptionalFields', () => {
  it('renders all optional fields', () => {
    renderFields()

    expect(screen.getByLabelText(/program initiator/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/program owner/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/organisational unit/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/solution provider/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/approving authority/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/request date/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/target delivery date/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/estimated effort/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/delivery type/i)).toBeInTheDocument()
  })

  it('shows required markers when not in view mode', () => {
    const { container } = renderFields({ isView: false })

    const requiredSpans = Array.from(container.querySelectorAll('span[aria-hidden="true"]')).filter(
      (el) => el.textContent?.trim() === '*',
    )
    expect(requiredSpans.length).toBeGreaterThan(0)
  })

  it('hides required markers in view mode', () => {
    const { container } = renderFields({ isView: true })

    const requiredSpans = Array.from(container.querySelectorAll('span[aria-hidden="true"]')).filter(
      (el) => el.textContent?.trim() === '*',
    )
    expect(requiredSpans.length).toBe(0)
  })

  it('disables fields when disabled prop is true', () => {
    renderFields({ disabled: true })

    const initiatorInput = screen.getByLabelText(/program initiator/i)
    expect(initiatorInput).toBeDisabled()
  })

  it('does not disable fields when disabled prop is false', () => {
    renderFields({ disabled: false })

    const initiatorInput = screen.getByLabelText(/program initiator/i)
    expect(initiatorInput).not.toBeDisabled()
  })

  it('renders delivery type select trigger', () => {
    renderFields()

    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('renders effort comment textarea', () => {
    renderFields()

    expect(screen.getByRole('textbox', { name: /effort comment/i })).toBeInTheDocument()
  })
})
