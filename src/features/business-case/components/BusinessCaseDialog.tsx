import { useRef } from 'react'

import { useTranslation } from 'react-i18next'

import type { BusinessCaseNode } from '@/entities/business-case'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Skeleton,
} from '@/shared/components'

import { useBusinessCaseDialogActions } from '../hooks/useBusinessCaseDialogActions'
import type { BusinessCaseFormValues } from '../utils/businessCaseSchema'
import { BusinessCaseDialogFooter } from './BusinessCaseDialogFooter'
import type { BusinessCaseFormHandle } from './BusinessCaseForm'
import { BusinessCaseForm } from './BusinessCaseForm'
import { BusinessCaseStatusBadge } from './BusinessCaseStatusBadge'

interface BusinessCaseDialogProps {
  projectId: string
  isOpen: boolean
  onClose: () => void
}

function toFormValues(bc: BusinessCaseNode): BusinessCaseFormValues {
  return {
    clientSummary: bc.clientSummary ?? '',
    projectRationale: bc.projectRationale ?? '',
    expectedBenefit: bc.expectedBenefit ?? '',
    options: bc.options ?? '',
    investmentCalculation: bc.investmentCalculation ?? '',
    keyRisks: bc.keyRisks ?? '',
    expectedNegativeSideEffect: bc.expectedNegativeSideEffect ?? '',
    timeline: bc.timeline ?? '',
  }
}

const FORM_ID = 'business-case-dialog-form'

/**
 * Combined create / view / edit dialog for a project's Business Case.
 * Opened from the Project Detail page.
 *
 * - No BC exists    → create form with Save as Draft + Mark as Complete actions.
 * - BC is draft     → edit form with the same actions.
 * - BC is submitted → edit form with Save only (mark-complete hidden).
 *
 * @param props - Component props.
 * @param props.projectId - The project to scope the BC lookup and creation to.
 * @param props.isOpen    - Whether the dialog is visible.
 * @param props.onClose   - Callback to close the dialog.
 * @returns The business case dialog.
 */
export function BusinessCaseDialog({ projectId, isOpen, onClose }: BusinessCaseDialogProps) {
  const { t } = useTranslation()
  const formRef = useRef<BusinessCaseFormHandle>(null)

  const {
    bc,
    isLoading,
    isSavePending,
    isSubmitting,
    hasExisting,
    isSubmitted,
    isAccepted,
    handleSaveDraft,
    markCompleteHandler,
  } = useBusinessCaseDialogActions({ projectId, onClose })

  const dialogTitle = hasExisting
    ? t('pages.businessCase.detailPage.heading')
    : t('pages.businessCase.newPage.heading')

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent
        size="xl"
        className="flex max-h-[90vh] flex-col overflow-hidden"
        aria-describedby={undefined}
      >
        <DialogHeader className="shrink-0">
          <div className="flex items-center gap-2">
            <DialogTitle>{dialogTitle}</DialogTitle>
            {bc?.status && <BusinessCaseStatusBadge status={bc.status} />}
          </div>
        </DialogHeader>

        <DialogBody>
          {isLoading ? (
            <div className="flex flex-col gap-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : (
            <BusinessCaseForm
              ref={formRef}
              formId={FORM_ID}
              hideActions
              mode={hasExisting ? 'edit' : 'create'}
              defaultValues={bc ? toFormValues(bc) : undefined}
              onSaveDraft={handleSaveDraft}
              onMarkComplete={markCompleteHandler}
              isSavePending={isSavePending}
              isSubmitPending={isSubmitting}
            />
          )}
        </DialogBody>

        {!isLoading && (
          <BusinessCaseDialogFooter
            formId={FORM_ID}
            isAccepted={isAccepted}
            isSubmitted={isSubmitted}
            isSavePending={isSavePending}
            isSubmitting={isSubmitting}
            onClose={onClose}
            onMarkComplete={() => formRef.current?.triggerMarkComplete()}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
