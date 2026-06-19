import type { ReadableSpan, SpanExporter } from '@opentelemetry/sdk-trace-base'

interface ExportResult {
  code: 0 | 1
  error?: Error
}

type OtlpAnyValue =
  | { stringValue: string }
  | { boolValue: boolean }
  | { intValue: string }
  | { doubleValue: number }
  | { arrayValue: { values: OtlpAnyValue[] } }

interface OtlpKeyValue {
  key: string
  value: OtlpAnyValue
}

interface OtlpSpanEvent {
  name: string
  timeUnixNano: string
  attributes?: OtlpKeyValue[]
  droppedAttributesCount?: number
}

interface OtlpSpanLink {
  traceId: string
  spanId: string
  attributes?: OtlpKeyValue[]
  droppedAttributesCount?: number
}

interface OtlpSpan {
  traceId: string
  spanId: string
  name: string
  kind: number
  startTimeUnixNano: string
  endTimeUnixNano: string
  attributes?: OtlpKeyValue[]
  droppedAttributesCount?: number
  events?: OtlpSpanEvent[]
  links?: OtlpSpanLink[]
  status?: {
    code: number
    message?: string
  }
  parentSpanId?: string
}

interface OtlpResourceSpan {
  resource: {
    attributes?: OtlpKeyValue[]
    droppedAttributesCount?: number
  }
  scopeSpans: Array<{
    scope: {
      name: string
      version?: string
      schemaUrl?: string
    }
    spans: OtlpSpan[]
    schemaUrl?: string
  }>
}

interface OtlpExportTraceServiceRequest {
  resourceSpans: OtlpResourceSpan[]
}

function toUnixNano(time: [number, number]): string {
  return (BigInt(time[0]) * 1_000_000_000n + BigInt(time[1])).toString()
}

function toAnyValue(value: unknown): OtlpAnyValue | undefined {
  if (typeof value === 'string') {
    return { stringValue: value }
  }

  if (typeof value === 'boolean') {
    return { boolValue: value }
  }

  if (typeof value === 'number') {
    return Number.isInteger(value) ? { intValue: String(value) } : { doubleValue: value }
  }

  if (typeof value === 'bigint') {
    return { intValue: value.toString() }
  }

  if (Array.isArray(value)) {
    const values = value.map(toAnyValue).filter((item): item is OtlpAnyValue => item !== undefined)

    return { arrayValue: { values } }
  }

  if (value == null) {
    return undefined
  }

  return { stringValue: String(value) }
}

function toKeyValueAttributes(
  attributes: Record<string, unknown> | Readonly<Record<string, unknown>>,
): OtlpKeyValue[] {
  return Object.entries(attributes)
    .map(([key, value]) => {
      const otlpValue = toAnyValue(value)

      return otlpValue ? { key, value: otlpValue } : undefined
    })
    .filter((item): item is OtlpKeyValue => item !== undefined)
}

function buildSpanEvent(event: ReadableSpan['events'][number]): OtlpSpanEvent {
  return {
    name: event.name,
    timeUnixNano: toUnixNano(event.time),
    attributes:
      event.attributes && Object.keys(event.attributes).length > 0
        ? toKeyValueAttributes(event.attributes as Record<string, unknown>)
        : undefined,
    droppedAttributesCount: event.droppedAttributesCount ?? 0,
  }
}

function buildSpanLink(link: ReadableSpan['links'][number]): OtlpSpanLink {
  return {
    traceId: link.context.traceId.toLowerCase(),
    spanId: link.context.spanId.toLowerCase(),
    attributes:
      link.attributes && Object.keys(link.attributes).length > 0
        ? toKeyValueAttributes(link.attributes as Record<string, unknown>)
        : undefined,
    droppedAttributesCount: link.droppedAttributesCount ?? 0,
  }
}

function buildSpan(span: ReadableSpan): OtlpSpan {
  return {
    traceId: span.spanContext().traceId.toLowerCase(),
    spanId: span.spanContext().spanId.toLowerCase(),
    parentSpanId: span.parentSpanContext?.spanId.toLowerCase(),
    name: span.name,
    kind: span.kind,
    startTimeUnixNano: toUnixNano(span.startTime),
    endTimeUnixNano: toUnixNano(span.endTime),
    attributes:
      Object.keys(span.attributes).length > 0
        ? toKeyValueAttributes(span.attributes as Record<string, unknown>)
        : undefined,
    droppedAttributesCount: span.droppedAttributesCount,
    events: span.events.map(buildSpanEvent),
    links: span.links.map(buildSpanLink),
    status:
      span.status.code === 0 && !span.status.message
        ? undefined
        : {
            code: span.status.code,
            message: span.status.message,
          },
  }
}

function buildResourceSpan(spans: ReadableSpan[]): OtlpResourceSpan | undefined {
  const firstSpan = spans[0]

  if (!firstSpan) {
    return undefined
  }

  const groupedScopes = new Map<
    string,
    {
      scope: {
        name: string
        version?: string
        schemaUrl?: string
      }
      spans: OtlpSpan[]
    }
  >()

  for (const span of spans) {
    const scope = span.instrumentationScope
    const scopeKey = `${scope.name}::${scope.version ?? ''}::${scope.schemaUrl ?? ''}`
    const grouped = groupedScopes.get(scopeKey)

    if (grouped) {
      grouped.spans.push(buildSpan(span))
      continue
    }

    groupedScopes.set(scopeKey, {
      scope,
      spans: [buildSpan(span)],
    })
  }

  return {
    resource: {
      attributes: toKeyValueAttributes(firstSpan.resource.attributes as Record<string, unknown>),
      droppedAttributesCount: 0,
    },
    scopeSpans: Array.from(groupedScopes.values()),
  }
}

function buildRequestBody(spans: ReadableSpan[]): OtlpExportTraceServiceRequest {
  const resourceSpan = buildResourceSpan(spans)

  return {
    resourceSpans: resourceSpan ? [resourceSpan] : [],
  }
}

/**
 * Minimal OTLP/HTTP browser span exporter that posts JSON-encoded trace data.
 */
export class OtlpHttpTraceExporter implements SpanExporter {
  private readonly endpoint: string

  private readonly headers: Record<string, string>

  constructor(endpoint: string, headers: Record<string, string>) {
    this.endpoint = endpoint
    this.headers = headers
  }

  export(spans: ReadableSpan[], resultCallback: (result: ExportResult) => void) {
    if (spans.length === 0) {
      resultCallback({ code: 0 })
      return
    }

    void fetch(this.endpoint, {
      body: JSON.stringify(buildRequestBody(spans)),
      headers: {
        'Content-Type': 'application/json',
        ...this.headers,
      },
      keepalive: true,
      method: 'POST',
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`OTLP export failed with status ${response.status}`)
        }

        resultCallback({ code: 0 })
      })
      .catch((error: unknown) => {
        const normalizedError = error instanceof Error ? error : new Error(String(error))
        // eslint-disable-next-line no-console -- telemetry exporter cannot use its own trace pipeline to report failures #needsrefactor
        console.error('OpenTelemetry export failed', normalizedError)
        resultCallback({ code: 1, error: normalizedError })
      })
  }

  forceFlush() {
    return Promise.resolve()
  }

  shutdown() {
    return Promise.resolve()
  }
}
