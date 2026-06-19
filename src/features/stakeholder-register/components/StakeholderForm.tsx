import { useEffect, useMemo, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import type {
  BehaviouralStrategy,
  Person,
  ProjectMember,
  StrategyDescription,
} from '@/entities/stakeholder'
import { useGetMembersByPerson } from '@/entities/stakeholder'
import { Button, Form, Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components'
import type { ComboboxOption } from '@/shared/components'

import { deriveBehaviouralStrategy } from '../utils/behaviouralStrategy'
import { stakeholderFormSchema, type StakeholderFormValues } from '../utils/stakeholderSchema'
import { InfluenceAttitudeMatrixEditor } from './InfluenceAttitudeMatrixEditor'
import { StakeholderAnalysisFields } from './StakeholderAnalysisFields'
import { StakeholderContactTab } from './StakeholderContactTab'
import { StakeholderFormHeaderRows } from './StakeholderFormHeaderRows'
import { StakeholderLogsTab } from './StakeholderLogsTab'
import { UnsavedLogsConfirmDialog } from './UnsavedLogsConfirmDialog'

function memberLabel(m: Person) {
  return `${m.firstName} ${m.lastName}`
}

function memberRole(m: ProjectMember) {
  return m.roleNames.join(', ')
}

const STRATEGY_DESCRIPTION_KEY: Record<
  BehaviouralStrategy,
  keyof Pick<StrategyDescription, 'manageClosely' | 'keepInformed' | 'keepSatisfied' | 'monitor'>
> = {
  MANAGE_CLOSELY: 'manageClosely',
  KEEP_INFORMED: 'keepInformed',
  KEEP_SATISFIED: 'keepSatisfied',
  MONITOR: 'monitor',
}

/** Props for {@link StakeholderForm}. */
export interface StakeholderFormProps {
  /** Domain object (Portfolio / Program / Project) id — source for the member pickers. */
  objectId: string
  defaultValues?: Partial<StakeholderFormValues>
  onSave: (values: StakeholderFormValues) => void
  onCancel: () => void
  readOnly?: boolean
  strategyDescription?: StrategyDescription | null
  initialResponsibleMember?: Person | null
  existingNames?: string[]
  /** Called whenever the combined dirty state (form changes or unsaved log edits) changes. */
  onHasUnsavedChangesChange?: (v: boolean) => void
}

/**
 * Full-featured stakeholder entry form with mandatory and optional field sections.
 *
 * Includes matrix position editor, member linking with name/role prefill,
 * responsible person picker, duplicate name detection, and an activity log tab.
 *
 * @param props - Component props.
 * @param props.objectId - The domain object ID used for member search queries.
 * @param props.defaultValues - Values to pre-fill the form when editing.
 * @param props.onSave - Callback invoked with validated form values on submit.
 * @param props.onCancel - Callback invoked when the user cancels without saving.
 * @param props.readOnly - When true, all inputs are disabled and the save button is hidden.
 * @param props.initialResponsibleMember - Pre-selected responsible person; preserved in the member option list even if absent from the current object's member list.
 * @param props.strategyDescription - Read-only strategy descriptions displayed alongside the matrix.
 * @param props.existingNames - All existing entry names for duplicate name warning.
 * @param props.onHasUnsavedChangesChange - Notifies the parent when the dirty state changes.
 * @returns A multi-tab form for creating or editing a stakeholder entry.
 */
// eslint-disable-next-line max-lines-per-function -- form orchestrator managing member linking, matrix position, duplicate detection, unsaved-log guard, and tab layout; already extracted UnsavedLogsConfirmDialog and strategy key map
export function StakeholderForm({
  objectId,
  defaultValues,
  onSave,
  onCancel,
  readOnly = false,
  strategyDescription,
  initialResponsibleMember,
  existingNames,
  onHasUnsavedChangesChange,
}: StakeholderFormProps) {
  const { t } = useTranslation()

  const form = useForm<StakeholderFormValues>({
    resolver: zodResolver(stakeholderFormSchema),
    defaultValues: defaultValues ?? {
      name: '',
      role: '',
      contactGroup: undefined,
      email: null,
      email2: null,
      email3: null,
      phone: null,
      phone2: null,
      phone3: null,
      preferredCommunicationType: null,
      matrixPosition: null,
      typeOfAffectedness: 'NEUTRAL',
      conflictPotential: null,
      expectations: null,
      responsible: null,
      inclusionMeasures: null,
      memberId: null,
      logs: [],
    },
  })

  const watchedMatrix = useWatch({ control: form.control, name: 'matrixPosition' })
  const watchedName = useWatch({ control: form.control, name: 'name' })
  const strategy = watchedMatrix ? deriveBehaviouralStrategy(watchedMatrix) : null

  const { data: members = [], isLoading: membersLoading } = useGetMembersByPerson(objectId)

  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false)
  const [hasUnsavedLogs, setHasUnsavedLogs] = useState(false)
  const [pendingValues, setPendingValues] = useState<StakeholderFormValues | null>(null)

  useEffect(() => {
    onHasUnsavedChangesChange?.(form.formState.isDirty || hasUnsavedLogs)
  }, [form.formState.isDirty, hasUnsavedLogs, onHasUnsavedChangesChange])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!watchedName || !existingNames?.length) {
        setShowDuplicateWarning(false)
        return
      }
      const trimmed = watchedName.trim().toLowerCase()
      setShowDuplicateWarning(existingNames.some((n) => n.trim().toLowerCase() === trimmed))
    }, 300)
    return () => clearTimeout(timer)
  }, [watchedName, existingNames])

  // Static option list of project members. A seed option preserves the selected
  // label when the current selection is no longer among the object's members.
  const memberOptions = useMemo<ComboboxOption[]>(() => {
    const opts = members.map((m) => ({ value: m.id, label: memberLabel(m) }))
    const has = (id: string) => opts.some((o) => o.value === id)
    if (defaultValues?.memberId && defaultValues?.name && !has(defaultValues.memberId)) {
      opts.unshift({ value: defaultValues.memberId, label: defaultValues.name })
    }
    if (initialResponsibleMember && !has(initialResponsibleMember.id)) {
      opts.unshift({
        value: initialResponsibleMember.id,
        label: memberLabel(initialResponsibleMember),
      })
    }
    return opts
  }, [members, defaultValues, initialResponsibleMember])

  const handleMemberLinkChange = (memberId: string | null) => {
    if (!memberId) {
      form.setValue('memberId', null)
      return
    }
    const member = members.find((m) => m.id === memberId)
    if (member) {
      form.setValue('name', memberLabel(member), { shouldValidate: false })
      // Prefill the role field from the member's RASCI role(s) on this object.
      const role = memberRole(member)
      if (role) {
        form.setValue('role', role, { shouldValidate: true })
      }
    }
    form.setValue('memberId', memberId)
  }

  function handleSubmitWithCheck(values: StakeholderFormValues) {
    if (hasUnsavedLogs) {
      setPendingValues(values)
    } else {
      onSave(values)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmitWithCheck)}
        className="flex flex-col gap-4"
        noValidate
      >
        <StakeholderFormHeaderRows
          memberOptions={memberOptions}
          membersLoading={membersLoading}
          readOnly={readOnly}
          showDuplicateWarning={showDuplicateWarning}
          onMemberLinkChange={handleMemberLinkChange}
        />

        <Tabs
          defaultValue="general"
          className="-mt-2 min-h-[480px]"
        >
          <TabsList>
            <TabsTrigger value="general">
              {t('pages.stakeholderRegister.form.tabGeneral')}
            </TabsTrigger>
            <TabsTrigger value="contact">
              {t('pages.stakeholderRegister.form.tabContact')}
            </TabsTrigger>
            <TabsTrigger value="logs">{t('pages.stakeholderRegister.form.tabLogs')}</TabsTrigger>
          </TabsList>

          <TabsContent
            value="general"
            className="flex flex-col gap-4 pt-4"
          >
            {/* Matrix (left) | Analysis fields (right) */}
            <div className="mt-4 grid grid-cols-2 gap-8">
              {/* Left: Matrix */}
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium">
                  {t('pages.stakeholderRegister.matrix.sectionTitle')}
                </p>
                <InfluenceAttitudeMatrixEditor
                  value={watchedMatrix ?? null}
                  onChange={(pos) => form.setValue('matrixPosition', pos ?? undefined)}
                  readOnly={readOnly}
                />
                {strategy && strategyDescription && (
                  <p className="text-muted-foreground text-sm italic">
                    {strategyDescription[STRATEGY_DESCRIPTION_KEY[strategy]]}
                  </p>
                )}
              </div>

              {/* Right: Analysis fields */}
              <StakeholderAnalysisFields
                readOnly={readOnly}
                memberOptions={memberOptions}
                membersLoading={membersLoading}
              />
            </div>
          </TabsContent>

          <TabsContent
            value="contact"
            className="pt-4"
          >
            <StakeholderContactTab readOnly={readOnly} />
          </TabsContent>

          <TabsContent
            value="logs"
            className="pt-4"
          >
            <StakeholderLogsTab
              readOnly={readOnly}
              onHasUnsavedChanges={setHasUnsavedLogs}
            />
          </TabsContent>
        </Tabs>

        {!readOnly && (
          <div className="mt-4 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              {t('pages.stakeholderRegister.form.cancelButton')}
            </Button>
            <Button type="submit">{t('pages.stakeholderRegister.form.saveButton')}</Button>
          </div>
        )}
      </form>

      <UnsavedLogsConfirmDialog
        open={pendingValues !== null}
        onClose={() => setPendingValues(null)}
        onConfirm={() => {
          if (pendingValues) {
            onSave(pendingValues)
            setPendingValues(null)
          }
        }}
      />
    </Form>
  )
}
