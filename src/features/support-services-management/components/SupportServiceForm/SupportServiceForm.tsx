/* eslint-disable max-lines -- 489-line form component: create/edit paths, unsaved-changes dialog, and submit logic share forwardRef scope */
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import {
  Button,
  Combobox,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  MarkdownEditor,
  Separator,
  showError,
  Skeleton,
} from '@/shared/components'
import { REQUIRED_MARKER } from '@/shared/lib/constants'

import { supportServiceFormValuesSchema } from '../../api/supportServicesApi'
import { useCreateSupportService } from '../../hooks/useCreateSupportService'
import { useMoveSupportService } from '../../hooks/useMoveSupportService'
import { usePlanningRoles } from '../../hooks/usePlanningRoles'
import { useSupportService, useSupportServiceTree } from '../../hooks/useSupportServices'
import { useUpdateSupportService } from '../../hooks/useUpdateSupportService'
import type { SupportServiceFormValues } from '../../types/supportService.types'
import { getExcludedParentIds } from '../../utils/getSupportServiceDescendants'
import { PlanningRoleInlineCreate } from '../PlanningRoleInlineCreate'
import { PtInput } from '../PtInput'

/** Imperative handle exposed via `forwardRef` for external cancel control. */
export interface SupportServiceFormHandle {
  /** Triggers the cancel flow: shows the unsaved-changes guard if the form is dirty. */
  requestClose: () => void
}

interface SupportServiceFormProps {
  /** Project ID for scoping queries and mutations. */
  projectId: string
  /**
   * Support service ID when editing an existing record.
   * `undefined` means create mode.
   */
  supportServiceId?: string
  /**
   * Default parent ID for create mode (replaces the former `useSearchParams` approach).
   * When provided, the parent field is pre-filled with this value.
   */
  defaultParentId?: string | null
  /** Called after successful save. */
  onSaved: () => void
  /** Called when the user cancels without saving. */
  onCancel: () => void
}

/**
 * Full-page form for creating or editing a support service.
 *
 * Handles: name, parent (Combobox, excludes self+descendants), assignee
 * (Combobox from planning roles + inline create), estimatedEffort (leaf-only
 * editable, read-only with hint for parents), description and otherInformation
 * (MarkdownEditor). Shows an unsaved-changes guard on cancel.
 *
 * @param props - Component props.
 * @param props.projectId - Project ID for data and mutations.
 * @param props.supportServiceId - ID of the support service being edited, or undefined for create.
 * @param props.defaultParentId - Default parent ID for create mode; pre-fills the parent field when provided.
 * @param props.onSaved - Called after the form saves successfully.
 * @param props.onCancel - Called when the user cancels.
 * @returns The rendered support service form.
 */
