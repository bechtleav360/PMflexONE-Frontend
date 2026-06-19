import { useId } from 'react'
import type { ReactElement } from 'react'

import { useTranslation } from 'react-i18next'

import { EN_DASH } from '@/shared/lib/constants'
import { cn } from '@/shared/lib/utils'
import type { FilterFieldDef, FilterTranslateFn } from '@/shared/types'

import { Button } from '../Button'
import { Checkbox } from '../Checkbox'
import { Combobox } from '../Combobox'
import { DatePicker, formatLocalDate } from '../DatePicker'
import { Label } from '../Label'
import { YearPicker } from '../YearPicker'
import { TextSearchField } from './TextSearchField'

/** Props shared by all per-type field renderers. */
interface FieldRendererProps<TFilter extends Record<string, unknown>> {
  field: FilterFieldDef
  fieldId: string
  value: TFilter
  onChange: (update: Partial<TFilter>) => void
  t: FilterTranslateFn
}

/**
 * Props for `FilterBar`.
 *
 * @property fields - Ordered list of filter field definitions to render.
 * @property value - The current filter state object.
 * @property onChange - Called with partial updates whenever the user changes a control.
 * @property onReset - Called when the user clicks "Clear filters". Optional.
 * @property isFiltered - When true **and** `onReset` is provided, a "Clear filters" button is shown at the trailing end.
 * @property className - Additional CSS classes for the root element.
 */
interface FilterBarProps<TFilter extends Record<string, unknown>> {
  fields: FilterFieldDef[]
  value: TFilter
  onChange: (update: Partial<TFilter>) => void
  onReset?: () => void
  isFiltered?: boolean
  className?: string
}

/**
 * Renders `text-search`, `select`, `combobox`, and `checkbox` fields.
 *
 * Split from `renderRangeAndYear` to stay within the complexity limit.
 *
 * @param props - Shared field renderer props.
 * @returns The appropriate field element, or null when the field type is not handled here.
 */
function renderSimpleField<TFilter extends Record<string, unknown>>({
  field,
  fieldId,
  value,
  onChange,
}: FieldRendererProps<TFilter>): ReactElement | null {
  if (field.type === 'text-search') {
    return (
      <TextSearchField
        key={field.key}
        field={field}
        id={fieldId}
        externalValue={(value[field.key] as string | null) ?? ''}
        onCommit={(v) => onChange({ [field.key]: v || null } as Partial<TFilter>)}
      />
    )
  }

  if (field.type === 'select' || field.type === 'combobox') {
    return (
      <div
        key={field.key}
        className="flex flex-col gap-1"
      >
        <Label htmlFor={fieldId}>{field.label}</Label>
        <Combobox
          id={fieldId}
          value={(value[field.key] as string | null) ?? null}
          onChange={(v) => onChange({ [field.key]: v } as Partial<TFilter>)}
          options={field.options}
          className="w-44"
        />
      </div>
    )
  }

  if (field.type === 'checkbox') {
    return (
      <div
        key={field.key}
        className="flex items-center gap-1.5 pb-1"
      >
        <Checkbox
          id={fieldId}
          checked={(value[field.key] as boolean | undefined) ?? false}
          onCheckedChange={(v) => onChange({ [field.key]: v === true } as Partial<TFilter>)}
        />
        <Label
          htmlFor={fieldId}
          className="cursor-pointer"
        >
          {field.label}
        </Label>
      </div>
    )
  }

  return null
}

/**
 * Parses a YYYY-MM-DD string to a local Date, or returns null if the input is malformed.
 *
 * @param s - The ISO date string to parse (expected format: YYYY-MM-DD).
 * @returns A Date at local midnight for the given date, or null when the string is invalid.
 */
function parseDateString(s: string): Date | null {
  const parts = s.split('-').map(Number)
  if (parts.length !== 3 || parts.some(isNaN)) return null
  const [y, m, d] = parts
  return new Date(y, m - 1, d)
}

/**
 * Renders `date-range` and `year` fields.
 *
 * Split from `renderSimpleField` to stay within the complexity limit.
 *
 * @param props - Shared field renderer props.
 * @returns The appropriate field element, or null when the field type is not handled here.
 */
function renderRangeAndYear<TFilter extends Record<string, unknown>>({
  field,
  fieldId,
  value,
  onChange,
  t,
}: FieldRendererProps<TFilter>): ReactElement | null {
  if (field.type === 'date-range') {
    const compositeKey = `${field.keyFrom}_${field.keyTo}`
    const rangeValue = (value[compositeKey] as { from: string | null; to: string | null }) ?? {
      from: null,
      to: null,
    }
    return (
      <div
        key={compositeKey}
        role="group"
        aria-labelledby={`${fieldId}-label`}
        className="flex flex-col gap-1"
      >
        <span
          id={`${fieldId}-label`}
          className="text-[13px] leading-none font-semibold"
        >
          {field.label}
        </span>
        <div className="flex items-center gap-2">
          <DatePicker
            id={`${fieldId}-from`}
            value={rangeValue.from ? parseDateString(rangeValue.from) : null}
            onChange={(date) =>
              onChange({
                [compositeKey]: { ...rangeValue, from: date ? formatLocalDate(date) : null },
              } as Partial<TFilter>)
            }
            aria-label={t('shared.filterBar.dateFrom', { label: field.label })}
          />
          <span
            aria-hidden="true"
            className="text-muted-foreground select-none"
          >
            {EN_DASH}
          </span>
          <DatePicker
            id={`${fieldId}-to`}
            value={rangeValue.to ? parseDateString(rangeValue.to) : null}
            onChange={(date) =>
              onChange({
                [compositeKey]: { ...rangeValue, to: date ? formatLocalDate(date) : null },
              } as Partial<TFilter>)
            }
            aria-label={t('shared.filterBar.dateTo', { label: field.label })}
          />
        </div>
      </div>
    )
  }

  if (field.type === 'year') {
    return (
      <div
        key={field.key}
        className="flex flex-col gap-1"
      >
        <Label htmlFor={fieldId}>{field.label}</Label>
        <YearPicker
          id={fieldId}
          value={(value[field.key] as number | null) ?? null}
          onChange={(v) => onChange({ [field.key]: v } as Partial<TFilter>)}
          className="w-36"
        />
      </div>
    )
  }

  return null
}

/**
 * Config-driven filter bar that renders one control per `FilterFieldDef` entry.
 *
 * Layout: horizontal flex row wrapping on overflow. Each control is in its own
 * labeled group (label above, control below). A ghost "Clear filters" button
 * appears at the trailing end when `isFiltered` is true.
 *
 * The `text-search` control debounces `onChange` calls by 300 ms internally.
 *
 * @param props - {@link FilterBarProps}
 * @returns The rendered filter bar.
 */
export function FilterBar<TFilter extends Record<string, unknown>>({
  fields,
  value,
  onChange,
  onReset,
  isFiltered = false,
  className,
}: FilterBarProps<TFilter>) {
  const { t } = useTranslation()
  const baseId = useId()

  return (
    <div className={cn('flex flex-wrap items-end gap-4', className)}>
      {fields.map((field) => {
        const fieldKey = field.type === 'date-range' ? field.keyFrom : field.key
        const fieldId = `${baseId}-${fieldKey}`
        const props = { field, fieldId, value, onChange, t }
        return renderSimpleField(props) ?? renderRangeAndYear(props)
      })}

      {isFiltered && onReset && (
        <div className="pb-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
          >
            {t('shared.filterBar.clearFilters')}
          </Button>
        </div>
      )}
    </div>
  )
}
