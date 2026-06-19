import { useCallback, useEffect, useRef } from 'react'

const MIN_WIDTH_PX = 280
const MAX_WIDTH_PX = 800

/**
 * Handles mouse-drag resizing for the right sidebar.
 * Registers global `mousemove` and `mouseup` listeners while dragging.
 * @param widthPx - Current sidebar width in pixels.
 * @param setWidthPx - Setter to update the sidebar width.
 * @returns `handleDragStart` — mouse-down handler to attach to the resize handle element.
 */
export function useResizeDrag(widthPx: number, setWidthPx: (w: number) => void) {
  const isDragging = useRef(false)
  const dragStartX = useRef(0)
  const dragStartWidth = useRef(0)

  const handleDragStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      isDragging.current = true
      dragStartX.current = e.clientX
      dragStartWidth.current = widthPx
    },
    [widthPx],
  )

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!isDragging.current) return
      const delta = dragStartX.current - e.clientX
      setWidthPx(Math.max(MIN_WIDTH_PX, Math.min(MAX_WIDTH_PX, dragStartWidth.current + delta)))
    }
    function onMouseUp() {
      isDragging.current = false
    }
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
  }, [setWidthPx])

  return handleDragStart
}
