import { useState } from 'react'

import { Copy, PencilLine, Share2, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import {
  Button,
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/shared/components'

import { ShowcaseSection } from './ShowcaseSection'

/**
 * Showcase section for the ContextMenu component.
 * @returns A section containing a context menu example with actions, a checkbox, and a submenu.
 */
export function ContextMenuSection() {
  const { t } = useTranslation()
  const [showHidden, setShowHidden] = useState(true)

  return (
    <ShowcaseSection title={t('showcase.contextMenu.title')}>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <Button
            variant="outline"
            className="bg-muted/20 text-muted-foreground hover:bg-muted/30 h-28 w-72 border-dashed"
          >
            {t('showcase.contextMenu.triggerLabel')}
          </Button>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-56">
          <ContextMenuLabel inset>{t('showcase.contextMenu.label')}</ContextMenuLabel>
          <ContextMenuItem>
            <PencilLine />
            {t('showcase.contextMenu.rename')}
            <ContextMenuShortcut>{t('showcase.contextMenu.renameShortcut')}</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem>
            <Copy />
            {t('showcase.contextMenu.duplicate')}
            <ContextMenuShortcut>{t('showcase.contextMenu.duplicateShortcut')}</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuSub>
            <ContextMenuSubTrigger>
              <Share2 />
              {t('showcase.contextMenu.share')}
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-48">
              <ContextMenuItem>{t('showcase.contextMenu.shareViaEmail')}</ContextMenuItem>
              <ContextMenuItem>{t('showcase.contextMenu.copyLink')}</ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
          <ContextMenuSeparator />
          <ContextMenuCheckboxItem
            checked={showHidden}
            onCheckedChange={(checked: boolean | 'indeterminate') =>
              setShowHidden(checked === true)
            }
          >
            {t('showcase.contextMenu.showHidden')}
          </ContextMenuCheckboxItem>
          <ContextMenuSeparator />
          <ContextMenuItem variant="destructive">
            <Trash2 />
            {t('showcase.contextMenu.delete')}
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </ShowcaseSection>
  )
}
