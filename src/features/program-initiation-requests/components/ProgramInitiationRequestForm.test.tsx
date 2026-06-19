import { act, createElement, createRef } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import type { ProgramInitiationRequestFormHandle } from './ProgramInitiationRequestForm'
import { ProgramInitiationRequestForm } from './ProgramInitiationRequestForm'

vi.mock('@/features/portfolios', () => ({
  usePortfolios: () => ({ data: [{ id: 'port-1', name: 'Test Portfolio' }], isPending: false }),
}))

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
  return Wrapper
}

function renderForm(props?: Partial<React.ComponentProps<typeof ProgramInitiationRequestForm>>) {
  return render(
    createElement(ProgramInitiationRequestForm, {
      mode: 'create',
      onSubmit: vi.fn(),
      isPending: false,
      programName: 'Alpha Program',
      ...props,
    }),
    { wrapper: makeWrapper() },
  )
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

describe('ProgramInitiationRequestForm - rendering', () => {
  it('renders mandatory and optional fields', () => {
    renderForm()

    expect(screen.getByLabelText(/program title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/document version/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/requesting program/i)).toBeInTheDocument()
  })

  it('shows portfolio selector in create mode', () => {
    renderForm({ mode: 'create' })

    expect(screen.getByRole('combobox', { name: /parent domain/i })).toBeInTheDocument()
  })

  it('view mode disables fields and hides action buttons', () => {
    renderForm({ mode: 'view', defaultValues: { name: 'Test PIR' } })

    expect(screen.queryByRole('button', { name: /^submit$/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /save as draft/i })).not.toBeInTheDocument()
    expect(screen.getByLabelText(/program title/i)).toBeDisabled()
  })

  it('shows Submit button but no Save as Draft when onSaveDraft is not provided', () => {
    renderForm({ mode: 'create', onSaveDraft: undefined })

    expect(screen.getByRole('button', { name: /^submit$/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /save as draft/i })).not.toBeInTheDocument()
  })

  it('shows Save as Draft button when onSaveDraft is provided', () => {
    renderForm({ mode: 'create', onSaveDraft: vi.fn() })

    expect(screen.getByRole('button', { name: /save as draft/i })).toBeInTheDocument()
  })

  it('hides action buttons when hideActions is true', () => {
    renderForm({ mode: 'create', hideActions: true })

    expect(screen.queryByRole('button', { name: /^submit$/i })).not.toBeInTheDocument()
  })

  it('shows portfolio name as read-only in view mode', () => {
    renderForm({ mode: 'view', portfolioName: 'Alpha Portfolio', defaultValues: { name: 'PIR' } })

    expect(screen.getByDisplayValue('Alpha Portfolio')).toBeInTheDocument()
  })

  it('shows empty string in portfolio field when portfolioName is null in view mode', () => {
    renderForm({ mode: 'view', portfolioName: null, defaultValues: { name: 'PIR' } })

    const inputs = screen.getAllByRole('textbox')
    const portfolioInput = inputs.find(
      (el) => (el as HTMLInputElement).readOnly && (el as HTMLInputElement).value === '',
    )
    expect(portfolioInput).toBeDefined()
  })
})

describe('ProgramInitiationRequestForm - validation', () => {
  it('shows name required error after submit with empty name', async () => {
    const user = userEvent.setup()
    renderForm()

    await user.click(screen.getByRole('button', { name: /^submit$/i }))

    expect(screen.getByText(/program title is required/i)).toBeInTheDocument()
  })
})

describe('ProgramInitiationRequestForm - actions', () => {
  it('ref.saveDraft() calls onSaveDraft when form has a name', async () => {
    const onSaveDraft = vi.fn()
    const ref = createRef<ProgramInitiationRequestFormHandle>()

    renderForm({
      ref,
      onSaveDraft,
      hideActions: true,
      defaultValues: { name: 'My Draft', requestingProgramId: 'prog-1' },
    })

    act(() => {
      ref.current?.saveDraft()
    })

    await waitFor(() => expect(onSaveDraft).toHaveBeenCalled(), { timeout: 3000 })
  })

  it('ref.saveDraft() does nothing when onSaveDraft is not provided', () => {
    const ref = createRef<ProgramInitiationRequestFormHandle>()
    renderForm({ ref, hideActions: true })

    expect(() => ref.current?.saveDraft()).not.toThrow()
  })

  it('clicking Save as Draft calls onSaveDraft with form values', async () => {
    const user = userEvent.setup()
    const onSaveDraft = vi.fn()

    renderForm({
      onSaveDraft,
      hideActions: false,
      defaultValues: { name: 'My Draft', requestingProgramId: 'prog-1' },
    })

    await user.click(screen.getByRole('button', { name: /save as draft/i }))

    await waitFor(() => expect(onSaveDraft).toHaveBeenCalled(), { timeout: 3000 })
  })

  it('does not call onSubmit when required name field is empty', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    renderForm({ onSubmit })

    await user.click(screen.getByRole('button', { name: /^submit$/i }))

    expect(onSubmit).not.toHaveBeenCalled()
  })
})
