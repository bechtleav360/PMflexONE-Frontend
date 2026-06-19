import { ChevronRight, LogOut, Palette, Scale } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { CreateProjectModal } from '@/features/create-project'
import { Button } from '@/shared/components'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/DropdownMenu'
import { useCurrentUser } from '@/shared/hooks/useCurrentUser'
import { useComponentShowcaseDrawerStore } from '@/shared/lib/useComponentShowcaseDrawerStore'
import { useLicensesDialogStore } from '@/shared/lib/useLicensesDialogStore'

import { LanguageSwitcher } from './LanguageSwitcher'
import { ThemeSwitcher } from './ThemeSwitcher'

/**
 * Builds avatar initials from first and last name.
 * @param firstName - The user's first name.
 * @param lastName - The user's last name.
 * @returns One or two uppercase initials.
 */
function getInitials(firstName: string, lastName: string): string {
  const first = firstName.charAt(0).toUpperCase()
  const last = lastName.charAt(0).toUpperCase()
  return last ? `${first}${last}` : first
}

/**
 * Action toolbar in the application header: theme, language, user menu, and DEV tools.
 * @returns The rendered actions element.
 */
export function HeaderActions() {
  const toggleComponentShowcaseDrawer = useComponentShowcaseDrawerStore((s) => s.toggle)
  const openLicensesDialog = useLicensesDialogStore((s) => s.setOpen)
  const { t } = useTranslation()
  const { data: currentUser } = useCurrentUser()

  const initials = currentUser ? getInitials(currentUser.firstName, currentUser.lastName) : '??'
  const fullName = currentUser ? `${currentUser.firstName} ${currentUser.lastName}`.trim() : null
  const userEmail = currentUser?.mail || null

  function handleLogout() {
    window.location.href = '/oauth2/sign_out'
  }

  return (
    <div className="ml-auto flex items-center gap-1.5">
      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground h-11 w-11 border border-transparent hover:bg-black/5 dark:hover:bg-white/10"
        onClick={() => openLicensesDialog(true)}
        aria-label={t('licenses.triggerLabel')}
      >
        <Scale className="h-5 w-5" />
      </Button>

      {import.meta.env.DEV ? (
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground h-11 w-11 border border-transparent hover:bg-black/5 dark:hover:bg-white/10"
          onClick={toggleComponentShowcaseDrawer}
          aria-label={t('header.showcaseDrawer')}
        >
          <Palette className="h-5 w-5" />
        </Button>
      ) : null}

      <ThemeSwitcher />
      <LanguageSwitcher />

      <div
        className="bg-border mx-1 h-6 w-px"
        aria-hidden="true"
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="hover:border-border group h-12 gap-2.5 rounded-full border border-transparent px-1 pr-3 hover:bg-black/5 dark:hover:bg-white/10"
            aria-label={t('header.userMenu')}
          >
            <span
              className="bg-sidebar-card flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-white"
              aria-hidden="true"
            >
              {initials}
            </span>
            {fullName ? (
              <span className="hidden flex-col items-start leading-tight sm:flex">
                <span className="text-foreground text-[13px] font-semibold">{fullName}</span>
                {userEmail ? (
                  <span className="text-muted-foreground text-[12px]">{userEmail}</span>
                ) : null}
              </span>
            ) : null}
            <ChevronRight className="text-muted-foreground h-3.5 w-3.5 opacity-60 transition-transform group-data-[state=open]:rotate-90" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="min-w-[220px]"
        >
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut />
            {t('header.logout')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateProjectModal />
    </div>
  )
}
