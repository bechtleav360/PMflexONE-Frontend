const DAY_LABELS: Intl.DateTimeFormatOptions = { weekday: 'short' }
const CALENDAR_DAY_LABELS: Intl.DateTimeFormatOptions = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
}

type CalendarDay = {
  date: Date
  isCurrentMonth: boolean
  isDisabled: boolean
}

function getDateOnly(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate())
}

function isBeforeDate(left: Date, right: Date) {
  return getDateOnly(left).getTime() < getDateOnly(right).getTime()
}

function isAfterDate(left: Date, right: Date) {
  return getDateOnly(left).getTime() > getDateOnly(right).getTime()
}

function normalizeYear(year: number) {
  if (year >= 100) {
    return year
  }

  return 2000 + year
}

function getFirstDayOfWeek() {
  return 1
}

function extractDigits(value: string) {
  return value.match(/\d+/g)?.map((segment) => Number(segment)) ?? []
}

function getDateParts(locale: string) {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  })
    .formatToParts(new Date(2006, 10, 22))
    .filter((part) => part.type === 'year' || part.type === 'month' || part.type === 'day')
}

function getParsedDate(values: Map<string, number>) {
  const year = normalizeYear(values.get('year') ?? Number.NaN)
  const month = (values.get('month') ?? Number.NaN) - 1
  const day = values.get('day') ?? Number.NaN

  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return null
  }

  const parsed = new Date(year, month, day)

  if (parsed.getFullYear() !== year || parsed.getMonth() !== month || parsed.getDate() !== day) {
    return null
  }

  return parsed
}

/**
 * Serialises a Date to an ISO 8601 date string (YYYY-MM-DD) using local
 * year/month/day components. `toISOString()` must not be used here because it
 * converts to UTC first, which shifts the date back by one day in UTC+ timezones.
 *
 * @param date - The date to format.
 * @returns A YYYY-MM-DD string in local time.
 */
export function formatLocalDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Formats a date using the requested locale and `Intl.DateTimeFormat` options.
 *
 * @param value - Date to format or `null` when the field is empty.
 * @param locale - Locale used for formatting.
 * @param formatOptions - Date formatting options.
 * @returns The formatted date string, or an empty string for `null` values.
 */
export function formatDate(
  value: Date | null,
  locale: string,
  formatOptions: Intl.DateTimeFormatOptions,
) {
  if (!value) {
    return ''
  }

  return new Intl.DateTimeFormat(locale, formatOptions).format(value)
}

const FORMAT_PART_LABELS: Partial<Record<Intl.DateTimeFormatPartTypes, string>> = {
  day: 'DD',
  month: 'MM',
  year: 'YYYY',
}

/**
 * Returns a locale-aware format-hint placeholder for a date input.
 *
 * Uses `Intl.DateTimeFormat.formatToParts` to produce a string like
 * "DD.MM.YYYY" (de) or "MM/DD/YYYY" (en) from the locale's separator
 * characters — without showing today's date, which would mislead the user
 * into thinking a value is already selected.
 *
 * @param locale - Locale used for formatting.
 * @param formatOptions - Date formatting options.
 * @returns A format-hint placeholder string.
 */
export function getPlaceholder(locale: string, formatOptions: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(locale, formatOptions)
    .formatToParts(new Date(2000, 10, 22))
    .map((part) => FORMAT_PART_LABELS[part.type] ?? part.value)
    .join('')
}

/**
 * Parses a locale-formatted date string in the current `day/month/year` order.
 *
 * @param value - Input string typed by the user.
 * @param locale - Locale used to determine date-part order.
 * @returns A valid `Date` instance or `null` when parsing fails.
 */
export function parseLocaleDate(value: string, locale: string) {
  const digits = extractDigits(value)

  if (digits.length !== 3) {
    return null
  }

  const order = getDateParts(locale)

  if (order.length !== 3) {
    return null
  }

  const values = new Map<string, number>()

  order.forEach((part, index) => {
    values.set(part.type, digits[index])
  })

  return getParsedDate(values)
}

/**
 * Builds the six-week calendar grid used by the date picker popover.
 *
 * @param viewDate - The month currently displayed in the calendar.
 * @param minDate - Optional lower bound for selectable dates.
 * @param maxDate - Optional upper bound for selectable dates.
 * @returns A 42-day grid covering the visible calendar month.
 */
export function buildCalendarDays(viewDate: Date, minDate?: Date, maxDate?: Date) {
  const firstDayOfWeek = getFirstDayOfWeek()
  const monthStart = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1)
  const leadingDays = (monthStart.getDay() - firstDayOfWeek + 7) % 7
  const startDate = new Date(monthStart.getFullYear(), monthStart.getMonth(), 1 - leadingDays)

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate() + index,
    )

    return {
      date,
      isCurrentMonth: date.getMonth() === viewDate.getMonth(),
      isDisabled: Boolean(
        (minDate && isBeforeDate(date, minDate)) || (maxDate && isAfterDate(date, maxDate)),
      ),
    } satisfies CalendarDay
  })
}

/**
 * Returns weekday labels ordered according to the current locale.
 *
 * @param locale - Locale used to derive the first weekday.
 * @returns Abbreviated weekday labels for the calendar header.
 */
export function getWeekdayLabels(locale: string) {
  const firstDayOfWeek = getFirstDayOfWeek()
  const sampleWeek = Array.from({ length: 7 }, (_, index) => new Date(2024, 0, 7 + index))
  const orderedWeek = [...sampleWeek.slice(firstDayOfWeek), ...sampleWeek.slice(0, firstDayOfWeek)]

  return orderedWeek.map((date) => new Intl.DateTimeFormat(locale, DAY_LABELS).format(date))
}

/**
 * Formats an accessible label for a single calendar day button.
 *
 * @param date - Calendar day to describe.
 * @param locale - Locale used for date formatting.
 * @returns A screen-reader friendly date label.
 */
export function formatCalendarDayLabel(date: Date, locale: string) {
  return new Intl.DateTimeFormat(locale, CALENDAR_DAY_LABELS).format(date)
}
