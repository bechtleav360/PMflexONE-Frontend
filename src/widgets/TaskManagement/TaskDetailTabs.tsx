import { useState, type ReactNode } from 'react'

import { useTranslation } from 'react-i18next'

import {
  ChangeHistoryPanel,
  useBoards,
  usePersons,
  useWorkItem,
  useWorkItemAttachments,
} from '@/entities/work-item'
import { AttachmentList } from '@/features/work-item-attachments'
import { CommentThread } from '@/features/work-item-comments'
import { WorkItemLinksPanel } from '@/features/work-item-links'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components'
import type { ScopeType } from '@/shared/types/scopeType'

import { WorkItemDetailsTabContent } from './WorkItemDetailsTabContent'

interface TaskDetailTabsProps {
  workItemId: string
  scopeType: ScopeType
  scopeId: string
  /** When provided, replaces the Details tab content with this node (edit mode). */
  editContent?: ReactNode
  onOpenWorkItem?: (id: string) => void
}

/**
 * Tabbed detail view for a work item: details, comments, attachments, links, and change history.
 * @param root0 - Component props.
 * @param root0.workItemId - ID of the work item to display.
 * @param root0.scopeType - Entity type owning the work item.
 * @param root0.scopeId - ID of the owning entity.
 * @param root0.editContent - When provided, replaces the Details tab content with this node.
 * @param root0.onOpenWorkItem - Called when the user navigates to a linked work item.
 * @returns A tabbed panel with details, comments, attachments, links, and history tabs.
 */
export function TaskDetailTabs({
  workItemId,
  scopeType,
  scopeId,
  editContent,
  onOpenWorkItem,
}: TaskDetailTabsProps) {
  const { t } = useTranslation()
  const [historyOpen, setHistoryOpen] = useState(false)
  const { data: workItem } = useWorkItem(workItemId)
  const { data: attachments = [], isFetching: isAttachmentsFetching } =
    useWorkItemAttachments(workItemId)
  const { data: persons = [] } = usePersons()
  const { data: boards = [] } = useBoards(scopeType, scopeId)
  const assigneeMap = Object.fromEntries(persons.map((p) => [p.id, `${p.firstName} ${p.lastName}`]))

  const columnMap = Object.fromEntries(boards.flatMap((b) => b.columns.map((c) => [c.id, c.name])))

  return (
    <Tabs
      defaultValue="details"
      className="flex h-full flex-col overflow-hidden"
      onValueChange={(val) => {
        if (val === 'history') setHistoryOpen(true)
      }}
    >
      <TabsList className="mb-3 shrink-0">
        <TabsTrigger value="details">
          {t('widgets.taskManagement.detail.tabs.details', 'Details')}
        </TabsTrigger>
        <TabsTrigger value="comments">
          {t('widgets.taskManagement.detail.tabs.comments', 'Comments')}
        </TabsTrigger>
        <TabsTrigger value="attachments">
          {t('widgets.taskManagement.detail.tabs.attachments', 'Attachments')}
        </TabsTrigger>
        <TabsTrigger value="links">
          {t('widgets.taskManagement.detail.tabs.links', 'Links')}
        </TabsTrigger>
        <TabsTrigger value="history">
          {t('widgets.taskManagement.detail.tabs.history', 'History')}
        </TabsTrigger>
      </TabsList>

      <div className="flex-1 overflow-y-auto">
        <TabsContent
          value="details"
          className="space-y-4"
        >
          {editContent ?? (workItem && <WorkItemDetailsTabContent workItem={workItem} />)}
        </TabsContent>

        <TabsContent value="comments">
          <CommentThread workItemId={workItemId} />
        </TabsContent>

        <TabsContent value="attachments">
          <AttachmentList
            workItemId={workItemId}
            attachments={attachments}
            isFetching={isAttachmentsFetching}
          />
        </TabsContent>

        <TabsContent value="links">
          {workItem && (
            <WorkItemLinksPanel
              workItemId={workItemId}
              links={workItem.links ?? []}
              onOpenWorkItem={onOpenWorkItem}
            />
          )}
        </TabsContent>

        <TabsContent value="history">
          <ChangeHistoryPanel
            entityType="workItem"
            entityId={workItemId}
            isOpen={historyOpen}
            labelMap={Object.fromEntries((workItem?.labels ?? []).map((l) => [l.id, l.name]))}
            assigneeMap={assigneeMap}
            columnMap={columnMap}
          />
        </TabsContent>
      </div>
    </Tabs>
  )
}
