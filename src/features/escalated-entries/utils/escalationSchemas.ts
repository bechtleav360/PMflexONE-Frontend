import { z } from 'zod'

const escalationReasonSchema = z.object({ reason: z.string().trim().min(1) })

/** Zod form schema for the escalate-entry dialog reason field. */
export const EscalateEntryFormSchema = escalationReasonSchema

/** Zod form schema for the de-escalate-entry dialog reason field. */
export const DeEscalateEntryFormSchema = escalationReasonSchema

/** Zod form schema for the target-level assessment update form. */
export const UpdateAssessmentFormSchema = z.object({
  targetProbability: z.number().int().min(1).max(5).optional(),
  targetImpact: z.number().int().min(1).max(5).optional(),
})

/** Validated form values for the escalation reason fields. */
export type EscalationReasonFormValues = z.infer<typeof escalationReasonSchema>

/** @deprecated Use EscalationReasonFormValues. */
export type EscalateEntryFormValues = EscalationReasonFormValues

/** @deprecated Use EscalationReasonFormValues. */
export type DeEscalateEntryFormValues = EscalationReasonFormValues

/** Validated form values for the target-level assessment update. */
export type UpdateAssessmentFormValues = z.infer<typeof UpdateAssessmentFormSchema>
