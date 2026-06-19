import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import { i18n } from '@/shared/lib/i18n'

import { InfluenceAttitudeMatrixEditor } from './InfluenceAttitudeMatrixEditor'

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

describe('InfluenceAttitudeMatrixEditor', () => {
  it('renders the matrix container', () => {
    render(
      <InfluenceAttitudeMatrixEditor
        value={null}
        onChange={vi.fn()}
      />,
    )
    expect(screen.getByRole('application')).toBeInTheDocument()
  })

  it('renders a dot when a position is provided', () => {
    render(
      <InfluenceAttitudeMatrixEditor
        value={{ x: 0.7, y: 0.8 }}
        onChange={vi.fn()}
      />,
    )
    expect(screen.getByTestId('matrix-dot')).toBeInTheDocument()
  })

  it('does not render a dot when value is null', () => {
    render(
      <InfluenceAttitudeMatrixEditor
        value={null}
        onChange={vi.fn()}
      />,
    )
    expect(screen.queryByTestId('matrix-dot')).not.toBeInTheDocument()
  })

  it('shows a strategy label when a position is provided', () => {
    render(
      <InfluenceAttitudeMatrixEditor
        value={{ x: 0.8, y: 0.8 }}
        onChange={vi.fn()}
      />,
    )
    // Scope to the aria-live strategy readout — the matrix grid also renders
    // "Manage closely" as a static zone label, so a bare text query is ambiguous.
    const liveRegion = screen.getByText(/strategy/i).closest('[aria-live]')
    expect(liveRegion).toHaveTextContent(/manage closely/i)
  })

  it('does not render drag handlers when readOnly', () => {
    render(
      <InfluenceAttitudeMatrixEditor
        value={{ x: 0.5, y: 0.5 }}
        onChange={vi.fn()}
        readOnly
      />,
    )
    const canvas = screen.getByRole('application')
    // tabIndex should not be set in readOnly mode
    expect(canvas).not.toHaveAttribute('tabindex')
  })

  it('matrix container is keyboard-focusable when not readOnly', () => {
    render(
      <InfluenceAttitudeMatrixEditor
        value={{ x: 0.5, y: 0.5 }}
        onChange={vi.fn()}
      />,
    )
    expect(screen.getByRole('application')).toHaveAttribute('tabindex', '0')
  })

  it('strategy label has aria-live="polite"', () => {
    render(
      <InfluenceAttitudeMatrixEditor
        value={{ x: 0.7, y: 0.7 }}
        onChange={vi.fn()}
      />,
    )
    const liveRegion = screen.getByText(/strategy/i).closest('[aria-live]')
    expect(liveRegion).toHaveAttribute('aria-live', 'polite')
  })
})

describe('InfluenceAttitudeMatrixEditor — keyboard navigation', () => {
  it('ArrowUp key increases y position and calls onChange', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <InfluenceAttitudeMatrixEditor
        value={{ x: 0.5, y: 0.5 }}
        onChange={onChange}
      />,
    )

    const canvas = screen.getByRole('application')
    canvas.focus()
    await user.keyboard('{ArrowUp}')

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ x: 0.5, y: expect.closeTo(0.55, 5) }),
    )
  })

  it('ArrowDown key decreases y position and calls onChange', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <InfluenceAttitudeMatrixEditor
        value={{ x: 0.5, y: 0.5 }}
        onChange={onChange}
      />,
    )

    const canvas = screen.getByRole('application')
    canvas.focus()
    await user.keyboard('{ArrowDown}')

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ x: 0.5, y: expect.closeTo(0.45, 5) }),
    )
  })

  it('ArrowLeft key decreases x position and calls onChange', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <InfluenceAttitudeMatrixEditor
        value={{ x: 0.5, y: 0.5 }}
        onChange={onChange}
      />,
    )

    const canvas = screen.getByRole('application')
    canvas.focus()
    await user.keyboard('{ArrowLeft}')

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ x: expect.closeTo(0.45, 5), y: 0.5 }),
    )
  })

  it('ArrowRight key increases x position and calls onChange', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <InfluenceAttitudeMatrixEditor
        value={{ x: 0.5, y: 0.5 }}
        onChange={onChange}
      />,
    )

    const canvas = screen.getByRole('application')
    canvas.focus()
    await user.keyboard('{ArrowRight}')

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ x: expect.closeTo(0.55, 5), y: 0.5 }),
    )
  })
})

describe('InfluenceAttitudeMatrixEditor — keyboard guards and label updates', () => {
  it('keyboard does nothing when readOnly', () => {
    const onChange = vi.fn()
    render(
      <InfluenceAttitudeMatrixEditor
        value={{ x: 0.5, y: 0.5 }}
        onChange={onChange}
        readOnly
      />,
    )

    // In readOnly mode the element has no tabIndex so focus via Tab won't land on it.
    // Use fireEvent to dispatch the keyDown directly on the application element
    // (simulating keyboard event without focus management).
    const container = screen.getByRole('application').parentElement!
    fireEvent.keyDown(container, { key: 'ArrowUp' })

    expect(onChange).not.toHaveBeenCalled()
  })

  it('strategy label updates after keyboard navigation to manage closely quadrant', async () => {
    const user = userEvent.setup()
    render(
      <InfluenceAttitudeMatrixEditor
        value={{ x: 0.5, y: 0.5 }}
        onChange={vi.fn()}
      />,
    )

    const canvas = screen.getByRole('application')
    canvas.focus()
    // Navigate to top-right (high influence, positive attitude = Manage Closely)
    await user.keyboard('{ArrowRight}{ArrowRight}{ArrowUp}{ArrowUp}')

    const liveRegion = screen.getByText(/strategy/i).closest('[aria-live]')
    expect(liveRegion).toHaveTextContent(/manage closely/i)
  })
})

describe('InfluenceAttitudeMatrixEditor — mousedown interaction', () => {
  it('mousedown on grid calls onChange with computed position', () => {
    const onChange = vi.fn()
    render(
      <InfluenceAttitudeMatrixEditor
        value={null}
        onChange={onChange}
      />,
    )

    const grid = screen.getByRole('application')

    fireEvent.mouseDown(grid, {
      clientX: 100,
      clientY: 100,
      bubbles: true,
    })

    expect(onChange).toHaveBeenCalled()
  })

  it('mousedown on grid does not call onChange when readOnly', () => {
    const onChange = vi.fn()
    render(
      <InfluenceAttitudeMatrixEditor
        value={null}
        onChange={onChange}
        readOnly
      />,
    )

    const grid = screen.getByRole('application')

    fireEvent.mouseDown(grid, {
      clientX: 100,
      clientY: 100,
      bubbles: true,
    })

    expect(onChange).not.toHaveBeenCalled()
  })
})
