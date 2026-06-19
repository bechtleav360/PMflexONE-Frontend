import type { Ref } from 'react'

import { useTranslation } from 'react-i18next'

import type { MatrixPosition } from '@/entities/stakeholder'

import { QUADRANT_OVERLAYS, ZONE_COLOURS } from '../utils/matrixZones'
import { AxisArrows } from './AxisArrows'

// Quadrant order: top-left, top-right, bottom-left, bottom-right
// (CSS grid rows go top→bottom; y axis goes low→high bottom→top)
// colOffset/rowOffset are the global 6×6 cell coordinates of the quadrant's top-left cell
const QUADRANTS = [
  { zone: 'zone-keep-satisfied', borderRadius: '10px 0 0 0', colOffset: 0, rowOffset: 0 }, // x<0.5, y>=0.5
  { zone: 'zone-manage-closely', borderRadius: '0 10px 0 0', colOffset: 3, rowOffset: 0 }, // x>=0.5, y>=0.5
  { zone: 'zone-monitor', borderRadius: '0 0 0 10px', colOffset: 0, rowOffset: 3 }, // x<0.5, y<0.5
  { zone: 'zone-keep-informed', borderRadius: '0 0 10px 0', colOffset: 3, rowOffset: 3 }, // x>=0.5, y<0.5
] as const

const CELLS_PER_QUADRANT = 3

const LBL_CLS =
  'text-[11px] font-semibold text-muted-foreground select-none whitespace-nowrap leading-tight'

/** A single read-only dot rendered in overview mode. */
export interface OverviewDot {
  id: string
  position: MatrixPosition
  label?: string
}

/** Props for {@link InfluenceAttitudeMatrix}. */
export interface InfluenceAttitudeMatrixProps {
  /** Current dot position in [0,1]×[0,1] coords */
  dotPosition?: MatrixPosition | null
  /** Ghost dot at saved position shown while dragging */
  ghostDotPosition?: MatrixPosition | null
  /** Read-only dots for overview mode */
  overviewDots?: OverviewDot[]
  /** Called on mousedown anywhere on the grid */
  onGridMouseDown?: (e: React.MouseEvent<HTMLDivElement>) => void
  onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>
  tabIndex?: number
  /** Forwarded to inner grid for bounding-rect calculations */
  innerRef?: Ref<HTMLDivElement>
  /** Called with CSS col/row (0-based from top-left) when a cell is clicked in overview mode */
  onCellClick?: (col: number, row: number) => void
  /** Currently selected cell in CSS col/row coordinates */
  selectedCell?: { col: number; row: number } | null
}

/**
 * Low-level influence-attitude matrix rendering primitive.
 *
 * Renders the 2×2 quadrant backgrounds, 6×6 cell overlay, axis arrows and labels,
 * an interactive dot, an optional ghost dot (shown during drag), and read-only
 * overview dots with count badges. Delegates all interaction handling to the caller.
 *
 * @param props - Component props (see {@link InfluenceAttitudeMatrixProps}).
 * @returns A fully rendered influence-attitude matrix layout.
 */
