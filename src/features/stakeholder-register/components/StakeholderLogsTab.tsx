import { useEffect, useState } from 'react'

import { ArrowDownUp, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { Button, Input, MarkdownContent } from '@/shared/components'

import type { StakeholderFormValues } from '../utils/stakeholderSchema'
import { StakeholderLogInlineEditRow } from './StakeholderLogInlineEditRow'

/**
 * Parse a `'YYYY-MM-DD'` date string in local time.
 *
 * `new Date('YYYY-MM-DD')` treats the string as UTC midnight, which shifts
 * the displayed date one day earlier in timezones west of UTC. Using the
 * multi-argument `Date` constructor creates a local-midnight Date instead.
 *
 * @param dateStr - ISO date-only string in `'YYYY-MM-DD'` format.
 * @returns A `Date` representing local midnight on the given calendar day.
 */
function parseDateLocal(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number) as [number, number, number]
  return new Date(y, m - 1, d)
}

interface StakeholderLogsTabProps {
  readOnly?: boolean
  onHasUnsavedChanges?: (v: boolean) => void
}

/**
 * Renders the logs tab inside the stakeholder form.
 *
 * Supports inline creation (draft row prepended at the top) and inline editing
 * (row transforms in-place) without layout jumps or a separate bottom card.
 *
 * @param props - Component props.
 * @param props.readOnly - When true, hides all mutating controls.
 * @param props.onHasUnsavedChanges - Notifies the parent when unsaved log edits exist.
 * @returns The logs tab content with toolbar and log list.
 */
// eslint-disable-next-line max-lines-per-function -- inline CRUD with draft + edit state; extracting further would split closely coupled log state across files
export function StakeholderLogsTab({
  readOnly = false,
  onHasUnsavedChanges,
}: StakeholderLogsTabProps) {
  const { t } = useTranslation()
  const { control, getValues } = useFormContext<StakeholderFormValues>()
  const { fields, append, remove, update } = useFieldArray({ control, name: 'logs' })

  const [sortAsc, setSortAsc] = useState(false)
  const [search, setSearch] = useState('')

  // Draft state for inline create
  const [isAdding, setIsAdding] = useState(false)
  const [draftDate, setDraftDate] = useState<Date | null>(null)
  const [draftContent, setDraftContent] = useState('')

  // Inline edit state
  const [editId, setEditId] = useState<string | null>(null)
  const [editDate, setEditDate] = useState<string>('')
  const [editContent, setEditContent] = useState('')

  useEffect(() => {
    onHasUnsavedChanges?.(isAdding || editId !== null)
  }, [isAdding, editId, onHasUnsavedChanges])

  const filtered = fields
    .filter((log) => !search || log.content.toLowerCase().includes(search.toLowerCase()))
    .slice()
    .sort((a, b) => {
      const cmp = a.date.localeCompare(b.date)
      return sortAsc ? cmp : -cmp
    })

  function handleDraftConfirm() {
    if (!draftDate || !draftContent.trim()) return
    append({
      id: crypto.randomUUID(),
      date: draftDate.toISOString().slice(0, 10),
      content: draftContent.trim(),
    })
    setIsAdding(false)
    setDraftDate(null)
    setDraftContent('')
  }

  function handleDraftCancel() {
    setIsAdding(false)
    setDraftDate(null)
    setDraftContent('')
  }

  function startEdit(id: string, date: string, content: string) {
    setEditId(id)
    setEditDate(date)
    setEditContent(content)
  }

  function confirmEdit(fieldIndex: number) {
    const log = getValues(`logs.${fieldIndex}`)
    update(fieldIndex, {
      id: log!.id,
      version: log?.version,
      date: editDate,
      content: editContent.trim(),
    })
    setEditId(null)
  }

  const searchPlaceholder = t('pages.stakeholderRegister.form.logs.searchPlaceholder')
  const contentPlaceholder = t('pages.stakeholderRegister.form.logs.contentPlaceholder')
  const emptyLabel = t('pages.stakeholderRegister.form.logs.empty')
  const toggleSortLabel = t('pages.stakeholderRegister.form.logs.toggleSort')
  const addNoteLabel = t('pages.stakeholderRegister.form.logs.addNote')
  const saveLabel = t('pages.stakeholderRegister.form.saveButton')
  const cancelLabel = t('pages.stakeholderRegister.form.cancelButton')

  const showList = isAdding || filtered.length > 0

  return (
    <div className="flex flex-col gap-4 pt-4">
      {/* Toolbar: search + sort + add */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="pl-8"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setSortAsc((v) => !v)}
          aria-label={toggleSortLabel}
          title={toggleSortLabel}
        >
          <ArrowDownUp className="h-4 w-4" />
        </Button>
        {!readOnly && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setIsAdding(true)}
            disabled={isAdding}
            aria-label={addNoteLabel}
            title={addNoteLabel}
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Log list */}
      {showList ? (
        <ul className="flex flex-col gap-2">
          {/* Draft row — always at the very top */}
          {isAdding && (
            <li className="rounded-md border p-3">
              <StakeholderLogInlineEditRow
                date={draftDate}
                content={draftContent}
                contentPlaceholder={contentPlaceholder}
                onDateChange={setDraftDate}
                onContentChange={setDraftContent}
                onConfirm={handleDraftConfirm}
                onCancel={handleDraftCancel}
                confirmDisabled={!draftDate || !draftContent.trim()}
                confirmLabel={saveLabel}
                cancelLabel={cancelLabel}
              />
            </li>
          )}

          {/* Existing log entries */}
          {filtered.map((log) => {
            const fieldIndex = fields.findIndex((f) => f.id === log.id)
            const isEditing = editId === log.id

            return (
              <li
                key={log.id}
                className="rounded-md border p-3"
              >
                {isEditing && !readOnly ? (
                  <StakeholderLogInlineEditRow
                    date={editDate ? parseDateLocal(editDate) : null}
                    content={editContent}
                    contentPlaceholder={contentPlaceholder}
                    onDateChange={(d) => setEditDate(d ? d.toISOString().slice(0, 10) : '')}
                    onContentChange={setEditContent}
                    onConfirm={() => confirmEdit(fieldIndex)}
                    onCancel={() => setEditId(null)}
                    confirmDisabled={!editDate || !editContent.trim()}
                    confirmLabel={saveLabel}
                    cancelLabel={cancelLabel}
                  />
                ) : (
                  <div className="flex items-start gap-3">
                    <span className="text-muted-foreground w-24 shrink-0 pt-0.5 text-xs font-medium">
                      {new Intl.DateTimeFormat(undefined, {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                      }).format(parseDateLocal(log.date))}
                    </span>
                    <MarkdownContent
                      value={log.content}
                      className="flex-1"
                      editorClassName="text-sm"
                    />
                    {!readOnly && (
                      <div className="flex shrink-0 gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          aria-label={t('pages.stakeholderRegister.form.logs.editNote')}
                          onClick={() => startEdit(log.id, log.date, log.content)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive h-7 w-7"
                          aria-label={t('pages.stakeholderRegister.form.logs.deleteNote')}
                          onClick={() => remove(fieldIndex)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="text-muted-foreground text-sm">{emptyLabel}</p>
      )}
    </div>
  )
}
