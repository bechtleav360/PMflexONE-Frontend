import { SpanStatusCode, trace } from '@opentelemetry/api'
import { registerInstrumentations } from '@opentelemetry/instrumentation'
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load'
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch'
import { resourceFromAttributes } from '@opentelemetry/resources'
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base'
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web'
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions'

import { OtlpHttpTraceExporter } from './otlpHttpTraceExporter'

/**
 * Telemetry settings resolved from runtime configuration.
 */
export interface TelemetryRuntimeConfig {
  enabled: boolean
  serviceName?: string
  serviceVersion?: string
  traceEndpoint?: string
  headers?: Record<string, string>
}

let initialized = false

function buildTraceEndpoint(endpoint: string): string {
  const url = new URL(endpoint, window.location.origin)

  if (!url.pathname.endsWith('/v1/traces')) {
    url.pathname = `${url.pathname.replace(/\/$/, '')}/v1/traces`
  }

  return url.toString()
}

function createIgnorePattern(endpoint: string): RegExp {
  return new RegExp(`^${endpoint.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:[?#].*)?$`)
}

function buildResourceAttributes(serviceName: string, serviceVersion: string | undefined) {
  return {
    [ATTR_SERVICE_NAME]: serviceName,
    ...(serviceVersion ? { [ATTR_SERVICE_VERSION]: serviceVersion } : {}),
    'deployment.environment': import.meta.env.MODE,
  }
}

function buildTelemetryConfig(runtimeConfig: TelemetryRuntimeConfig) {
  if (!runtimeConfig.enabled) {
    return undefined
  }

  if (!runtimeConfig.traceEndpoint) {
    return undefined
  }

  return {
    headers: runtimeConfig.headers ?? {},
    resourceAttributes: buildResourceAttributes(
      runtimeConfig.serviceName?.trim() || 'p1ng-frontend',
      runtimeConfig.serviceVersion?.trim(),
    ),
    traceEndpoint: buildTraceEndpoint(runtimeConfig.traceEndpoint),
  }
}

type SerializableAttributeValue = string | number | boolean

/**
 * Traces a React UI rendering error inside a dedicated span so the boundary can
 * surface a correlated failure event to the configured OTLP backend.
 * @param error - The error captured by the boundary.
 * @param componentStack - The React component stack for the failing subtree.
 * @param attributes - Extra span attributes that help identify the failure context.
 * @returns Nothing.
 */
export function traceUiError(
  error: Error,
  componentStack?: string | null,
  attributes: Record<string, SerializableAttributeValue> = {},
) {
  const tracer = trace.getTracer('p1ng-frontend.ui')
  const span = tracer.startSpan('react.error_boundary')

  span.setAttribute('error.type', error.name)
  span.setAttribute('error.message', error.message)

  if (error.stack) {
    span.setAttribute('error.stack', error.stack)
  }

  if (componentStack?.trim()) {
    span.setAttribute('react.component_stack', componentStack.trim())
  }

  for (const [key, value] of Object.entries(attributes)) {
    span.setAttribute(key, value)
  }

  span.recordException(error)
  span.setStatus({
    code: SpanStatusCode.ERROR,
    message: error.message,
  })
  span.end()
}

/**
 * Initializes browser tracing for the application.
 *
 * Tracing is disabled unless runtime configuration enables it and provides an
 * OTLP trace endpoint.
 * @param runtimeConfig - Runtime telemetry settings loaded at startup.
 * @returns Nothing.
 */
export function initializeTelemetry(runtimeConfig: TelemetryRuntimeConfig) {
  if (initialized || typeof window === 'undefined') {
    return
  }

  const config = buildTelemetryConfig(runtimeConfig)

  if (!config) {
    return
  }

  const exporter = new OtlpHttpTraceExporter(config.traceEndpoint, config.headers)
  const provider = new WebTracerProvider({
    resource: resourceFromAttributes(config.resourceAttributes),
    spanProcessors: [new SimpleSpanProcessor(exporter)],
  })

  provider.register()

  registerInstrumentations({
    instrumentations: [
      new DocumentLoadInstrumentation(),
      new FetchInstrumentation({
        ignoreUrls: [createIgnorePattern(config.traceEndpoint)],
      }),
    ],
  })

  initialized = true
}
