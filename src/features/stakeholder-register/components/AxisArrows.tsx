/** Props for {@link AxisArrows}. */
interface AxisArrowsProps {
  highLabel: string
  lowLabel: string
  lblCls: string
}

/**
 * Renders the vertical and horizontal cross-arrow overlays for the influence-attitude matrix.
 *
 * Both arrows are `pointer-events-none absolute` positioned so they sit on top of the
 * quadrant grid without interfering with user interaction.
 *
 * @param props - Component props.
 * @param props.highLabel - Translated label for the HIGH axis end.
 * @param props.lowLabel - Translated label for the LOW axis end.
 * @param props.lblCls - Shared CSS class string applied to all axis labels.
 * @returns Two axis-arrow divs (vertical and horizontal).
 */
export function AxisArrows({ highLabel, lowLabel, lblCls }: AxisArrowsProps) {
  return (
    <>
      {/* Vertical cross arrow (Degree of influence) */}
      <div
        className="text-muted-foreground pointer-events-none absolute top-0 bottom-0 flex flex-col items-center"
        style={{ left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}
        aria-hidden="true"
      >
        <span className={`${lblCls} mb-0.5`}>{highLabel}</span>
        <svg
          width="10"
          height="7"
          viewBox="0 0 10 7"
          style={{ flexShrink: 0 }}
        >
          <polygon
            points="5,0 0,7 10,7"
            fill="currentColor"
          />
        </svg>
        <div
          className="flex-1 bg-current"
          style={{ width: '1.5px' }}
        />
        <svg
          width="10"
          height="7"
          viewBox="0 0 10 7"
          style={{ flexShrink: 0 }}
        >
          <polygon
            points="5,7 0,0 10,0"
            fill="currentColor"
          />
        </svg>
        <span className={`${lblCls} mt-0.5`}>{lowLabel}</span>
      </div>

      {/* Horizontal cross arrow (Degree of affectedness) */}
      <div
        className="text-muted-foreground pointer-events-none absolute right-0 left-0 flex items-center"
        style={{ top: '50%', transform: 'translateY(-50%)', zIndex: 10 }}
        aria-hidden="true"
      >
        <span
          className={`${lblCls} mr-0.5`}
          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
        >
          {lowLabel}
        </span>
        <svg
          width="7"
          height="10"
          viewBox="0 0 7 10"
          style={{ flexShrink: 0 }}
        >
          <polygon
            points="0,5 7,0 7,10"
            fill="currentColor"
          />
        </svg>
        <div
          className="flex-1 bg-current"
          style={{ height: '1.5px' }}
        />
        <svg
          width="7"
          height="10"
          viewBox="0 0 7 10"
          style={{ flexShrink: 0 }}
        >
          <polygon
            points="7,5 0,0 0,10"
            fill="currentColor"
          />
        </svg>
        <span
          className={`${lblCls} ml-0.5`}
          style={{ writingMode: 'vertical-rl' }}
        >
          {highLabel}
        </span>
      </div>
    </>
  )
}
