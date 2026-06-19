// Decorative character rendered aria-hidden — not translatable i18n text.
const ASTERISK = '*'

/**
 * Visual indicator for required form fields.
 *
 * Renders a red asterisk that is hidden from assistive technology.
 * Screen readers rely on `aria-required` on the corresponding input instead.
 *
 * @returns A decorative asterisk span.
 */
export function RequiredMark() {
  return (
    <span
      className="text-destructive ml-0.5"
      aria-hidden
    >
      {ASTERISK}
    </span>
  )
}
