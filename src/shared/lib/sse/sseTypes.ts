/**
 * Event type constants — must match sse.event-types in application.yml.
 * The backend loads event types from configuration (no compiled enum), so these
 * constants are the frontend's source of truth for event type strings.
 */
export const SSE_EVENT_TYPES = {
  AGENT_TASK_COMPLETED: 'notification.agent.taskCompleted.v1',
  AGENT_RECOMMENDATION_READY: 'notification.agent.recommendationReady.v1',
  AGENT_RISK_DETECTED: 'notification.agent.riskDetected.v1',
  OPERATION_PROGRESS: 'notification.operation.progress.v1',
  OPERATION_COMPLETED: 'notification.operation.completed.v1',
  OPERATION_FAILED: 'notification.operation.failed.v1',
  SYSTEM_ALERT: 'notification.system.alert.v1',
} as const
