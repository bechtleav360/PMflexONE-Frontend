import { useEffect, useMemo, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import type { ComboboxOption } from '@/shared/components/Combobox/ComboboxTypes'
import { showError, showSuccess } from '@/shared/components/Toast/toastApi'

import { deliverableFormValuesSchema } from '../api/deliverablesApi'
import { useDeliverablesUiStore } from '../store/deliverablesUiStore'
import type { DeliverableFormValues } from '../types/deliverable.types'
import { isBusinessIdDuplicate, suggestBusinessId } from '../utils/generateBusinessId'
import { getExcludedParentIds } from '../utils/getDeliverableDescendants'
import { useCreateDeliverable } from './useCreateDeliverable'
import { useDeliverable, useDeliverableTree } from './useDeliverables'
import { usePersons } from './usePersons'
import { useUpdateDeliverable } from './useUpdateDeliverable'

const DUPLICATE_KEY = 'features.deliverablesManagement.validation.businessIdDuplicate'

/** Stable empty references — avoid useMemo invalidation when treeData is undefined. */
const EMPTY_TREE: never[] = []
const EMPTY_FLAT: never[] = []

/**
 * Encapsulates all form state, effects, validation, and submission logic for
 * the deliverable create / edit / read-only modal.
 *
 * Separating this from the JSX keeps `DeliverableFormModal` below the
 * `max-lines-per-function` trigger and makes the logic independently testable.
 *
 * @param projectId - Project ID used to scope queries and mutations.
 * @returns Form control object and all derived state needed by `DeliverableFormModal`.
 */
// eslint-disable-next-line max-lines-per-function, complexity -- aggregates form control, modal open/close, pre-fill effects, businessId dedup, and submit/delete orchestration; splitting these into separate hooks would require excessive prop-drilling of shared state
export function useDeliverableFormState(projectId: string) {
  const { t } = useTranslation()

  // Store
  const modal = useDeliverablesUiStore((s) => s.modal)
  const closeModal = useDeliverablesUiStore((s) => s.closeModal)
  const { open: isOpen, mode, deliverableId, initialParentId } = modal
  const isReadOnly = mode === 'read'

  // Data fetching
  const { data: treeData } = useDeliverableTree(projectId)
  const flat = useMemo(() => treeData?.flat ?? EMPTY_FLAT, [treeData?.flat])
  const tree = useMemo(() => treeData?.tree ?? EMPTY_TREE, [treeData?.tree])

  const { data: existing, isPending: existingLoading } = useDeliverable(deliverableId)
  const { data: persons = [], isPending: personsLoading } = usePersons()

  // Mutations
  const createMutation = useCreateDeliverable(projectId)
  const updateMutation = useUpdateDeliverable(projectId)
  const isSaving = createMutation.isPending || updateMutation.isPending

  // Suggested businessId for new deliverables (recomputed only when modal opens or parent changes)
  const suggestedBusinessId = useMemo(
    () => suggestBusinessId(tree, initialParentId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isOpen, initialParentId],
  )

  // Form
  const form = useForm<DeliverableFormValues>({
    resolver: zodResolver(deliverableFormValuesSchema),
    defaultValues: {
      name: '',
      businessId: '',
      parentId: initialParentId ?? null,
      ownerId: null,
      description: null,
      otherInformation: null,
    },
  })

  // Early duplicate-businessId validation (fires on every change, not just submit)
  const watchedBusinessId = form.watch('businessId')
  useEffect(() => {
    if (!isOpen) return
    if (watchedBusinessId && isBusinessIdDuplicate(watchedBusinessId, flat, deliverableId)) {
      form.setError('businessId', { message: DUPLICATE_KEY })
    } else if (form.formState.errors.businessId?.message === DUPLICATE_KEY) {
      form.clearErrors('businessId')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedBusinessId, flat, deliverableId, isOpen])

  // Reset / pre-fill when modal opens or existing data arrives
  // eslint-disable-next-line complexity -- branches cover create/edit/read modes × existing data arrival timing; each branch is a distinct pre-fill scenario that cannot be flattened without losing readability
  useEffect(() => {
    if (!isOpen) {
      form.reset()
      return
    }

    if (mode === 'create') {
      form.reset({
        name: '',
        businessId: suggestedBusinessId,
        parentId: initialParentId ?? null,
        ownerId: null,
        description: null,
        otherInformation: null,
      })
      const id = setTimeout(() => {
        form.setFocus('name')
      }, 50)
      return () => clearTimeout(id)
    } else if ((mode === 'edit' || mode === 'read') && existing) {
      form.reset({
        name: existing.name,
        businessId: existing.businessId ?? '',
        parentId: existing.parent?.node.id ?? null,
        ownerId: existing.owner?.node.id ?? null,
        description: existing.description ?? null,
        otherInformation: existing.otherInformation ?? null,
      })
    }
    // Intentionally exclude `existing` object reference — we only want to pre-fill
    // when the modal opens or when a *different* deliverable is loaded, not on every
    // background refetch. See DeliverableFormModal for full explanation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, mode, existing?.id])

  // Parent dropdown options (exclude self and descendants in edit mode)
  const excludedParentIds = useMemo(
    () => (deliverableId ? getExcludedParentIds(deliverableId, tree) : new Set<string>()),
    [deliverableId, tree],
  )
  const parentOptions = useMemo(
    () =>
      flat
        .filter((d) => !excludedParentIds.has(d.id))
        .map((d) => ({
          value: d.id,
          label: d.businessId ? `${d.businessId} – ${d.name}` : d.name,
        })),
    [flat, excludedParentIds],
  )

  // Owner dropdown — inactive persons (no userId) cannot be selected as new owners.
  // If the currently assigned owner has become inactive, they are injected as a
  // disabled option so the combobox can still display their name in edit/read mode.
  const inactiveSuffix = t('features.deliverablesManagement.accessibility.inactiveOwnerSuffix')
  const { ownerOptions, inactiveOwnerName } = useMemo(() => {
    const activeOptions: ComboboxOption[] = persons
      .filter((p) => !!p.userId)
      .map((p) => ({ value: p.id, label: `${p.firstName} ${p.lastName}`.trim() }))
    const ownerNode = existing?.owner?.node ?? null
    if (ownerNode && !ownerNode.userId) {
      const name = `${ownerNode.firstName} ${ownerNode.lastName}`.trim()
      return {
        inactiveOwnerName: name,
        ownerOptions: [
          {
            value: ownerNode.id,
            label: `${name} ${inactiveSuffix}`,
            disabled: true,
          },
          ...activeOptions,
        ],
      }
    }
    return { inactiveOwnerName: null, ownerOptions: activeOptions }
  }, [persons, existing?.owner?.node, inactiveSuffix])

  const [unsavedChangesOpen, setUnsavedChangesOpen] = useState(false)

  function handleClose() {
    if (form.formState.isDirty && !isReadOnly) {
      setUnsavedChangesOpen(true)
      return
    }
    closeModal()
  }

  function handleConfirmDiscard() {
    setUnsavedChangesOpen(false)
    closeModal()
  }

  function handleCancelDiscard() {
    setUnsavedChangesOpen(false)
  }

  // eslint-disable-next-line complexity -- handles create vs. edit paths, businessId dedup guard, field error setting, and toast dispatch; all branches share the same form values and cannot be split without duplicating the dedup check
  async function onSubmit(values: DeliverableFormValues) {
    // Duplicate businessId guard (zodResolver owns field validation so rules.validate
    // is ignored; check here before mutating and surface as a field error).
    if (values.businessId && isBusinessIdDuplicate(values.businessId, flat, deliverableId)) {
      form.setError('businessId', { message: DUPLICATE_KEY })
      return
    }

    try {
      if (mode === 'create') {
        await createMutation.mutateAsync({
          name: values.name,
          businessId: values.businessId || null,
          parentId: values.parentId ?? null,
          ownerId: values.ownerId ?? null,
          description: values.description ?? null,
          otherInformation: values.otherInformation ?? null,
        })
        showSuccess(t('features.deliverablesManagement.toast.created'))
      } else if (mode === 'edit' && deliverableId) {
        if (!existing) {
          showError(t('features.deliverablesManagement.toast.notFound'))
          return
        }
        await updateMutation.mutateAsync({
          id: deliverableId,
          input: {
            version: existing.version,
            name: values.name,
            businessId: values.businessId || null,
            ownerId: values.ownerId ?? null,
            description: values.description ?? null,
            otherInformation: values.otherInformation ?? null,
          },
        })
        showSuccess(t('features.deliverablesManagement.toast.saved'))
      }
      closeModal()
    } catch {
      showError(t('features.deliverablesManagement.toast.saveFailed'))
    }
  }

  const showSkeleton = (mode === 'edit' || mode === 'read') && existingLoading

  const titleKey =
    mode === 'create'
      ? 'features.deliverablesManagement.actions.create'
      : mode === 'edit'
        ? 'features.deliverablesManagement.actions.edit'
        : 'features.deliverablesManagement.actions.view'

  return {
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
  }
}
