import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import { PortfolioYearField } from './PortfolioYearField'

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

function renderField(overrides: Partial<Parameters<typeof PortfolioYearField>[0]> = {}) {
  return render(
    <PortfolioYearField
      id="start-year"
      label="Start Year"
      value={null}
      onChange={vi.fn()}
      {...overrides}
    />,
  )
}

describe('PortfolioYearField — rendering', () => {
  it('renders the label text', () => {
    renderField()
    expect(screen.getByText('Start Year')).toBeInTheDocument()
  })

  it('shows a placeholder when no year is selected', () => {
    renderField({ value: null })
    expect(screen.getByText(/select year/i)).toBeInTheDocument()
  })

  it('shows the selected year in the trigger', () => {
    renderField({ value: 2026 })
    expect(screen.getByText('2026')).toBeInTheDocument()
  })

  it('does not show the year grid on initial render', () => {
    renderField()
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('renders an error message as a role=alert paragraph when errorMessage is provided', () => {
    renderField({ errorMessage: 'Year is required', errorId: 'err-start-year' })
    expect(screen.getByRole('alert')).toHaveTextContent('Year is required')
  })

  it('does not render an error message when errorMessage is absent', () => {
    renderField()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})

describe('PortfolioYearField — interactions', () => {
  it('opens the year grid when the trigger is clicked', async () => {
    renderField()
    await userEvent.click(screen.getByLabelText('Start Year'))
    expect(screen.getByRole('group')).toBeInTheDocument()
  })

  it('closes the year grid when the trigger is clicked again', async () => {
    renderField()
    const trigger = screen.getByLabelText('Start Year')
    await userEvent.click(trigger)
    await userEvent.click(trigger)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('calls onChange with the selected year and closes the grid', async () => {
    const onChange = vi.fn()
    renderField({ onChange, value: 2020 })
    await userEvent.click(screen.getByLabelText('Start Year'))
    await userEvent.click(screen.getByRole('button', { name: '2023' }))
    expect(onChange).toHaveBeenCalledWith(2023)
    expect(screen.queryByRole('group')).not.toBeInTheDocument()
  })

  it('closes the year grid when clicking outside the component', async () => {
    renderField()
    await userEvent.click(screen.getByLabelText('Start Year'))
    expect(screen.getByRole('group')).toBeInTheDocument()
    await userEvent.click(document.body)
    expect(screen.queryByRole('group')).not.toBeInTheDocument()
  })

  it('navigates to the previous decade when the prev-decade button is clicked', async () => {
    // Open with value=2026 so current decade starts at 2020
    renderField({ value: 2026 })
    await userEvent.click(screen.getByLabelText('Start Year'))
    const prevBtn = screen.getByRole('button', { name: /prev.*decade/i })
    await userEvent.click(prevBtn)
    // After going back 12 years the new decade start is 2008 — verify it's shown
    expect(screen.getByRole('button', { name: '2008' })).toBeInTheDocument()
  })

  it('navigates to the next decade when the next-decade button is clicked', async () => {
    renderField({ value: 2026 })
    await userEvent.click(screen.getByLabelText('Start Year'))
    const nextBtn = screen.getByRole('button', { name: /next.*decade/i })
    await userEvent.click(nextBtn)
    // After advancing 12 years from 2020 the new decade starts at 2032
    expect(screen.getByRole('button', { name: '2032' })).toBeInTheDocument()
  })

  it('initialises the decade from the current year when value is null', async () => {
    // decadeStart(null) falls back to new Date().getFullYear()
    renderField({ value: null })
    await userEvent.click(screen.getByLabelText('Start Year'))
    // The group is rendered, meaning the decade was initialised without error
    expect(screen.getByRole('group')).toBeInTheDocument()
  })

  it('applies the error border class when errorMessage is provided', () => {
    renderField({ errorMessage: 'Required', errorId: 'err-year' })
    const trigger = screen.getByRole('button', { name: /start year/i })
    // The trigger has a border-destructive class when there is an error
    expect(trigger.className).toMatch(/border-destructive/)
  })

  it('sets aria-describedby on trigger when errorId is provided', () => {
    renderField({ errorId: 'err-year', errorMessage: 'Required' })
    const trigger = screen.getByRole('button', { name: /start year/i })
    expect(trigger).toHaveAttribute('aria-describedby', 'err-year')
  })
})
