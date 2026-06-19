import { useTranslation } from 'react-i18next'

import { Button, Tabs, TabsContent } from '@/shared/components'
import type { ScopeType } from '@/shared/types/scopeType'

import { BoardTabContent } from './BoardTabContent'
import { WidgetErrorBoundary } from './WidgetErrorBoundary'

interface TaskBoardSectionProps {
  boardsLoading: boolean
  boards: Array<{ id: string; name: string }>
  activeBoardId: string | null
  scopeType: ScopeType
  onBoardChange: (boardId: string) => void
  onCreateBoard: () => void
  onBoardDeleted: (deletedId: string) => void
  onSelect?: (workItemId: string) => void
  onAddTask?: (columnId: string) => void
}

/**
 * Renders the board content area or the empty-state prompt depending on loading and data state.
 * Board switching is driven by the activeBoardId prop; the tab nav row is intentionally omitted
 * since the active board name is shown in the page heading.
 * @param root0 - Component props.
 * @param root0.boardsLoading - Whether the boards list is still loading.
 * @param root0.boards - The list of available boards.
 * @param root0.activeBoardId - The ID of the currently selected board.
 * @param root0.scopeType - The scope entity type — forwarded to each board tab for mutation context.
 * @param root0.onBoardChange - Called when the active board tab changes.
 * @param root0.onCreateBoard - Called when the user clicks "New Board".
 * @param root0.onSelect - Called when the user clicks a card to open the detail panel.
 * @param root0.onAddTask - Called with the column ID when the user clicks "Add a task".
 * @param root0.onBoardDeleted - Called with the deleted board's ID so the parent can update selection state.
 * @returns The board section element, a loading placeholder, or an empty-state prompt.
 */
export function TaskBoardSection({
  boardsLoading,
  boards,
  activeBoardId,
  scopeType,
  onBoardChange,
  onCreateBoard,
  onSelect,
  onAddTask,
}: TaskBoardSectionProps) {
  const { t } = useTranslation()

  if (boardsLoading) return null

  if (boards.length === 0) {
    return (
      <div className="text-muted-foreground flex flex-1 flex-col items-center justify-center gap-3">
        <p>{t('widgets.taskManagement.noBoards', 'No boards yet.')}</p>
        <Button onClick={onCreateBoard}>
          {t('widgets.taskManagement.createBoard', 'New Board')}
        </Button>
      </div>
    )
  }

  if (!activeBoardId) return null

  return (
    <Tabs
      value={activeBoardId}
      onValueChange={onBoardChange}
      className="flex h-full flex-col"
    >
      {boards.map((board) => (
        <TabsContent
          key={board.id}
          value={board.id}
          className="min-h-0 flex-1 overflow-auto"
        >
          <WidgetErrorBoundary>
            <BoardTabContent
              boardId={board.id}
              scopeType={scopeType}
              onSelect={onSelect}
              onAddTask={onAddTask}
            />
          </WidgetErrorBoundary>
        </TabsContent>
      ))}
    </Tabs>
  )
}
