import { el } from '@/shared/dom'
import type { ButtonRole, PlatformTheme, ReasonField } from '../types'
import { FLOATING_BAR_MODIFIER, isInAppBar } from './anchors'
import styles from './theme.css?inline'

const ROWS = 3
const REPLICATED_VALUE = 'data-replicated-value'
const APP_BAR_GAP = '8px'

const VARIANTS: Record<ButtonRole, readonly string[]> = {
  confirm: ['sb-sf-button--large', 'sb-sf-button--square', 'sb-sf-button--brand'],
  dismiss: ['sb-sf-button--large', 'sb-sf-button--square', 'sb-sf-button--neutral'],
  neutral: ['sb-sf-button--large', 'sb-sf-button--square', 'sb-sf-button--neutral'],
  quiet: ['sb-sf-button--large', 'sb-sf-button--square', 'sb-sf-button--plain'],
}

export const snappfoodTheme: PlatformTheme = {
  dialogClass: null,
  styles,
  triggerStyles: styles,

  createButton(label, role, onClick) {
    return button(label, VARIANTS[role], onClick)
  },

  createTriggerButton(anchor, label, onClick) {
    const onCover = anchor.element.closest(`.${FLOATING_BAR_MODIFIER}`) !== null

    const trigger = button(
      label,
      [
        'sb-sf-button--small',
        'sb-sf-button--rounded',
        onCover ? 'sb-sf-button--onImage' : 'sb-sf-button--neutral',
      ],
      onClick,
    )

    if (isInAppBar(anchor.element)) trigger.style.marginLeft = APP_BAR_GAP
    return trigger
  },

  createReasonField(placeholder) {
    return createField(placeholder)
  },
}

function button(
  label: string,
  variants: readonly string[],
  onClick?: () => void,
): HTMLButtonElement {
  const element = el('button', { type: 'button', class: ['sb-sf-button', ...variants].join(' ') }, [
    el('span', { class: 'sb-sf-button__label', text: label }),
  ])

  if (onClick) element.addEventListener('click', onClick)
  return element
}

function createField(placeholder: string): ReasonField {
  const textarea = el('textarea', { class: 'byn-text-input__input', rows: ROWS, placeholder })

  const context = el(
    'div',
    {
      class:
        'byn-text-input__context byn-text-input__context--with-label byn-text-input__context--multiline',
    },
    [textarea],
  )

  const container = el(
    'label',
    { class: 'byn-text-input__container byn-input-container byn-input-container--outfield' },
    [
      el('span', { class: 'byn-input-container__content-wrapper' }, [
        el('span', { class: 'byn-input-container__content' }, [context]),
      ]),
    ],
  )

  const replicate = (): void => {
    context.setAttribute(REPLICATED_VALUE, textarea.value)
    container.setAttribute(REPLICATED_VALUE, textarea.value)
  }
  replicate()
  textarea.addEventListener('input', replicate)

  return { wrapper: el('div', { class: 'byn-input-wrapper' }, [container]), textarea }
}
