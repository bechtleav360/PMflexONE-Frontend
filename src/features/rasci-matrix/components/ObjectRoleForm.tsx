import { useEffect } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { addObjectRoleInputSchema } from '@/entities/role'
import type { AddObjectRoleInput, MatrixRole, RoleGroup } from '@/entities/role'
import { Form } from '@/shared/components'

import { GroupField } from './GroupField'
import { RoleTextFields } from './RoleTextFields'
import { SourceRoleSelector } from './SourceRoleSelector'

/** Values managed by ObjectRoleForm. */
export type ObjectRoleFormValues = AddObjectRoleInput

interface ObjectRoleFormProps {
  formId?: string
  /** Template roles available as source for pre-filling task permissions. */
  templateRoles: MatrixRole[]
  /** Available role groups for the groupId select. */
  roleGroups: RoleGroup[]
  /** The object ID this role will belong to. */
  objectId: string
  /** Called with validated values on form submission. */
  onSubmit: (values: ObjectRoleFormValues) => void
  /** When true, disables the form. */
  isPending?: boolean
  /** Pre-fill values when editing an existing role. */
  defaultValues?: Partial<ObjectRoleFormValues>
  /** When true, hides the source-role (template) selector. */
  hideSourceRole?: boolean
}

/**
 * Form for adding a custom role to an object matrix.
 * Provides a source role selector that pre-fills the tasks array from the
 * selected template role's permission values.
 *
 * @param props - Form configuration.
 * @returns The rendered object role form.
 */
export function ObjectRoleForm({
  formId,
  templateRoles,
  roleGroups,
  objectId,
  onSubmit,
  isPending = false,
  defaultValues,
  hideSourceRole = false,
}: ObjectRoleFormProps) {
  const form = useForm<ObjectRoleFormValues>({
    resolver: zodResolver(addObjectRoleInputSchema),
    defaultValues: {
      objectId,
      name: '',
      shortTitle: '',
      description: '',
      groupId: '',
      tasks: [],
      ...defaultValues,
    },
  })

  function handleSourceRoleChange(roleId: string) {
    const sourceRole = templateRoles.find((r) => r.id === roleId)
    if (sourceRole) {
      form.setValue('tasks', sourceRole.tasks as ObjectRoleFormValues['tasks'], {
        shouldValidate: true,
      })
    }
  }

  // Keep objectId in sync if prop changes
  useEffect(() => {
    form.setValue('objectId', objectId)
  }, [objectId, form])

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        {!hideSourceRole && (
          <SourceRoleSelector
            templateRoles={templateRoles}
            isPending={isPending}
            onValueChange={handleSourceRoleChange}
          />
        )}

        <RoleTextFields
          control={form.control}
          isPending={isPending}
        />

        <GroupField
          control={form.control}
          roleGroups={roleGroups}
          isPending={isPending}
        />
      </form>
    </Form>
  )
}
