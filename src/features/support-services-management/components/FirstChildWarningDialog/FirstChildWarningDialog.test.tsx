import { createElement } from 'react'

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import { useSupportServicesUiStore } from '../../store/supportServicesUiStore'
import { FirstChildWarningDialog } from './FirstChildWarningDialog'

beforeAll(async () => {
  await i18n.changeLanguage('de')
})

beforeEach(() => {
  useSupportServicesUiStore.setState({
    firstChildWarning: { open: false, nodeId: null, nodeName: '', effort: 0 },
  })
})

function Fixture() {
  return createElement(FirstChildWarningDialog, {})
}

describe('FirstChildWarningDialog', () => {
  it('does not render when closed', () => {
    render(createElement(Fixture, {}))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders with title visible when open', async () => {
    useSupportServicesUiStore.setState({
      firstChildWarning: { open: true, nodeId: 'n1', nodeName: 'Node 1', effort: 5 },
    })
    render(createElement(Fixture, {}))
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
    expect(screen.getByText('Manueller Aufwandswert geht verloren')).toBeInTheDocument()
  })

  it('"Weiter" button calls openFormDialog with (undefined, nodeId)', async () => {
    const user = userEvent.setup()
    const openFormDialog = vi.spyOn(useSupportServicesUiStore.getState(), 'openFormDialog')

    useSupportServicesUiStore.setState({
      firstChildWarning: { open: true, nodeId: 'n1', nodeName: 'Node 1', effort: 5 },
      openFormDialog,
    })

    render(createElement(Fixture, {}))
    await waitFor(() => screen.getByRole('dialog'))
    await user.click(screen.getByRole('button', { name: /weiter/i }))

    expect(openFormDialog).toHaveBeenCalledWith(undefined, 'n1')
  })

  it('"Abbrechen" button calls closeFirstChildWarning', async () => {
    const user = userEvent.setup()
    const closeFirstChildWarning = vi.fn()

    useSupportServicesUiStore.setState({
      firstChildWarning: { open: true, nodeId: 'n1', nodeName: 'Node 1', effort: 5 },
      closeFirstChildWarning,
    })

    render(createElement(Fixture, {}))
    await waitFor(() => screen.getByRole('dialog'))
    await user.click(screen.getByRole('button', { name: /abbrechen/i }))

    expect(closeFirstChildWarning).toHaveBeenCalled()
  })
})
