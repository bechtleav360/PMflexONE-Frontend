import { ChevronDown, Pencil, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/shared/components'

import { ShowcaseSection } from './ShowcaseSection'

/**
 * Showcase section for DropdownMenu variants.
 * @returns A section displaying dropdown menu examples.
 */
export function DropdownSection() {
  const { t } = useTranslation()

  return (
    <ShowcaseSection title={t('showcase.dropdown.title')}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary">
            {t('showcase.dropdown.actions')}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>{t('showcase.dropdown.project')}</DropdownMenuLabel>
          <DropdownMenuItem>
            <Pencil />
            {t('showcase.dropdown.edit')}
            <DropdownMenuShortcut>{t('showcase.dropdown.editShortcut')}</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>{t('showcase.dropdown.duplicate')}</DropdownMenuItem>
          <DropdownMenuItem>
            {t('showcase.dropdown.export')}
            <DropdownMenuShortcut>{t('showcase.dropdown.exportShortcut')}</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>{t('showcase.dropdown.dangerZone')}</DropdownMenuLabel>
          <DropdownMenuItem variant="destructive">
            <Trash2 />
            {t('showcase.dropdown.delete')}
            <DropdownMenuShortcut>{t('showcase.dropdown.deleteShortcut')}</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </ShowcaseSection>
  )
}
