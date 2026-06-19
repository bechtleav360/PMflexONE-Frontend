import { useState } from 'react'

import { useTranslation } from 'react-i18next'

import { Button } from '@/shared/components/Button'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'

import { ShowcaseSection } from './ShowcaseSection'

/**
 * Showcase section for the ConfirmDialog component.
 * Demonstrates default and destructive dialog variants.
 * @returns A section with default and destructive ConfirmDialog examples.
 */
export function ConfirmDialogSection() {
  const { t } = useTranslation()
  const [defaultOpen, setDefaultOpen] = useState(false)
  const [destructiveOpen, setDestructiveOpen] = useState(false)

  return (
    <ShowcaseSection title={t('showcase.confirmDialog.title')}>
      <Button
        variant="outline"
        onClick={() => setDefaultOpen(true)}
      >
        {t('showcase.confirmDialog.openDefault')}
      </Button>
      <Button
        variant="destructive"
        onClick={() => setDestructiveOpen(true)}
      >
        {t('showcase.confirmDialog.openDestructive')}
      </Button>

      <ConfirmDialog
        open={defaultOpen}
        onOpenChange={setDefaultOpen}
        title={t('showcase.confirmDialog.defaultTitle')}
        description={t('showcase.confirmDialog.defaultDescription')}
        onConfirm={() => setDefaultOpen(false)}
      />

      <ConfirmDialog
        open={destructiveOpen}
        onOpenChange={setDestructiveOpen}
        title={t('showcase.confirmDialog.destructiveTitle')}
        description={t('showcase.confirmDialog.destructiveDescription')}
        variant="destructive"
        onConfirm={() => setDestructiveOpen(false)}
      />
    </ShowcaseSection>
  )
}
