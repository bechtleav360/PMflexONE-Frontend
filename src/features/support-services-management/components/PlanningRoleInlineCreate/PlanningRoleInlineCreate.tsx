import { useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components'

import { useCreatePlanningRole } from '../../hooks/useCreatePlanningRole'
import { PtInput } from '../PtInput/PtInput'

const planningRoleInlineSchema = z.object({
  name: z.string().min(1, 'features.planningRolesManagement.validation.nameRequired').max(100),
  capacityPerWeek: z
    .number({ error: 'features.planningRolesManagement.validation.capacityRequired' })
    .gt(0, 'features.planningRolesManagement.validation.capacityMin'),
})

type PlanningRoleInlineValues = z.infer<typeof planningRoleInlineSchema>

interface PlanningRoleInlineCreateProps {
  /** Project ID for creating the planning role. */
  projectId: string
  /** Called with the new role ID after successful creation. */
  onRoleCreated: (roleId: string) => void
  /** Children rendered as the trigger element. */
  children?: React.ReactNode
}

/**
 * Compact inline form inside a Popover for creating a new planning role.
 *
 * Fields: Name (max 100 chars, required) + Kapazität pro Woche (PT, required, > 0).
 * On save: calls `useCreatePlanningRole`, auto-selects new role via `onRoleCreated`.
 * Shows duplicate-name error inline when BE returns a duplicate error.
 *
 * @param props - Component props.
 * @param props.projectId - Project ID for the planning role scope.
 * @param props.onRoleCreated - Callback with the new role ID on success.
 * @param props.children - Trigger element (the "+ create" option button).
 * @returns The rendered popover with inline create form.
 */
// eslint-disable-next-line max-lines-per-function -- inline create row with form state, submission mutation, and keyboard handler in a single scope
export function PlanningRoleInlineCreate({
  projectId,
  onRoleCreated,
  children,
}: PlanningRoleInlineCreateProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const createMutation = useCreatePlanningRole(projectId)

  const form = useForm<PlanningRoleInlineValues>({
    resolver: zodResolver(planningRoleInlineSchema),
    defaultValues: { name: '', capacityPerWeek: 1 },
  })

  async function onSubmit(values: PlanningRoleInlineValues) {
    setServerError(null)
    try {
      const role = await createMutation.mutateAsync({
        name: values.name,
        capacityPerWeek: values.capacityPerWeek,
      })
      form.reset()
      setOpen(false)
      onRoleCreated(role.id)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      if (message.includes('DUPLICATE_PLANNING_ROLE_NAME') || message.includes('duplicate')) {
        setServerError(t('features.supportServicesManagement.planningRole.duplicateError'))
      } else {
        setServerError(t('features.supportServicesManagement.toast.saveFailed'))
      }
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (!nextOpen) {
      form.reset()
      setServerError(null)
    }
  }

  return (
    <Popover
      open={open}
      onOpenChange={handleOpenChange}
    >
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        className="w-72 p-4"
        side="bottom"
        align="start"
      >
        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.stopPropagation()
              void form.handleSubmit(onSubmit)(e)
            }}
            noValidate
            className="flex flex-col gap-3"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('features.supportServicesManagement.planningRole.nameLabel')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={createMutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="capacityPerWeek"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('features.supportServicesManagement.planningRole.capacityLabel')}
                  </FormLabel>
                  <FormControl>
                    <PtInput
                      {...field}
                      value={field.value}
                      onChange={(e) =>
                        field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))
                      }
                      disabled={createMutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {serverError && <p className="text-destructive text-xs">{serverError}</p>}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleOpenChange(false)}
                disabled={createMutation.isPending}
              >
                {t('features.supportServicesManagement.actions.cancel')}
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={createMutation.isPending}
              >
                {t('features.supportServicesManagement.actions.save')}
              </Button>
            </div>
          </form>
        </Form>
      </PopoverContent>
    </Popover>
  )
}
