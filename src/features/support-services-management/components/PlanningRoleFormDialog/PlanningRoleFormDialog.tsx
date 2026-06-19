import { useEffect, useMemo, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import {
  Button,
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
  Separator,
  Skeleton,
} from '@/shared/components'
import { REQUIRED_MARKER } from '@/shared/lib/constants'

import { useCreatePlanningRole } from '../../hooks/useCreatePlanningRole'
import { usePlanningRoles } from '../../hooks/usePlanningRoles'
import { useUpdatePlanningRole } from '../../hooks/useUpdatePlanningRole'
import { PtInput } from '../PtInput'
import { UserAssignmentsSection } from './UserAssignmentsSection'

const planningRoleFormSchema = z.object({
  name: z
    .string()
    .min(1, 'features.planningRolesManagement.validation.nameRequired')
    .max(100, 'features.planningRolesManagement.validation.nameMaxLength'),
  capacityPerWeek: z
    .number({ error: 'features.planningRolesManagement.validation.capacityRequired' })
    .gt(0, 'features.planningRolesManagement.validation.capacityMin'),
})

type PlanningRoleFormValues = z.infer<typeof planningRoleFormSchema>

interface PlanningRoleFormDialogProps {
  /** Project ID for scoping queries and mutations. */
  projectId: string
  /** Planning role ID in edit mode; undefined or null for create mode. */
  planningRoleId?: string | null
  /** Whether the dialog is open. */
  open: boolean
  /** Called when the dialog's open state should change. */
  onOpenChange: (open: boolean) => void
  /** Called after a successful save (create or update). */
  onSaved: () => void
}

/**
 * Modal dialog for creating or editing a planning role.
 *
 * Create mode: shows Name + Capacity fields only.
 * Edit mode: shows Name + Capacity + live user assignments list with add/remove/edit
 * (rendered via {@link UserAssignmentsSection}).
 *
 * @param props - Component props.
 * @param props.projectId - Project ID for scoping queries and mutations.
 * @param props.planningRoleId - Role ID in edit mode; undefined/null for create.
 * @param props.open - Whether the dialog is open.
 * @param props.onOpenChange - Called when the dialog open state should change.
 * @param props.onSaved - Called after a successful save.
 * @returns The rendered planning role form dialog.
 */
// eslint-disable-next-line max-lines-per-function, complexity -- create/edit/unsaved-guard flows share form state; embedding UserAssignmentsSection inline avoids a separate dialog-level context
export function PlanningRoleFormDialog({
  projectId,
  planningRoleId,
  open,
  onOpenChange,
  onSaved,
}: PlanningRoleFormDialogProps) {
  const { t } = useTranslation()
  const isEdit = Boolean(planningRoleId)

  const { data: roles = [], isPending: rolesLoading } = usePlanningRoles(projectId)
  const role = useMemo(
    () => roles.find((r) => r.id === planningRoleId) ?? null,
    [roles, planningRoleId],
  )

  const createMutation = useCreatePlanningRole(projectId)
  const updateMutation = useUpdatePlanningRole(projectId)
  const isSaving = createMutation.isPending || updateMutation.isPending

  const [serverError, setServerError] = useState<string | null>(null)
  const [unsavedOpen, setUnsavedOpen] = useState(false)

  const form = useForm<PlanningRoleFormValues>({
    resolver: zodResolver(planningRoleFormSchema),
    defaultValues: { name: '', capacityPerWeek: 1 },
  })

  // Pre-fill form when opening in edit mode
  useEffect(() => {
    if (!open) return
    if (isEdit && role) {
      form.reset({ name: role.name, capacityPerWeek: role.capacityPerWeek })
    } else if (!isEdit) {
      form.reset({ name: '', capacityPerWeek: 1 })
    }
    setServerError(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- role?.id intentional: reset only when role identity changes, not on every cache-updated object ref
  }, [open, planningRoleId, role?.id])

  function handleClose() {
    if (form.formState.isDirty) {
      setUnsavedOpen(true)
    } else {
      onOpenChange(false)
    }
  }

  async function onSubmit(values: PlanningRoleFormValues) {
    setServerError(null)

    const normalised = values.name.trim().toLowerCase()
    const isDuplicate = roles.some(
      (r) => r.name.trim().toLowerCase() === normalised && r.id !== planningRoleId,
    )
    if (isDuplicate) {
      form.setError('name', {
        message: t('features.planningRolesManagement.validation.nameDuplicate'),
      })
      return
    }

    try {
      if (isEdit && planningRoleId && role) {
        await updateMutation.mutateAsync({
          id: planningRoleId,
          input: {
            version: role.version,
            name: values.name,
            capacityPerWeek: values.capacityPerWeek,
          },
        })
      } else {
        await createMutation.mutateAsync({
          name: values.name,
          capacityPerWeek: values.capacityPerWeek,
        })
      }
      form.reset(values)
      onSaved()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      if (msg.includes('DUPLICATE_PLANNING_ROLE_NAME') || msg.toLowerCase().includes('duplicate')) {
        setServerError(t('features.planningRolesManagement.validation.nameDuplicate'))
      } else {
        setServerError(t('features.planningRolesManagement.toast.saveFailed'))
      }
    }
  }

  const title = isEdit
    ? t('features.planningRolesManagement.form.editTitle')
    : t('features.planningRolesManagement.form.createTitle')

  const showSkeleton = isEdit && rolesLoading && !role

  const watchedCapacity = form.watch('capacityPerWeek')

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(o) => {
          if (!o) handleClose()
        }}
      >
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription className="sr-only">{title}</DialogDescription>
          </DialogHeader>

          {showSkeleton ? (
            <DialogBody>
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton
                  key={`skeleton-${i}`}
                  className="h-10 w-full rounded-md"
                />
              ))}
            </DialogBody>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                noValidate
              >
                <DialogBody className="flex flex-col gap-4">
                  {/* Name */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t('features.planningRolesManagement.form.fields.name')}
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
                            autoFocus // eslint-disable-line jsx-a11y/no-autofocus -- intentional: dialog forms must focus first field on open
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Capacity per Week */}
                  <FormField
                    control={form.control}
                    name="capacityPerWeek"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t('features.planningRolesManagement.form.fields.capacityPerWeek')}
                          <span
                            className="text-destructive ml-0.5"
                            aria-hidden="true"
                          >
                            {REQUIRED_MARKER}
                          </span>
                        </FormLabel>
                        <FormControl>
                          <PtInput
                            value={field.value}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === '' ? '' : parseFloat(e.target.value),
                              )
                            }
                            disabled={isSaving}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* User Assignments (edit mode only) */}
                  {isEdit && planningRoleId && (
                    <>
                      <Separator />
                      <UserAssignmentsSection
                        projectId={projectId}
                        planningRoleId={planningRoleId}
                        watchedCapacity={
                          Number.isFinite(watchedCapacity)
                            ? watchedCapacity
                            : (role?.capacityPerWeek ?? 0)
                        }
                        userAssignments={role?.userAssignments ?? []}
                        onError={setServerError}
                      />
                    </>
                  )}

                  {serverError && (
                    <p
                      className="text-destructive text-sm"
                      role="alert"
                    >
                      {serverError}
                    </p>
                  )}
                </DialogBody>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={isSaving}
                  >
                    {t('features.planningRolesManagement.actions.cancel')}
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSaving}
                  >
                    {t('features.planningRolesManagement.actions.save')}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>

      {/* Unsaved changes guard */}
      <Dialog
        open={unsavedOpen}
        onOpenChange={(o) => {
          if (!o) setUnsavedOpen(false)
        }}
      >
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>{t('features.planningRolesManagement.unsavedChanges.title')}</DialogTitle>
            <DialogDescription className="sr-only">
              {t('features.planningRolesManagement.unsavedChanges.description')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setUnsavedOpen(false)}
            >
              {t('features.planningRolesManagement.unsavedChanges.keepEditing')}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                setUnsavedOpen(false)
                onOpenChange(false)
              }}
            >
              {t('features.planningRolesManagement.unsavedChanges.discard')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
