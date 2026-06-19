import { z } from 'zod'

/** Zod schema for a single third-party package and its licence information. */
export const LicensePackageSchema = z.object({
  name: z.string(),
  version: z.string(),
  license: z.string(),
  licenseText: z.string().optional(),
  homepage: z.string().optional(),
  description: z.string().optional(),
})

/** Zod schema for a named source of licence data (e.g. frontend or backend package set). */
export const LicenseSourceSchema = z.object({
  name: z.string(),
  generatedAt: z.string(),
  packages: z.array(LicensePackageSchema),
})

/** Zod schema for the top-level manifest written to `public/licenses.json` by the Vite build plugin. */
export const LicenseManifestSchema = z.object({
  version: z.literal('1'),
  sources: z.array(LicenseSourceSchema),
})

/** Represents a single third-party package and its licence information. */
export type LicensePackage = z.infer<typeof LicensePackageSchema>

/** A named source of licence data (e.g. frontend or backend package set). */
export type LicenseSource = z.infer<typeof LicenseSourceSchema>

/** Top-level manifest written to `public/licenses.json` by the Vite build plugin. */
export type LicenseManifest = z.infer<typeof LicenseManifestSchema>
