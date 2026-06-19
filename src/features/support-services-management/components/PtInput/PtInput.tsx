import type { ComponentPropsWithoutRef } from 'react'

import { Input } from '@/shared/components'

type PtInputProps = Omit<ComponentPropsWithoutRef<'input'>, 'type' | 'step'>

/**
 * Number input pre-configured for PT (person-time) values.
 *
 * Locks `type="number"` and `step="0.25"` — the canonical PT increment.
 * Default `min` is `"0.25"`; pass `min="0"` for fields where zero is valid
 * (e.g. estimated effort on a support service with no planned work).
 *
 * @param props - All standard input props except `type` and `step`.
 * @returns The rendered PT number input.
 */
export function PtInput({ min = '0.25', ...props }: PtInputProps) {
  return (
    <Input
      type="number"
      step="0.25"
      min={min}
      {...props}
    />
  )
}
