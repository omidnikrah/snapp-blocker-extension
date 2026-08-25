import type { BlockedShop } from '@/domain/blocked-shop'
import markup from '@/icons/block-icon.svg?raw'
import type { PlatformTheme } from '@/platforms/types'
import { el } from '@/shared/dom'
import { formatDate } from '@/shared/format-date'

function createBlockIcon(className: string): SVGElement {
  const svg = new DOMParser().parseFromString(markup, 'image/svg+xml').documentElement
  svg.setAttribute('class', className)
  return svg as unknown as SVGElement
}

export interface BlockedOverlayOptions {
  readonly theme: PlatformTheme
  readonly shop: BlockedShop
  readonly onBack: () => void
  readonly onUnblock: () => void
}

export function createBlockedOverlay({
  theme,
  shop,
  onBack,
  onUnblock,
}: BlockedOverlayOptions): HTMLDivElement {
  return el('div', { class: 'sb-overlay sb-surface' }, [
    el('div', { class: 'sb-overlay__card' }, [
      createBlockIcon('sb-overlay__icon'),
      el('h1', { class: 'sb-overlay__title', text: 'این فروشگاه رو مسدود کرده‌ای' }),
      el('p', { class: 'sb-overlay__shop-name', text: shop.name }),
      ...(shop.reason ? [el('p', { class: 'sb-overlay__reason', text: shop.reason })] : []),
      el('p', { class: 'sb-overlay__date', text: `مسدود شده در ${formatDate(shop.blockedAt)}` }),
      el('div', { class: 'sb-overlay__actions' }, [
        theme.createButton('بازگشت', 'neutral', onBack),
        theme.createButton('رفع مسدودی', 'quiet', onUnblock),
      ]),
    ]),
  ])
}
