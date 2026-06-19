import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './index.css'
import '@/shared/lib/i18n'

import { App } from '@/app'
import { AUTH_POPUP_MESSAGE, AUTH_POPUP_NAME } from '@/shared/lib/authSession'
import { setGraphqlEndpoint } from '@/shared/lib/graphqlClient'
import { loadRuntimeConfig, setAttachmentUploadUrl } from '@/shared/lib/runtimeConfig'
import { setSseEndpoint } from '@/shared/lib/sse'

async function bootstrap() {
  if (import.meta.env.VITE_MSW === 'true') {
    const { worker } = await import('@/shared/lib/msw/browser')
    await worker.start({ onUnhandledRequest: 'bypass' })
  }

  const runtimeConfig = await loadRuntimeConfig()

  if (runtimeConfig.backendUrl) {
    setGraphqlEndpoint(runtimeConfig.backendUrl)
  }

  if (runtimeConfig.sseEndpoint) {
    setSseEndpoint(runtimeConfig.sseEndpoint)
  }

  if (runtimeConfig.attachmentUploadUrl) {
    setAttachmentUploadUrl(runtimeConfig.attachmentUploadUrl)
  }

  if (runtimeConfig.telemetry.enabled) {
    const { initializeTelemetry } = await import('@/shared/lib/telemetry')
    initializeTelemetry(runtimeConfig.telemetry)
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

// When the app loads inside the auth popup (window.name persists through
// cross-origin navigation, window.opener may be null due to COOP headers).
if (window.name === AUTH_POPUP_NAME) {
  const channel = new BroadcastChannel(AUTH_POPUP_NAME)
  channel.postMessage({ type: AUTH_POPUP_MESSAGE })
  channel.close()
  window.close()
} else {
  void bootstrap()
}
