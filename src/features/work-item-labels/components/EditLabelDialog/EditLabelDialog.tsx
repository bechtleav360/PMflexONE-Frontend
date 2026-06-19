import { useEffect } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { ChangeHistoryPanel, useLabels } from '@/entities/work-item'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Form,
} from '@/shared/components'
import { FALLBACK_LABEL_COLOR } from '@/shared/components/LabelBadge'
import type { ScopeType } from '@/shared/types/scopeType'

import { useUpdateLabel } from '../../hooks/useUpdateLabel'
import { useEditLabelDialogStore } from '../../store/labelDialogStores'
import { labelFormSchema, type LabelFormValues } from '../../utils/labelFormSchema'
import { LabelFormFields } from './LabelFormFields'

interface EditLabelDialogProps {
  scopeType: ScopeType
  scopeId: string
}

/**
 * Dialog for editing an existing label's name and ARGB color.
 *
 * @param props - Scope context used to look up the label being edited.
 * @returns The rendered edit-label dialog.
 */
export function EditLabelDialog({ scopeType, scopeId }: EditLabelDialogProps) {
  const { t } = useTranslation()
  const open = useEditLabelDialogStore((s) => s.open)
  const payload = useEditLabelDialogStore((s) => s.payload)
  const closeModal = useEditLabelDialogStore((s) => s.closeModal)
  const { mutateAsync, isPending } = useUpdateLabel(scopeType, scopeId)
  const { data: labels = [] } = useLabels(scopeType, scopeId)
  const label = labels.find((l) => l.id === payload?.labelId)
  const form = useForm<LabelFormValues>({
    resolver: zodResolver(labelFormSchema),
    defaultValues: { name: '', color: FALLBACK_LABEL_COLOR },
  })

  useEffect(() => {
    if (label) form.reset({ name: label.name, color: label.color ?? FALLBACK_LABEL_COLOR })
  }, [label, form])

  async function onSubmit(values: LabelFormValues) {
    if (!label) return
    try {
      await mutateAsync({ id: label.id, version: label.version, ...values })
      closeModal()
    } catch {
      /* onError in hook handles user-facing feedback */
    }
  }
  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) {
      closeModal()
      form.reset()
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      <DialogContent
        className="sm:max-w-md"
        aria-describedby={undefined}
      >
        <DialogHeader>
          <DialogTitle>{t('features.workItemLabels.editDialog.title', 'Edit Label')}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <Form {...form}>
            <LabelFormFields
              form={form}
              isPending={isPending}
              onCancel={() => handleOpenChange(false)}
              onSubmit={onSubmit}
            />
          </Form>
          {label && (
            <>
              <hr className="my-2" />
              <ChangeHistoryPanel
                entityType="label"
                entityId={label.id}
                isOpen={open}
              />
            </>
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
