/**
 * Yellow accent bar at the left edge of a button/link row — inset top/bottom, rounded-r.
 * @returns An aria-hidden span positioned absolutely on the left edge.
 */
export function ActiveBar() {
  return (
    <span
      aria-hidden="true"
      className="bg-accent-active pointer-events-none absolute top-2 bottom-2 left-0 w-[3px] rounded-r-sm"
    />
  )
}
