import { useTranslation } from 'react-i18next'

function toRgbaStyle(rgbHex: string, alpha: number): string {
  // #RRGGBB + 0–255 → rgba(r,g,b,a) CSS string
  const r = parseInt(rgbHex.slice(1, 3), 16)
  const g = parseInt(rgbHex.slice(3, 5), 16)
  const b = parseInt(rgbHex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${(alpha / 255).toFixed(3)})`
}

/**
 * Props for the {@link ColorSwatch} component.
 * @property rgb - Current RGB hex string (`#RRGGBB`).
 * @property alpha - Alpha channel value (0–255).
 * @property disabled - Whether the colour input is disabled.
 * @property onChange - Called when the user selects a new RGB colour.
 */
export interface ColorSwatchProps {
  rgb: string
  alpha: number
  disabled: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

/**
 * Colour preview swatch with a native color input.
 * Renders a native `<input type="color">` alongside a checkerboard-backed preview tile
 * that shows the selected colour at the chosen alpha level.
 * @param root0 - Component props.
 * @param root0.rgb - The current RGB hex string (`#RRGGBB`).
 * @param root0.alpha - Alpha channel value (0–255).
 * @param root0.disabled - Whether the input is disabled.
 * @param root0.onChange - Called when the user picks a new RGB colour.
 * @returns The swatch element.
 */
export function ColorSwatch({ rgb, alpha, disabled, onChange }: ColorSwatchProps) {
  const { t } = useTranslation()
  return (
    <div className="text-muted-foreground flex flex-col gap-1 text-xs">
      {t('shared.colorPicker.colorLabel', 'Color')}
      <div className="flex gap-1">
        <input
          type="color"
          value={rgb}
          onChange={onChange}
          disabled={disabled}
          className="border-input h-8 w-10 cursor-pointer rounded border bg-transparent p-0.5"
          aria-label={t('shared.colorPicker.colorLabel', 'Color')}
        />
        <div
          className="border-input h-8 w-10 rounded border"
          style={{
            backgroundColor: toRgbaStyle(rgb, alpha),
            backgroundImage:
              'repeating-conic-gradient(var(--color-border-strong) 0% 25%, transparent 0% 50%)',
            backgroundSize: '8px 8px',
          }}
        >
          <div
            className="h-full w-full rounded"
            style={{ backgroundColor: toRgbaStyle(rgb, alpha) }}
          />
        </div>
      </div>
    </div>
  )
}
