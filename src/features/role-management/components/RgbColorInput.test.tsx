import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import { RgbColorInput } from './RgbColorInput'

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

function renderInput(value: string | undefined, onChange = vi.fn()) {
  render(
    <RgbColorInput
      value={value}
      onChange={onChange}
    />,
  )
  return onChange
}

describe('RgbColorInput — rendering', () => {
  it('renders the hex text field', () => {
    renderInput('#ff0000')
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('renders the color swatch input', () => {
    renderInput('#ff0000')
    expect(document.querySelector('input[type="color"]')).toBeInTheDocument()
  })

  it('shows the initial value in the hex field', () => {
    renderInput('#aabbcc')
    expect(screen.getByRole('textbox')).toHaveValue('#aabbcc')
  })

  it('shows the Clear button when value is set', () => {
    renderInput('#ff0000')
    expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument()
  })

  it('does not show the Clear button when value is empty', () => {
    renderInput('')
    expect(screen.queryByRole('button', { name: /clear/i })).not.toBeInTheDocument()
  })

  it('does not show the Clear button when value is undefined', () => {
    renderInput(undefined)
    expect(screen.queryByRole('button', { name: /clear/i })).not.toBeInTheDocument()
  })
})

describe('RgbColorInput — hex text field', () => {
  it('calls onChange with valid hex when a valid hex is typed', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <RgbColorInput
        value=""
        onChange={onChange}
      />,
    )
    await user.type(screen.getByRole('textbox'), '#123456')
    expect(onChange).toHaveBeenCalledWith('#123456')
  })

  it('does not call onChange with invalid partial hex', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <RgbColorInput
        value=""
        onChange={onChange}
      />,
    )
    await user.type(screen.getByRole('textbox'), '#12')
    // #12 is not a valid hex — onChange should not have been called with it
    const calls = onChange.mock.calls.map((c) => c[0])
    expect(calls.every((v: string) => v === '' || /^#[0-9a-fA-F]{6}$/.test(v))).toBe(true)
  })

  it('calls onChange with empty string when text is cleared', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <RgbColorInput
        value="#ff0000"
        onChange={onChange}
      />,
    )
    const textbox = screen.getByRole('textbox')
    await user.clear(textbox)
    expect(onChange).toHaveBeenCalledWith('')
  })
})

describe('RgbColorInput — Clear button', () => {
  it('calls onChange with empty string when Clear is clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <RgbColorInput
        value="#ff0000"
        onChange={onChange}
      />,
    )
    await user.click(screen.getByRole('button', { name: /clear/i }))
    expect(onChange).toHaveBeenCalledWith('')
  })
})
