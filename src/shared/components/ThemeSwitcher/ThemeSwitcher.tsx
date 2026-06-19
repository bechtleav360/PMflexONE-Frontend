import { Moon, Sun } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button, Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components'
import { useTheme } from '@/shared/hooks/useTheme'

/**
 * Icon button that toggles between light and dark theme.
 *
 * Reads and writes the active theme via {@link useTheme}. Renders a labelled
 * tooltip for screen-reader and pointer accessibility.
 * @returns A tooltip-wrapped icon button showing a sun (dark mode) or moon (light mode) icon.
 */
export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const { t } = useTranslation()
  const isDark = theme === 'dark'

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          aria-label={isDark ? t('theme.switchToLight') : t('theme.switchToDark')}
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{isDark ? t('theme.lightMode') : t('theme.darkMode')}</TooltipContent>
    </Tooltip>
  )
}
