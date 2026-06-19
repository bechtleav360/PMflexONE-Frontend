import { useTranslation } from 'react-i18next'

import { MarkdownContent } from '@/shared/components/MarkdownEditor'

import { ShowcaseSection } from './ShowcaseSection'

/**
 * Showcase section for the MarkdownContent component.
 * Displays a read-only rendered markdown string.
 * @returns A section with a MarkdownContent example.
 */
export function MarkdownContentSection() {
  const { t } = useTranslation()

  return (
    <ShowcaseSection title={t('showcase.markdownContent.title')}>
      <div className="w-full max-w-prose">
        <MarkdownContent value={t('showcase.markdownContent.sample')} />
      </div>
    </ShowcaseSection>
  )
}
