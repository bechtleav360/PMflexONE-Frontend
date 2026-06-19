/* eslint-disable max-lines -- single/multi mode, popover open state, search query, page cursor, and recents are all shared state; splitting into sub-components requires context or render-props threading across 5 rendering modes */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { Loader2, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Avatar, AvatarFallback } from '@/shared/components/Avatar'
import { Button } from '@/shared/components/Button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandLoading,
  CommandSeparator,
} from '@/shared/components/Command'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/Popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/Tooltip'
import { avatarColorClass } from '@/shared/lib/avatarColor'
import { cn } from '@/shared/lib/utils'

import { PersonCommandItem } from './PersonCommandItem'
import { initials } from './personPickerUtils'
import { usePersonPickerRecents, type PersonResult } from './usePersonPickerRecents'

const DEFAULT_STORAGE_KEY = 'person-picker-recent'
const DEBOUNCE_MS = 300
const DEFAULT_PAGE_SIZE = 20

// Maximum number of stacked avatars shown in the multi-select trigger.
const MAX_TRIGGER_AVATARS = 3

interface PersonPickerBaseProps {
  /**
   * Async search function. Called with `(query, page)` where `query` may be empty
   * (meaning "all users") and `page` is 0-based. Should return up to `pageSize` items.
   */
  onSearch: (query: string, page: number) => Promise<PersonResult[]>
  /** Number of items per page (default: 20). Must match server page size. */
  pageSize?: number
  /**
   * Person IDs to exclude from results (e.g. already-assigned persons).
   * Filtering happens client-side after fetch so `hasMore` stays accurate.
   */
  excludeIds?: ReadonlySet<string>
  /** Whether the picker is disabled. */
  disabled?: boolean
  /** Placeholder shown when nothing is selected. */
  placeholder?: string
  /** localStorage key for recent persons (default: 'person-picker-recent'). */
  storageKey?: string
  /** HTML id forwarded to the trigger button. */
  id?: string
  /** Additional classes for the trigger button. */
  className?: string
  /**
   * Pre-resolved persons to seed the internal ID→display map.
   * Prevents a blank trigger when injecting value/values IDs that have not yet
   * appeared in a search or recents (e.g. server-side pre-filled assignments).
   */
  resolvedPersons?: PersonResult[]
}

interface PersonPickerSingleProps extends PersonPickerBaseProps {
  multiple?: false
  /** Currently selected person ID. */
  value?: string | null
  /** Called when the selection changes. */
  onChange?: (value: string | null) => void
  values?: never
  onChangeValues?: never
}

interface PersonPickerMultiProps extends PersonPickerBaseProps {
  multiple: true
  /** Currently selected person IDs. */
  values?: string[]
  /** Called when the selection changes. */
  onChangeValues?: (values: string[]) => void
  value?: never
  onChange?: never
}

/** Props for the {@link PersonPicker} component. Discriminated by `multiple`. */
export type PersonPickerProps = PersonPickerSingleProps | PersonPickerMultiProps

/**
 * Person search picker with avatar display, recent suggestions, async search,
 * and load-more pagination.
 *
 * **Single-select (default):** closes on selection, `value`/`onChange` props.
 * **Multi-select (`multiple`):** stays open on selection, `values`/`onChangeValues` props.
 *
 * Pass `resolvedPersons` to seed the display map for pre-filled IDs that have
 * not yet appeared in a search — prevents a blank trigger on first render.
 *
 * - Opens with all users loaded (empty query, page 0).
 * - Typing filters via `onSearch`; results reset on each new query.
 * - "Load more" appends the next page when the last fetch returned a full page.
 * - Recently selected persons (up to 5) are suggested before search results.
 * - Selected person(s) are saved to localStorage under `storageKey`.
 *
 * @param props - Component props.
 * @returns The rendered person picker.
 */
