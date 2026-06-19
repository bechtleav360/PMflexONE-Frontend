import { useTranslation } from 'react-i18next'

import {
  Badge,
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Form,
  Skeleton,
} from '@/shared/components'

import { useDeliverableFormState } from '../../hooks/useDeliverableFormState'
import { DeliverableFormFields } from './DeliverableFormFields'

interface DeliverableFormModalProps {
  /** Project ID used for mutation scoping and parent dropdown. */
  projectId: string
}

/**
 * Unified create / edit / read-only modal for deliverables.
 *
 * Open state, mode, and all business logic are driven by
 * `useDeliverableFormState`. The modal renders the form shell and delegates
 * all data-fetching, validation, and submit handling to that hook.
 *
 * @param props - Component props.
 * @param props.projectId - Project ID passed to the form state hook.
 * @returns The rendered deliverable form dialog.
 */
// Justified: two dialog shells (form + unsaved-changes) + JSX-only option enrichment
// (inactive-owner Badge). Fields extracted to DeliverableFormFields.tsx.
// eslint-disable-next-line max-lines-per-function -- two dialog shells (form + unsaved-changes) + JSX-only option enrichment; fields are already extracted to DeliverableFormFields
export function DeliverableFormModal({ projectId }: DeliverableFormModalProps) {
  const { t } = useTranslation()
  const {
    form,
    isOpen,
    mode,
    isReadOnly,
    isSaving,
    personsLoading,
    parentOptions,
    ownerOptions,
    showSkeleton,
    titleKey,
    handleClose,
    onSubmit,
    unsavedChangesOpen,
    handleConfirmDiscard,
    handleCancelDiscard,
    inactiveOwnerName,
    inactiveSuffix,
  } = useDeliverableFormState(projectId)

  // Enrich the inactive-owner option with a Badge renderLabel — JSX stays in the component layer.
  const enrichedOwnerOptions = inactiveOwnerName
    ? ownerOptions.map((opt) =>
        opt.disabled
          ? {
              ...opt,
              renderLabel: () => (
                <span className="flex items-center gap-1.5">
                  <span>{inactiveOwnerName}</span>
                  <Badge
                    variant="warning"
                    className="text-xs"
                  >
                    {inactiveSuffix}
                  </Badge>
                </span>
              ),
            }
          : opt,
      )
    : ownerOptions

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) handleClose()
        }}
      >
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>{t(titleKey)}</DialogTitle>
            <DialogDescription className="sr-only">
              {t('features.deliverablesManagement.dialog.formDescription')}
            </DialogDescription>
          </DialogHeader>

          {showSkeleton ? (
            <DialogBody>
              <div className="flex flex-col gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    className="h-10 w-full rounded-md"
                  />
                ))}
              </div>
            </DialogBody>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                noValidate
              >
                <DialogBody className="flex flex-col gap-4">
                  <DeliverableFormFields
                    control={form.control}
                    isReadOnly={isReadOnly}
                    isSaving={isSaving}
                    personsLoading={personsLoading}
                    parentOptions={parentOptions}
                    ownerOptions={enrichedOwnerOptions}
                    mode={mode}
                  />
                </DialogBody>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={isSaving}
                  >
                    {t('features.deliverablesManagement.actions.cancel')}
                  </Button>
                  {!isReadOnly && (
                    <Button
                      type="submit"
                      disabled={isSaving}
                    >
                      {t('features.deliverablesManagement.actions.save')}
                    </Button>
                  )}
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>

      {/* Unsaved-changes confirmation dialog */}
      <Dialog
        open={unsavedChangesOpen}
        onOpenChange={(open) => {
          if (!open) handleCancelDiscard()
        }}
      >
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>{t('features.deliverablesManagement.unsavedChanges.title')}</DialogTitle>
            <DialogDescription className="sr-only">
              {t('features.deliverablesManagement.unsavedChanges.description')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelDiscard}
            >
              {t('features.deliverablesManagement.unsavedChanges.keepEditing')}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDiscard}
            >
              {t('features.deliverablesManagement.unsavedChanges.discard')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
