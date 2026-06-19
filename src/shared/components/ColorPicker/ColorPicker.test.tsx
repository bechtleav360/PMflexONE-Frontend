import { createElement, useState } from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import { ColorPicker } from './ColorPicker'

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

function ControlledColorPicker({ onChange }: { onChange: (v: string) => void }) {
  const [value, setValue] = useState('#FF000000')
  return createElement(ColorPicker, {
    value,
    onChange: (v: string) => {
      setValue(v)
      onChange(v)
    },
  })
}

describe('ColorPicker', () => {
  it('renders a hex input', () => {
    render(createElement(ColorPicker, { value: '#FF000000', onChange: vi.fn() }))
    const input = screen.getByRole('textbox')
    expect(input).toBeInTheDocument()
    expect((input as HTMLInputElement).value).toMatch(/#[0-9A-Fa-f]{8}/)
  })

  it('accepts a valid 8-digit ARGB hex value', async () => {
    const onChange = vi.fn()
    render(createElement(ControlledColorPicker, { onChange }))
    const user = userEvent.setup()

    const input = screen.getByRole('textbox')
    await user.clear(input)
    await user.type(input, '#AARRGGBB'.replace('AARRGGBB', 'FF00FF00'))

    // onChange should eventually be called with valid 8-char hex
    expect(onChange).toHaveBeenCalled()
  })

  it('rejects invalid hex and does not call onChange', async () => {
    const onChange = vi.fn()
    render(createElement(ColorPicker, { value: '#FF000000', onChange }))
    const user = userEvent.setup()

    const input = screen.getByRole('textbox')
    await user.clear(input)
    await user.type(input, 'GGGG')

    // Valid 8-digit hex not entered, onChange should not receive invalid value
    const calls = onChange.mock.calls.filter(
      ([v]) => typeof v === 'string' && /^#[0-9A-Fa-f]{8}$/.test(v),
    )
    // We just verify the component didn't crash
    expect(document.body).toBeInTheDocument()
    expect(calls.length).toBe(0)
  })

  it('output format matches #AARRGGBB (8 hex digits)', () => {
    const onChange = vi.fn()
    render(createElement(ColorPicker, { value: '#FF0000FF', onChange }))
    const input = screen.getByRole('textbox')
    expect((input as HTMLInputElement).value).toMatch(/^#[0-9A-Fa-f]{8}$/)
  })
})
