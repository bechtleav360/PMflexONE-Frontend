import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

/**
 * Brand logo + name link in the application header.
 * @returns The rendered brand link element.
 */
export function HeaderBrandLink() {
  const { t } = useTranslation()
  return (
    <Link
      to="/"
      className="flex items-center gap-2.5 rounded-md px-1.5 py-1 no-underline transition-colors hover:bg-black/5 dark:hover:bg-white/5"
      aria-label={t('header.brandLabel')}
    >
      <span aria-hidden="true">
        {/* SVG fill values are SVG presentation attributes, not CSS — hex is intentional here.
            #007194 = Petrol 100 % (brand primary). Do not replace with a CSS var. */}
        <svg
          viewBox="0 0 28 28"
          width="28"
          height="28"
        >
          <rect
            x="1"
            y="1"
            width="26"
            height="26"
            rx="6"
            fill="#007194"
          />
          <circle
            cx="14"
            cy="14"
            r="4"
            fill="#fff"
          />
          <circle
            cx="14"
            cy="14"
            r="9"
            fill="none"
            stroke="#fff"
            strokeOpacity=".55"
            strokeWidth="1.5"
          />
          <circle
            cx="14"
            cy="14"
            r="12.5"
            fill="none"
            stroke="#fff"
            strokeOpacity=".25"
            strokeWidth="1.5"
          />
        </svg>
      </span>
      <span
        className="text-primary text-[22px] font-extrabold"
        style={{ letterSpacing: '-0.02em' }}
      >
        {t('header.brandName')}
      </span>
      <span className="text-muted-foreground border-border-strong ml-1 hidden border-l pl-2 text-xs sm:inline">
        {t('header.title')}
      </span>
    </Link>
  )
}
