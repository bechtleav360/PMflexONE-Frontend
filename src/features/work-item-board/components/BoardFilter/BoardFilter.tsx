import { useTranslation } from 'react-i18next'

import { usePersons } from '@/entities/work-item'
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components'

import { useBoardFilterStore } from '../../store/useBoardFilterStore'

interface BoardFilterProps {
  scopeType?: string
  scopeId?: string
}

/**
 * Assignee and label filter controls for the work-item board. Priority is handled by the badge filter bar.
 * @param root0 - Component props.
 * @param root0.scopeType - Reserved for future scope-based filtering.
 * @param root0.scopeId - Reserved for future scope-based filtering.
 * @returns The filter form element.
 */
export function BoardFilter({ scopeType, scopeId }: BoardFilterProps) {
  void scopeType
  void scopeId
  const { t } = useTranslation()
  const { assigneeId, setAssigneeId, reset } = useBoardFilterStore()
  const { data: persons = [] } = usePersons()

  return (
    <form
      aria-label={t('features.workItem.board.filterLabel', 'Filter board')}
      className="flex flex-wrap items-center gap-3"
    >
      <Select
        value={assigneeId ?? ''}
        onValueChange={(v) => setAssigneeId(v || null)}
      >
        <SelectTrigger
          className="w-45"
          aria-label={t('features.workItem.form.assignee', 'Assignee')}
        >
          <SelectValue placeholder={t('features.workItem.form.assignee', 'Assignee')} />
        </SelectTrigger>
        <SelectContent>
          {persons.map((p) => (
            <SelectItem
              key={p.id}
              value={p.id}
            >
              {p.firstName} {p.lastName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={reset}
        aria-label={t('features.workItem.board.resetFilter', 'Reset filters')}
      >
        {t('features.workItem.board.resetFilter', 'Reset')}
      </Button>
    </form>
  )
}
