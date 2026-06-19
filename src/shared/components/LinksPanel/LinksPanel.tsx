import { useTranslation } from 'react-i18next'

import { Button } from '@/shared/components/Button'
import { Separator } from '@/shared/components/Separator'

/** A single linked entry shown in a LinksPanel section. */
export interface LinkedEntryItem {
  id: string
  entryNumber: string
  name: string
  status: string
}

/** A section within the LinksPanel (e.g. "Linked Issues", "Linked Risks"). */
export interface LinksPanelSection {
  title: string
  items: LinkedEntryItem[]
  /** Called with the linked entry ID when the user clicks Remove. */
  onRemove?: (id: string) => void
  /** Whether a remove mutation is in flight (disables all remove buttons in this section). */
  isRemoving?: boolean
}

interface LinksPanelProps {
  sections: LinksPanelSection[]
}

/**
 * Displays bidirectional links for an entry grouped into titled sections.
 * Each item has an entry number, name, status, and an optional Remove button.
 * Sections with no items show an empty-state message.
 *
 * @param props - Component props.
 * @param props.sections - Array of link sections to render.
 * @returns The rendered links panel.
 */
export function LinksPanel({ sections }: LinksPanelProps) {
  const { t } = useTranslation()

  if (sections.length === 0) return null

  return (
    <div className="flex flex-col gap-4">
      <Separator />
      {sections.map((section) => (
        <div
          key={section.title}
          className="flex flex-col gap-2"
        >
          <h4 className="text-sm font-medium">{section.title}</h4>
          {section.items.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t('shared.linksPanel.empty')}</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {section.items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm"
                >
                  <span className="text-muted-foreground font-mono text-xs">
                    {item.entryNumber}
                  </span>
                  <span className="flex-1 truncate">{item.name}</span>
                  <span className="text-muted-foreground text-xs">{item.status}</span>
                  {section.onRemove && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto px-2 py-0.5 text-xs"
                      onClick={() => section.onRemove!(item.id)}
                      disabled={section.isRemoving}
                      aria-label={t('shared.linksPanel.removeAriaLabel', { name: item.name })}
                    >
                      {t('shared.linksPanel.remove')}
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  )
}
