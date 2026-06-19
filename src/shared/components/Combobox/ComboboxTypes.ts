import type { ReactNode } from 'react'

/**
 * A single selectable item in a Combobox.
 *
 * @property value - Unique identifier used for selection and filtering.
 * @property label - Human-readable display text (also used for search filtering).
 * @property disabled - When true the item is visible but not selectable.
 * @property group - Optional group heading. Options sharing the same string are
 *   rendered under a labelled `CommandGroup`. Options without a group are placed
 *   in a single ungrouped `CommandGroup`.
 * @property renderLabel - Optional JSX renderer. When provided, replaces the plain
 *   `label` text in both the trigger button and the dropdown list item. The `label`
 *   string is still used for search filtering.
 */
export interface ComboboxOption {
  value: string
  label: string
  group?: string
  disabled?: boolean
  renderLabel?: () => ReactNode
}

/**
 * Props shared by all Combobox modes.
 *
 * @property value - Controlled selected value.
 * @property defaultValue - Initial uncontrolled selected value.
 * @property onChange - Callback fired when the selection changes.
 * @property placeholder - Text shown on the trigger button when nothing is selected.
 * @property searchPlaceholder - Placeholder inside the search input.
 * @property noResultsText - Text shown when the filtered list is empty.
 * @property loadingText - Accessible label for the loading indicator.
 * @property disabled - Disables the entire combobox.
 * @property loading - Shows a loading indicator inside the dropdown.
 * @property className - Additional classes for the trigger button.
 * @property id - HTML id forwarded to the trigger button.
 * @property listClassName - Additional classes applied to the CommandList (e.g. constrain max-height).
 */
interface ComboboxBaseProps {
  value?: string | null
  defaultValue?: string | null
  onChange?: (value: string | null) => void
  placeholder?: string
  searchPlaceholder?: string
  noResultsText?: string
  loadingText?: string
  disabled?: boolean
  loading?: boolean
  className?: string
  id?: string
  listClassName?: string
}

/**
 * Static mode — options are provided upfront; filtering happens client-side.
 *
 * @property options - Fixed list of items to display.
 * @property onSearch - Must be undefined in static mode.
 */
interface ComboboxStaticProps extends ComboboxBaseProps {
  options: ComboboxOption[]
  onSearch?: never
  debounceMs?: never
}

/**
 * Async mode — a search callback fetches matching items from a remote source.
 *
 * @property onSearch - Called (debounced) with the current query; should return matching options.
 * @property debounceMs - Milliseconds to debounce the search call (default: 300).
 * @property options - Must be undefined in async mode.
 * @property seedOptions - Pre-loaded options used to resolve the selected label before any search. Not shown in the dropdown list.
 */
interface ComboboxAsyncProps extends ComboboxBaseProps {
  options?: never
  onSearch: (query: string) => Promise<ComboboxOption[]>
  debounceMs?: number
  /** Pre-loaded options used to resolve the selected label before any search. Not shown in the dropdown list. */
  seedOptions?: ComboboxOption[]
}

/**
 * Union of all valid Combobox prop shapes.
 *
 * Add `onCreate` to either shape to enable the creatable behaviour.
 *
 * @property onCreate - When provided, a "Create …" option appears for queries with no match,
 *   and is called with the raw query string when selected.
 * @property createText - Custom label for the create option. Receives the current query and
 *   should return a display string. Defaults to `"Create \"<query>\""`.
 */
export type ComboboxProps = (ComboboxStaticProps | ComboboxAsyncProps) & {
  onCreate?: (query: string) => void
  createText?: (query: string) => string
}
