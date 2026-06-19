import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Button } from './Button'

const LABEL_CLICK_ME = 'Click me'
const LABEL_PRESS = 'Press'
const LABEL_DISABLED = 'Disabled'
const LABEL_LINK = 'Link'

describe('Button', () => {
  it('renders with text content', () => {
    render(<Button>{LABEL_CLICK_ME}</Button>)
    expect(screen.getByRole('button', { name: LABEL_CLICK_ME })).toBeInTheDocument()
  })

  it('calls onClick handler when clicked', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>{LABEL_PRESS}</Button>)

    await userEvent.click(screen.getByRole('button', { name: LABEL_PRESS }))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('is disabled when disabled prop is set', () => {
    render(<Button disabled>{LABEL_DISABLED}</Button>)
    expect(screen.getByRole('button', { name: LABEL_DISABLED })).toBeDisabled()
  })

  it('renders as a child element when asChild is true', () => {
    render(
      <Button asChild>
        <a href="/test">{LABEL_LINK}</a>
      </Button>,
    )
    expect(screen.getByRole('link', { name: LABEL_LINK })).toBeInTheDocument()
  })
})
