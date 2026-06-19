/**
 * Translate function signature accepted by filter field builder functions.
 *
 * Compatible with the `t` function returned by `useTranslation()`.
 */
export type FilterTranslateFn = (key: string, opts?: Record<string, unknown>) => string

/** A single selectable item for `select` and `combobox` filter controls. */
export interface SelectOption {
  label: string
  value: string
}

/** Discriminated union describing one filter control in a config-driven filter bar. */
export type FilterFieldDef =
  | {
      type: 'text-search'
      key: string
      label: string
      placeholder?: string
      defaultValue: string | null
    }
  | {
      type: 'select'
      key: string
      label: string
      options: SelectOption[]
      defaultValue: string | null
    }
  | {
      type: 'combobox'
      key: string
      label: string
      options: SelectOption[]
      defaultValue: string | null
    }
  | {
      type: 'checkbox'
      key: string
      label: string
      defaultValue: boolean
    }
  | {
      type: 'date-range'
      keyFrom: string
      keyTo: string
      label: string
      defaultValue: { from: string | null; to: string | null }
    }
  | {
      type: 'year'
      key: string
      label: string
      defaultValue: number | null
    }
