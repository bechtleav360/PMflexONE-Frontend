/**
 * Six-dot grip icon used in column drag handles and drag overlays.
 * @param props - Component props.
 * @param props.className - Optional class name forwarded to the SVG element.
 * @returns An aria-hidden SVG with six dots arranged in a 2×3 grid.
 */
export function GripDotsIcon({ className }: { className?: string }) {
  return (
    <svg
      width="10"
      height="14"
      viewBox="0 0 10 14"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <circle
        cx="2.5"
        cy="2"
        r="1.2"
      />
      <circle
        cx="2.5"
        cy="7"
        r="1.2"
      />
      <circle
        cx="2.5"
        cy="12"
        r="1.2"
      />
      <circle
        cx="7.5"
        cy="2"
        r="1.2"
      />
      <circle
        cx="7.5"
        cy="7"
        r="1.2"
      />
      <circle
        cx="7.5"
        cy="12"
        r="1.2"
      />
    </svg>
  )
}
