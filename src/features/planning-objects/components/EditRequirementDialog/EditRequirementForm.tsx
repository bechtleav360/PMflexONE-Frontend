/* eslint-disable max-lines -- form component; line count scales with number of domain fields */
import { useCallback, useEffect, useRef, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronDown, Link2 } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Input,
  Label,
  MarkdownEditor,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components'
import { cn } from '@/shared/lib/utils'

import type { RequirementDetail } from '../../types/requirement.types'
import { formatDateTime } from '../../utils'
import type { RequirementFormValues } from '../../utils/requirementSchema'
import { requirementFormSchema } from '../../utils/requirementSchema'
import type { RequirementDependenciesSectionHandle } from '../RequirementDependenciesSection'
import { RequirementDependenciesSection } from '../RequirementDependenciesSection'
import type { RequirementGoalLinksSectionHandle } from '../RequirementGoalLinksSection'
import { RequirementGoalLinksSection } from '../RequirementGoalLinksSection'

/** Props for {@link EditRequirementForm}. */
interface EditRequirementFormProps {
  /** The full requirement detail used to pre-populate the form. */
  requirementDetail: RequirementDetail
  /** Called with validated form values when the user submits. */
  onSubmit: (values: RequirementFormValues) => void | Promise<{ version: number } | void>
  /** Called after the full save sequence succeeds. */
  onSuccess?: () => void
  /** When true all inputs are disabled and the save button is hidden. */
  readOnly?: boolean
  /** ID of the scoped entity for link mutations. */
  scopeId: string
  /** Called whenever the form dirty state changes. */
  onDirtyChange?: (dirty: boolean) => void
}

/**
 * Form for editing an existing requirement.
 *
 * Pre-populates all fields from `requirementDetail`. Renders
 * {@link RequirementDependenciesSection} and {@link RequirementGoalLinksSection}
 * below the base fields for managing links.
 *
 * @param props - Component props.
 * @param props.requirementDetail - Existing requirement data used as default values.
 * @param props.onSubmit - Submit handler receiving validated form values.
 * @param props.scopeId - ID of the scoped entity for link mutations.
 * @returns The rendered edit form.
 */
