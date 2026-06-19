import { z } from 'zod'

import type { CreateAttachmentInput } from '@/entities/work-item'
import { graphqlClient } from '@/shared/lib/graphqlClient'

// ─── Constants ────────────────────────────────────────────────────────────────

/** MIME types accepted for work-item attachments (FA5 whitelist — not user-configurable). */
export const ALLOWED_ATTACHMENT_TYPES = [
  // Documents
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
  'application/vnd.oasis.opendocument.text', // odt
  'text/plain', // txt
  'text/markdown', // md
  // Spreadsheets
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
  'application/vnd.oasis.opendocument.spreadsheet', // ods
  'text/csv', // csv
  // Presentations
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // pptx
  'application/vnd.oasis.opendocument.presentation', // odp
  // Images
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  // Archives
  'application/zip',
]

/**
 * File extensions allowed by the backend asset service (mirrors AssetValidationProperties defaults).
 * The backend validates by extension + Tika MIME detection, so both must match.
 */
export const ALLOWED_ATTACHMENT_EXTENSIONS = new Set([
  'pdf',
  'docx',
  'odt',
  'txt',
  'md',
  'xlsx',
  'ods',
  'csv',
  'pptx',
  'odp',
  'png',
  'jpg',
  'jpeg',
  'gif',
  'webp',
  'zip',
])

/** Maximum allowed file size for attachments (10 MB). */
export const MAX_ATTACHMENT_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB

/**
 * Returns the content URL for an attachment asset.
 * @param id - The attachment ID.
 * @returns The relative URL to the asset's binary content.
 */
export const assetContentUrl = (id: string): string => `/api/assets/${id}/content`

// ─── GQL documents ────────────────────────────────────────────────────────────

/**
 * Only requests id + version — the asset fields (fileName, storageKey, size) are
 * null while the asset is PENDING and would cause the backend DataLoader to hang.
 * The full attachment data is fetched via the WorkItem query after invalidation.
 */
export const CREATE_ATTACHMENT = /* GraphQL */ `
  mutation CreateAttachment($workItemId: ID!, $input: CreateAttachmentInput!) {
    createAttachment(workItemId: $workItemId, input: $input) {
      id
      version
    }
  }
`

/** GraphQL mutation document for deleting an attachment by ID. */
export const DELETE_ATTACHMENT = /* GraphQL */ `
  mutation DeleteAttachment($id: ID!, $version: Int!) {
    deleteAttachment(id: $id, version: $version)
  }
`

// ─── Zod schemas ──────────────────────────────────────────────────────────────

const createAttachmentResponseSchema = z.object({
  createAttachment: z.object({
    id: z.string(),
    version: z.number().int(),
  }),
})

const deleteAttachmentResponseSchema = z.object({
  deleteAttachment: z.boolean(),
})

// ─── API functions ────────────────────────────────────────────────────────────

/**
 * Sends the `createAttachment` mutation and returns the created attachment record.
 *
 * @param workItemId - ID of the work item to attach the file to.
 * @param input - Optional attachment metadata.
 * @returns The newly created attachment (id + version only).
 */
export async function createAttachment(workItemId: string, input: CreateAttachmentInput = {}) {
  const raw = await graphqlClient.request(CREATE_ATTACHMENT, { workItemId, input })
  return createAttachmentResponseSchema.parse(raw).createAttachment
}

/**
 * Sends the `deleteAttachment` mutation.
 *
 * @param id - ID of the attachment to delete.
 * @param version - Current optimistic-lock version of the attachment.
 * @returns `true` when the deletion was acknowledged by the server.
 */
export async function deleteAttachment(id: string, version: number): Promise<boolean> {
  const raw = await graphqlClient.request(DELETE_ATTACHMENT, { id, version })
  return deleteAttachmentResponseSchema.parse(raw).deleteAttachment
}

/**
 * Uploads a file to the asset store for an already-created attachment record.
 *
 * @param file - The file to upload.
 * @param attachmentId - ID returned by {@link createAttachment}.
 */
export async function uploadAsset(file: File, attachmentId: string): Promise<void> {
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(assetContentUrl(attachmentId), {
    method: 'POST',
    body: formData,
    credentials: 'include',
  })

  if (!res.ok) {
    let serverCode = ''
    let serverMessage = ''
    try {
      const body = (await res.json()) as { code?: string; message?: string }
      serverCode = body.code ?? ''
      serverMessage = body.message ?? ''
    } catch {
      /* ignore parse errors */
    }
    throw new UploadError(res.status, serverCode, file.name, serverMessage)
  }
}

export class UploadError extends Error {
  readonly status: number
  readonly serverCode: string
  readonly fileName: string
  readonly serverMessage: string

  constructor(status: number, serverCode: string, fileName: string, serverMessage = '') {
    super(`Upload failed (${status}): ${serverCode || 'unknown'}`)
    this.status = status
    this.serverCode = serverCode
    this.fileName = fileName
    this.serverMessage = serverMessage
  }
}
