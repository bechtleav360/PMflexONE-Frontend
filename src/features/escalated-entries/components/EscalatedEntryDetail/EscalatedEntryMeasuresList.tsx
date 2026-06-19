import { useState } from 'react'

import { useTranslation } from 'react-i18next'

import { Button } from '@/shared/components'
import { Input } from '@/shared/components/Input'

import { useCreateEscalationMeasure } from '../../hooks/useCreateEscalationMeasure'
import { useDeleteEscalationMeasure } from '../../hooks/useDeleteEscalationMeasure'
import type { EscalationMeasure } from '../../types/escalatedEntry.types'

interface EscalatedEntryMeasuresListProps {
  escalatedEntryId: string
  measures: EscalationMeasure[]
  /** When true, add and remove controls are hidden. */
  isLocked?: boolean
}

/**
 * Displays and manages the ordered list of action measures for an escalated entry.
 * Items are sorted by position ascending. Supports adding and removing measures.
 *
 * @param root0 - Component props.
 * @param root0.escalatedEntryId - ID of the parent escalated entry.
 * @param root0.measures - Current measures array (unsorted; sorted here by position).
 * @param root0.isLocked - When true, add and remove controls are hidden.
 * @returns The measures list with add/remove controls.
 */
export function EscalatedEntryMeasuresList({
  escalatedEntryId,
  measures,
  isLocked = false,
}: EscalatedEntryMeasuresListProps) {
  const { t } = useTranslation()
  const [input, setInput] = useState('')
  const { mutate: createMeasure, isPending: isCreating } = useCreateEscalationMeasure()
  const { mutate: deleteMeasure } = useDeleteEscalationMeasure(escalatedEntryId)

  const sorted = [...measures].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))

  function handleAdd() {
    const content = input.trim()
    if (!content) return
    createMeasure({ escalatedEntryId, content }, { onSuccess: () => setInput('') })
  }

  return (
    <div className="flex flex-col gap-2">
      {sorted.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          {t('features.escalatedEntries.measures.empty')}
        </p>
      ) : (
        <ol className="flex flex-col gap-1">
          {sorted.map((measure) => (
            <li
              key={measure.id}
              className="flex items-center gap-2 text-sm"
            >
              <span className="flex-1">{measure.content}</span>
              {!isLocked && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteMeasure(measure.id)}
                >
                  {t('features.escalatedEntries.measures.remove')}
                </Button>
              )}
            </li>
          ))}
        </ol>
      )}
      {!isLocked && (
        <div className="flex gap-2">
          <Input
            type="text"
            className="flex-1"
            placeholder={t('features.escalatedEntries.measures.addPlaceholder')}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd()
            }}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAdd}
            disabled={isCreating}
          >
            {t('features.escalatedEntries.measures.add')}
          </Button>
        </div>
      )}
    </div>
  )
}
