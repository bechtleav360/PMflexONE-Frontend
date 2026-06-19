import { writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'path'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin, type ResolvedConfig } from 'vite'

// ---------------------------------------------------------------------------
// License generation types (Vite plugin only — not shared with app code)
// ---------------------------------------------------------------------------

interface LicenseCheckerPackageInfo {
  licenses?: string | string[]
  repository?: string
  licenseText?: string
  description?: string
}

interface LicenseCheckerModule {
  init(
    opts: { start: string; production?: boolean; excludePrivatePackages?: boolean },
    callback: (err: Error | null, packages: Record<string, LicenseCheckerPackageInfo>) => void,
  ): void
}

function collectFrontendLicenses(
  rootDir: string,
): Promise<{ name: string; generatedAt: string; packages: unknown[] }> {
  const require = createRequire(import.meta.url)
  const checker = require('license-checker-rseidelsohn') as LicenseCheckerModule

  return new Promise((resolvePromise, rejectPromise) => {
    checker.init(
      { start: rootDir, production: true, excludePrivatePackages: true },
      (err, packages) => {
        if (err) {
          rejectPromise(err)
          return
        }

        const packageList = Object.entries(packages).map(([nameAtVersion, info]) => {
          const atIndex = nameAtVersion.lastIndexOf('@')
          const name = nameAtVersion.slice(0, atIndex)
          const version = nameAtVersion.slice(atIndex + 1)
          const rawLicense = info.licenses
          const license = Array.isArray(rawLicense)
            ? rawLicense.join(', ')
            : (rawLicense ?? 'Unknown')

          return {
            name,
            version,
            license,
            homepage: info.repository,
            description: info.description,
            licenseText: info.licenseText,
          }
        })

        resolvePromise({
          name: 'frontend',
          generatedAt: new Date().toISOString(),
          packages: packageList,
        })
      },
    )
  })
}

function generateLicensesPlugin(): Plugin {
  let rootDir = process.cwd()

  return {
    name: 'generate-licenses',
    configResolved(config: ResolvedConfig) {
      rootDir = config.root
    },
    async buildStart() {
      try {
        const source = await collectFrontendLicenses(rootDir)
        const manifest = { version: '1' as const, sources: [source] }
        writeFileSync(
          path.resolve(rootDir, 'public', 'licenses.json'),
          JSON.stringify(manifest, null, 2) + '\n',
          'utf-8',
        )
      } catch (err) {
        // eslint-disable-next-line no-console -- Vite plugin build error; no other reporting channel available
        console.warn('[generate-licenses] Failed to generate licenses.json:', err)
      }
    },
  }
}

// ---------------------------------------------------------------------------

function readString(value: string | undefined): string | undefined {
  return value?.trim() || undefined
}

function readBoolean(value: string | undefined): boolean {
  return value === 'true'
}

function readHeaders(rawHeaders: string | undefined): Record<string, string> | undefined {
  if (!rawHeaders) {
    return undefined
  }

  const headers = rawHeaders.split(',').reduce<Record<string, string>>((acc, header) => {
    const [rawKey, ...rawValueParts] = header.split('=')

    const key = rawKey?.trim()
    const value = rawValueParts.join('=').trim()

    if (key && value) {
      acc[key] = value
    }

    return acc
  }, {})

  return Object.keys(headers).length > 0 ? headers : undefined
}

function buildRuntimeConfigJson(env: Record<string, string>): string {
  const runtimeConfig = {
    telemetry: {
      enabled: readBoolean(env.VITE_OTEL_ENABLED),
      serviceName: readString(env.VITE_OTEL_SERVICE_NAME) ?? 'p1ng-frontend',
      serviceVersion: readString(env.VITE_OTEL_SERVICE_VERSION),
      traceEndpoint:
        readString(env.VITE_OTEL_EXPORTER_OTLP_TRACES_ENDPOINT) ??
        readString(env.VITE_OTEL_EXPORTER_OTLP_ENDPOINT),
      headers:
        readHeaders(env.VITE_OTEL_EXPORTER_OTLP_TRACES_HEADERS) ??
        readHeaders(env.VITE_OTEL_EXPORTER_OTLP_HEADERS),
    },
  }

  return `${JSON.stringify(runtimeConfig, null, 2)}\n`
}

