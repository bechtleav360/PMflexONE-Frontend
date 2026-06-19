import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'
import type { FilterFieldDef } from '@/shared/types'

import { FilterBar } from './FilterBar'

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

interface TestFilter extends Record<string, unknown> {
  name: string | null
  status: string | null
  active: boolean
  year: number | null
}

const DEFAULT_VALUE: TestFilter = { name: null, status: null, active: false, year: null }

const TEXT_SEARCH_FIELD: FilterFieldDef = {
  type: 'text-search',
  key: 'name',
  label: 'Search',
  placeholder: 'Search...',
  defaultValue: null,
}

const SELECT_FIELD: FilterFieldDef = {
  type: 'select',
  key: 'status',
  label: 'Status',
  options: [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ],
  defaultValue: null,
}

const CHECKBOX_FIELD: FilterFieldDef = {
  type: 'checkbox',
  key: 'active',
  label: 'Active only',
  defaultValue: false,
}

const YEAR_FIELD: FilterFieldDef = {
  type: 'year',
  key: 'year',
  label: 'Year',
  defaultValue: null,
}

function renderBar(
  fields: FilterFieldDef[],
  overrides: {
    value?: TestFilter
    isFiltered?: boolean
    onReset?: () => void
  } = {},
) {
  const onChange = vi.fn()
  render(
    <FilterBar
      fields={fields}
      value={overrides.value ?? DEFAULT_VALUE}
      onChange={onChange}
      onReset={overrides.onReset}
      isFiltered={overrides.isFiltered ?? false}
    />,
  )
  return { onChange }
}

describe('FilterBar — text-search field', () => {
  it('renders a labeled input', () => {
    renderBar([TEXT_SEARCH_FIELD])
    expect(screen.getByLabelText('Search')).toBeInTheDocument()
  })
})

describe('FilterBar — select field', () => {
  it('renders a label for the select control', () => {
    renderBar([SELECT_FIELD])
    expect(screen.getByText('Status')).toBeInTheDocument()
  })
})

describe('FilterBar — checkbox field', () => {
  it('renders a labeled checkbox', () => {
    renderBar([CHECKBOX_FIELD])
    expect(screen.getByRole('checkbox')).toBeInTheDocument()
    expect(screen.getByText('Active only')).toBeInTheDocument()
  })

  it('calls onChange with the toggled value when the checkbox is clicked', async () => {
    const { onChange } = renderBar([CHECKBOX_FIELD])
    await userEvent.click(screen.getByRole('checkbox'))
    expect(onChange).toHaveBeenCalledWith({ active: true })
  })
})

describe('FilterBar — year field', () => {
  it('renders a label for the year picker', () => {
    renderBar([YEAR_FIELD])
    expect(screen.getByText('Year')).toBeInTheDocument()
  })
})

describe('FilterBar — clear button', () => {
  it('does not render the clear button when isFiltered is false', () => {
    renderBar([TEXT_SEARCH_FIELD], { isFiltered: false, onReset: vi.fn() })
    expect(screen.queryByRole('button', { name: /clear filters/i })).not.toBeInTheDocument()
  })

  it('does not render the clear button when onReset is not provided', () => {
    renderBar([TEXT_SEARCH_FIELD], { isFiltered: true })
    expect(screen.queryByRole('button', { name: /clear filters/i })).not.toBeInTheDocument()
  })

  it('renders the clear button when isFiltered is true and onReset is provided', () => {
    renderBar([TEXT_SEARCH_FIELD], { isFiltered: true, onReset: vi.fn() })
    expect(screen.getByRole('button', { name: /clear filters/i })).toBeInTheDocument()
  })

  it('calls onReset when the clear button is clicked', async () => {
    const onReset = vi.fn()
    renderBar([TEXT_SEARCH_FIELD], { isFiltered: true, onReset })
    await userEvent.click(screen.getByRole('button', { name: /clear filters/i }))
    expect(onReset).toHaveBeenCalledTimes(1)
  })
})
