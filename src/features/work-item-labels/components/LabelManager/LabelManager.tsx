import { useTranslation } from 'react-i18next'

import { useLabels } from '@/entities/work-item'
import { Button } from '@/shared/components'
import { LabelBadge } from '@/shared/components/LabelBadge'
import type { ScopeType } from '@/shared/types/scopeType'

import { useDeleteLabel } from '../../hooks/useDeleteLabel'
import { useCreateLabelDialogStore, useEditLabelDialogStore } from '../../store/labelDialogStores'

interface LabelManagerProps {
  scopeType: ScopeType
  scopeId: string
}

/**
 * Lists, creates, edits, and deletes labels within a scope.
 * @param root0 - Component props.
 * @param root0.scopeType - The scope type (e.g. 'Project').
 * @param root0.scopeId - The ID of the scope.
 * @returns The label manager element.
 */
export function LabelManager({ scopeType, scopeId }: LabelManagerProps) {
  const { t } = useTranslation()
  const { data: labels = [], isLoading } = useLabels(scopeType, scopeId)
  const { mutateAsync: deleteLabel } = useDeleteLabel(scopeType, scopeId)
  const openCreate = useCreateLabelDialogStore((s) => s.openModal)
  const openEdit = useEditLabelDialogStore((s) => s.openModal)

  async function handleDelete(id: string, version: number) {
    try {
      await deleteLabel({ id, version })
    } catch {
      // onError in hook handles user-facing feedback
    }
  }

  return (
    <section aria-label={t('features.workItemLabels.manager', 'Label Manager')}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">{t('features.workItemLabels.manager', 'Labels')}</h3>
        <Button
          size="sm"
          variant="outline"
          onClick={() => openCreate()}
          aria-label={t('features.workItemLabels.createLabel', 'Create label')}
        >
          {t('features.workItemLabels.createLabel', 'Create label')}
        </Button>
      </div>

      {isLoading && (
        <p className="text-muted-foreground text-sm">{t('common.loading', 'Loading…')}</p>
      )}

      {!isLoading && labels.length === 0 && (
        <p className="text-muted-foreground text-sm">
          {t('features.workItemLabels.noLabels', 'No labels yet.')}
        </p>
      )}

      <ul className="space-y-1">
        {labels.map((label) => (
          <li
            key={label.id}
            className="bg-card flex items-center justify-between rounded-md border px-3 py-1.5"
          >
            <LabelBadge
              name={label.name}
              color={label.color}
            />
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => openEdit({ labelId: label.id })}
                aria-label={t('features.workItemLabels.editLabel', { name: label.name })}
              >
                {t('common.edit', 'Edit')}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDelete(label.id, label.version)}
                aria-label={t('features.workItemLabels.deleteLabel', { name: label.name })}
              >
                {t('common.delete', 'Delete')}
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
