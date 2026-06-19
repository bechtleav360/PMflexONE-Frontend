import { createElement } from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import { SupportServiceViewToggle } from './SupportServiceViewToggle'

beforeAll(async () => {
  await i18n.changeLanguage('de')
})

describe('SupportServiceViewToggle', () => {
  it('renders tree and list tab triggers', () => {
    render(createElement(SupportServiceViewToggle, { value: 'tree', onChange: vi.fn() }))
    expect(screen.getByRole('tab', { name: 'Baumansicht' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Listenansicht' })).toBeInTheDocument()
  })

  it('calls onChange with "list" when list tab is clicked', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(createElement(SupportServiceViewToggle, { value: 'tree', onChange }))
    await user.click(screen.getByRole('tab', { name: 'Listenansicht' }))
    expect(onChange).toHaveBeenCalledWith('list')
  })

  it('calls onChange with "tree" when tree tab is clicked', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(createElement(SupportServiceViewToggle, { value: 'list', onChange }))
    await user.click(screen.getByRole('tab', { name: 'Baumansicht' }))
    expect(onChange).toHaveBeenCalledWith('tree')
  })
})
