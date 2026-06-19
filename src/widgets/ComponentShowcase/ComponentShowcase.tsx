import { lazy, Suspense } from 'react'

import { Separator } from '@/shared/components'

import { ButtonsSection } from './ButtonsSection'
import { ColorPickerSection } from './ColorPickerSection'
import { ComboboxSection } from './ComboboxSection'
import { ConfirmDialogSection } from './ConfirmDialogSection'
import { ContextMenuSection } from './ContextMenuSection'
import { DataDisplaySection } from './DataDisplaySection'
import { DrawerSection } from './DrawerSection'
import { DropdownSection } from './DropdownSection'
import { FeedbackSection } from './FeedbackSection'
import { FileUploadSection } from './FileUploadSection'
import { FormSection } from './FormSection'
import { LabelBadgeSection } from './LabelBadgeSection'
import { LayoutSection } from './LayoutSection'
import { ListViewSection } from './ListViewSection'
import { MarkdownContentSection } from './MarkdownContentSection'
import { MatrixTableSection } from './MatrixTableSection'
import { PersonPickerSection } from './PersonPickerSection'
import { RasciValueBadgeSection } from './RasciValueBadgeSection'
import { ToastSection } from './ToastSection'
import { YearPickerSection } from './YearPickerSection'

const TableSection = lazy(async () => ({
  default: (await import('./TableSection')).TableSection,
}))

const TextEditorSection = lazy(async () => ({
  default: (await import('./TextEditorSection')).TextEditorSection,
}))

const TreeViewSection = lazy(async () => ({
  default: (await import('./TreeViewSection')).TreeViewSection,
}))

/**
 * Renders every shadcn/ui component grouped by category.
 *
 * Intended as a visual reference and smoke-test for the design system.
 * @returns A vertically stacked list of component sections separated by dividers.
 */
export function ComponentShowcase() {
  return (
    <div className="space-y-10">
      <ButtonsSection />
      <Separator />
      <FormSection />
      <Separator />
      <ComboboxSection />
      <Separator />
      <FileUploadSection />
      <Separator />
      <Suspense
        fallback={
          <div
            aria-busy="true"
            className="border-border/60 bg-muted/20 min-h-48 rounded-lg border border-dashed"
          />
        }
      >
        <TextEditorSection />
      </Suspense>
      <Separator />
      <LayoutSection />
      <Separator />
      <DataDisplaySection />
      <Separator />
      <Suspense
        fallback={
          <div
            aria-busy="true"
            className="border-border/60 bg-muted/20 min-h-48 rounded-lg border border-dashed"
          />
        }
      >
        <TableSection />
      </Suspense>
      <Separator />
      <FeedbackSection />
      <Separator />
      <ToastSection />
      <Separator />
      <DrawerSection />
      <Separator />
      <DropdownSection />
      <Separator />
      <ContextMenuSection />
      <Separator />
      <ColorPickerSection />
      <Separator />
      <PersonPickerSection />
      <Separator />
      <RasciValueBadgeSection />
      <Separator />
      <ListViewSection />
      <Separator />
      <YearPickerSection />
      <Separator />
      <MatrixTableSection />
      <Separator />
      <Suspense
        fallback={
          <div
            aria-busy="true"
            className="border-border/60 bg-muted/20 min-h-48 rounded-lg border border-dashed"
          />
        }
      >
        <TreeViewSection />
      </Suspense>
      <Separator />
      <ConfirmDialogSection />
      <Separator />
      <LabelBadgeSection />
      <Separator />
      <MarkdownContentSection />
    </div>
  )
}
