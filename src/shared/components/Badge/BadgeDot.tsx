/**
 * 6 × 6 px indicator dot using `currentColor` — place inside a `<Badge>`.
 * @returns A decorative status dot span, aria-hidden.
 */
export function BadgeDot() {
  return (
    <span
      className="size-1.5 shrink-0 rounded-full bg-current"
      aria-hidden="true"
    />
  )
}
