import { useEffect } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import { useBoard } from '@/entities/work-item'
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@/shared/components'

import { useUpdateBoard } from '../../hooks/useUpdateBoard'
import { useEditBoardDialogStore } from '../../store/boardDialogStores'

const schema = z.object({ name: z.string().min(1).max(255), version: z.number().int() })
type Values = z.infer<typeof schema>

/**
 * Dialog for editing an existing board's name.
 * @returns The edit board dialog element.
 */
export function EditBoardDialog() {
  const { t } = useTranslation()
  const open = useEditBoardDialogStore((s) => s.open)
  const payload = useEditBoardDialogStore((s) => s.payload)
  const closeModal = useEditBoardDialogStore((s) => s.closeModal)

  const boardId = payload?.boardId ?? ''
  const { data: board, isLoading } = useBoard(boardId)
  const { mutateAsync, isPending } = useUpdateBoard()

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', version: 0 },
  })

  useEffect(() => {
    if (board) form.reset({ name: board.name, version: board.version })
  }, [board, form])

  async function onSubmit(values: Values) {
    try {
      await mutateAsync({
        id: boardId,
        input: { version: values.version, name: values.name.trim() },
      })
      form.reset()
    } catch {
      /* hook handles feedback */
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
          <DialogTitle>{t('features.workItem.board.editBoardTitle', 'Edit Board')}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          {!isLoading && (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('features.workItem.board.boardName', 'Board name')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeModal}
                    disabled={isPending}
                  >
                    {t('features.workItem.form.cancel', 'Cancel')}
                  </Button>
                  <Button
                    type="submit"
                    disabled={isPending}
                  >
                    {t('features.workItem.form.submit', 'Save')}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