export const SupportServiceForm = forwardRef<SupportServiceFormHandle, SupportServiceFormProps>(
  // eslint-disable-next-line max-lines-per-function, complexity -- create/edit paths share form state; splitting into sub-components would require forwardRef threading or context just to expose requestClose
  function SupportServiceForm(
    { projectId, supportServiceId, defaultParentId, onSaved, onCancel }: SupportServiceFormProps,
    ref,
  ) {
    const { t } = useTranslation()
    const isEdit = Boolean(supportServiceId)

    // Data
    const { data: treeData } = useSupportServiceTree(projectId)
    const flat = useMemo(() => treeData?.flat ?? [], [treeData?.flat])
    const tree = useMemo(() => treeData?.tree ?? [], [treeData?.tree])

    const { data: existing, isPending: existingLoading } = useSupportService(
      supportServiceId ?? null,
    )
    const { data: planningRoles = [], isPending: rolesLoading } = usePlanningRoles(projectId)

    // Mutations
    const createMutation = useCreateSupportService(projectId)
    const updateMutation = useUpdateSupportService(projectId)
    const moveMutation = useMoveSupportService(projectId)
    const isSaving = createMutation.isPending || updateMutation.isPending || moveMutation.isPending

    // Form
    const form = useForm<SupportServiceFormValues>({
      resolver: zodResolver(supportServiceFormValuesSchema),
      defaultValues: {
        name: '',
        parentId: defaultParentId ?? null,
        assigneeId: null,
        estimatedEffort: null,
        description: null,
        otherInformation: null,
      },
    })

    // Pre-fill when editing
    useEffect(() => {
      if (!isEdit || !existing) return
      form.reset({
        name: existing.name,
        parentId: existing.parent?.node.id ?? null,
        assigneeId: existing.assignee?.node.id ?? null,
        estimatedEffort: existing.estimatedEffort ?? null,
        description: existing.description ?? null,
        otherInformation: existing.otherInformation ?? null,
      })
      // eslint-disable-next-line react-hooks/exhaustive-deps -- existing?.id intentional: reset only when service identity changes, not on every cache-updated object ref
    }, [isEdit, existing?.id])

    // Parent options — exclude self and descendants in edit mode
    const excludedParentIds = useMemo(
      () => (supportServiceId ? getExcludedParentIds(supportServiceId, tree) : new Set<string>()),
      [supportServiceId, tree],
    )
    const parentOptions = useMemo(
      () =>
        flat
          .filter((s) => !excludedParentIds.has(s.id))
          .map((s) => ({ value: s.id, label: s.name })),
      [flat, excludedParentIds],
    )

    // Assignee options from planning roles
    const assigneeOptions = useMemo(
      () => planningRoles.map((r) => ({ value: r.id, label: r.name })),
      [planningRoles],
    )

    // Has children — determines if estimatedEffort is editable or read-only
    const hasChildren = useMemo(() => {
      if (!supportServiceId) return false
      return flat.some((s) => s.parent?.node.id === supportServiceId)
    }, [flat, supportServiceId])

    // Must read watched values during render so react-hook-form's Proxy subscribes to them;
    // reading inside event handlers leaves the value perpetually stale.
    const watchedEffort = form.watch('estimatedEffort')
    // Unsaved-changes guard
    // Must destructure isDirty during render so react-hook-form's Proxy subscribes to it;
    // reading it only inside event handlers leaves the value perpetually stale (always false).
    const { isDirty } = form.formState
    const [unsavedOpen, setUnsavedOpen] = useState(false)

    const handleCancel = useCallback(() => {
      if (isDirty) {
        setUnsavedOpen(true)
      } else {
        onCancel()
      }
    }, [isDirty, onCancel])

    useImperativeHandle(ref, () => ({ requestClose: handleCancel }), [handleCancel])

    // eslint-disable-next-line complexity -- create/edit paths differ in assignee-diff and move logic; guard + conditional update branches are inherently sequential
    async function onSubmit(values: SupportServiceFormValues) {
      try {
        if (isEdit && supportServiceId && existing) {
          // The server ignores an explicit `assigneeId: null` — removal must be
          // signalled via `clearAssignee` (see UpdateSupportServiceInput contract).
          const oldAssigneeId = existing.assignee?.node.id ?? null
          const newAssigneeId = values.assigneeId ?? null
          const updated = await updateMutation.mutateAsync({
            id: supportServiceId,
            input: {
              version: existing.version,
              name: values.name,
              ...(newAssigneeId !== oldAssigneeId &&
                (newAssigneeId === null ? { clearAssignee: true } : { assigneeId: newAssigneeId })),
              estimatedEffort: hasChildren ? undefined : (values.estimatedEffort ?? null),
              description: values.description ?? null,
              otherInformation: values.otherInformation ?? null,
            },
          })

          const oldParentId = existing.parent?.node.id ?? null
          const newParentId = values.parentId ?? null
          if (oldParentId !== newParentId) {
            const newSiblingCount = flat.filter(
              (s) => (s.parent?.node.id ?? null) === newParentId && s.id !== supportServiceId,
            ).length
            try {
              await moveMutation.mutateAsync({
                id: supportServiceId,
                input: {
                  version: updated.version,
                  parentId: newParentId,
                  position: newSiblingCount,
                },
              })
            } catch {
              // The field update above already persisted — report that only the
              // re-parenting failed instead of a misleading generic save error.
              showError(t('features.supportServicesManagement.toast.savedButMoveFailed'))
              onSaved()
              return
            }
          }
        } else {
          await createMutation.mutateAsync({
            name: values.name,
            parentId: values.parentId ?? null,
            assigneeId: values.assigneeId ?? null,
            estimatedEffort: values.estimatedEffort ?? null,
            description: values.description ?? null,
            otherInformation: values.otherInformation ?? null,
          })
        }
        form.reset(values)
        onSaved()
      } catch {
        showError(t('features.supportServicesManagement.toast.saveFailed'))
      }
    }

    const showSkeleton = isEdit && existingLoading

    if (showSkeleton) {
      return (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton
              key={`skeleton-${i}`}
              className="h-10 w-full rounded-md"
            />
          ))}
        </div>
      )
    }

    return (
      <>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
          >
            <DialogBody className="flex flex-col gap-6">
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('features.supportServicesManagement.fields.name')}
                      <span
                        className="text-destructive ml-0.5"
                        aria-hidden="true"
                      >
                        {REQUIRED_MARKER}
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isSaving}
                        // eslint-disable-next-line jsx-a11y/no-autofocus -- intentional: dialog forms must focus first field on open
                        autoFocus
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Parent */}
              <FormField
                control={form.control}
                name="parentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('features.supportServicesManagement.fields.parent')}</FormLabel>
                    <FormControl>
                      <Combobox
                        value={field.value ?? null}
                        onChange={field.onChange}
                        options={parentOptions}
                        disabled={isSaving}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Assignee — planning role with inline create */}
              <FormField
                control={form.control}
                name="assigneeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('features.supportServicesManagement.fields.assignee')}</FormLabel>
                    <FormControl>
                      <div className="flex flex-col gap-1">
                        <Combobox
                          value={field.value ?? null}
                          onChange={field.onChange}
                          options={assigneeOptions}
                          loading={rolesLoading}
                          disabled={isSaving}
                        />
                        <PlanningRoleInlineCreate
                          projectId={projectId}
                          onRoleCreated={(roleId) => field.onChange(roleId)}
                        >
                          <Button
                            type="button"
                            variant="link"
                            className="h-auto p-0 text-left text-xs"
                            disabled={isSaving}
                          >
                            {t('features.supportServicesManagement.planningRole.createInline')}
                          </Button>
                        </PlanningRoleInlineCreate>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Estimated Effort — leaf: editable, parent: read-only with hint */}
              {hasChildren ? (
                <div className="flex flex-col gap-1.5">
                  <p className="text-sm leading-none font-medium">
                    {t('features.supportServicesManagement.fields.estimatedEffort')}
                  </p>
                  <p className="text-sm">
                    {watchedEffort != null ? `${watchedEffort} ${t('common.unitPt')}` : '—'}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {t('features.supportServicesManagement.fields.estimatedEffortReadOnly')}
                  </p>
                </div>
              ) : (
                <FormField
                  control={form.control}
                  name="estimatedEffort"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('features.supportServicesManagement.fields.estimatedEffort')}
                      </FormLabel>
                      <FormControl>
                        <PtInput
                          min="0"
                          value={field.value ?? ''}
                          onChange={(e) => {
                            const val = e.target.value
                            field.onChange(val === '' ? null : parseFloat(val))
                          }}
                          disabled={isSaving}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <Separator />

              {/* Description */}
              <Controller
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('features.supportServicesManagement.fields.description')}
                    </FormLabel>
                    <FormControl>
                      <MarkdownEditor
                        value={field.value ?? ''}
                        onChange={(v) => field.onChange(v.trimEnd() || null)}
                        disabled={isSaving}
                        ariaLabel={t('features.supportServicesManagement.fields.description')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Other Information */}
              <Controller
                control={form.control}
                name="otherInformation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('features.supportServicesManagement.fields.otherInformation')}
                    </FormLabel>
                    <FormControl>
                      <MarkdownEditor
                        value={field.value ?? ''}
                        onChange={(v) => field.onChange(v.trimEnd() || null)}
                        disabled={isSaving}
                        ariaLabel={t('features.supportServicesManagement.fields.otherInformation')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </DialogBody>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSaving}
              >
                {t('features.supportServicesManagement.actions.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
              >
                {t('features.supportServicesManagement.actions.save')}
              </Button>
            </DialogFooter>
          </form>
        </Form>

        {/* Unsaved-changes confirmation dialog */}
        <Dialog
          open={unsavedOpen}
          onOpenChange={(open) => {
            if (!open) setUnsavedOpen(false)
          }}
        >
          <DialogContent size="sm">
            <DialogHeader>
              <DialogTitle>
                {t('features.supportServicesManagement.unsavedChanges.title')}
              </DialogTitle>
              <DialogDescription className="sr-only">
                {t('features.supportServicesManagement.unsavedChanges.description')}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setUnsavedOpen(false)}
              >
                {t('features.supportServicesManagement.unsavedChanges.keepEditing')}
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  setUnsavedOpen(false)
                  onCancel()
                }}
              >
                {t('features.supportServicesManagement.unsavedChanges.discard')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    )
  },
)
