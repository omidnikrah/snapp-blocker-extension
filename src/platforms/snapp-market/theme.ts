import blockIconMarkup from '@/icons/block-icon.svg?raw'
import { createSvgIcon, el } from '@/shared/dom'
import type { ButtonRole, PlatformTheme, ReasonField } from '../types'
import styles from './theme.css?inline'
import triggerStyles from './trigger.css?inline'

const VARIANTS: Record<ButtonRole, string> = {
  confirm: 'primary',
  dismiss: 'ghost',
  neutral: 'neutral',
  quiet: 'brand',
}

const MAX_LENGTH = 200
const BLOCKED_BADGE_LABEL = 'مسدود شده'

export const snappMarketTheme: PlatformTheme = {
  dialogClass: 'sb-dialog--express',
  styles,
  triggerStyles,
  listingBadgeStyles: styles,

  createTriggerButton(_anchor, label, onClick) {
    const button = el('button', { type: 'button', class: 'sb-express-trigger' }, [label])
    button.addEventListener('click', onClick)
    return button
  },

  createButton(label, role, onClick) {
    const button = el('button', {
      type: 'button',
      class: `sb-express-button sb-express-button--${VARIANTS[role]}`,
      text: label,
    })
    if (onClick) button.addEventListener('click', onClick)
    return button
  },

  createReasonField(placeholder): ReasonField {
    const textarea = el('textarea', {
      class: 'sb-express-field',
      placeholder,
      maxlength: MAX_LENGTH,
    })
    return { wrapper: textarea, textarea }
  },

  createBlockedCardBadge() {
    return el('span', { class: 'sb-express-listing-badge' }, [
      createSvgIcon(blockIconMarkup, 'sb-express-listing-badge__icon'),
      el('span', { class: 'sb-express-listing-badge__text', text: BLOCKED_BADGE_LABEL }),
    ])
  },
}
