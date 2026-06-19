import { useCallback, useMemo } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { z } from 'zod'

import { useWorkItem, useWorkItems } from '@/entities/work-item'
import {
  Button,
  Combobox,
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components'
import type { ScopeType } from '@/shared/types/scopeType'

import { useCreateWorkItemLink } from '../../hooks/useCreateWorkItemLink'
import { useCreateWorkItemLinkDialogStore } from '../../store/linkDialogStores'
import { normalizeWorkItemLink, validateWorkItemLink } from '../../utils/linkNormalizer'

const LINK_TYPES = ['parent', 'child', 'next', 'previous', 'related'] as const

const createLinkFormSchema = z.object({
  toWorkItemId: z.string().min(1, 'Target work item is required'),
  linkType: z.enum(LINK_TYPES),
})

type CreateLinkFormValues = z.infer<typeof createLinkFormSchema>

interface CreateWorkItemLinkDialogProps {
  workItemId: string
  scopeType: ScopeType
  scopeId: string
}

const VALIDATION_I18N_KEYS = {
  SELF_LINK: 'features.workItemLinks.validation.selfLink',
  DUPLICATE_LINK: 'features.workItemLinks.validation.duplicateLink',
  OPPOSITE_DIRECTION: 'features.workItemLinks.validation.oppositeDirection',
  ALREADY_LINKED: 'features.workItemLinks.validation.alreadyLinked',
} as const

/**
 * Dialog for creating a typed link from the given work item to another work item.
 * Supports searching by name (with live suggestions) or entering an ID directly.
 *
 * @param root0 - Component props.
 * @param root0.workItemId - ID of the source work item the link originates from.
 * @param root0.scopeType - Scope type used to fetch linkable work items.
 * @param root0.scopeId - Scope ID used to fetch linkable work items.
 * @returns The create-link dialog with target item search and link-type fields.
 */
// eslint-disable-next-line max-lines-per-function -- dialog component; line count scales with form field count
export function CreateWorkItemLinkDialog({
  workItemId,
  scopeType,
  scopeId,
}: CreateWorkItemLinkDialogProps) {
  const { t } = useTranslation()
  const open = useCreateWorkItemLinkDialogStore((s) => s.open)
  const closeModal = useCreateWorkItemLinkDialogStore((s) => s.closeModal)
  const { mutateAsync, isPending } = useCreateWorkItemLink(workItemId)
  const { data: sourceWorkItem } = useWorkItem(workItemId)
  const { data: allWorkItems = [] } = useWorkItems(scopeType, scopeId)

  const form = useForm<CreateLinkFormValues>({
    resolver: zodResolver(createLinkFormSchema),
    defaultValues: { toWorkItemId: '', linkType: 'related' },
  })

  // Build combobox options from all work items in scope, excluding the source item
  const workItemOptions = useMemo(
    () =>
      allWorkItems
        .filter((item) => item.id !== workItemId)
        .map((item) => ({ value: item.id, label: item.name })),
    [allWorkItems, workItemId],
  )

  // eslint-disable-next-line react-hooks/incompatible-library -- react-hook-form watch() triggers React Compiler's incompatible-library rule; suppression is intentional
  const currentId = form.watch('toWorkItemId')
  const comboboxValue = currentId || null

  const handleComboboxChange = useCallback(
    (value: string | null) => {
      form.setValue('toWorkItemId', value ?? '', { shouldValidate: true })
    },
    [form],
  )

  // onCreate: user typed a raw ID that matches no work item name — use it verbatim
  const handleUseRawId = useCallback(
    (rawInput: string) => {
      form.setValue('toWorkItemId', rawInput.trim(), { shouldValidate: true })
    },
    [form],
  )

  async function onSubmit(values: CreateLinkFormValues) {
    const validationError = validateWorkItemLink(
      { fromWorkItemId: workItemId, toWorkItemId: values.toWorkItemId, linkType: values.linkType },
      sourceWorkItem?.links ?? [],
    )
    if (validationError) {
      toast.error(t(VALIDATION_I18N_KEYS[validationError]))
      return
    }

    try {
      await mutateAsync({
        input: normalizeWorkItemLink({
          fromWorkItemId: workItemId,
          toWorkItemId: values.toWorkItemId,
          linkType: values.linkType,
        }),
      })
      closeModal()
      form.reset()
    } catch {
      // onError in hook handles user-facing feedback
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
          <DialogTitle>{t('features.workItemLinks.createDialog.title', 'Add Link')}</DialogTitle>
        </DialogHeader>

        <DialogBody>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="toWorkItemId"
                render={() => (
                  <FormItem>
                    <FormLabel>
                      {t('features.workItemLinks.createDialog.targetId', 'Linked Item')}
                    </FormLabel>
                    <FormControl>
                      <Combobox
                        options={workItemOptions}
                        value={comboboxValue}
                        onChange={handleComboboxChange}
                        onCreate={handleUseRawId}
                        createText={(q) =>
                          `${t('features.workItemLinks.createDialog.useIdPrefix', 'Use ID:')} ${q}`
                        }
                        placeholder={t(
                          'features.workItemLinks.createDialog.targetIdPlaceholder',
                          'Search by name or enter ID',
                        )}
                        searchPlaceholder={t(
                          'features.workItemLinks.createDialog.targetIdSearchPlaceholder',
                          'Type a name or paste an ID…',
                        )}
                        noResultsText={t(
                          'features.workItemLinks.createDialog.targetIdNoResults',
                          'No matching items found.',
                        )}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="linkType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('features.workItemLinks.createDialog.linkType', 'Link Type')}
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {LINK_TYPES.map((type) => (
                          <SelectItem
                            key={type}
                            value={type}
                          >
                            {t(`features.workItemLinks.linkType.${type}`, type)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                >
                  {t('common.cancel', 'Cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                >
                  {isPending
                    ? t('common.saving', 'Saving…')
                    : t('features.workItemLinks.createDialog.submit', 'Add Link')}
                </Button>
              </div>
            </form>
          </Form>
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
