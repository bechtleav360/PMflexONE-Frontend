import { useState } from 'react'

import { useTranslation } from 'react-i18next'

import { Input } from '@/shared/components'

interface RgbColorInputProps {
  /** Initial hex color value (#RRGGBB). Only read on mount; use `key` to reset. */
  value: string | undefined
  onChange: (v: string) => void
  disabled?: boolean
}

function isValidHex(s: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(s)
}

function normaliseHex(s: string): string {
  if (/^#[0-9a-fA-F]{3}$/.test(s)) {
    return `#${s[1]}${s[1]}${s[2]}${s[2]}${s[3]}${s[3]}`
  }
  return s
}

/**
 * Minimal RGB hex color input: native color swatch + hex text field.
 * Outputs a `#RRGGBB` string or `''` when cleared.
 * `value` is used as initial state only — pass a `key` to reset the component.
 *
 * @param root0 - Component props.
 * @param root0.value - Initial hex color value (#RRGGBB).
 * @param root0.onChange - Called with the new hex string or `''` when cleared.
 * @param root0.disabled - When true, the input is disabled.
 * @returns The rendered color input element.
 */
export function RgbColorInput({ value, onChange, disabled }: RgbColorInputProps) {
  const { t } = useTranslation()
  const [hexText, setHexText] = useState(normaliseHex(value ?? ''))

  // Raw hex fallback is intentional: native <input type="color"> requires a valid hex value.
  // This is an explicit exception to the token-only rule.
  const swatchValue = isValidHex(hexText) ? hexText : '#000000'

  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={swatchValue}
        disabled={disabled}
        onChange={(e) => {
          setHexText(e.target.value)
          onChange(e.target.value)
        }}
        className="border-input h-9 w-10 shrink-0 cursor-pointer rounded border bg-transparent p-0.5"
        aria-label={t('pages.roleManagement.groupColorLabel', 'Group color')}
      />
      <Input
        value={hexText}
        disabled={disabled}
        maxLength={7}
        placeholder="#RRGGBB"
        className="w-28 font-mono"
        onChange={(e) => {
          const raw = e.target.value
          setHexText(raw)
          if (isValidHex(raw)) onChange(raw)
          if (raw === '') onChange('')
        }}
      />
      {hexText && (
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground text-xs"
          onClick={() => {
            setHexText('')
            onChange('')
          }}
          disabled={disabled}
        >
          {t('common.clear')}
        </button>
      )}
    </div>
  )
}
