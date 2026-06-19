import { Eye, ListPlus, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components'

import { useDeliverablesUiStore } from '../../store/deliverablesUiStore'

interface DeliverableTreeNodeActionsProps {
  /** ID of the deliverable this row belongs to. */
  nodeId: string
  /** Optimistic-lock version, forwarded to the delete dialog. */
  nodeVersion: number
  /** Parent ID used for "create sibling" — `undefined` for root nodes. */
  parentId: string | undefined
  /** Whether write actions (edit, create, delete) should be rendered. */
  canWrite: boolean
}

/**
 * Single kebab button that opens a dropdown with all actions for a deliverable row.
 *
 * Replaces per-action tooltip buttons to reduce per-row DOM count — the dropdown
 * content renders in a portal only while open, so closed rows pay only ~3 DOM nodes
 * instead of the ~18 required by the previous inline button layout.
 *
 * @param props - Component props.
 * @param props.nodeId - ID of the deliverable.
 * @param props.nodeVersion - Version for optimistic-lock delete.
 * @param props.parentId - Parent ID for the "create sibling" action.
 * @param props.canWrite - Whether to render write-only actions.
 * @returns The rendered kebab button with dropdown menu.
 */
export function DeliverableTreeNodeActions({
  nodeId,
  nodeVersion,
  parentId,
  canWrite,
}: DeliverableTreeNodeActionsProps) {
  const { t } = useTranslation()

  const openReadModal = useDeliverablesUiStore((s) => s.openReadModal)
  const openEditModal = useDeliverablesUiStore((s) => s.openEditModal)
  const openCreateModal = useDeliverablesUiStore((s) => s.openCreateModal)
  const openDeleteDialog = useDeliverablesUiStore((s) => s.openDeleteDialog)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-6 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100"
          aria-label={t('features.deliverablesManagement.actions.rowActions')}
        >
          <MoreHorizontal
            className="size-3.5"
            aria-hidden="true"
          />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => openReadModal(nodeId)}>
          <Eye
            className="mr-2 size-4"
            aria-hidden="true"
          />
          {t('features.deliverablesManagement.actions.view')}
        </DropdownMenuItem>

        {canWrite && (
          <>
            <DropdownMenuItem onSelect={() => openEditModal(nodeId)}>
              <Pencil
                className="mr-2 size-4"
                aria-hidden="true"
              />
              {t('features.deliverablesManagement.actions.edit')}
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onSelect={() => openCreateModal(nodeId)}>
              <Plus
                className="mr-2 size-4"
                aria-hidden="true"
              />
              {t('features.deliverablesManagement.actions.createChild')}
            </DropdownMenuItem>

            <DropdownMenuItem onSelect={() => openCreateModal(parentId)}>
              <ListPlus
                className="mr-2 size-4"
                aria-hidden="true"
              />
              {t('features.deliverablesManagement.actions.createSibling')}
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onSelect={() => openDeleteDialog(nodeId, nodeVersion)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2
                className="mr-2 size-4"
                aria-hidden="true"
              />
              {t('features.deliverablesManagement.actions.delete')}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
