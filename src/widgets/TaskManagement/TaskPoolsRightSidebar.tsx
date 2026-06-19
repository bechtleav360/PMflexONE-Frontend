import { useCallback } from 'react'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { SidebarOnboardingHint } from '@/features/work-item-board'
import type { ScopeType } from '@/shared/types/scopeType'

import { SidebarPanelContent } from './SidebarPanelContent'
import { useResizeDrag } from './useResizeDrag'
import { useRightSidebarStore } from './useRightSidebarStore'

interface TaskPoolsRightSidebarProps {
  scopeType: ScopeType
  scopeId: string
  assignedWorkItemIds?: ReadonlySet<string>
  currentBoardId?: string
  onSelect: (id: string) => void
  onCreateTask: () => void
}

/**
 * Fixed right sidebar with two tabs: Active Tasks and Archive.
 * Overlays board content, toggled via a button, width is drag-resizable.
 * @param root0 - Component props.
 * @param root0.scopeType - The scope entity type.
 * @param root0.scopeId - The scope entity ID.
 * @param root0.assignedWorkItemIds - IDs of work items already assigned to a board column.
 * @param root0.currentBoardId - ID of the currently active board.
 * @param root0.onSelect - Called when the user clicks a task row.
 * @param root0.onCreateTask - Called when the user clicks "Create task".
 * @returns The sidebar toggle button and optional sidebar panel.
 */
export function TaskPoolsRightSidebar({
  scopeType,
  scopeId,
  assignedWorkItemIds,
  currentBoardId = '',
  onSelect,
  onCreateTask,
}: TaskPoolsRightSidebarProps) {
  const { t } = useTranslation()
  const isOpen = useRightSidebarStore((s) => s.isOpen)
  const activeTab = useRightSidebarStore((s) => s.activeTab)
  const widthPx = useRightSidebarStore((s) => s.widthPx)
  const toggle = useRightSidebarStore((s) => s.toggle)
  const setActiveTab = useRightSidebarStore((s) => s.setActiveTab)
  const setWidthPxRaw = useRightSidebarStore((s) => s.setWidthPx)
  const setWidthPx = useCallback((w: number) => setWidthPxRaw(w), [setWidthPxRaw])
  const handleDragStart = useResizeDrag(widthPx, setWidthPx)

  return (
    <>
      <SidebarOnboardingHint>
        <button
          type="button"
          onClick={toggle}
          aria-label={
            isOpen
              ? t('widgets.taskManagement.rightSidebar.close', 'Close task panel')
              : t('widgets.taskManagement.rightSidebar.open', 'Open task panel')
          }
          className="bg-muted/80 hover:bg-muted fixed top-1/2 z-40 flex h-12 w-5 -translate-y-1/2 cursor-pointer items-center justify-center rounded-l-md border border-r-0 shadow-md transition-all"
          style={{ right: isOpen ? widthPx : 0 }}
        >
          {isOpen ? (
            <ChevronRight className="text-muted-foreground h-3 w-3" />
          ) : (
            <ChevronLeft className="text-muted-foreground h-3 w-3" />
          )}
        </button>
      </SidebarOnboardingHint>

      {isOpen && (
        <SidebarPanelContent
          widthPx={widthPx}
          handleDragStart={handleDragStart}
          toggle={toggle}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          scopeType={scopeType}
          scopeId={scopeId}
          assignedWorkItemIds={assignedWorkItemIds}
          currentBoardId={currentBoardId}
          onSelect={onSelect}
          onCreateTask={onCreateTask}
        />
      )}
    </>
  )
}
