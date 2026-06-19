import { ListPlus, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/components'

import { useSupportServicesUiStore } from '../../store/supportServicesUiStore'
import { triggerCreateChild } from './triggerCreateChild'

interface SupportServiceTreeNodeActionsProps {
  /** ID of the support service this row belongs to. */
  nodeId: string
  /** Optimistic-lock version, forwarded to the delete dialog. */
  nodeVersion: number
  /** Node name, used for the first-child warning dialog. */
  nodeName: string
  /** Parent ID used for "create sibling" — `undefined` for root nodes. */
  parentId: string | undefined
  /** Whether this node has children (controls delete dialog variant). */
  hasChildren: boolean
  /** Estimated effort of this node (for first-child warning check). */
  estimatedEffort: number | null
  /** Whether write actions (edit, create, delete) should be rendered. */
  canWrite: boolean
}

/**
 * Single kebab button that opens a dropdown with all actions for a support service row.
 *
 * Actions:
 * - "Bearbeiten" → open form dialog in edit mode
 * - "Untergeordnete Supportleistung anlegen" → check firstChildWarning if leaf with effort > 0,
 *   otherwise open form dialog with parentId pre-filled
 * - "Löschen" → open delete dialog with hasChildren flag
 *
 * @param props - Component props.
 * @returns The rendered kebab button with dropdown menu.
 */
export function SupportServiceTreeNodeActions({
  nodeId,
  nodeVersion,
  nodeName,
  parentId,
  hasChildren,
  estimatedEffort,
  canWrite,
}: SupportServiceTreeNodeActionsProps) {
  const { t } = useTranslation()

  const openDeleteDialog = useSupportServicesUiStore((s) => s.openDeleteDialog)
  const openFirstChildWarning = useSupportServicesUiStore((s) => s.openFirstChildWarning)
  const openFormDialog = useSupportServicesUiStore((s) => s.openFormDialog)

  if (!canWrite) return null

  function handleCreateChild() {
    triggerCreateChild(
      nodeId,
      nodeName,
      estimatedEffort,
      hasChildren,
      openFirstChildWarning,
      openFormDialog,
    )
  }

  return (
    <DropdownMenu>
      <Tooltip>
        <DropdownMenuTrigger asChild>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100"
              aria-label={t('features.supportServicesManagement.actions.rowActions')}
            >
              <MoreHorizontal
                className="size-3.5"
                aria-hidden="true"
              />
            </Button>
          </TooltipTrigger>
        </DropdownMenuTrigger>
        <TooltipContent>
          {t('features.supportServicesManagement.actions.rowActions')}
        </TooltipContent>
      </Tooltip>

      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => openFormDialog(nodeId)}>
          <Pencil
            className="mr-2 size-4"
            aria-hidden="true"
          />
          {t('features.supportServicesManagement.actions.edit')}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onSelect={handleCreateChild}>
          <Plus
            className="mr-2 size-4"
            aria-hidden="true"
          />
          {t('features.supportServicesManagement.actions.createChild')}
        </DropdownMenuItem>

        <DropdownMenuItem onSelect={() => openFormDialog(undefined, parentId ?? null)}>
          <ListPlus
            className="mr-2 size-4"
            aria-hidden="true"
          />
          {t('features.supportServicesManagement.actions.createSibling')}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onSelect={() => openDeleteDialog(nodeId, nodeVersion, hasChildren)}
          className="text-destructive focus:text-destructive"
        >
          <Trash2
            className="mr-2 size-4"
            aria-hidden="true"
          />
          {t('features.supportServicesManagement.actions.delete')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
