import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import { useBoard } from '@/entities/work-item'
import { Dialog, DialogBody, DialogContent, DialogHeader, DialogTitle } from '@/shared/components'

import { useCreateBoardColumn } from '../../hooks/useCreateBoardColumn'
import { useCreateColumnDialogStore } from '../../store/boardDialogStores'
import { BASE_STATUSES } from '../../utils/boardFormSchema'
import { ColumnForm, type ColumnFormValues } from './ColumnForm'

const columnSchema = z.object({
  name: z.string().min(1),
  workItemStatus: z.enum(BASE_STATUSES),
})

/**
 * Modal dialog for adding a new column to an existing board.
 * @returns The create-board-column dialog with name and status fields.
 */
export function CreateBoardColumnDialog() {
  const { t } = useTranslation()
  const open = useCreateColumnDialogStore((s) => s.open)
  const payload = useCreateColumnDialogStore((s) => s.payload)
  const closeModal = useCreateColumnDialogStore((s) => s.closeModal)

  const boardId = payload?.boardId ?? ''
  const { data: board } = useBoard(boardId)
  const { mutateAsync, isPending } = useCreateBoardColumn(boardId)

  const form = useForm<ColumnFormValues>({
    resolver: zodResolver(columnSchema),
    defaultValues: { name: '', workItemStatus: 'OPEN' },
  })

  async function onSubmit(values: ColumnFormValues) {
    const nextPosition = board ? Math.max(0, ...board.columns.map((c) => c.position)) + 1 : 1
    try {
      await mutateAsync({
        name: values.name,
        workItemStatus: values.workItemStatus,
        position: nextPosition,
      })
      form.reset()
    } catch {
      /* hook handles */
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) closeModal()
      }}
    >
      <DialogContent
        className="sm:max-w-sm"
        aria-describedby={undefined}
      >
        <DialogHeader>
          <DialogTitle>{t('features.workItem.board.addColumnTitle', 'Add Column')}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <ColumnForm
            form={form}
            isPending={isPending}
            onClose={closeModal}
            onSubmit={onSubmit}
          />
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
