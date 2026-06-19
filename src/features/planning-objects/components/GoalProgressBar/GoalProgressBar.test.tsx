import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { GoalProgressBar } from './GoalProgressBar'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => {
      if (opts && typeof opts.value !== 'undefined') return `${key}:${opts.value}`
      return key
    },
  }),
}))

describe('GoalProgressBar', () => {
  it('renders a progressbar with the correct aria value', () => {
    render(<GoalProgressBar value={42} />)
    const bar = screen.getByRole('progressbar')
    expect(bar).toHaveAttribute('aria-valuenow', '42')
  })

  it('shows the percentage label', () => {
    render(<GoalProgressBar value={75} />)
    expect(screen.getByText('75%')).toBeDefined()
  })

  it('aria-label contains the value', () => {
    render(<GoalProgressBar value={60} />)
    const bar = screen.getByRole('progressbar')
    expect(bar.getAttribute('aria-label')).toContain('60')
  })

  it('clamps value above 100 to 100', () => {
    render(<GoalProgressBar value={150} />)
    const bar = screen.getByRole('progressbar')
    expect(bar).toHaveAttribute('aria-valuenow', '100')
    expect(screen.getByText('100%')).toBeDefined()
  })

  it('clamps negative value to 0', () => {
    render(<GoalProgressBar value={-10} />)
    const bar = screen.getByRole('progressbar')
    expect(bar).toHaveAttribute('aria-valuenow', '0')
    expect(screen.getByText('0%')).toBeDefined()
  })
})
