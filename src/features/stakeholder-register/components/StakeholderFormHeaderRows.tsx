import { TriangleAlert } from 'lucide-react'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import {
  Alert,
  AlertDescription,
  AlertTitle,
  Combobox,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/shared/components'
import type { ComboboxOption } from '@/shared/components'
import { cn } from '@/shared/lib/utils'

import type { StakeholderFormValues } from '../utils/stakeholderSchema'
import { RequiredMark } from './RequiredMark'

interface StakeholderFormHeaderRowsProps {
  memberOptions: ComboboxOption[]
  membersLoading: boolean
  readOnly: boolean
  showDuplicateWarning: boolean
  onMemberLinkChange: (memberId: string | null) => void
}

/**
 * First two rows of the stakeholder form: member link + role (row 1) and name + contact group (row 2).
 *
 * Reads from the parent `react-hook-form` context via `useFormContext`.
 *
 * @param props - Component props.
 * @param props.memberOptions - Options for the member link combobox.
 * @param props.membersLoading - Whether the member options are still loading.
 * @param props.readOnly - When true, disables all input controls.
 * @param props.showDuplicateWarning - Whether to show the duplicate name alert.
 * @param props.onMemberLinkChange - Callback when the member link combobox value changes.
 * @returns Two form rows rendered as a React fragment.
 */
// eslint-disable-next-line max-lines-per-function -- two header rows with 4 FormField definitions each; verbosity is inherent to form-field JSX and cannot be reduced without obscuring the field structure
export function StakeholderFormHeaderRows({
  memberOptions,
  membersLoading,
  readOnly,
  showDuplicateWarning,
  onMemberLinkChange,
}: StakeholderFormHeaderRowsProps) {
  const { t } = useTranslation()
  const { control, setValue, getValues } = useFormContext<StakeholderFormValues>()

  return (
    <>
      {/* Row 1: Link to member | Role — always visible */}
      <div className="grid grid-cols-2 gap-8">
        {/* Member link picker (T055) */}
        <FormField
          control={control}
          name="memberId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('pages.stakeholderRegister.form.memberLinkLabel')}</FormLabel>
              <Combobox
                value={field.value ?? null}
                options={memberOptions}
                onChange={onMemberLinkChange}
                placeholder={t('pages.stakeholderRegister.form.memberLinkPlaceholder')}
                noResultsText={t('pages.stakeholderRegister.form.memberLinkNoResults')}
                loading={membersLoading}
                disabled={readOnly}
              />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('pages.stakeholderRegister.form.roleLabel')}
                <RequiredMark />
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={readOnly}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Row 2: Name | Contact Group — always visible */}
      <div className="grid grid-cols-2 gap-8">
        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('pages.stakeholderRegister.form.nameLabel')}
                <RequiredMark />
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={readOnly}
                  onChange={(e) => {
                    field.onChange(e)
                    // T056: clear member link when user manually edits name
                    if (getValues('memberId')) {
                      setValue('memberId', null)
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
              <Alert
                variant="warning"
                className={cn(!showDuplicateWarning && 'invisible')}
                aria-hidden={!showDuplicateWarning}
              >
                <TriangleAlert className="h-4 w-4" />
                <AlertTitle>
                  {t('pages.stakeholderRegister.form.duplicateNameWarningTitle')}
                </AlertTitle>
                <AlertDescription>
                  {t('pages.stakeholderRegister.form.duplicateNameWarning')}
                </AlertDescription>
              </Alert>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="contactGroup"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('pages.stakeholderRegister.form.contactGroupLabel')}
                <RequiredMark />
              </FormLabel>
              <Select
                value={field.value ?? ''}
                onValueChange={field.onChange}
                disabled={readOnly}
              >
                <FormControl>
                  <SelectTrigger data-testid="contact-group-select">
                    <span>
                      {field.value
                        ? t(`pages.stakeholderRegister.form.contactGroupOptions.${field.value}`)
                        : t('pages.stakeholderRegister.form.contactGroupPlaceholder')}
                    </span>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {(['INTERNAL', 'CUSTOMER', 'SUPPLIER', 'PARTNER'] as const).map((opt) => (
                    <SelectItem
                      key={opt}
                      value={opt}
                    >
                      {t(`pages.stakeholderRegister.form.contactGroupOptions.${opt}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  )
}
