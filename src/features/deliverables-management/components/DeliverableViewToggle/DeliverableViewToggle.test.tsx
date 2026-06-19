import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import { DeliverableViewToggle } from './DeliverableViewToggle'

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

describe('DeliverableViewToggle — rendering', () => {
  it('renders Tree and List tabs', () => {
    render(
      <DeliverableViewToggle
        value="tree"
        onChange={vi.fn()}
      />,
    )
    expect(screen.getByRole('tab', { name: /^tree$/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /^list$/i })).toBeInTheDocument()
  })

  it('marks the active tab via aria-selected', () => {
    render(
      <DeliverableViewToggle
        value="list"
        onChange={vi.fn()}
      />,
    )
    expect(screen.getByRole('tab', { name: /^list$/i })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: /^tree$/i })).toHaveAttribute('aria-selected', 'false')
  })
})

describe('DeliverableViewToggle — interaction', () => {
  it('calls onChange with "list" when List tab is clicked', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(
      <DeliverableViewToggle
        value="tree"
        onChange={onChange}
      />,
    )
    await user.click(screen.getByRole('tab', { name: /^list$/i }))
    expect(onChange).toHaveBeenCalledWith('list')
  })

  it('calls onChange with "tree" when Tree tab is clicked', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(
      <DeliverableViewToggle
        value="list"
        onChange={onChange}
      />,
    )
    await user.click(screen.getByRole('tab', { name: /^tree$/i }))
    expect(onChange).toHaveBeenCalledWith('tree')
  })
})
