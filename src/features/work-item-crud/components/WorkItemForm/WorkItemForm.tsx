import type { FormEventHandler } from 'react'

import type { UseFormReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { Button, Form } from '@/shared/components'
import type { ScopeType } from '@/shared/types/scopeType'

import type { WorkItemFormValues } from '../../utils/workItemFormSchema'
import { WorkItemCoreFields } from './WorkItemCoreFields'
import { WorkItemSelectFields } from './WorkItemSelectFields'

/** The `form` prop type expected by {@link WorkItemForm}. Use this to avoid double-casts when passing a wider form instance. */
export type WorkItemFormHandle = UseFormReturn<WorkItemFormValues>

interface WorkItemFormProps {
  form: WorkItemFormHandle
  isPending: boolean
  onSubmit: FormEventHandler<HTMLFormElement>
  onCancel?: () => void
  submitLabel?: string
  /** When true the status field is shown (edit mode only). */
  showStatus?: boolean
  /** When true the status field is disabled (task assigned to board column). */
  disableStatus?: boolean
  /** Scope context for loading available labels. Required to show the labels field. */
  scopeType?: ScopeType
  /** Scope context for loading available labels. Required to show the labels field. */
  scopeId?: string
}

/**
 * Shared form layout for creating and editing work items.
 * @param root0 - Component props.
 * @param root0.form - React Hook Form instance for work item values.
 * @param root0.isPending - Whether a mutation is in flight.
 * @param root0.onSubmit - Form submit handler.
 * @param root0.onCancel - Optional cancel handler; renders a cancel button when provided.
 * @param root0.submitLabel - Optional override for the submit button label.
 * @param root0.showStatus - When true the status field is shown (edit mode only).
 * @param root0.disableStatus - When true the status select is disabled.
 * @param root0.scopeType - Scope entity type for loading available labels.
 * @param root0.scopeId - Scope entity ID for loading available labels.
 * @returns The work item form element.
 */
export function WorkItemForm({
  form,
  isPending,
  onSubmit,
  onCancel,
  submitLabel,
  showStatus = false,
  disableStatus = false,
  scopeType,
  scopeId,
}: WorkItemFormProps) {
  const { t } = useTranslation()

  return (
    <Form {...form}>
      <form
        onSubmit={onSubmit}
        className="space-y-4"
      >
        <WorkItemCoreFields
          control={form.control}
          isPending={isPending}
        />

        <WorkItemSelectFields
          control={form.control}
          isPending={isPending}
          showStatus={showStatus}
          disableStatus={disableStatus}
          scopeType={scopeType}
          scopeId={scopeId}
        />

        <div className="flex justify-end gap-2 pt-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isPending}
            >
              {t('features.workItem.form.cancel', 'Cancel')}
            </Button>
          )}
          <Button
            type="submit"
            disabled={isPending}
          >
            {submitLabel ?? t('features.workItem.form.submit', 'Save')}
          </Button>
        </div>
      </form>
    </Form>
  )
}
