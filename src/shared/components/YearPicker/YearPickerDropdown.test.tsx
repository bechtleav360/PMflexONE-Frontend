import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import { YearPickerDropdown } from './YearPickerDropdown'

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

const years = Array.from({ length: 12 }, (_, i) => 2020 + i)

const defaultProps = {
  label: 'Start Year',
  decade: 2020,
  gridSize: 12,
  years,
  value: 2024 as number | null,
  onPrevDecade: vi.fn(),
  onNextDecade: vi.fn(),
  onSelect: vi.fn(),
  onClear: vi.fn(),
}

function renderDropdown(overrides: Partial<typeof defaultProps> = {}) {
  return render(
    <YearPickerDropdown
      {...defaultProps}
      {...overrides}
    />,
  )
}

describe('YearPickerDropdown — rendering', () => {
  it('renders as a group with the given aria-label', () => {
    renderDropdown()
    expect(screen.getByRole('group', { name: 'Start Year' })).toBeInTheDocument()
  })

  it('displays the decade range in the header', () => {
    renderDropdown({ decade: 2020, gridSize: 12 })
    expect(screen.getByText('2020–2031')).toBeInTheDocument()
  })

  it('marks the selected year as aria-pressed', () => {
    renderDropdown({ value: 2024 })
    expect(screen.getByRole('button', { name: '2024' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('marks unselected years as aria-pressed false', () => {
    renderDropdown({ value: 2024 })
    expect(screen.getByRole('button', { name: '2023' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('shows the clear button when a value is selected', () => {
    renderDropdown({ value: 2024 })
    expect(screen.getByRole('button', { name: 'Clear selection' })).toBeInTheDocument()
  })

  it('hides the clear button when value is null', () => {
    renderDropdown({ value: null })
    expect(screen.queryByRole('button', { name: 'Clear selection' })).not.toBeInTheDocument()
  })

  it('hides the clear button when onClear is not provided', () => {
    renderDropdown({ value: 2024, onClear: undefined })
    expect(screen.queryByRole('button', { name: 'Clear selection' })).not.toBeInTheDocument()
  })
})

describe('YearPickerDropdown — interactions', () => {
  it('calls onSelect with the clicked year', async () => {
    const onSelect = vi.fn()
    renderDropdown({ onSelect })
    await userEvent.click(screen.getByRole('button', { name: '2023' }))
    expect(onSelect).toHaveBeenCalledWith(2023)
  })

  it('calls onPrevDecade when the previous decade button is clicked', async () => {
    const onPrevDecade = vi.fn()
    renderDropdown({ onPrevDecade })
    await userEvent.click(screen.getByRole('button', { name: 'Previous decade' }))
    expect(onPrevDecade).toHaveBeenCalledTimes(1)
  })

  it('calls onNextDecade when the next decade button is clicked', async () => {
    const onNextDecade = vi.fn()
    renderDropdown({ onNextDecade })
    await userEvent.click(screen.getByRole('button', { name: 'Next decade' }))
    expect(onNextDecade).toHaveBeenCalledTimes(1)
  })

  it('calls onClear when the clear button is clicked', async () => {
    const onClear = vi.fn()
    renderDropdown({ onClear, value: 2024 })
    await userEvent.click(screen.getByRole('button', { name: 'Clear selection' }))
    expect(onClear).toHaveBeenCalledTimes(1)
  })
})
