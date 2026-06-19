/**
 * Runtime telemetry settings delivered through `/runtime-config.json`.
 */
export interface RuntimeTelemetryConfig {
  enabled: boolean
  serviceName?: string
  serviceVersion?: string
  traceEndpoint?: string
  headers?: Record<string, string>
}

/**
 * Top-level runtime configuration consumed during app startup.
 */
export interface RuntimeConfig {
  telemetry: RuntimeTelemetryConfig
  backendUrl?: string
  sseEndpoint?: string
  /** Base URL for attachment upload requests, e.g. `https://storage.example.com/upload`. */
  attachmentUploadUrl?: string
}

const RUNTIME_CONFIG_URL = '/runtime-config.json'

let _attachmentUploadUrl = ''

/**
 * Sets the attachment upload base URL once at bootstrap time.
 * @param url - The base URL to set for attachment uploads.
 */
export function setAttachmentUploadUrl(url: string): void {
  _attachmentUploadUrl = url
}

/**
 * Returns the attachment upload base URL set during bootstrap.
 * @returns The attachment upload base URL string.
 */
export function getAttachmentUploadUrl(): string {
  return _attachmentUploadUrl
}

const DEFAULT_RUNTIME_CONFIG: RuntimeConfig = {
  telemetry: {
    enabled: false,
  },
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function readBoolean(value: unknown): boolean {
  return value === true || value === 'true'
}

function readHeaders(value: unknown): Record<string, string> | undefined {
  if (!isRecord(value)) {
    return undefined
  }

  const headers = Object.entries(value).reduce<Record<string, string>>(
    (acc, [key, headerValue]) => {
      const normalizedValue = readString(headerValue)

      if (normalizedValue) {
        acc[key] = normalizedValue
      }

      return acc
    },
    {},
  )

  return Object.keys(headers).length > 0 ? headers : undefined
}

function readTelemetryConfig(value: unknown): RuntimeTelemetryConfig {
  const telemetry = isRecord(value) ? value : {}

  return {
    enabled: readBoolean(telemetry.enabled),
    serviceName: readString(telemetry.serviceName),
    serviceVersion: readString(telemetry.serviceVersion),
    traceEndpoint: readString(telemetry.traceEndpoint),
    headers: readHeaders(telemetry.headers),
  }
}

/**
 * Loads and validates the runtime configuration from the server.
 * @returns The parsed runtime configuration, or a safe default when the fetch fails.
 */
export async function loadRuntimeConfig(): Promise<RuntimeConfig> {
  try {
    const response = await fetch(RUNTIME_CONFIG_URL, {
      cache: 'no-store',
    })

    if (!response.ok) {
      return DEFAULT_RUNTIME_CONFIG
    }

    const payload: unknown = await response.json()

    if (!isRecord(payload)) {
      return DEFAULT_RUNTIME_CONFIG
    }

    return {
      telemetry: readTelemetryConfig(payload.telemetry),
      backendUrl: readString(payload.backendUrl),
      sseEndpoint: readString(payload.sseEndpoint),
      attachmentUploadUrl: readString(payload.attachmentUploadUrl),
    }
  } catch {
    return DEFAULT_RUNTIME_CONFIG
  }
}
