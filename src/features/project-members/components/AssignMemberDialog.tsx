import { useRef, type RefObject } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import type { PersonSearchResult } from '@/entities/project-member'
import { generateInitials, searchPersons } from '@/entities/project-member'
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

import { useAssignMember } from '../hooks/useAssignMember'
import { useProjectMembersStore } from '../store/projectMembersStore'
import { AssignMemberForm } from './AssignMemberForm'

async function buildPersonOptions(
  query: string,
  personCacheRef: RefObject<Map<string, PersonSearchResult>>,
): Promise<ComboboxOption[]> {
  if (query.length < 2) return []
  const results = await searchPersons({ hasUser: true, searchText: query })
  results.forEach((p) => personCacheRef.current.set(p.id, p))
  return results.map((p) => ({
    value: p.id,
    label: [p.firstName, p.lastName].filter(Boolean).join(' ') + (p.mail ? ` (${p.mail})` : ''),
  }))
}

const formSchema = z.object({
  personId: z.string().min(1),
  roleId: z.string().min(1),
  initials: z.string().max(10).optional(),
})

type FormValues = z.infer<typeof formSchema>

const FORM_ID = 'assign-member-dialog-form'

type ScopeType = 'Project' | 'Program' | 'Portfolio'

const DOMAIN_TYPE_MAP: Record<ScopeType, 'PROJECT' | 'PROGRAM' | 'PORTFOLIO'> = {
  Project: 'PROJECT',
  Program: 'PROGRAM',
  Portfolio: 'PORTFOLIO',
}

interface AssignMemberDialogProps {
  open: boolean
  projectId: string
  scopeType?: ScopeType
}

/**
 * Dialog for assigning a new member to a project, program, or portfolio scope.
 * Provides person search, role selection, and optional initials input.
 *
 * @param root0 - Component props.
 * @returns The rendered assign-member dialog element.
 */
export function AssignMemberDialog({
  open,
  projectId,
  scopeType = 'Project',
}: AssignMemberDialogProps) {
  const { t } = useTranslation()
  const { closeAll } = useProjectMembersStore()
  const { mutateAsync: assign, isPending } = useAssignMember(projectId)
  const { data: matrix } = useMatrix({
    domainType: DOMAIN_TYPE_MAP[scopeType],
    objectId: projectId,
  })
  // cache search results by id so we can look up name for initials generation
  const personCacheRef = useRef<Map<string, PersonSearchResult>>(new Map())

  const roleOptions: ComboboxOption[] =
    matrix?.roles.map((r) => ({ value: r.id, label: r.name })) ?? []

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { personId: '', roleId: '', initials: '' },
  })

  function handleSearchPersons(query: string) {
    return buildPersonOptions(query, personCacheRef)
  }

  function handleGenerateInitials() {
    const personId = form.getValues('personId')
    if (!personId) return
    const person = personCacheRef.current.get(personId)
    form.setValue('initials', generateInitials(person?.firstName ?? null, person?.lastName ?? null))
  }

  async function handleSubmit(values: FormValues) {
    await assign({
      scopeId: projectId,
      scopeType,
      personId: values.personId,
      roleId: values.roleId,
      initials: values.initials || undefined,
    })
    form.reset()
    closeAll()
  }

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) {
      form.reset()
      closeAll()
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
          <DialogTitle>{t('pages.projectMembers.assignTitle')}</DialogTitle>
        </DialogHeader>

        <DialogBody>
          <AssignMemberForm
            form={form}
            formId={FORM_ID}
            isPending={isPending}
            roleOptions={roleOptions}
            onSearch={handleSearchPersons}
            onGenerateInitials={handleGenerateInitials}
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
            {t('pages.projectMembers.assignButton')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
