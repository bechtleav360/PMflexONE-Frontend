import { ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button, Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components'
import type { ScopeType } from '@/shared/types/scopeType'

import { ActivePool } from './ActivePool'
import { ArchivePool } from './ArchivePool'

/** Props for the SidebarPanelContent component. */
export interface SidebarPanelContentProps {
  scopeType: ScopeType
  scopeId: string
  assignedWorkItemIds?: ReadonlySet<string>
  currentBoardId?: string
  onSelect: (id: string) => void
  onCreateTask: () => void
  widthPx: number
  handleDragStart: (e: React.MouseEvent) => void
  toggle: () => void
  activeTab: 'active' | 'archive'
  setActiveTab: (tab: 'active' | 'archive') => void
}

/**
 * Resizable sidebar panel showing Active Tasks and Archive tabs.
 * @param root0 - Component props.
 * @param root0.widthPx - Current panel width in pixels.
 * @param root0.handleDragStart - Mouse-down handler for the resize drag handle.
 * @param root0.toggle - Closes the sidebar.
 * @param root0.activeTab - Currently active tab identifier.
 * @param root0.setActiveTab - Updates the active tab.
 * @param root0.scopeType - The scope entity type.
 * @param root0.scopeId - The scope entity ID.
 * @param root0.assignedWorkItemIds - IDs of work items already on a board column.
 * @param root0.currentBoardId - ID of the currently active board.
 * @param root0.onSelect - Called when the user selects a task.
 * @param root0.onCreateTask - Called when the user clicks "Create task".
 * @returns The sidebar panel element.
 */
export function SidebarPanelContent({
  widthPx,
  handleDragStart,
  toggle,
  activeTab,
  setActiveTab,
  scopeType,
  scopeId,
  assignedWorkItemIds,
  currentBoardId = '',
  onSelect,
  onCreateTask,
}: SidebarPanelContentProps) {
  const { t } = useTranslation()
  return (
    <div
      className="bg-background fixed inset-y-0 right-0 z-30 flex flex-col border-l shadow-xl"
      style={{ width: widthPx }}
    >
      <button
        type="button"
        aria-label={t('widgets.taskManagement.rightSidebar.resize', 'Resize task panel')}
        onMouseDown={handleDragStart}
        className="hover:bg-border active:bg-primary/30 absolute inset-y-0 left-0 w-1 cursor-col-resize"
      />
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as 'active' | 'archive')}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="flex shrink-0 items-center border-b px-4 pt-3 pb-0">
          <TabsList className="h-9">
            <TabsTrigger value="active">
              {t('pages.taskManagement.activePool', 'Active Tasks')}
            </TabsTrigger>
            <TabsTrigger value="archive">
              {t('widgets.taskManagement.rightSidebar.archiveTab', 'Archive')}
            </TabsTrigger>
          </TabsList>
          <Button
            size="sm"
            variant="ghost"
            className="ml-auto"
            onClick={toggle}
            aria-label={t('widgets.taskManagement.rightSidebar.close', 'Close task panel')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <TabsContent
          value="active"
          className="mt-0 min-h-0 flex-1 overflow-y-auto px-4 py-3"
        >
          <ActivePool
            scopeType={scopeType}
            scopeId={scopeId}
            assignedWorkItemIds={assignedWorkItemIds}
            currentBoardId={currentBoardId}
            onSelect={onSelect}
            onCreateTask={onCreateTask}
          />
        </TabsContent>
        <TabsContent
          value="archive"
          className="mt-0 min-h-0 flex-1 overflow-y-auto px-4 py-3"
        >
          <ArchivePool
            scopeType={scopeType}
            scopeId={scopeId}
            onSelect={onSelect}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
