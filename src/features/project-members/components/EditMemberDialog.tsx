import { useEffect } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import { generateInitials } from '@/entities/project-member'
import { useMatrix } from '@/entities/role'
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components'
import type { ComboboxOption } from '@/shared/components'

import { useUpdateMember } from '../hooks/useUpdateMember'
import { useProjectMembersStore } from '../store/projectMembersStore'
import { EditMemberForm } from './EditMemberForm'

const formSchema = z.object({
  roleId: z.string().min(1),
  initials: z.string().max(10).optional(),
})

type FormValues = z.infer<typeof formSchema>

const FORM_ID = 'edit-member-dialog-form'

interface EditMemberDialogProps {
  projectId: string
}

/**
 * Dialog for editing an existing member assignment's role and initials.
 * Opens when the store's pendingEdit is set and resets on close.
 *
 * @param root0 - Component props.
 * @returns The rendered edit-member dialog element.
 */
export function EditMemberDialog({ projectId }: EditMemberDialogProps) {
  const { t } = useTranslation()
  const { pendingEdit, closeAll } = useProjectMembersStore()
  const { mutateAsync: update, isPending } = useUpdateMember(projectId)
  const { data: matrix } = useMatrix({ domainType: 'PROJECT', objectId: projectId })

  const roleOptions: ComboboxOption[] =
    matrix?.roles.map((r) => ({ value: r.id, label: r.name })) ?? []

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { roleId: '', initials: '' },
  })

  useEffect(() => {
    if (pendingEdit) {
      form.reset({
        roleId: pendingEdit.role.id,
        initials: pendingEdit.initials ?? '',
      })
    } else {
      form.reset({ roleId: '', initials: '' })
    }
  }, [pendingEdit, form])

  async function handleSubmit(values: FormValues) {
    if (!pendingEdit) return
    await update({
      id: pendingEdit.id,
      roleId: values.roleId,
      initials: values.initials || undefined,
    })
    closeAll()
  }

  return (
    <Dialog
      open={pendingEdit !== null}
      onOpenChange={(isOpen) => {
        if (!isOpen) closeAll()
      }}
    >
      <DialogContent
        className="sm:max-w-md"
        aria-describedby={undefined}
      >
        <DialogHeader>
          <DialogTitle>{t('pages.projectMembers.editTitle')}</DialogTitle>
        </DialogHeader>

        <DialogBody>
          <EditMemberForm
            form={form}
            formId={FORM_ID}
            isPending={isPending}
            roleOptions={roleOptions}
            onGenerateInitials={() =>
              form.setValue(
                'initials',
                generateInitials(
                  pendingEdit?.person.firstName ?? null,
                  pendingEdit?.person.lastName ?? null,
                ),
              )
            }
            onSubmit={handleSubmit}
          />
        </DialogBody>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={closeAll}
            disabled={isPending}
          >
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button
            type="submit"
            form={FORM_ID}
            disabled={isPending}
            aria-disabled={isPending}
          >
            {t('pages.projectMembers.editButton')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
