import { useRef } from 'react'

import { useTranslation } from 'react-i18next'

import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  showPromise,
} from '@/shared/components'
import { getGraphQLErrorMessage } from '@/shared/lib/utils'

import { useCreateProjectInitiationRequest } from '../hooks/useCreateProjectInitiationRequest'
import { useSubmitProjectInitiationRequest } from '../hooks/useSubmitProjectInitiationRequest'
import { useCreatePirDialogStore } from '../store/useCreatePirDialogStore'
import type { ProjectInitiationRequestFormValues } from '../utils/projectInitiationRequestSchema'
import type { ProjectInitiationRequestFormHandle } from './ProjectInitiationRequestForm'
import { ProjectInitiationRequestForm } from './ProjectInitiationRequestForm'

function opt<T>(v: T | null | undefined): T | undefined {
  return v ?? undefined
}
function optStr(v: string | null | undefined): string | undefined {
  return v || undefined
}

function buildCreateInput(values: ProjectInitiationRequestFormValues) {
  return {
    name: values.name,
    requestingProjectId: values.requestingProjectId,
    scopeId: values.scopeId,
    scopeType: values.scopeType,
    documentVersion: optStr(values.documentVersion),
    projectInitiator: opt(values.projectInitiator),
    projectOwner: opt(values.projectOwner),
    organizationalUnit: opt(values.organizationalUnit),
    solutionProvider: opt(values.solutionProvider),
    approvalAuthority: opt(values.approvalAuthority),
    requestDate: opt(values.requestDate),
    estimatedEffort: opt(values.estimatedEffort),
    estimatedEffortComment: optStr(values.estimatedEffortComment),
    targetDeliveryDate: opt(values.targetDeliveryDate),
    deliveryType: opt(values.deliveryType),
  }
}

/**
 * Scrollable dialog for creating a new project initiation request.
 * Open/close state is managed by `useCreatePirDialogStore`.
 *
 * On "Submit Request": creates the PIR then immediately submits it (create-then-submit).
 * On "Save as Draft": creates the PIR with draft status (backend default).
 * On success, closes the dialog and navigates to the detail page for the new PIR.
 *
 * @returns The create-PIR dialog.
 */
// eslint-disable-next-line max-lines-per-function -- 101 lines, one over limit; extraction would over-engineer a single cohesive dialog
export function CreateProjectInitiationRequestDialog() {
  const { t } = useTranslation()
  const { isOpen, close } = useCreatePirDialogStore()
  const { mutateAsync: createPIR, isPending: isCreating } = useCreateProjectInitiationRequest()
  const { mutateAsync: submitPIR, isPending: isSubmitting } = useSubmitProjectInitiationRequest()
  const formRef = useRef<ProjectInitiationRequestFormHandle>(null)

  const isPending = isCreating || isSubmitting

  function handleSubmit(values: ProjectInitiationRequestFormValues) {
    showPromise(
      (async () => {
        const created = await createPIR(buildCreateInput(values))
        if (created.status === 'draft') {
          await submitPIR({ id: created.id, version: created.version })
        }
        close()
      })(),
      {
        loading: t('pages.initiationRequests.toast.submitting'),
        success: t('pages.initiationRequests.toast.submitSuccess'),
        error: (err) =>
          getGraphQLErrorMessage(err, t('pages.initiationRequests.toast.submitError')),
      },
    )
  }

  function handleSaveDraft(values: ProjectInitiationRequestFormValues) {
    showPromise(
      (async () => {
        await createPIR(buildCreateInput(values))
        close()
      })(),
      {
        loading: t('pages.initiationRequests.toast.creating'),
        success: t('pages.initiationRequests.toast.createSuccess'),
        error: (err) =>
          getGraphQLErrorMessage(err, t('pages.initiationRequests.toast.createError')),
      },
    )
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) close()
      }}
    >
      <DialogContent
        size="xl"
        className="flex max-h-[90vh] flex-col overflow-hidden"
      >
        <DialogHeader className="shrink-0">
          <DialogTitle>{t('pages.initiationRequests.dialog.createTitle')}</DialogTitle>
          <DialogDescription>
            {t('pages.initiationRequests.dialog.createDescription')}
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          <ProjectInitiationRequestForm
            ref={formRef}
            formId="create-pir-form"
            mode="create"
            onSubmit={handleSubmit}
            onSaveDraft={handleSaveDraft}
            isPending={isPending}
            hideActions
          />
        </DialogBody>

        <DialogFooter className="shrink-0">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={close}
          >
            {t('pages.initiationRequests.form.cancelButton')}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => formRef.current?.saveDraft()}
          >
            {t('pages.initiationRequests.form.saveDraftButton')}
          </Button>
          <Button
            type="submit"
            form="create-pir-form"
            disabled={isPending}
          >
            {t('pages.initiationRequests.form.submitButton')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
