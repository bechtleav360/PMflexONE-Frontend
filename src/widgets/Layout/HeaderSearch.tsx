import { Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'

/**
 * Search bar in the application header.
 * @returns The rendered search element.
 */
export function HeaderSearch() {
  const { t } = useTranslation()
  return (
    <div
      className="bg-muted text-muted-foreground flex h-11 max-w-[540px] flex-1 items-center gap-2 rounded-lg border px-3"
      role="search"
    >
      <Search
        className="h-4 w-4 shrink-0"
        aria-hidden="true"
      />
      <input
        type="search"
        placeholder={t('header.search')}
        className="text-foreground flex-1 bg-transparent text-sm outline-none"
        aria-label={t('header.search')}
      />
      <kbd
        className="bg-card border-border-strong text-foreground hidden rounded border px-1.5 py-0.5 font-mono text-[11px] font-semibold sm:inline-flex"
        aria-hidden="true"
      >
        {t('header.searchShortcut')}
      </kbd>
    </div>
  )
}
