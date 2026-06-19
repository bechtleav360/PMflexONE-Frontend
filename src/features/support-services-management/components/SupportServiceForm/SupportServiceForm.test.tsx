import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import { SupportServiceForm } from './SupportServiceForm'

// Mock hooks that make real network requests
vi.mock('../../hooks/useSupportServices', () => ({
  useSupportServiceTree: () => ({ data: { tree: [], flat: [] }, isPending: false }),
  useSupportService: () => ({ data: null, isPending: false, isFetched: true }),
}))

vi.mock('../../hooks/usePlanningRoles', () => ({
  usePlanningRoles: () => ({ data: [], isPending: false }),
}))

vi.mock('../../hooks/useCreateSupportService', () => ({
  useCreateSupportService: () => ({
    mutateAsync: vi.fn().mockResolvedValue({ id: 'new-id', version: 1 }),
    isPending: false,
  }),
}))

vi.mock('../../hooks/useUpdateSupportService', () => ({
  useUpdateSupportService: () => ({
    mutateAsync: vi.fn().mockResolvedValue({ id: 'existing-id', version: 2 }),
    isPending: false,
  }),
}))

vi.mock('../../hooks/useMoveSupportService', () => ({
  useMoveSupportService: () => ({
    mutateAsync: vi.fn().mockResolvedValue({ id: 'existing-id', version: 3 }),
    isPending: false,
  }),
}))

vi.mock('../../hooks/useCreatePlanningRole', () => ({
  useCreatePlanningRole: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}))

function Fixture({ onSaved = vi.fn(), onCancel = vi.fn() }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const form = createElement(SupportServiceForm, {
    projectId: 'proj1',
    supportServiceId: undefined,
    onSaved,
    onCancel,
  })
  return createElement(
    QueryClientProvider,
    { client: queryClient },
    createElement(
      MemoryRouter,
      { initialEntries: ['/projects/proj1/support-services/new'] },
      createElement(
        Routes,
        null,
        createElement(Route, { path: '/projects/:id/support-services/new', element: form }),
      ),
    ),
  )
}

beforeAll(async () => {
  await i18n.changeLanguage('de')
})

describe('SupportServiceForm', () => {
  it('renders the name field', async () => {
    render(createElement(Fixture, {}))
    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /bezeichnung/i })).toBeInTheDocument()
    })
  })

  it('shows a validation error when name is empty on submit', async () => {
    const user = userEvent.setup()
    render(createElement(Fixture, {}))

    await waitFor(() => screen.getByRole('button', { name: /speichern/i }))
    await user.click(screen.getByRole('button', { name: /speichern/i }))

    await waitFor(() => {
      expect(screen.getByText(/pflichtfeld/i)).toBeInTheDocument()
    })
  })

  it('calls onCancel when cancel is clicked without dirty form', async () => {
    const onCancel = vi.fn()
    const user = userEvent.setup()

    render(createElement(Fixture, { onCancel }))

    await waitFor(() => screen.getByRole('button', { name: /abbrechen/i }))
    await user.click(screen.getByRole('button', { name: /abbrechen/i }))

    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('does not call onCancel immediately when cancel is clicked with a dirty form', async () => {
    const onCancel = vi.fn()
    const user = userEvent.setup()

    render(createElement(Fixture, { onCancel }))

    // Make the form dirty by typing in the name field
    await waitFor(() => screen.getByRole('textbox', { name: /bezeichnung/i }))
    await user.type(screen.getByRole('textbox', { name: /bezeichnung/i }), 'Test Service')
    await user.click(screen.getByRole('button', { name: /abbrechen/i }))

    // When form is dirty, cancel must not immediately invoke the onCancel callback —
    // the unsaved-changes guard dialog intercepts the action first.
    expect(onCancel).not.toHaveBeenCalled()
  })
})
