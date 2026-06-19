import { useState } from 'react'

import { Pencil } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import type { StrategyDescription } from '@/entities/stakeholder'
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components'
import type { ScopeType } from '@/shared/types/scopeType'

import { StrategyDescriptionsEditForm } from './StrategyDescriptionsEditForm'

/** Props for {@link StrategyDescriptionsForm}. */
export interface StrategyDescriptionsFormProps {
  scopeType: ScopeType
  scopeId: string
  initialValues?: StrategyDescription | null
}

/**
 * Read-only display of strategy description quadrants with an edit trigger.
 *
 * Renders the four strategy description fields (Monitor, Keep Informed,
 * Keep Satisfied, Manage Closely) in read-only mode. An edit button opens
 * a dialog with {@link StrategyDescriptionsEditForm} for in-place editing.
 *
 * @param props - Component props.
 * @param props.scopeType - The type of scope (Project, Program, Portfolio).
 * @param props.scopeId - The ID of the scope.
 * @param props.initialValues - Existing strategy descriptions to display.
 * @returns A section with read-only strategy descriptions and an edit button.
 */
export function StrategyDescriptionsForm({
  scopeType,
  scopeId,
  initialValues,
}: StrategyDescriptionsFormProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const fields = [
    {
      name: 'monitor',
      label: t('pages.stakeholderRegister.strategyConfig.monitorLabel'),
      value: initialValues?.monitor,
    },
    {
      name: 'keepInformed',
      label: t('pages.stakeholderRegister.strategyConfig.keepInformedLabel'),
      value: initialValues?.keepInformed,
    },
    {
      name: 'keepSatisfied',
      label: t('pages.stakeholderRegister.strategyConfig.keepSatisfiedLabel'),
      value: initialValues?.keepSatisfied,
    },
    {
      name: 'manageClosely',
      label: t('pages.stakeholderRegister.strategyConfig.manageCloselyLabel'),
      value: initialValues?.manageClosely,
    },
  ]

  return (
    <section aria-label={t('pages.stakeholderRegister.strategyConfig.sectionTitle')}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {t('pages.stakeholderRegister.strategyConfig.sectionTitle')}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen(true)}
          aria-label={t('pages.stakeholderRegister.strategyConfig.editButton')}
        >
          <Pencil className="size-4" />
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        {fields.map(({ name, label, value }) => (
          <div key={name}>
            <p className="text-sm font-medium">{label}</p>
            <p className="text-muted-foreground text-sm whitespace-pre-wrap">{value ?? '–'}</p>
          </div>
        ))}
      </div>

      <Dialog
        open={open}
        onOpenChange={setOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('pages.stakeholderRegister.strategyConfig.sectionTitle')}</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <StrategyDescriptionsEditForm
              scopeType={scopeType}
              scopeId={scopeId}
              initialValues={initialValues}
              onSuccess={() => setOpen(false)}
            />
          </DialogBody>
        </DialogContent>
      </Dialog>
    </section>
  )
}
