import { KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'

/**
 * Configures dnd-kit sensors for column drag-and-drop reordering.
 * @returns An object with `sensors` ready to pass to `DndContext`.
 */
export function useTableColumnReorderDnd() {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  return { sensors }
}
