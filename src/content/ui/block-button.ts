import { el } from '@/shared/dom'

export const BLOCK_BUTTON_LABEL = 'مسدود کردن این فروشگاه'

export function createFloatingButton(onClick: () => void): HTMLButtonElement {
  const button = el('button', { type: 'button', class: 'sb-trigger' }, [BLOCK_BUTTON_LABEL])

  button.addEventListener('click', onClick)
  return button
}
