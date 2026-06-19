import { gql } from 'graphql-request'

/** GraphQL query document for fetching the scoped list of escalated entries. */
export const GET_ESCALATED_ENTRIES = gql`
  query GetEscalatedEntries(
    $filter: EscalatedEntryFilter!
    $pagination: Pagination
    $orderBy: OrderBy
  ) {
    escalatedEntries(filter: $filter, pagination: $pagination, orderBy: $orderBy) {
      id
      version
      sourceEntryType
      sourceEntryId
      scope {
        id
        scopeType
      }
      escalationChain
      status
      entryNumber
      name
      description
      pestelCategory
      sourceStatus
      probability
      impact
      riskLevel
      targetProbability
      targetImpact
      escalatedAt
      returnedAt
      createdAt
      updatedAt
      creator {
        id
        firstName
        lastName
        mail
      }
      updater {
        id
        firstName
        lastName
        mail
      }
    }
  }
`

/** GraphQL query document for fetching a single escalated entry (with log + measures). */
export const GET_ESCALATED_ENTRY = gql`
  query GetEscalatedEntry($id: ID!) {
    escalatedEntry(id: $id) {
      id
      version
      sourceEntryType
      sourceEntryId
      scope {
        id
        scopeType
      }
      escalationChain
      status
      entryNumber
      name
      description
      pestelCategory
      sourceStatus
      probability
      impact
      riskLevel
      targetProbability
      targetImpact
      escalatedAt
      returnedAt
      createdAt
      updatedAt
      creator {
        id
        firstName
        lastName
        mail
      }
      updater {
        id
        firstName
        lastName
        mail
      }
      escalationProtocol {
        id
        version
        eventType
        reason
        occurredAt
        performedBy {
          id
          firstName
          lastName
          mail
        }
      }
      parentEntry {
        id
        targetProbability
        targetImpact
        escalationProtocol {
          id
          version
          eventType
          reason
          occurredAt
          performedBy {
            id
            firstName
            lastName
            mail
          }
        }
        measures {
          id
          version
          content
          position
          createdAt
          updatedAt
          creator {
            id
            firstName
            lastName
            mail
          }
        }
      }
      childEntry {
        id
        targetProbability
        targetImpact
        escalationProtocol {
          id
          version
          eventType
          reason
          occurredAt
          performedBy {
            id
            firstName
            lastName
            mail
          }
        }
        measures {
          id
          version
          content
          position
          createdAt
          updatedAt
          creator {
            id
            firstName
            lastName
            mail
          }
        }
      }
      measures {
        id
        version
        content
        position
        createdAt
        updatedAt
        creator {
          id
          firstName
          lastName
          mail
        }
      }
    }
  }
`

/** GraphQL mutation document for escalating a source entry. */
export const ESCALATE_ENTRY = gql`
  mutation EscalateEntry($input: EscalateEntryInput!) {
    createEscalatedEntry(input: $input) {
      id
      version
      status
      escalatedAt
      sourceEntryId
      sourceEntryType
      scope {
        id
        scopeType
      }
      escalationChain
      entryNumber
      name
    }
  }
`

/** GraphQL mutation document for returning (de-escalating) an escalated entry. */
export const DE_ESCALATE_ENTRY = gql`
  mutation DeEscalateEntry($input: DeEscalateEntryInput!) {
    deEscalateEntry(input: $input) {
      id
      version
      status
      returnedAt
    }
  }
`

/** GraphQL mutation document for updating the target-level assessment. */
export const UPDATE_ESCALATED_ENTRY = gql`
  mutation UpdateEscalatedEntryAssessment($input: UpdateEscalatedEntryAssessmentInput!) {
    updateEscalatedEntry(input: $input) {
      id
      version
      targetProbability
      targetImpact
      updatedAt
    }
  }
`

/** GraphQL mutation document for adding an action measure. */
export const CREATE_ESCALATION_MEASURE = gql`
  mutation CreateEscalationMeasure($input: AddEscalationMeasureInput!) {
    createEscalationMeasure(input: $input) {
      id
      version
      content
      position
      createdAt
      updatedAt
      creator {
        id
        firstName
        lastName
        mail
      }
    }
  }
`

/** GraphQL mutation document for editing an action measure. */
export const UPDATE_ESCALATION_MEASURE = gql`
  mutation UpdateEscalationMeasure($input: UpdateEscalationMeasureInput!) {
    updateEscalationMeasure(input: $input) {
      id
      version
      content
      position
      updatedAt
    }
  }
`

/** GraphQL mutation document for deleting an action measure. */
export const DELETE_ESCALATION_MEASURE = gql`
  mutation DeleteEscalationMeasure($id: ID!) {
    deleteEscalationMeasure(id: $id)
  }
`
