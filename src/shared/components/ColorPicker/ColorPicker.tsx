import { useEffect, useId, useState } from 'react'

import { useTranslation } from 'react-i18next'

import { ColorSwatch } from './ColorSwatch'

interface ColorPickerProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

function toRgbHex(argb: string): string {
  // #AARRGGBB → #RRGGBB
  if (/^#[0-9A-Fa-f]{8}$/.test(argb)) {
    return `#${argb.slice(3)}`
  }
  return '#000000'
}

function toAlphaInt(argb: string): number {
  // #AARRGGBB → 0–255
  if (/^#[0-9A-Fa-f]{8}$/.test(argb)) {
    return parseInt(argb.slice(1, 3), 16)
  }
  return 255
}

function buildArgb(rgbHex: string, alpha: number): string {
  // #RRGGBB + 0–255 → #AARRGGBB
  const aa = alpha.toString(16).padStart(2, '0').toUpperCase()
  return `#${aa}${rgbHex.slice(1).toUpperCase()}`
}

/**
 * ARGB colour picker — outputs `#AARRGGBB` format.
 * Provides a native `<input type="color">` for RGB and an alpha range slider.
 * Keyboard-accessible: all inputs are standard HTML controls.
 * @param root0 - Component props.
 * @param root0.value - The current ARGB colour string (`#AARRGGBB`).
 * @param root0.onChange - Callback invoked with the new ARGB colour when changed.
 * @param root0.disabled - Whether the picker is disabled.
 * @returns The colour picker element.
 */
export function ColorPicker({ value, onChange, disabled = false }: ColorPickerProps) {
  const { t } = useTranslation()
  const hexInputId = useId()

  const [hexInput, setHexInput] = useState(value)
  const [rgb, setRgb] = useState(() => toRgbHex(value))
  const [alpha, setAlpha] = useState(() => toAlphaInt(value))

  useEffect(() => {
    setHexInput(value)
    setRgb(toRgbHex(value))
    setAlpha(toAlphaInt(value))
  }, [value])

  function handleRgbChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newRgb = e.target.value
    setRgb(newRgb)
    const newArgb = buildArgb(newRgb, alpha)
    setHexInput(newArgb)
    onChange(newArgb)
  }

  function handleAlphaChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newAlpha = Number(e.target.value)
    setAlpha(newAlpha)
    const newArgb = buildArgb(rgb, newAlpha)
    setHexInput(newArgb)
    onChange(newArgb)
  }

  function handleHexInput(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value
    setHexInput(raw)
    if (/^#[0-9A-Fa-f]{8}$/.test(raw)) {
      setRgb(toRgbHex(raw))
      setAlpha(toAlphaInt(raw))
      onChange(raw.toUpperCase().replace('#', '#'))
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <ColorSwatch
          rgb={rgb}
          alpha={alpha}
          disabled={disabled}
          onChange={handleRgbChange}
        />
        <label className="text-muted-foreground flex flex-1 flex-col gap-1 text-xs">
          {t('shared.colorPicker.alphaLabel', 'Alpha (0–255)')}
          <input
            type="range"
            min={0}
            max={255}
            value={alpha}
            onChange={handleAlphaChange}
            disabled={disabled}
            className="w-full"
            aria-label={t('shared.colorPicker.alphaLabel', 'Alpha (0–255)')}
          />
        </label>
      </div>
      <label
        className="text-muted-foreground flex flex-col gap-1 text-xs"
        htmlFor={hexInputId}
      >
        {t('shared.colorPicker.hexLabel', 'Hex (#AARRGGBB)')}
        <input
          id={hexInputId}
          type="text"
          value={hexInput}
          onChange={handleHexInput}
          disabled={disabled}
          maxLength={9}
          className="border-input bg-background h-8 rounded-md border px-2 font-mono text-sm"
          aria-label={t('shared.colorPicker.hexLabel', 'Hex (#AARRGGBB)')}
          placeholder="#AARRGGBB"
        />
      </label>
    </div>
  )
}
