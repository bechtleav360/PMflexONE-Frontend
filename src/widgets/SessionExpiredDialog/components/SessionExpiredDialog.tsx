import * as DialogPrimitive from '@radix-ui/react-dialog'
import { LogIn, ShieldAlert } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button, DialogDescription, DialogOverlay, DialogTitle } from '@/shared/components'
import { useAuthSessionStore } from '@/shared/lib/authSession'
import { cn } from '@/shared/lib/utils'

import { useSignInPopup } from '../hooks/useSignInPopup'

/**
 * Global modal shown when the session cookie becomes invalid.
 * Non-dismissible — prompts the user to re-authenticate via oauth2-proxy
 * without discarding current page state.
 * @returns The session expired dialog element.
 */
export function SessionExpiredDialog() {
  const { t } = useTranslation()
  const sessionExpired = useAuthSessionStore((s) => s.sessionExpired)
  const { signInState, openSignIn } = useSignInPopup()

  const isPending = signInState === 'pending' || signInState === 'verifying'

  let buttonLabel = t('auth.sessionExpired.signIn')
  if (signInState === 'pending') buttonLabel = t('auth.sessionExpired.signingIn')
  if (signInState === 'verifying') buttonLabel = t('auth.sessionExpired.verifying')

  return (
    <DialogPrimitive.Root open={sessionExpired}>
      <DialogPrimitive.Portal>
        <DialogOverlay />
        <DialogPrimitive.Content
          className={cn(
            'bg-background fixed top-[50%] left-[50%] z-50 w-full max-w-sm translate-x-[-50%] translate-y-[-50%]',
            'gap-lg p-xl flex flex-col items-center border text-center shadow-lg sm:rounded-lg',
            'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
            'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
          )}
          onPointerDownOutside={(e) => {
            e.preventDefault()
          }}
          onEscapeKeyDown={(e) => {
            e.preventDefault()
          }}
          onInteractOutside={(e) => {
            e.preventDefault()
          }}
        >
          <ShieldAlert
            className="text-warning h-10 w-10"
            aria-hidden="true"
          />
          <div className="flex flex-col items-center gap-1 sm:text-center">
            <DialogTitle>{t('auth.sessionExpired.title')}</DialogTitle>
            <DialogDescription>{t('auth.sessionExpired.description')}</DialogDescription>
          </div>

          {(signInState === 'error' || signInState === 'blocked') && (
            <p
              role="alert"
              className="text-destructive text-sm"
            >
              {signInState === 'blocked'
                ? t('auth.sessionExpired.popupBlocked')
                : t('auth.sessionExpired.verifyError')}
            </p>
          )}

          <Button
            onClick={openSignIn}
            disabled={isPending}
            className="gap-xs w-full"
          >
            <LogIn
              className="h-4 w-4"
              aria-hidden="true"
            />
            {buttonLabel}
          </Button>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