// eslint-disable-next-line max-lines-per-function, complexity -- single/multi branch, controlled/uncontrolled open state, search debounce, pagination, and recents all diverge here; extracting a sub-hook would require threading 6+ derived values
export function PersonPicker({
  multiple,
  value,
  onChange,
  values,
  onChangeValues,
  resolvedPersons,
  onSearch,
  pageSize = DEFAULT_PAGE_SIZE,
  excludeIds,
  disabled,
  placeholder,
  storageKey = DEFAULT_STORAGE_KEY,
  id,
  className,
}: PersonPickerProps) {
  const { t } = useTranslation()

  const resolvedPlaceholder = placeholder ?? t('shared.personPicker.placeholder')

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<PersonResult[]>([])
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const { recents, addRecent, removeRecent } = usePersonPickerRecents(storageKey)

  // Internal map of all known persons for resolving IDs → display data.
  // Seed order: resolvedPersons first (server truth), then recents, then search
  // results — so the freshest data wins.
  const knownPersons = useRef<Map<string, PersonResult>>(new Map())
  if (resolvedPersons) {
    for (const p of resolvedPersons) knownPersons.current.set(p.id, p)
  }
  for (const p of recents) knownPersons.current.set(p.id, p)
  for (const p of results) knownPersons.current.set(p.id, p)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const generationRef = useRef(0)

  const runSearch = useCallback(
    async (q: string, pg: number, append: boolean) => {
      const generation = ++generationRef.current
      if (pg === 0) setIsLoading(true)
      else setIsLoadingMore(true)

      try {
        const found = await onSearch(q, pg)
        if (generationRef.current !== generation) return
        const filtered = excludeIds ? found.filter((p) => !excludeIds.has(p.id)) : found
        setResults((prev) => (append ? [...prev, ...filtered] : filtered))
        setHasMore(found.length === pageSize)
        setPage(pg)
      } catch {
        if (generationRef.current !== generation) return
        // Error surfaced via empty result state; no further action needed
        if (!append) setResults([])
        setHasMore(false)
      } finally {
        if (generationRef.current === generation) {
          setIsLoading(false)
          setIsLoadingMore(false)
        }
      }
    },
    [onSearch, pageSize, excludeIds],
  )

  // Load first page when the popover opens.
  useEffect(() => {
    if (open) {
      void runSearch('', 0, false)
    }
  }, [open, runSearch])

  const handleQueryChange = useCallback(
    (q: string) => {
      setQuery(q)
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        void runSearch(q, 0, false)
      }, DEBOUNCE_MS)
    },
    [runSearch],
  )

  const handleLoadMore = useCallback(() => {
    void runSearch(query, page + 1, true)
  }, [runSearch, query, page])

  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next)
    if (!next) {
      setQuery('')
      setResults([])
      setPage(0)
      setHasMore(false)
      setIsLoading(false)
      setIsLoadingMore(false)
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const handleSelect = useCallback(
    // eslint-disable-next-line complexity -- selection handler branches on single vs multi mode
    (selectedId: string) => {
      const person = knownPersons.current.get(selectedId) ?? null

      if (multiple) {
        const current = values ?? []
        const isAlreadySelected = current.includes(selectedId)
        const next = isAlreadySelected
          ? current.filter((id) => id !== selectedId)
          : [...current, selectedId]
        if (person && !isAlreadySelected) addRecent(person)
        onChangeValues?.(next)
        // Popover stays open in multi mode.
      } else {
        if (person) addRecent(person)
        onChange?.(selectedId === value ? null : selectedId)
        handleOpenChange(false)
      }
    },
    [multiple, values, value, onChange, onChangeValues, addRecent, handleOpenChange],
  )

  // ─── Derived display data ────────────────────────────────────────────────────

  const isSelected = useCallback(
    (id: string) => (multiple ? (values ?? []).includes(id) : id === value),
    [multiple, values, value],
  )

  // Single-select trigger
  const selectedPerson = !multiple && value ? (knownPersons.current.get(value) ?? null) : null

  // Multi-select trigger — memoised so downstream useMemo deps stay stable
  const selectedValues = useMemo(() => (multiple ? (values ?? []) : []), [multiple, values])
  const selectedPersonObjects = selectedValues
    .map((id) => knownPersons.current.get(id))
    .filter((p): p is PersonResult => p !== undefined)

  const showRecents = recents.length > 0 && query.trim() === ''

  // When recents are visible, exclude them from the results list to prevent duplicates.
  const recentIds = useMemo(() => new Set(recents.map((r) => r.id)), [recents])
  const displayResults = useMemo(
    () => (showRecents ? results.filter((p) => !recentIds.has(p.id)) : results),
    [showRecents, results, recentIds],
  )

  // Accessible label for the trigger button — reflects current selection for screen readers.
  const triggerAriaLabel = useMemo(() => {
    if (multiple) {
      if (selectedValues.length === 0) return resolvedPlaceholder
      if (selectedPersonObjects.length === selectedValues.length) {
        return selectedPersonObjects.map((p) => `${p.firstName} ${p.lastName}`).join(', ')
      }
      return t('shared.personPicker.selected', { count: selectedValues.length })
    }
    return selectedPerson
      ? `${selectedPerson.firstName} ${selectedPerson.lastName}`
      : resolvedPlaceholder
  }, [multiple, selectedValues, selectedPersonObjects, selectedPerson, resolvedPlaceholder, t])

  return (
    <Popover
      open={open}
      onOpenChange={handleOpenChange}
    >
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="secondary"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-label={triggerAriaLabel}
          disabled={disabled}
          className={cn('w-full justify-start gap-2 font-normal', className)}
        >
          {multiple ? (
            // ── Multi-select trigger ────────────────────────────────────────
            selectedValues.length === 0 ? (
              <>
                <User
                  className="text-muted-foreground size-4 shrink-0"
                  aria-hidden="true"
                />
                <span className="text-muted-foreground truncate">{resolvedPlaceholder}</span>
              </>
            ) : selectedValues.length === 1 && selectedPersonObjects[0] ? (
              <>
                <Avatar className="size-5 shrink-0">
                  <AvatarFallback
                    aria-hidden="true"
                    className={cn(
                      'text-[10px]',
                      avatarColorClass(
                        selectedPersonObjects[0].firstName,
                        selectedPersonObjects[0].lastName,
                      ),
                    )}
                  >
                    {initials(
                      selectedPersonObjects[0].firstName,
                      selectedPersonObjects[0].lastName,
                    )}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate">
                  {selectedPersonObjects[0].firstName} {selectedPersonObjects[0].lastName}
                </span>
              </>
            ) : (
              <>
                <div className="flex shrink-0 -space-x-1.5">
                  {selectedPersonObjects.slice(0, MAX_TRIGGER_AVATARS).map((p) => (
                    <Tooltip key={p.id}>
                      <TooltipTrigger asChild>
                        <Avatar className="ring-background size-5 ring-2">
                          <AvatarFallback
                            aria-hidden="true"
                            className={cn('text-[10px]', avatarColorClass(p.firstName, p.lastName))}
                          >
                            {initials(p.firstName, p.lastName)}
                          </AvatarFallback>
                        </Avatar>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {p.firstName} {p.lastName}
                        </p>
                        {p.mail && <p className="opacity-75">{p.mail}</p>}
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
                <span className="truncate text-sm">
                  {t('shared.personPicker.selected', { count: selectedValues.length })}
                </span>
              </>
            )
          ) : // ── Single-select trigger ───────────────────────────────────────
          selectedPerson ? (
            <>
              <Avatar className="size-5 shrink-0">
                <AvatarFallback
                  aria-hidden="true"
                  className={cn(
                    'text-[10px]',
                    avatarColorClass(selectedPerson.firstName, selectedPerson.lastName),
                  )}
                >
                  {initials(selectedPerson.firstName, selectedPerson.lastName)}
                </AvatarFallback>
              </Avatar>
              <span className="truncate">
                {selectedPerson.firstName} {selectedPerson.lastName}
              </span>
            </>
          ) : (
            <>
              <User
                className="text-muted-foreground size-4 shrink-0"
                aria-hidden="true"
              />
              <span className="text-muted-foreground truncate">{resolvedPlaceholder}</span>
            </>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={t('shared.personPicker.searchPlaceholder')}
            aria-label={t('shared.personPicker.searchPlaceholder')}
            value={query}
            onValueChange={handleQueryChange}
          />
          <CommandList>
            {isLoading && (
              <CommandLoading>
                <div
                  role="status"
                  aria-label={t('shared.personPicker.loading')}
                  className="text-muted-foreground flex items-center justify-center gap-2 py-6 text-sm"
                >
                  <Loader2
                    aria-hidden="true"
                    className="h-4 w-4 animate-spin"
                  />
                </div>
              </CommandLoading>
            )}

            {!isLoading && (
              <>
                {/* Recents (shown when no query typed) */}
                {showRecents && (
                  <>
                    <CommandGroup heading={t('shared.personPicker.recentsGroup')}>
                      {recents.map((person) => (
                        <PersonCommandItem
                          key={person.id}
                          person={person}
                          isSelected={isSelected(person.id)}
                          onSelect={handleSelect}
                          showMail={false}
                          onRemove={removeRecent}
                        />
                      ))}
                    </CommandGroup>
                    {displayResults.length > 0 && <CommandSeparator />}
                  </>
                )}

                {/* Search / all-user results (recents already shown above are excluded) */}
                {displayResults.length > 0 ? (
                  <CommandGroup
                    heading={
                      query.trim()
                        ? t('shared.personPicker.resultsGroup')
                        : t('shared.personPicker.allGroup')
                    }
                  >
                    {displayResults.map((person) => (
                      <PersonCommandItem
                        key={person.id}
                        person={person}
                        isSelected={isSelected(person.id)}
                        onSelect={handleSelect}
                      />
                    ))}
                    {hasMore && (
                      <CommandItem
                        value="--load-more--"
                        disabled={isLoadingMore}
                        onSelect={() => handleLoadMore()}
                        className="text-muted-foreground hover:bg-accent hover:text-accent-foreground flex cursor-pointer items-center justify-center gap-1 rounded-sm px-2 py-1.5 text-xs"
                      >
                        {isLoadingMore ? (
                          <Loader2
                            className="h-3 w-3 animate-spin"
                            aria-hidden="true"
                          />
                        ) : null}
                        {t('shared.personPicker.loadMore')}
                      </CommandItem>
                    )}
                  </CommandGroup>
                ) : (
                  !showRecents && <CommandEmpty>{t('shared.personPicker.noResults')}</CommandEmpty>
                )}
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
