import { useTranslation } from 'react-i18next'

import { useStakeholderDialogStore } from '../store/useStakeholderDialogStore'
import { entryToFormValues } from '../utils/stakeholderMappers'
import type { StakeholderFormValues } from '../utils/stakeholderSchema'

/** Mode of the stakeholder dialog — `'create'` when opening without a payload. */
export type StakeholderDialogMode = 'create' | 'edit'

/** Data derived by {@link useStakeholderDialogData} for the dialog component. */
export interface StakeholderDialogData {
  mode: StakeholderDialogMode
  defaultValues: StakeholderFormValues | undefined
  dialogTitle: string
}

/**
 * Derives the dialog mode, default form values, and translated title from
 * the current {@link useStakeholderDialogStore} payload.
 *
 * @returns An object with `mode`, `defaultValues`, and `dialogTitle`.
 */
export function useStakeholderDialogData(): StakeholderDialogData {
  const { t } = useTranslation()
  const payload = useStakeholderDialogStore((s) => s.payload)

  if (payload) {
    return {
      mode: 'edit',
      defaultValues: entryToFormValues(payload),
      dialogTitle: t('pages.stakeholderRegister.form.editTitle'),
    }
  }

  return {
    mode: 'create',
    defaultValues: undefined,
    dialogTitle: t('pages.stakeholderRegister.form.createTitle'),
  }
}
