import { createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import { useSupportServicesUiStore } from '../../store/supportServicesUiStore'
import { SupportServiceFormDialog } from './SupportServiceFormDialog'

vi.mock('../SupportServiceForm', () => ({
  SupportServiceForm: ({ onSaved, onCancel }: { onSaved: () => void; onCancel: () => void }) =>
    createElement('div', { 'data-testid': 'support-service-form' }, [
      createElement('button', { key: 'save', type: 'button', onClick: onSaved }, 'Form Saved'),
      createElement('button', { key: 'cancel', type: 'button', onClick: onCancel }, 'Form Cancel'),
    ]),
}))

function Fixture() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return createElement(
    QueryClientProvider,
    { client: queryClient },
    createElement(SupportServiceFormDialog, { projectId: 'proj1' }),
  )
}

beforeAll(async () => {
  await i18n.changeLanguage('de')
})

describe('SupportServiceFormDialog', () => {
  it('does not render the dialog when formDialog.open is false', () => {
    useSupportServicesUiStore.setState({
      formDialog: { open: false, supportServiceId: null, defaultParentId: null },
    })
    render(createElement(Fixture, {}))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows the create title when open with no supportServiceId', async () => {
    useSupportServicesUiStore.setState({
      formDialog: { open: true, supportServiceId: null, defaultParentId: null },
    })
    render(createElement(Fixture, {}))
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
    expect(screen.getByRole('heading', { name: 'Supportleistung anlegen' })).toBeInTheDocument()
  })

  it('shows the edit title when open with a supportServiceId', async () => {
    useSupportServicesUiStore.setState({
      formDialog: { open: true, supportServiceId: 'ss-42', defaultParentId: null },
    })
    render(createElement(Fixture, {}))
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
    expect(screen.getByRole('heading', { name: 'Supportleistung bearbeiten' })).toBeInTheDocument()
  })

  it('closes dialog and calls closeFormDialog when form save succeeds', async () => {
    const user = userEvent.setup()
    const closeFormDialog = vi.fn()
    useSupportServicesUiStore.setState({
      formDialog: { open: true, supportServiceId: null, defaultParentId: null },
      closeFormDialog,
    })
    render(createElement(Fixture, {}))
    await waitFor(() => screen.getByRole('dialog'))

    await user.click(screen.getByRole('button', { name: 'Form Saved' }))

    await waitFor(() => {
      expect(closeFormDialog).toHaveBeenCalled()
    })
  })

  it('closes dialog and calls closeFormDialog when form save succeeds in edit mode', async () => {
    const user = userEvent.setup()
    const closeFormDialog = vi.fn()
    useSupportServicesUiStore.setState({
      formDialog: { open: true, supportServiceId: 'ss-1', defaultParentId: null },
      closeFormDialog,
    })
    render(createElement(Fixture, {}))
    await waitFor(() => screen.getByRole('dialog'))

    await user.click(screen.getByRole('button', { name: 'Form Saved' }))

    await waitFor(() => {
      expect(closeFormDialog).toHaveBeenCalled()
    })
  })

  it('closes dialog when form cancel is invoked', async () => {
    const user = userEvent.setup()
    const closeFormDialog = vi.fn()
    useSupportServicesUiStore.setState({
      formDialog: { open: true, supportServiceId: null, defaultParentId: null },
      closeFormDialog,
    })
    render(createElement(Fixture, {}))
    await waitFor(() => screen.getByRole('dialog'))

    await user.click(screen.getByRole('button', { name: 'Form Cancel' }))

    await waitFor(() => {
      expect(closeFormDialog).toHaveBeenCalled()
    })
  })
})
