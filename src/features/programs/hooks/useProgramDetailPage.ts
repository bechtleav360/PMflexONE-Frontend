import { useState } from 'react'

import { useParams } from 'react-router-dom'

import { useGetProgramInitiationRequestByProgramId } from '@/entities/program-initiation-request'
import { useEditProgramDialogStore, useProgram } from '@/features/programs'

/**
 * Encapsulates data fetching and state for the program detail page.
 * @returns All data, derived values, and callbacks needed by `ProgramDetailPage`.
 */
export function useProgramDetailPage() {
  const { id = '' } = useParams<{ id: string }>()
  const { data, isPending, isError, refetch } = useProgram(id)
  const openEdit = useEditProgramDialogStore((s) => s.open)
  const { data: pirSummary } = useGetProgramInitiationRequestByProgramId(id)
  const [isPIRDialogOpen, setIsPIRDialogOpen] = useState(false)

  const portfolioId = data?.portfolio?.item.id ?? ''
  const programName = data?.name ?? ''

  return {
    id,
    data,
    isPending,
    isError,
    refetch,
    openEdit,
    pirSummary,
    isPIRDialogOpen,
    setIsPIRDialogOpen,
    portfolioId,
    programName,
  }
}
