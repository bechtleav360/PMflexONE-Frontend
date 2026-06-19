import { Languages } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/shared/components'
import { SUPPORTED_LANGUAGES } from '@/shared/lib/i18n'

/** Map of language codes to their translation keys for display names. */
const LANGUAGE_LABEL_KEYS: Record<(typeof SUPPORTED_LANGUAGES)[number], string> = {
  en: 'language.en',
  de: 'language.de',
}

/**
 * Dropdown button that lets the user switch the application language.
 * Persists the choice via i18next's language detector (localStorage).
 * @returns A dropdown menu trigger with radio options for each supported language.
 */
export function LanguageSwitcher() {
  const { i18n, t } = useTranslation()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground h-11 w-11 border border-transparent hover:bg-black/5 dark:hover:bg-white/10"
        >
          <Languages className="h-5 w-5" />
          <span className="sr-only">{t('language.switch')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup
          value={i18n.language}
          onValueChange={(lng) => i18n.changeLanguage(lng)}
        >
          {SUPPORTED_LANGUAGES.map((lng) => (
            <DropdownMenuRadioItem
              key={lng}
              value={lng}
            >
              {t(LANGUAGE_LABEL_KEYS[lng])}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
