import { useTranslation } from 'react-i18next'

import type { ProjectWorkItem } from '@/entities/work-item'
import { PRIORITY_ICON } from '@/features/work-item-board'
import { LabelBadge, MarkdownContent } from '@/shared/components'

import { TaskIdCell } from './TaskIdCell'

function personName(p: { firstName: string; lastName: string } | null | undefined): string {
  return p ? `${p.firstName} ${p.lastName}` : '—'
}

function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(iso),
  )
}

interface WorkItemDetailsTabContentProps {
  workItem: ProjectWorkItem
}

/**
 * Details tab body: description, task ID, column, priority, due date, assignee, labels, and audit fields.
 * @param root0 - Component props.
 * @param root0.workItem - The work item whose details to display.
 * @returns The details tab content element.
 */
export function WorkItemDetailsTabContent({ workItem }: WorkItemDetailsTabContentProps) {
  const { t } = useTranslation()

  return (
    <>
      {workItem.description && (
        <div className="space-y-1">
          <p className="text-muted-foreground text-xs font-medium">
            {t('entities.workItem.fields.description', 'Description')}
          </p>
          <MarkdownContent value={workItem.description} />
        </div>
      )}
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <dt className="text-muted-foreground">{t('entities.workItem.fields.id', 'Task ID')}</dt>
        <dd>
          <TaskIdCell id={workItem.id} />
        </dd>

        {workItem.boardColumn && (
          <>
            <dt className="text-muted-foreground">
              {t('entities.workItem.fields.column', 'Column')}
            </dt>
            <dd>{workItem.boardColumn.name}</dd>
          </>
        )}

        <dt className="text-muted-foreground">
          {t('entities.workItem.fields.priority', 'Priority')}
        </dt>
        <dd>
          {workItem.priority ? (
            <span className="inline-flex items-center gap-1.5">
              {(() => {
                const entry = PRIORITY_ICON[workItem.priority]
                if (!entry) return null
                const Icon = entry.icon
                return <Icon className={`h-4 w-4 ${entry.className}`} />
              })()}
              {t(`entities.workItem.priority.${workItem.priority}`, workItem.priority)}
            </span>
          ) : (
            '—'
          )}
        </dd>

        <dt className="text-muted-foreground">
          {t('entities.workItem.fields.dueDate', 'Due Date')}
        </dt>
        <dd>{workItem.dueDate ?? '—'}</dd>

        <dt className="text-muted-foreground">
          {t('entities.workItem.fields.assignee', 'Assignee')}
        </dt>
        <dd>{personName(workItem.assignee)}</dd>

        {!!workItem.labels?.length && (
          <>
            <dt className="text-muted-foreground">
              {t('entities.workItem.fields.labels', 'Labels')}
            </dt>
            <dd className="flex flex-wrap gap-1">
              {workItem.labels.map((label) => (
                <LabelBadge
                  key={label.id}
                  name={label.name}
                  color={label.color}
                />
              ))}
            </dd>
          </>
        )}

        <dt className="text-muted-foreground">
          {t('entities.workItem.fields.createdBy', 'Created by')}
        </dt>
        <dd>{personName(workItem.creator)}</dd>
        <dt className="text-muted-foreground">
          {t('entities.workItem.fields.createdAt', 'Created')}
        </dt>
        <dd>{formatDateTime(workItem.createdAt)}</dd>
        <dt className="text-muted-foreground">
          {t('entities.workItem.fields.updatedBy', 'Updated by')}
        </dt>
        <dd>{personName(workItem.updater)}</dd>
        <dt className="text-muted-foreground">
          {t('entities.workItem.fields.updatedAt', 'Updated')}
        </dt>
        <dd>{formatDateTime(workItem.updatedAt)}</dd>
      </dl>
    </>
  )
}
