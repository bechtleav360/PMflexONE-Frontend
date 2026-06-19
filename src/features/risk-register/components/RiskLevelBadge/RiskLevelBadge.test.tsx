import { createElement } from 'react'

import { render, screen } from '@testing-library/react'
import { beforeAll, describe, expect, it } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import { RiskLevelBadge } from './RiskLevelBadge'

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

describe('RiskLevelBadge', () => {
  it('renders numeric level when provided', () => {
    render(createElement(RiskLevelBadge, { riskLevel: 12, type: 'RISK' }))
    const badge = screen.getByTestId('risk-level-badge')
    expect(badge).toHaveTextContent('12')
    expect(badge).toHaveAttribute('data-color', 'yellow')
  })

  it('renders em-dash when level is null', () => {
    render(createElement(RiskLevelBadge, { riskLevel: null, type: 'RISK' }))
    const badge = screen.getByTestId('risk-level-badge')
    expect(badge).toHaveTextContent('—')
    expect(badge).toHaveAttribute('data-color', 'gray')
  })

  it('applies green data-color for low risk level', () => {
    render(createElement(RiskLevelBadge, { riskLevel: 2, type: 'RISK' }))
    expect(screen.getByTestId('risk-level-badge')).toHaveAttribute('data-color', 'green')
  })

  it('applies red data-color for high risk level', () => {
    render(createElement(RiskLevelBadge, { riskLevel: 20, type: 'RISK' }))
    expect(screen.getByTestId('risk-level-badge')).toHaveAttribute('data-color', 'red')
  })

  it('includes a screen-reader-only label', () => {
    render(createElement(RiskLevelBadge, { riskLevel: 12, type: 'RISK' }))
    expect(screen.getByTestId('risk-level-badge').querySelector('.sr-only')).not.toBeNull()
  })
})
