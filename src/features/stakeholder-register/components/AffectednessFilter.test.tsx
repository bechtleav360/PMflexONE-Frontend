import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import { AffectednessFilter } from './AffectednessFilter'

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

describe('AffectednessFilter', () => {
  it('renders three buttons: All, Positive, Negative', () => {
    render(
      <AffectednessFilter
        value="ALL"
        onChange={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: /all/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /positive/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /negative/i })).toBeInTheDocument()
  })

  it('marks active button as pressed', () => {
    render(
      <AffectednessFilter
        value="POSITIVE"
        onChange={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: /positive/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('button', { name: /all/i })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button', { name: /negative/i })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('calls onChange with POSITIVE when Positive button clicked', async () => {
    const onChange = vi.fn()
    render(
      <AffectednessFilter
        value="ALL"
        onChange={onChange}
      />,
    )
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /positive/i }))
    expect(onChange).toHaveBeenCalledWith('POSITIVE')
  })

  it('calls onChange with NEGATIVE when Negative button clicked', async () => {
    const onChange = vi.fn()
    render(
      <AffectednessFilter
        value="ALL"
        onChange={onChange}
      />,
    )
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /negative/i }))
    expect(onChange).toHaveBeenCalledWith('NEGATIVE')
  })

  it('calls onChange with ALL when All button clicked', async () => {
    const onChange = vi.fn()
    render(
      <AffectednessFilter
        value="POSITIVE"
        onChange={onChange}
      />,
    )
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /all/i }))
    expect(onChange).toHaveBeenCalledWith('ALL')
  })
})
