import type { AnchorTarget } from '@/platforms/types'
import { el } from '@/shared/dom'
import overlayStyles from './overlay.css?inline'
import shadowStyles from './style.css?inline'

const FLOATING_HOST_ID = 'snapp-blocker-root'
const OVERLAY_HOST_ID = 'snapp-blocker-overlay'
const OVERLAY_STYLE_ID = 'snapp-blocker-overlay-styles'
const LISTING_STYLE_ID = 'snapp-blocker-listing-styles'
export const INJECTED_ATTRIBUTE = 'data-snapp-blocker-inline'

export function mountFloatingRoot(): { triggerLayer: HTMLDivElement } {
  const host = el('div', { id: FLOATING_HOST_ID })
  document.documentElement.append(host)

  return { triggerLayer: attachShadow(host) }
}

export function mountOverlayHost(themeStyles: string): HTMLDivElement {
  document.getElementById(OVERLAY_STYLE_ID)?.remove()
  document.head.append(
    el('style', { id: OVERLAY_STYLE_ID, text: `${overlayStyles}\n${themeStyles}` }),
  )

  document.getElementById(OVERLAY_HOST_ID)?.remove()
  const host = el('div', { id: OVERLAY_HOST_ID })
  document.body.append(host)

  return host
}

export function isOverlayShowing(): boolean {
  return (document.getElementById(OVERLAY_HOST_ID)?.childElementCount ?? 0) > 0
}

export function mountListingStyles(styles: string): void {
  if (document.getElementById(LISTING_STYLE_ID)) return
  document.head.append(el('style', { id: LISTING_STYLE_ID, text: styles }))
}

export function unmountExtensionUi(): void {
  for (const id of [FLOATING_HOST_ID, OVERLAY_HOST_ID, OVERLAY_STYLE_ID, LISTING_STYLE_ID]) {
    document.getElementById(id)?.remove()
  }
  for (const node of document.querySelectorAll(`[${INJECTED_ATTRIBUTE}]`)) node.remove()
}

export function insertInline(anchor: AnchorTarget, node: Element): void {
  node.setAttribute(INJECTED_ATTRIBUTE, '')

  switch (anchor.placement) {
    case 'prepend':
      anchor.element.prepend(node)
      return
    case 'append':
      anchor.element.append(node)
      return
    case 'after':
      anchor.element.insertAdjacentElement('afterend', node)
      return
  }
}

export function mountInlineRoot(
  anchor: AnchorTarget,
  extraStyles = '',
): { host: HTMLElement; container: HTMLDivElement } {
  const host = el('span', { style: 'display:inline-flex;align-items:center' })
  insertInline(anchor, host)

  return { host, container: attachShadow(host, extraStyles) }
}

function attachShadow(host: HTMLElement, extraStyles = ''): HTMLDivElement {
  const container = el('div', { class: 'sb-root', dir: 'rtl' })
  host
    .attachShadow({ mode: 'open' })
    .append(el('style', { text: `${shadowStyles}\n${extraStyles}` }), container)
  return container
}
