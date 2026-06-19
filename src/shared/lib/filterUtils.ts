import type { FilterFieldDef } from '@/shared/types'

/** Union of all value types a filter field default can hold. */
type FilterDefaultValue =
  | string
  | number
  | boolean
  | null
  | { from: string | null; to: string | null }

/**
 * Derives the initial filter object from a field definition array.
 *
 * For `date-range` fields the resulting key is `${keyFrom}_${keyTo}` and the
 * value is the `defaultValue` object `{ from, to }`. All other field types use
 * their `key` directly.
 *
 * The return type is narrowed to `Record<string, FilterDefaultValue>` so that
 * downstream `as { … }` assertions are constrained to the known value types.
 * TypeScript cannot infer the field key names from a runtime array, so each
 * `DEFAULT_FILTER` constant still requires a type assertion — but the assertion
 * will fail if a field's value type falls outside `FilterDefaultValue`.
 *
 * @param fields - Array of filter field definitions.
 * @returns A flat record mapping each field's key to its default value.
 */
export function buildDefaultFilter(fields: FilterFieldDef[]): Record<string, FilterDefaultValue> {
  const result: Record<string, FilterDefaultValue> = {}

  for (const field of fields) {
    if (field.type === 'date-range') {
      result[`${field.keyFrom}_${field.keyTo}`] = field.defaultValue
    } else {
      result[field.key] = field.defaultValue
    }
  }

  return result
}
