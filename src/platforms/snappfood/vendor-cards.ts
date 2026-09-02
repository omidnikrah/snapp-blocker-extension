import type { VendorCardTarget } from '../types'
import { readVendorCodeFromHref } from './vendor-url'

interface CardShape {
  readonly selector: string
  readonly vendorCode?: (card: Element) => string | null
  readonly vendorId?: (card: Element) => string | null
}

const CARD_SHAPES: readonly CardShape[] = [
  {
    selector: 'a[data-vendor-code]',
    vendorCode: (card) => card.getAttribute('data-vendor-code'),
  },
  {
    selector: '[data-product-id][data-vendor-id]',
    vendorId: (card) => card.getAttribute('data-vendor-id'),
  },
]

const FALLBACK_SHAPES: readonly CardShape[] = [
  {
    selector: 'a[href*="-r-"]',
    vendorCode: (card) => readVendorCodeFromHref(card.getAttribute('href')),
  },
]

export function findVendorCards(document: Document): VendorCardTarget[] {
  const cards = collectCards(document, CARD_SHAPES)
  return cards.length > 0 ? cards : collectCards(document, FALLBACK_SHAPES)
}

function collectCards(document: Document, shapes: readonly CardShape[]): VendorCardTarget[] {
  const cards = new Map<Element, VendorCardTarget>()

  for (const shape of shapes) {
    for (const card of document.querySelectorAll(shape.selector)) {
      if (cards.has(card)) continue

      if (card.parentElement?.closest(shape.selector)) continue

      const vendorCode = shape.vendorCode?.(card) ?? null
      const vendorId = shape.vendorId?.(card) ?? null
      if (vendorCode || vendorId) cards.set(card, { element: card, vendorCode, vendorId })
    }
  }

  return [...cards.values()]
}
