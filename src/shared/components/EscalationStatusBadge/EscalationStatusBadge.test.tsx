import { createElement } from 'react'

import { render, screen } from '@testing-library/react'
import { beforeAll, describe, expect, it } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import { EscalationStatusBadge } from './EscalationStatusBadge'

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

describe('EscalationStatusBadge', () => {
  it('renders ACTIVE badge with correct label', () => {
    render(createElement(EscalationStatusBadge, { status: 'ACTIVE' }))
    const badge = screen.getByTestId('escalation-status-badge')
    expect(badge).toHaveTextContent('Active')
  })

  it('renders RETURNED badge with correct label', () => {
    render(createElement(EscalationStatusBadge, { status: 'RETURNED' }))
    const badge = screen.getByTestId('escalation-status-badge')
    expect(badge).toHaveTextContent('Returned')
  })

  it('applies warning token class for ACTIVE status', () => {
    render(createElement(EscalationStatusBadge, { status: 'ACTIVE' }))
    const badge = screen.getByTestId('escalation-status-badge')
    expect(badge.className).toMatch(/warning/)
  })

  it('applies muted token class for RETURNED status', () => {
    render(createElement(EscalationStatusBadge, { status: 'RETURNED' }))
    const badge = screen.getByTestId('escalation-status-badge')
    expect(badge.className).toMatch(/muted/)
  })

  it('includes a screen-reader ARIA label', () => {
    render(createElement(EscalationStatusBadge, { status: 'ACTIVE' }))
    const badge = screen.getByTestId('escalation-status-badge')
    expect(badge).toHaveAttribute('aria-label')
  })
})