/**
 * DEV-only middleware that stubs the oauth2-proxy `/me` endpoint so that
 * `useCurrentUser` resolves with a fictional user instead of returning null.
 * The middleware is never included in production builds (`apply: 'serve'`).
 *
 * @returns The dev-only Vite plugin that stubs `/me` and `/oauth2/sign_out`.
 */
function devAuthMockPlugin(): Plugin {
  return {
    name: 'dev-auth-mock',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/oauth2/sign_out') {
          res.statusCode = 302
          res.setHeader('Location', '/')
          res.end()
          return
        }

        if (req.url !== '/me') {
          next()
          return
        }

        const mockUser = JSON.stringify({
          id: '00000000-0000-0000-0000-000000000000',
          firstName: 'Jana',
          lastName: 'Müller',
          mail: 'jana.mueller@example.com',
          displayName: 'Jana Müller',
          profileImage: null,
        })
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.end(mockUser)
      })
    },
  }
}

function runtimeConfigPlugin(): Plugin {
  return {
    name: 'runtime-config-json',
    apply: 'serve',
    configureServer(server) {
      const env = loadEnv(server.config.mode, server.config.root, 'VITE_')
      const runtimeConfigJson = buildRuntimeConfigJson(env)

      server.middlewares.use((req, res, next) => {
        if (req.url !== '/runtime-config.json') {
          next()
          return
        }

        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.setHeader('Cache-Control', 'no-store')
        res.end(runtimeConfigJson)
      })
    },
  }
}

const sourceChunkRules = [
  ['/src/app/', 'app'],
  ['/src/pages/', 'pages'],
  ['/src/widgets/', 'widgets'],
  ['/src/features/', 'features'],
  ['/src/entities/', 'entities'],
  ['/src/shared/', 'shared'],
] as const

function manualChunksForSourceModules(id: string) {
  if (id.includes('node_modules')) {
    return undefined
  }

  const matchedRule = sourceChunkRules.find(([segment]) => id.includes(segment))

  return matchedRule?.[1]
}

const vendorChunkRules = [
  { test: (id: string) => id.includes('@opentelemetry/'), chunk: 'telemetry' },
  {
    test: (id: string) =>
      id.includes('i18next') ||
      id.includes('react-i18next') ||
      id.includes('i18next-browser-languagedetector'),
    chunk: 'i18n',
  },
  {
    test: (id: string) => id.includes('@tanstack/react-query') || id.includes('graphql-request'),
    chunk: 'data',
  },
  { test: (id: string) => id.includes('lucide-react'), chunk: 'icons' },
  {
    test: (id: string) => id.includes('@radix-ui/') || id.includes('react-resizable-panels'),
    chunk: 'ui-primitives',
  },
  {
    test: (id: string) =>
      id.includes('react-hook-form') || id.includes('@hookform/resolvers') || id.includes('zod'),
    chunk: 'forms',
  },
  { test: (id: string) => id.includes('react-router-dom'), chunk: 'router' },
] as const

function manualChunksForVendorModules(id: string) {
  if (!id.includes('node_modules')) {
    return undefined
  }

  const matchedRule = vendorChunkRules.find((rule) => rule.test(id))

  return matchedRule?.chunk ?? 'vendor'
}

function manualChunks(id: string) {
  return manualChunksForSourceModules(id) ?? manualChunksForVendorModules(id)
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    devAuthMockPlugin(),
    runtimeConfigPlugin(),
    generateLicensesPlugin(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks,
      },
    },
  },
  server: {
    host: '0.0.0.0',
    allowedHosts: ['p1ng.localhost'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
