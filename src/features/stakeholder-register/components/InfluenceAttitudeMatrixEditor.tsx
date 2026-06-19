import { useEffect, useLayoutEffect, useRef, useState } from 'react'

import { useTranslation } from 'react-i18next'

import type { MatrixPosition } from '@/entities/stakeholder'

import { deriveBehaviouralStrategy } from '../utils/behaviouralStrategy'
import { InfluenceAttitudeMatrix } from './InfluenceAttitudeMatrix'

/** Props for {@link InfluenceAttitudeMatrixEditor}. */
export interface InfluenceAttitudeMatrixEditorProps {
  /** Current committed position. */
  value: MatrixPosition | null
  /** Called on every position update (live during drag and on commit). */
  onChange: (pos: MatrixPosition | null) => void
  readOnly?: boolean
}

/** Pixel radius from each centre axis line that counts as "over the arrows". */
const CENTER_HIT_PX = 15

/**
 * Interactive influence-attitude matrix editor.
 *
 * Users can drag or click to position a dot on the 6×6 grid. Arrow-key
 * keyboard navigation is also supported. The component syncs to the
 * `value` prop on external change (e.g. dialog open/reset).
 *
 * @param props - Component props.
 * @param props.value - The current committed matrix position, or `null` if unset.
 * @param props.onChange - Callback invoked with the new position on every update.
 * @param props.readOnly - When `true`, disables all interaction.
 * @returns An interactive matrix grid for placing a stakeholder position dot.
 */
// eslint-disable-next-line max-lines-per-function -- drag/mouse/keyboard event handlers plus prop-to-state sync require co-located refs and state; splitting would scatter tightly coupled interaction logic
export function InfluenceAttitudeMatrixEditor({
  value,
  onChange,
  readOnly = false,
}: InfluenceAttitudeMatrixEditorProps) {
  const { t } = useTranslation()

  const gridRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)
  /** Position before current drag — used to revert when released over centre arrows */
  const savedPosRef = useRef<MatrixPosition | null>(value)
  const onChangeRef = useRef(onChange)

  const [pendingPos, setPendingPos] = useState<MatrixPosition | null>(value)
  /** Ghost dot position: shown at savedPos while dragging, null otherwise */
  const [ghostPos, setGhostPos] = useState<MatrixPosition | null>(null)

  // Keep onChangeRef in sync without reading it during render
  useLayoutEffect(() => {
    onChangeRef.current = onChange
  })

  // Sync when an external value change arrives (e.g. dialog open/reset).
  // useLayoutEffect fires before paint so there is no visual flash.
  // The "adjust during render" alternative is blocked by react-hooks/refs (reading
  // isDraggingRef during render is banned). The isDraggingRef guard prevents circular
  // prop-sync during drag; the pattern is safe.
  useLayoutEffect(() => {
    if (!isDraggingRef.current) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- see comment above
      setPendingPos(value)
      savedPosRef.current = value
    }
  }, [value])

  // Register global drag listeners once
  useEffect(() => {
    function posFromClient(clientX: number, clientY: number): MatrixPosition | null {
      const el = gridRef.current
      if (!el) return null
      const rect = el.getBoundingClientRect()
      return {
        x: Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)),
        y: Math.max(0, Math.min(1, 1 - (clientY - rect.top) / rect.height)),
      }
    }

    function overCenter(clientX: number, clientY: number): boolean {
      const el = gridRef.current
      if (!el) return false
      const rect = el.getBoundingClientRect()
      const dx = Math.abs(clientX - (rect.left + rect.width / 2))
      const dy = Math.abs(clientY - (rect.top + rect.height / 2))
      return dx <= CENTER_HIT_PX || dy <= CENTER_HIT_PX
    }

    function handleMouseMove(e: MouseEvent) {
      if (!isDraggingRef.current) return
      const pos = posFromClient(e.clientX, e.clientY)
      if (!pos) return
      setPendingPos(pos)
      onChangeRef.current(pos)
    }

    function handleMouseUp(e: MouseEvent) {
      if (!isDraggingRef.current) return
      isDraggingRef.current = false
      setGhostPos(null)

      if (overCenter(e.clientX, e.clientY)) {
        const revertTo = savedPosRef.current
        setPendingPos(revertTo)
        onChangeRef.current(revertTo)
      } else {
        const pos = posFromClient(e.clientX, e.clientY)
        if (pos) {
          savedPosRef.current = pos
          setPendingPos(pos)
          onChangeRef.current(pos)
        }
      }
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  function handleGridMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    if (readOnly) return
    e.preventDefault()
    const el = gridRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const pos: MatrixPosition = {
      x: Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / rect.height)),
    }
    savedPosRef.current = pendingPos
    isDraggingRef.current = true
    setGhostPos(pendingPos)
    setPendingPos(pos)
    onChangeRef.current(pos)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (readOnly) return
    const STEP = 0.05
    const cur = pendingPos ?? { x: 0.5, y: 0.5 }
    let next: MatrixPosition | null = null

    switch (e.key) {
      case 'ArrowUp':
        next = { x: cur.x, y: Math.min(1, cur.y + STEP) }
        break
      case 'ArrowDown':
        next = { x: cur.x, y: Math.max(0, cur.y - STEP) }
        break
      case 'ArrowLeft':
        next = { x: Math.max(0, cur.x - STEP), y: cur.y }
        break
      case 'ArrowRight':
        next = { x: Math.min(1, cur.x + STEP), y: cur.y }
        break
    }

    if (next) {
      e.preventDefault()
      savedPosRef.current = next
      setPendingPos(next)
      onChangeRef.current(next)
    }
  }

  const strategy = pendingPos ? deriveBehaviouralStrategy(pendingPos) : null

  return (
    <div className="flex w-full flex-col gap-2">
      <InfluenceAttitudeMatrix
        innerRef={gridRef}
        dotPosition={pendingPos}
        ghostDotPosition={ghostPos}
        onGridMouseDown={readOnly ? undefined : handleGridMouseDown}
        onKeyDown={readOnly ? undefined : handleKeyDown}
        tabIndex={readOnly ? undefined : 0}
      />
      {strategy && (
        <p
          aria-live="polite"
          className="text-muted-foreground text-sm"
        >
          {t('pages.stakeholderRegister.matrix.strategyLabel')}{' '}
          <strong>{t(`pages.stakeholderRegister.matrix.strategyValues.${strategy}`)}</strong>
        </p>
      )}
    </div>
  )
}
