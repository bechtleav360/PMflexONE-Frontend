import { createElement } from 'react'

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { PtInput } from './PtInput'

describe('PtInput', () => {
  it('renders a number input with step="0.25" and default min="0.25"', () => {
    render(createElement(PtInput, { 'aria-label': 'effort' }))
    const input = screen.getByRole('spinbutton', { name: 'effort' })
    expect(input).toHaveAttribute('type', 'number')
    expect(input).toHaveAttribute('step', '0.25')
    expect(input).toHaveAttribute('min', '0.25')
  })

  it('allows min prop to be overridden to "0"', () => {
    render(createElement(PtInput, { 'aria-label': 'effort', min: '0' }))
    const input = screen.getByRole('spinbutton', { name: 'effort' })
    expect(input).toHaveAttribute('min', '0')
  })
})
