import { useState } from 'react'

import { ColorPicker } from '@/shared/components'

import { ShowcaseSection } from './ShowcaseSection'

const outputLabel = 'Output: '

/**
 * Showcase section for the ColorPicker component with ARGB (#AARRGGBB) format demo.
 * @returns A section containing an interactive ColorPicker example.
 */
export function ColorPickerSection() {
  const [color, setColor] = useState('#FF2563EB')

  return (
    <ShowcaseSection title="ColorPicker">
      <div className="w-72 rounded-md border p-4">
        <ColorPicker
          value={color}
          onChange={setColor}
        />
        <p className="text-muted-foreground mt-3 text-xs">
          {outputLabel}
          <span className="font-mono">{color}</span>
        </p>
      </div>
    </ShowcaseSection>
  )
}
