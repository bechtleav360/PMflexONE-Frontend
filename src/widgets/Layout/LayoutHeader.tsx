import { HeaderActions } from './HeaderActions'
import { HeaderBrandLink } from './HeaderBrandLink'
import { HeaderSearch } from './HeaderSearch'

/**
 * Sticky application header containing the brand link, search bar, and action toolbar.
 * @returns The rendered application header element.
 */
export function LayoutHeader() {
  return (
    <header
      role="banner"
      className="bg-header sticky top-0 z-10 flex h-[60px] shrink-0 items-center gap-4 border-b px-4"
    >
      <HeaderBrandLink />
      <HeaderSearch />
      <HeaderActions />
    </header>
  )
}
