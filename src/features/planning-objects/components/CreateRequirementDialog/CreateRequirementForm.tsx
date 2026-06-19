/* eslint-disable max-lines -- form component; line count scales with number of domain fields */
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import {
  Input,
  Label,
  MarkdownEditor,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components'

import type { RequirementFormValues } from '../../utils/requirementSchema'
import { requirementFormSchema } from '../../utils/requirementSchema'

/** Props for {@link CreateRequirementForm}. */
interface CreateRequirementFormProps {
  /** Called with validated form values when the user submits. */
  onSubmit: (values: RequirementFormValues) => void
}

/**
 * Form for creating a new requirement.
 *
 * Uses react-hook-form + Zod. Includes name, type, priority, status, scope, source,
 * estimated effort range, description, and acceptance criteria.
 *
 * @param props - Component props.
 * @param props.onSubmit - Submit handler receiving validated form values.
 * @returns The rendered creation form.
 */
// eslint-disable-next-line max-lines-per-function -- form component; line count scales with number of domain fields, not logic complexity
export function CreateRequirementForm({ onSubmit }: CreateRequirementFormProps) {
  const { t } = useTranslation()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RequirementFormValues>({
    resolver: zodResolver(requirementFormSchema),
    defaultValues: {
      name: '',
      requirementScope: 'IN_SCOPE',
      source: 'INTERNAL',
      type: 'FUNCTIONAL',
      priority: 'MUST_HAVE',
      status: 'NEW',
      estimatedEffortMin: null,
      estimatedEffortMax: null,
      description: null,
      acceptanceCriteria: null,
    },
  })

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-4"
      id="create-requirement-form"
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="create-req-name">
          {t('features.planningObjects.common.name')}
          <span
            aria-hidden="true"
            className="text-destructive ml-0.5"
            role="presentation"
          >
            {/* eslint-disable-next-line react/jsx-no-literals -- required-field asterisk is a UI convention, not translatable content */}
            {'*'}
          </span>
        </Label>
        <Input
          id="create-req-name"
          aria-describedby={errors.name ? 'create-req-name-error' : undefined}
          aria-invalid={!!errors.name}
          {...register('name')}
        />
        {errors.name && (
          <p
            id="create-req-name-error"
            role="alert"
            className="text-destructive text-xs"
          >
            {t(errors.name.message ?? 'features.planningObjects.validation.nameRequired')}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="create-req-type">
            {t('features.planningObjects.requirements.fieldType')}
          </Label>
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger id="create-req-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FUNCTIONAL">
                    {t('features.planningObjects.requirements.type.functional')}
                  </SelectItem>
                  <SelectItem value="NON_FUNCTIONAL">
                    {t('features.planningObjects.requirements.type.nonFunctional')}
                  </SelectItem>
                  <SelectItem value="CONSTRAINT">
                    {t('features.planningObjects.requirements.type.constraint')}
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="create-req-priority">
            {t('features.planningObjects.requirements.fieldPriority')}
          </Label>
          <Controller
            name="priority"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger id="create-req-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MUST_HAVE">
                    {t('features.planningObjects.requirements.priority.mustHave')}
                  </SelectItem>
                  <SelectItem value="SHOULD_HAVE">
                    {t('features.planningObjects.requirements.priority.shouldHave')}
                  </SelectItem>
                  <SelectItem value="COULD_HAVE">
                    {t('features.planningObjects.requirements.priority.couldHave')}
                  </SelectItem>
                  <SelectItem value="WONT_HAVE">
                    {t('features.planningObjects.requirements.priority.wontHave')}
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="create-req-status">
            {t('features.planningObjects.requirements.fieldStatus')}
          </Label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger id="create-req-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NEW">
                    {t('features.planningObjects.requirements.status.new')}
                  </SelectItem>
                  <SelectItem value="ANALYSED">
                    {t('features.planningObjects.requirements.status.analysed')}
                  </SelectItem>
                  <SelectItem value="SPECIFIED">
                    {t('features.planningObjects.requirements.status.specified')}
                  </SelectItem>
                  <SelectItem value="IMPLEMENTED">
                    {t('features.planningObjects.requirements.status.implemented')}
                  </SelectItem>
                  <SelectItem value="TESTED">
                    {t('features.planningObjects.requirements.status.tested')}
                  </SelectItem>
                  <SelectItem value="ACCEPTED">
                    {t('features.planningObjects.requirements.status.accepted')}
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="create-req-scope">
            {t('features.planningObjects.requirements.fieldScope')}
          </Label>
          <Controller
            name="requirementScope"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger id="create-req-scope">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IN_SCOPE">
                    {t('features.planningObjects.requirements.scope.inScope')}
                  </SelectItem>
                  <SelectItem value="OUT_OF_SCOPE">
                    {t('features.planningObjects.requirements.scope.outOfScope')}
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="create-req-source">
            {t('features.planningObjects.requirements.fieldSource')}
          </Label>
          <Controller
            name="source"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger id="create-req-source">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INTERNAL">
                    {t('features.planningObjects.requirements.sourceInternal')}
                  </SelectItem>
                  <SelectItem value="EXTERNAL">
                    {t('features.planningObjects.requirements.sourceExternal')}
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>{t('features.planningObjects.requirements.fieldEffort')}</Label>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-xs">
              {t('features.planningObjects.requirements.effortFrom')}
            </span>
            <Input
              id="create-req-effort-min"
              type="number"
              min={0}
              className="w-24"
              aria-describedby={
                errors.estimatedEffortMin ? 'create-req-effort-min-error' : undefined
              }
              {...register('estimatedEffortMin', {
                setValueAs: (v: string) => (v === '' ? null : Number(v)),
              })}
            />
            {/* eslint-disable-next-line react/jsx-no-literals -- typographic dash is layout punctuation, not translatable content */}
            <span className="text-muted-foreground">{'–'}</span>
            <span className="text-muted-foreground text-xs">
              {t('features.planningObjects.requirements.effortTo')}
            </span>
            <Input
              id="create-req-effort-max"
              type="number"
              min={0}
              className="w-24"
              aria-describedby={
                errors.estimatedEffortMax ? 'create-req-effort-max-error' : undefined
              }
              {...register('estimatedEffortMax', {
                setValueAs: (v: string) => (v === '' ? null : Number(v)),
              })}
            />
          </div>
          {errors.estimatedEffortMax && (
            <p
              id="create-req-effort-max-error"
              role="alert"
              className="text-destructive text-xs"
            >
              {t(
                errors.estimatedEffortMax.message ??
                  'features.planningObjects.validation.effortMinGtMax',
              )}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="create-req-description">
          {t('features.planningObjects.common.description')}
        </Label>
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <MarkdownEditor
              value={field.value ?? ''}
              onChange={(v) => field.onChange(v || null)}
              ariaLabel={t('features.planningObjects.common.description')}
            />
          )}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="create-req-acceptance">
          {t('features.planningObjects.requirements.acceptanceCriteria')}
        </Label>
        <Controller
          name="acceptanceCriteria"
          control={control}
          render={({ field }) => (
            <MarkdownEditor
              value={field.value ?? ''}
              onChange={(v) => field.onChange(v || null)}
              ariaLabel={t('features.planningObjects.requirements.acceptanceCriteria')}
            />
          )}
        />
      </div>
    </form>
  )
}
