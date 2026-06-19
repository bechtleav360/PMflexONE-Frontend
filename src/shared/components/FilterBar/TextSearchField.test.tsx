import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'
import type { FilterFieldDef } from '@/shared/types'

import { TextSearchField } from './TextSearchField'

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

const FIELD: Extract<FilterFieldDef, { type: 'text-search' }> = {
  type: 'text-search',
  key: 'name',
  label: 'Search',
  placeholder: 'Search...',
  defaultValue: null,
}

function renderField(
  overrides: { externalValue?: string; onCommit?: (value: string) => void } = {},
) {
  const onCommit = overrides.onCommit ?? vi.fn()
  render(
    <TextSearchField
      field={FIELD}
      id="test-search"
      externalValue={overrides.externalValue ?? ''}
      onCommit={onCommit}
    />,
  )
  return { onCommit, input: screen.getByLabelText('Search') }
}

describe('TextSearchField — rendering', () => {
  it('renders a labeled text input', () => {
    const { input } = renderField()
    expect(input).toBeInTheDocument()
  })

  it('reflects the initial externalValue', () => {
    const { input } = renderField({ externalValue: 'hello' })
    expect(input).toHaveValue('hello')
  })
})

describe('TextSearchField — debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('does not call onCommit before the debounce window elapses', () => {
    const { onCommit, input } = renderField()
    fireEvent.change(input, { target: { value: 'abc' } })
    vi.advanceTimersByTime(299)
    expect(onCommit).not.toHaveBeenCalled()
  })

  it('calls onCommit with the typed value after 300 ms', () => {
    const { onCommit, input } = renderField()
    fireEvent.change(input, { target: { value: 'hello' } })
    vi.advanceTimersByTime(300)
    expect(onCommit).toHaveBeenCalledWith('hello')
  })

  it('resets the debounce timer on each keystroke — only fires once', () => {
    const { onCommit, input } = renderField()
    fireEvent.change(input, { target: { value: 'h' } })
    vi.advanceTimersByTime(200)
    fireEvent.change(input, { target: { value: 'he' } })
    vi.advanceTimersByTime(300)
    expect(onCommit).toHaveBeenCalledTimes(1)
    expect(onCommit).toHaveBeenCalledWith('he')
  })
})

describe('TextSearchField — external value reset', () => {
  it('syncs the input when externalValue changes', () => {
    const { rerender } = render(
      <TextSearchField
        field={FIELD}
        id="test-search"
        externalValue="previous"
        onCommit={vi.fn()}
      />,
    )
    expect(screen.getByLabelText('Search')).toHaveValue('previous')

    rerender(
      <TextSearchField
        field={FIELD}
        id="test-search"
        externalValue=""
        onCommit={vi.fn()}
      />,
    )
    expect(screen.getByLabelText('Search')).toHaveValue('')
  })
})