// eslint-disable-next-line max-lines-per-function, complexity -- form component; line count scales with number of domain fields, not logic complexity
export function EditRequirementForm({
  requirementDetail,
  onSubmit,
  onSuccess,
  readOnly = false,
  scopeId,
  onDirtyChange,
}: EditRequirementFormProps) {
  const { t, i18n } = useTranslation()
  const depsRef = useRef<RequirementDependenciesSectionHandle>(null)
  const goalsRef = useRef<RequirementGoalLinksSectionHandle>(null)

  const [linksOpen, setLinksOpen] = useState(true)
  const [linksDirty, setLinksDirty] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
  } = useForm<RequirementFormValues>({
    resolver: zodResolver(requirementFormSchema),
    defaultValues: {
      name: requirementDetail.name,
      requirementScope: requirementDetail.requirementScope,
      source: requirementDetail.source,
      type: requirementDetail.type,
      priority: requirementDetail.priority,
      status: requirementDetail.status,
      estimatedEffortMin: requirementDetail.estimatedEffortMin ?? null,
      estimatedEffortMax: requirementDetail.estimatedEffortMax ?? null,
      description: requirementDetail.description ?? null,
      acceptanceCriteria: requirementDetail.acceptanceCriteria ?? null,
    },
  })

  useEffect(() => {
    onDirtyChange?.(isDirty || linksDirty)
  }, [isDirty, linksDirty, onDirtyChange])

  const flushAndSubmit = useCallback(
    async (values: RequirementFormValues) => {
      await depsRef.current?.flush()
      await goalsRef.current?.flush()
      const result = await onSubmit(values)
      if (result && typeof result === 'object' && 'version' in result) {
        onSuccess?.()
      }
    },
    [onSubmit, onSuccess],
  )

  // eslint-disable-next-line react-hooks/refs -- flushAndSubmit reads linksRef.current inside a callback, not during render; the ref is accessed only when the form submits
  const handleFormSubmit = handleSubmit(flushAndSubmit)

  return (
    <>
      <form
        onSubmit={handleFormSubmit}
        noValidate
        className="flex flex-col gap-4"
        id="edit-requirement-form"
      >
        <div className="flex flex-col gap-1.5">
          <p className="text-sm leading-none font-medium">
            {t('features.planningObjects.common.createdAt')}
          </p>
          <p className="text-muted-foreground text-sm">
            {formatDateTime(requirementDetail.createdAt, i18n.language)}
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edit-req-name">
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
            id="edit-req-name"
            aria-describedby={errors.name ? 'edit-req-name-error' : undefined}
            aria-invalid={!!errors.name}
            disabled={readOnly}
            {...register('name')}
          />
          {errors.name && (
            <p
              id="edit-req-name-error"
              role="alert"
              className="text-destructive text-xs"
            >
              {t(errors.name.message ?? 'features.planningObjects.validation.nameRequired')}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-req-type">
              {t('features.planningObjects.requirements.fieldType')}
            </Label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={readOnly}
                >
                  <SelectTrigger id="edit-req-type">
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
            <Label htmlFor="edit-req-priority">
              {t('features.planningObjects.requirements.fieldPriority')}
            </Label>
            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={readOnly}
                >
                  <SelectTrigger id="edit-req-priority">
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
            <Label htmlFor="edit-req-status">
              {t('features.planningObjects.requirements.fieldStatus')}
            </Label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={readOnly}
                >
                  <SelectTrigger id="edit-req-status">
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
            <Label htmlFor="edit-req-scope">
              {t('features.planningObjects.requirements.fieldScope')}
            </Label>
            <Controller
              name="requirementScope"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={readOnly}
                >
                  <SelectTrigger id="edit-req-scope">
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
            <Label htmlFor="edit-req-source">
              {t('features.planningObjects.requirements.fieldSource')}
            </Label>
            <Controller
              name="source"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={readOnly}
                >
                  <SelectTrigger id="edit-req-source">
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

          {(!readOnly ||
            requirementDetail.estimatedEffortMin != null ||
            requirementDetail.estimatedEffortMax != null) && (
            <div className="flex flex-col gap-1.5">
              <Label>{t('features.planningObjects.requirements.fieldEffort')}</Label>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-xs">
                  {t('features.planningObjects.requirements.effortFrom')}
                </span>
                <Input
                  id="edit-req-effort-min"
                  type="number"
                  min={0}
                  className="w-24"
                  disabled={readOnly}
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
                  id="edit-req-effort-max"
                  type="number"
                  min={0}
                  className="w-24"
                  disabled={readOnly}
                  aria-describedby={
                    errors.estimatedEffortMax ? 'edit-req-effort-max-error' : undefined
                  }
                  {...register('estimatedEffortMax', {
                    setValueAs: (v: string) => (v === '' ? null : Number(v)),
                  })}
                />
              </div>
              {errors.estimatedEffortMax && (
                <p
                  id="edit-req-effort-max-error"
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
          )}
        </div>

        {(!readOnly || requirementDetail.description) && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-req-description">
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
                  disabled={readOnly}
                />
              )}
            />
          </div>
        )}

        {(!readOnly || requirementDetail.acceptanceCriteria) && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-req-acceptance">
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
                  disabled={readOnly}
                />
              )}
            />
          </div>
        )}
      </form>

      {(!readOnly ||
        requirementDetail.dependencies.length > 0 ||
        requirementDetail.linkedGoals.length > 0) && (
        <div className="border-border bg-muted/30 mt-4 rounded-md border">
          <Collapsible
            open={linksOpen}
            onOpenChange={setLinksOpen}
          >
            <CollapsibleTrigger asChild>
              <button
                type="button"
                aria-expanded={linksOpen}
                aria-controls="edit-requirement-links-content"
                className="text-foreground hover:text-foreground/80 flex w-full items-center justify-between px-4 py-3 text-sm font-medium"
              >
                <span className="flex items-center gap-1.5">
                  <Link2
                    className="h-3.5 w-3.5"
                    aria-hidden="true"
                  />
                  {t('features.planningObjects.requirements.linksSection')}
                </span>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 transition-transform duration-200',
                    linksOpen && 'rotate-180',
                  )}
                  aria-hidden="true"
                />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent forceMount>
              <div
                id="edit-requirement-links-content"
                className="border-border flex flex-col gap-6 border-t px-4 pt-3 pb-4"
              >
                <RequirementDependenciesSection
                  key={requirementDetail.id}
                  ref={depsRef}
                  requirementId={requirementDetail.id}
                  requirementVersion={requirementDetail.version}
                  dependencies={requirementDetail.dependencies}
                  scopeId={scopeId}
                  readOnly={readOnly}
                  onDirtyChange={readOnly ? undefined : setLinksDirty}
                />
                <RequirementGoalLinksSection
                  ref={goalsRef}
                  requirementId={requirementDetail.id}
                  linkedGoals={requirementDetail.linkedGoals}
                  scopeId={scopeId}
                  readOnly={readOnly}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}
    </>
  )
}
