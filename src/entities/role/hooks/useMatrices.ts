import { useQuery } from '@tanstack/react-query'

import { getMatrices } from '../api/getMatrices'
import { roleQueryKeys } from '../model/role.queryKeys'
import type { Matrix } from '../model/role.types'

/**
 * Fetches the list of all matrices and returns the React Query result.
 *
 * @returns The React Query result containing the array of matrices.
 */
export function useMatrices() {
  return useQuery<Matrix[]>({
    queryKey: roleQueryKeys.matrices(),
    queryFn: () => getMatrices(),
    staleTime: 0,
  })
}
