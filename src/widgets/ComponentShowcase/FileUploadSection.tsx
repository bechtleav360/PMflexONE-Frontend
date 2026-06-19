import * as React from 'react'

import { useTranslation } from 'react-i18next'

import { FileUpload } from '@/shared/components'

import { ShowcaseSection } from './ShowcaseSection'

function createDemoFiles() {
  return [
    new File(['Quarterly review notes and next steps.'], 'quarterly-review.txt', {
      type: 'text/plain',
      lastModified: Date.UTC(2026, 3, 9),
    }),
    new File(
      ['1. Collect feedback\n2. Finalize copy\n3. Review with the team'],
      'handover-checklist.md',
      {
        type: 'text/markdown',
        lastModified: Date.UTC(2026, 3, 10),
      },
    ),
  ]
}

/**
 * Showcase section for the shared file upload component.
 * @returns A section demonstrating file upload, listing, open, and remove actions.
 */
export function FileUploadSection() {
  const { t } = useTranslation()
  const [files, setFiles] = React.useState<File[]>(() => createDemoFiles())

  return (
    <ShowcaseSection title={t('showcase.fileUpload.title')}>
      <div className="gap-sm flex flex-col">
        <div className="space-y-sm max-w-xl">
          <p className="text-muted-foreground text-sm">{t('showcase.fileUpload.description')}</p>
          <p className="text-muted-foreground text-sm">{t('showcase.fileUpload.hint')}</p>
        </div>

        <FileUpload
          files={files}
          onFilesChange={setFiles}
          labels={{
            button: t('showcase.fileUpload.button'),
            dropzoneTitle: t('showcase.fileUpload.dropzoneTitle'),
            dropzoneDescription: t('showcase.fileUpload.dropzoneDescription'),
            emptyState: t('showcase.fileUpload.emptyState'),
            open: t('showcase.fileUpload.open'),
            remove: t('showcase.fileUpload.remove'),
            fileCount: (count) => t('showcase.fileUpload.fileCount', { count }),
          }}
        />
      </div>
    </ShowcaseSection>
  )
}
