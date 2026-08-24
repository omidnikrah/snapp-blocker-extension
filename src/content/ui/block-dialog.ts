import type { PlatformTheme } from '@/platforms/types'
import { el } from '@/shared/dom'

const PLACEHOLDER = 'مثلاً کیفیت پایین، سفارش اشتباه، تأخیر در ارسال...'

export interface BlockDialogOptions {
  readonly theme: PlatformTheme
  readonly shopName: string
  readonly onSubmit: (reason: string) => void
  readonly onCancel: () => void
}

export function createBlockDialog({
  theme,
  shopName,
  onSubmit,
  onCancel,
}: BlockDialogOptions): HTMLDivElement {
  const field = theme.createReasonField(PLACEHOLDER)

  const submit = theme.createButton('مسدود کن', 'confirm')
  submit.type = 'submit'

  const dialog = el('form', { class: `sb-dialog ${theme.dialogClass ?? ''}`.trim() }, [
    el('h2', { class: 'sb-dialog__title', text: 'این فروشگاه مسدود بشه؟' }),
    el('p', { class: 'sb-dialog__subtitle', text: shopName }),
    el('span', { class: 'sb-dialog__label', text: 'دلیل (اختیاری)' }),
    field.wrapper,
    el('div', { class: 'sb-dialog__actions' }, [
      theme.createButton('انصراف', 'dismiss', onCancel),
      submit,
    ]),
  ])

  dialog.addEventListener('submit', (event) => {
    event.preventDefault()
    onSubmit(field.textarea.value.trim())
  })

  const backdrop = el('div', { class: 'sb-backdrop sb-surface' }, [dialog])

  backdrop.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') onCancel()
  })

  backdrop.addEventListener('click', (event) => {
    if (event.target === backdrop) onCancel()
  })

  queueMicrotask(() => {
    field.textarea.focus()
  })

  return backdrop
}
