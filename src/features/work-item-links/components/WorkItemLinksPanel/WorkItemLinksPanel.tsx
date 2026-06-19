import { useTranslation } from 'react-i18next'

import type { WorkItemLinkNode } from '@/entities/work-item'
import { Button } from '@/shared/components'

import { useCreateWorkItemLinkDialogStore } from '../../store/linkDialogStores'

interface WorkItemLinksPanelProps {
  workItemId: string
  links: WorkItemLinkNode[]
  onOpenWorkItem?: (id: string) => void
}

/**
 * Displays typed links for a work item, grouped by edgeTypeName, with a create action.
 * @param root0 - Component props.
 * @param root0.workItemId - The source work item ID.
 * @param root0.links - The list of link nodes to display.
 * @param root0.onOpenWorkItem - Called with the target item ID when a link is clicked.
 * @returns The links panel section element.
 */
export function WorkItemLinksPanel({ workItemId, links, onOpenWorkItem }: WorkItemLinksPanelProps) {
  const { t } = useTranslation()
  const openCreate = useCreateWorkItemLinkDialogStore((s) => s.openModal)

  // Group links by edgeTypeName; links without a type go to an "other" bucket
  const grouped = links.reduce<Record<string, WorkItemLinkNode[]>>((acc, link) => {
    const key = link.edgeTypeName ?? 'other'
    if (!acc[key]) acc[key] = []
    acc[key].push(link)
    return acc
  }, {})

  const hasLinks = links.length > 0

  return (
    <section aria-label={t('features.workItemLinks.panel', 'Linked Work Items')}>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold">
          {t('features.workItemLinks.panel', 'Linked Work Items')}
        </h3>
        <Button
          size="sm"
          variant="outline"
          onClick={() => openCreate({ workItemId })}
        >
          {t('features.workItemLinks.addLink', 'Add Link')}
        </Button>
      </div>

      {!hasLinks && (
        <p className="text-muted-foreground text-sm">
          {t('features.workItemLinks.noLinks', 'No linked work items.')}
        </p>
      )}

      {Object.entries(grouped).map(([type, items]) => (
        <div
          key={type}
          className="mb-3"
        >
          <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase">
            {t(`features.workItemLinks.linkType.${type}`, type)}
          </p>
          <ul className="space-y-1">
            {items.map((link, idx) => {
              const itemId = link.item?.id
              const itemName =
                link.item?.name ?? t('features.workItemLinks.unknownItem', 'Unknown item')
              const isClickable = Boolean(itemId && onOpenWorkItem)
              return (
                <li
                  key={`${type}-${itemId ?? idx}`}
                  className="bg-card flex items-center justify-between rounded-md border text-sm"
                >
                  {isClickable ? (
                    <button
                      type="button"
                      className="hover:bg-accent flex w-full cursor-pointer items-center rounded-md px-3 py-1.5 text-left transition-colors"
                      onClick={() => {
                        if (itemId && onOpenWorkItem) onOpenWorkItem(itemId)
                      }}
                    >
                      <span className="truncate">{itemName}</span>
                    </button>
                  ) : (
                    <span className="truncate px-3 py-1.5">{itemName}</span>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </section>
  )
}
