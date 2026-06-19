import { useTranslation } from 'react-i18next'

import { MarkdownContent, MarkdownEditor } from '@/shared/components'

import { ShowcaseSection } from './ShowcaseSection'

/**
 * Showcase section for the markdown editor and read-only content renderer.
 * @returns A section containing the shared markdown editor and content demos.
 */
export function TextEditorSection() {
  const { t } = useTranslation()

  return (
    <ShowcaseSection title={t('showcase.textEditor.title')}>
      <div className="flex w-full max-w-4xl flex-col gap-6">
        <div className="flex flex-col gap-2">
          <p className="text-muted-foreground text-sm font-medium">
            {t('showcase.textEditor.editorTitle')}
          </p>
          <MarkdownEditor
            defaultValue={t('showcase.textEditor.initialContent')}
            className="w-full"
          />
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-muted-foreground text-sm font-medium">
            {t('showcase.textEditor.contentTitle')}
          </p>
          <MarkdownContent value={t('showcase.textEditor.initialContent')} />
        </div>
      </div>
    </ShowcaseSection>
  )
}
