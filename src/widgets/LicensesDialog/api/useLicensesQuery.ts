import { useQuery } from '@tanstack/react-query'

import { LicenseManifestSchema } from '@/shared/types/licenses'
import type { LicenseManifest } from '@/shared/types/licenses'

async function fetchLicenses(): Promise<LicenseManifest> {
  const res = await fetch('/licenses.json')
  if (!res.ok) {
    throw new Error(`Failed to load licenses: ${res.status}`)
  }
  return LicenseManifestSchema.parse(await res.json())
}

/**
 * TanStack Query hook that fetches and validates the licenses manifest from `/licenses.json`.
 * @param enabled - When `false` the query is skipped; pass `true` when the dialog opens.
 * @returns The TanStack Query result containing the parsed {@link LicenseManifest}.
 */
export function useLicensesQuery(enabled: boolean) {
  return useQuery({
    queryKey: ['licenses'],
    queryFn: fetchLicenses,
    staleTime: Infinity,
    enabled,
  })
}
