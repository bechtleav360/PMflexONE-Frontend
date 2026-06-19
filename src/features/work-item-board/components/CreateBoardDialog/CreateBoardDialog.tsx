import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

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
import { REQUIRED_MARKER } from '@/shared/lib/constants'
import type { ScopeType } from '@/shared/types/scopeType'

import { useCreateBoard } from '../../hooks/useCreateBoard'
import { useCreateBoardDialogStore } from '../../store/boardDialogStores'
import {
  boardFormSchema,
  DEFAULT_BOARD_COLUMNS,
  type BoardFormValues,
} from '../../utils/boardFormSchema'

interface CreateBoardDialogProps {
  scopeType: ScopeType
  scopeId: string
}

/**
 * Dialog for creating a new board within a given scope.
 * @param root0 - Component props.
 * @param root0.scopeType - The scope type (e.g. 'Project').
 * @param root0.scopeId - The ID of the scope the board belongs to.
 * @returns The create board dialog element.
 */
export function CreateBoardDialog({ scopeType, scopeId }: CreateBoardDialogProps) {
  const { t } = useTranslation()
  const open = useCreateBoardDialogStore((s) => s.open)
  const closeModal = useCreateBoardDialogStore((s) => s.closeModal)
  const { mutateAsync, isPending } = useCreateBoard(scopeType, scopeId)

  const form = useForm<BoardFormValues>({
    resolver: zodResolver(boardFormSchema),
    defaultValues: { name: '', columns: DEFAULT_BOARD_COLUMNS },
  })

  async function onSubmit(values: BoardFormValues) {
    try {
      await mutateAsync({
        input: {
          scopeId,
          scopeType,
          name: values.name.trim(),
          columns: values.columns.map((c) => ({ ...c })),
        },
      })
      form.reset({ name: '', columns: DEFAULT_BOARD_COLUMNS })
    } catch {
      /* onError in hook handles feedback */
    }
  }

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) {
      closeModal()
      form.reset({ name: '', columns: DEFAULT_BOARD_COLUMNS })
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      <DialogContent
        className="sm:max-w-lg"
        aria-describedby={undefined}
      >
        <DialogHeader>
          <DialogTitle>{t('features.workItem.board.createBoardTitle', 'Create Board')}</DialogTitle>
        </DialogHeader>
        <DialogBody>
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
                    <FormLabel>
                      {t('features.workItem.board.boardName', 'Board name')}
                      {REQUIRED_MARKER}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t(
                          'features.workItem.board.boardNamePlaceholder',
                          'e.g. Sprint Board',
                        )}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2 pt-2">
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
                  {t('features.workItem.board.createBoard', 'Create')}
                </Button>
              </div>
            </form>
          </Form>
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
