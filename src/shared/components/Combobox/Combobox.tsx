import { useTranslation } from 'react-i18next'

import type { ComboboxProps } from './ComboboxTypes'
import { ComboboxView } from './ComboboxView'
import { useComboboxController } from './useComboboxController'

/**
 * Flexible combobox supporting three composition modes:
 *
 * - **Static**: pass `options` for a client-side filtered dropdown.
 * - **Async**: pass `onSearch` for a debounced server-driven search.
 * - **Creatable**: add `onCreate` to either mode to allow adding new entries.
 *
 * Controlled via `value` + `onChange`; uncontrolled via `defaultValue`.
 *
 * @param props - {@link ComboboxProps}
 * @returns An accessible combobox trigger and dropdown.
 */
export function Combobox(props: ComboboxProps) {
  const { t } = useTranslation()

  const defaultCreateText = (q: string) => `${t('shared.combobox.createPrefix')} "${q}"`

  const {
    placeholder = t('shared.combobox.placeholder'),
    searchPlaceholder = t('shared.combobox.searchPlaceholder'),
    noResultsText = t('shared.combobox.noResults'),
    loadingText = t('shared.combobox.loading'),
    createText = defaultCreateText,
    onCreate,
    disabled,
    className,
    listClassName,
    id,
  } = props

  const {
    open,
    query,
    displayedOptions,
    selectedOption,
    isLoading,
    setOpen,
    handleSelect,
    handleCreate,
    handleQueryChange,
  } = useComboboxController(props)

  const trimmedQuery = query.trim()
  const exactMatch = displayedOptions.some(
    (o) => o.label.toLowerCase() === trimmedQuery.toLowerCase(),
  )
  const showCreate = !!onCreate && trimmedQuery !== '' && !exactMatch

  return (
    <ComboboxView
      open={open}
      query={query}
      displayedOptions={displayedOptions}
      selectedOption={selectedOption}
      isLoading={isLoading}
      placeholder={placeholder}
      searchPlaceholder={searchPlaceholder}
      noResultsText={noResultsText}
      loadingText={loadingText}
      createText={createText}
      showCreate={showCreate}
      disabled={disabled}
      className={className}
      listClassName={listClassName}
      id={id}
      setOpen={setOpen}
      handleSelect={handleSelect}
      handleCreate={handleCreate}
      handleQueryChange={handleQueryChange}
    />
  )
}

Combobox.displayName = 'Combobox'
