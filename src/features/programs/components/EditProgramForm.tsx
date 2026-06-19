import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { Button, Combobox, Input, Label } from '@/shared/components'
import { REQUIRED_MARKER } from '@/shared/lib/constants'

import { useEditProgramSubmit } from '../hooks/useEditProgramSubmit'
import { useLookupProgramStatus } from '../hooks/useLookupProgramStatus'
import type { Program } from '../types/program.types'
import { PROGRAM_STATUS } from '../types/program.types'
import {
  editProgramSchema,
  getProgramNameErrorMessage,
  type EditProgramFormValues,
} from '../utils/programSchema'
import { ProgramMetaSection } from './ProgramMetaSection'

const EDITABLE_STATUSES = new Set<string>([
  PROGRAM_STATUS.CREATED,
  PROGRAM_STATUS.ACTIVE,
  PROGRAM_STATUS.COMPLETED,
  PROGRAM_STATUS.ARCHIVED,
])

function getDefaultValues(program: Program): EditProgramFormValues {
  return {
    name: program.name,
    status: program.status ?? '',
    portfolioId: program.portfolio?.item.id,
    metadata: program.metadata ?? null,
  }
}

/** Props for {@link EditProgramForm}. */
interface EditProgramFormProps {
  /** The program to pre-fill and update. Must be the full detail object. */
  program: Program
  /** Called when the server rejects the update due to an optimistic-lock conflict. */
  onVersionConflict?: () => void
}

/**
 * Form for editing an existing program.
 *
 * Pre-fills all fields from `props.program`. Calls `onVersionConflict` when the
 * server returns a version conflict so the parent can reload fresh data.
 * Inline validation and server-side duplicate-name errors are surfaced as
 * field-level messages.
 *
 * @param props - Component props.
 * @param props.program - The program to pre-fill and update.
 * @param props.onVersionConflict - Called on optimistic-lock conflict.
 * @returns The rendered edit form.
 */
export function EditProgramForm({ program, onVersionConflict }: EditProgramFormProps) {
  const { t } = useTranslation()
  const { data: statuses = [] } = useLookupProgramStatus()

  const statusOptions = [...statuses]
    .filter((s) => EDITABLE_STATUSES.has(s.status))
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((s) => ({
      value: s.status,
      label: t(`pages.programs.status.${s.status}`, { defaultValue: s.description ?? s.status }),
    }))

  const {
    register,
    handleSubmit,
    setValue,
    control,
    setError,
    formState: { errors },
  } = useForm<EditProgramFormValues>({
    resolver: zodResolver(editProgramSchema),
    defaultValues: getDefaultValues(program),
  })

  const { onSubmit, isPending, close } = useEditProgramSubmit({
    program,
    setError,
    onVersionConflict,
  })
  const statusValue = useWatch({ control, name: 'status' })
  const nameErrorMessage = getProgramNameErrorMessage(errors.name?.message, t)

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="edit-program-name">
          {t('pages.programs.editDialog.fields.name')}
          <span
            className="text-destructive ml-0.5"
            aria-hidden="true"
          >
            {REQUIRED_MARKER}
          </span>
        </Label>
        <Input
          id="edit-program-name"
          placeholder={t('pages.programs.editDialog.fields.namePlaceholder')}
          aria-invalid={errors.name !== undefined}
          aria-describedby={errors.name ? 'edit-program-name-error' : undefined}
          {...register('name')}
        />
        {nameErrorMessage && (
          <p
            id="edit-program-name-error"
            role="alert"
            className="text-destructive text-sm"
          >
            {nameErrorMessage}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="edit-program-status">{t('pages.programs.editDialog.fields.status')}</Label>
        <Combobox
          id="edit-program-status"
          value={statusValue ?? null}
          onChange={(v) => {
            setValue('status', v ?? '')
          }}
          options={statusOptions}
          placeholder={t('pages.programs.editDialog.fields.statusPlaceholder')}
        />
      </div>

      <ProgramMetaSection program={program} />

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={close}
          disabled={isPending}
        >
          {t('pages.programs.editDialog.cancel')}
        </Button>
        <Button
          type="submit"
          disabled={isPending}
        >
          {t('pages.programs.editDialog.submit')}
        </Button>
      </div>
    </form>
  )
}
