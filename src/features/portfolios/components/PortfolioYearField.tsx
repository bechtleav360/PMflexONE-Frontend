import { Label, YearPicker } from '@/shared/components'

interface PortfolioYearFieldProps {
  /** Input element id forwarded to the trigger button. */
  id: string
  /** Visible label text. */
  label: string
  /** Controlled numeric value, or null when no year is selected. */
  value: number | null
  /** Called with the selected year number, or null when cleared. */
  onChange: (value: number | null) => void
  /** aria-describedby id for the error message element. */
  errorId?: string
  /** Validation error message; renders a role="alert" paragraph when set. */
  errorMessage?: string
}

/**
 * Controlled year picker field with an associated label and optional error message.
 *
 * @param props - Component props.
 * @param props.id - Trigger button id (linked to the label via htmlFor).
 * @param props.label - Visible label text.
 * @param props.value - Controlled numeric value, or null when no year is selected.
 * @param props.onChange - Called with the selected year number or null.
 * @param props.errorId - aria-describedby id for the error message element.
 * @param props.errorMessage - Validation error message; renders a role="alert" paragraph when set.
 * @returns A labelled year picker with error display.
 */
export function PortfolioYearField({
  id,
  label,
  value,
  onChange,
  errorId,
  errorMessage,
}: PortfolioYearFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <YearPicker
        id={id}
        value={value}
        onChange={onChange}
        aria-describedby={errorId}
        hasError={errorMessage !== undefined}
        className="h-9"
      />
      {errorMessage && (
        <p
          id={errorId}
          role="alert"
          className="text-destructive text-sm"
        >
          {errorMessage}
        </p>
      )}
    </div>
  )
}