// eslint-disable-next-line max-lines-per-function -- dense rendering primitive: quadrant backgrounds, cell grid overlay, interactive dot, ghost dot, and overview dots cannot be meaningfully split without degrading locality
export function InfluenceAttitudeMatrix({
  dotPosition,
  ghostDotPosition,
  overviewDots,
  onGridMouseDown,
  onKeyDown,
  tabIndex,
  innerRef,
  onCellClick,
  selectedCell,
}: InfluenceAttitudeMatrixProps) {
  const { t } = useTranslation()

  function absDot(pos: MatrixPosition, extra?: React.CSSProperties): React.CSSProperties {
    return {
      position: 'absolute',
      left: `${pos.x * 100}%`,
      top: `${(1 - pos.y) * 100}%`,
      transform: 'translate(-50%, -50%)',
      ...extra,
    }
  }

  return (
    <div className="@container flex w-full flex-col gap-0">
      <div className="flex items-stretch gap-1">
        {/* Y-axis title */}
        <div
          className="flex w-4 shrink-0 items-center justify-center"
          aria-hidden="true"
        >
          <span
            className="text-muted-foreground text-[11px] whitespace-nowrap select-none"
            style={{
              writingMode: 'vertical-rl',
              transform: 'rotate(180deg)',
              letterSpacing: '.05em',
            }}
          >
            {t('pages.stakeholderRegister.matrix.influenceLabel')}
          </span>
        </div>

        {/* Padded wrapper — cross arrows are absolute children */}
        <div
          className="relative flex-1"
          style={{ padding: '26px 22px' }}
        >
          {/* 2×2 quadrant grid */}
          {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- role="application" widget with keyboard handler — a11y interaction rules do not apply to declared application landmark */}
          <div
            ref={innerRef}
            role="application"
            aria-label={t('pages.stakeholderRegister.matrix.sectionTitle')}
            className="relative grid aspect-square w-full grid-cols-2 grid-rows-2"
            style={{ gap: 14, background: 'var(--color-background)' }}
            onMouseDown={onGridMouseDown}
            onKeyDown={onKeyDown}
            tabIndex={tabIndex}
          >
            {/* Quadrant backgrounds with watermarks and 3×3 cell indicator grid */}
            {QUADRANTS.map(({ zone, borderRadius, colOffset, rowOffset }) => {
              const overlay = QUADRANT_OVERLAYS.find((o) => o.zone === zone)!
              const { Icon, strategyKey } = overlay
              return (
                <div
                  key={zone}
                  className={`relative flex items-center justify-center overflow-hidden ${ZONE_COLOURS[zone]}`}
                  style={{ borderRadius }}
                  aria-hidden="true"
                >
                  <div className="pointer-events-none flex flex-col items-center gap-3 p-2">
                    <Icon className="text-foreground/15 size-8 @sm:size-12 @md:size-16 @lg:size-20" />
                    <span className="text-foreground/25 px-4 text-center text-sm leading-tight font-normal @sm:text-base @md:text-lg @lg:text-xl">
                      {t(`pages.stakeholderRegister.matrix.strategyValues.${strategyKey}`)}
                    </span>
                  </div>

                  {/* 3×3 cell grid overlay — stays inside the quadrant, never bleeds into the gap */}
                  <div
                    className={`absolute inset-0 grid ${onCellClick ? '' : 'pointer-events-none'}`}
                    style={{
                      gridTemplateColumns: `repeat(${CELLS_PER_QUADRANT}, 1fr)`,
                      gridTemplateRows: `repeat(${CELLS_PER_QUADRANT}, 1fr)`,
                    }}
                  >
                    {Array.from({ length: CELLS_PER_QUADRANT * CELLS_PER_QUADRANT }, (_, i) => {
                      const localCol = i % CELLS_PER_QUADRANT
                      const localRow = Math.floor(i / CELLS_PER_QUADRANT)
                      const col = colOffset + localCol
                      const row = rowOffset + localRow
                      const isSelected = selectedCell?.col === col && selectedCell?.row === row
                      if (onCellClick) {
                        return (
                          <button
                            key={`${col}-${row}`}
                            type="button"
                            className={`border-foreground/10 border transition-colors ${
                              isSelected ? 'bg-foreground/10' : 'hover:bg-foreground/5'
                            }`}
                            onClick={() => onCellClick(col, row)}
                            aria-label={t('pages.stakeholderRegister.matrix.cellAriaLabel', {
                              x: col,
                              y: 5 - row,
                            })}
                          />
                        )
                      }
                      return (
                        <div
                          key={`${col}-${row}`}
                          className="border-foreground/10 border"
                        />
                      )
                    })}
                  </div>
                </div>
              )
            })}

            {/* Ghost dot (saved position while dragging) */}
            {ghostDotPosition && (
              <div
                aria-hidden="true"
                style={absDot(ghostDotPosition, {
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: 'var(--color-primary)',
                  opacity: 0.25,
                  border: '2px solid var(--color-background)',
                  zIndex: 8,
                  pointerEvents: 'none',
                })}
              />
            )}

            {/* Interactive dot */}
            {dotPosition && (
              <div
                data-testid="matrix-dot"
                aria-hidden="true"
                style={absDot(dotPosition, {
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: 'var(--color-primary)',
                  border: '2px solid var(--color-background)',
                  boxShadow: '0 2px 6px var(--color-shadow-overlay)',
                  zIndex: 10,
                  cursor: onGridMouseDown ? 'grab' : 'default',
                  pointerEvents: 'none',
                })}
              />
            )}

            {/* Overview dots */}
            {overviewDots?.map((d) => (
              <div
                key={d.id}
                role="img"
                title={d.label}
                aria-label={d.label}
                data-testid="overview-dot"
                style={absDot(d.position, {
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  background: 'var(--color-primary)',
                  border: '1.5px solid var(--color-background)',
                  boxShadow: '0 1px 4px var(--color-shadow-overlay)',
                  zIndex: 10,
                  pointerEvents: 'none',
                  cursor: 'default',
                })}
              />
            ))}
          </div>

          <AxisArrows
            highLabel={t('pages.stakeholderRegister.matrix.axisLabels.HIGH')}
            lowLabel={t('pages.stakeholderRegister.matrix.axisLabels.LOW')}
            lblCls={LBL_CLS}
          />
        </div>
      </div>

      {/* X-axis title */}
      <p
        className="text-muted-foreground mt-1 text-center text-[11px] select-none"
        style={{ letterSpacing: '.04em', paddingLeft: 18 }}
        aria-hidden="true"
      >
        {t('pages.stakeholderRegister.matrix.affectednessLabel')}
      </p>
    </div>
  )
}
