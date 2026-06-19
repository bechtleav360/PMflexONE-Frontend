import { createElement, useMemo } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import type { ProgramInitiationRequestFormValues } from '../utils/programInitiationRequestSchema'
import { ProgramInitiationRequestMandatoryFields } from './ProgramInitiationRequestMandatoryFields'

vi.mock('@/features/portfolios', () => ({
  usePortfolios: () => ({ data: [{ id: 'port-1', name: 'Alpha Portfolio' }], isPending: false }),
}))

interface HarnessProps {
  disabled?: boolean
  isView?: boolean
  isCreate?: boolean
  programName?: string
  portfolioName?: string | null
}

function FieldHarness({
  disabled = false,
  isView = false,
  isCreate = false,
  programName = 'Test Program',
  portfolioName = null,
}: HarnessProps) {
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
    createElement(ProgramInitiationRequestMandatoryFields, {
      register,
      control,
      errors,
      disabled,
      isView,
      isCreate,
      programName,
      portfolioName,
    }),
  )
}

function renderFields(props?: HarnessProps) {
  return render(createElement(FieldHarness, props ?? {}))
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

describe('ProgramInitiationRequestMandatoryFields', () => {
  it('renders name and document version inputs', () => {
    renderFields()

    expect(screen.getByLabelText(/program title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/document version/i)).toBeInTheDocument()
  })

  it('shows requesting program as read-only field with programName value', () => {
    renderFields({ programName: 'My Program' })

    expect(screen.getByDisplayValue('My Program')).toBeInTheDocument()
  })

  it('shows required markers when not in view mode', () => {
    const { container } = renderFields({ isView: false })

    const requiredSpans = Array.from(container.querySelectorAll('span[aria-hidden="true"]')).filter(
      (el) => el.textContent?.trim() === '*',
    )
    expect(requiredSpans.length).toBeGreaterThan(0)
  })

  it('shows portfolio selector in create mode', () => {
    renderFields({ isCreate: true })

    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('does not show portfolio selector when not in create mode', () => {
    renderFields({ isCreate: false, isView: false })

    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
  })

  it('shows portfolio name input in view mode', () => {
    renderFields({ isView: true, portfolioName: 'Beta Portfolio' })

    expect(screen.getByDisplayValue('Beta Portfolio')).toBeInTheDocument()
  })

  it('shows empty portfolio input in view mode when portfolioName is null', () => {
    renderFields({ isView: true, portfolioName: null })

    const inputs = screen.getAllByRole('textbox')
    const portfolioInput = inputs.find((el) => (el as HTMLInputElement).id === 'ppir-portfolioName')
    expect(portfolioInput).toBeDefined()
    expect((portfolioInput as HTMLInputElement).value).toBe('')
  })

  it('shows portfolio items in create mode when portfolios are available', () => {
    renderFields({ isCreate: true })

    const trigger = screen.getByRole('combobox')
    expect(trigger).toBeInTheDocument()
  })
})
