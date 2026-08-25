import { slugSegmentToName } from '@/shared/shop-name'
import type { PlatformAdapter, VendorCardTarget } from '../types'

const VENDOR_ID_PATTERN = /^[a-zA-Z0-9]+$/
const LOGO_SELECTOR = 'img[src*="/vendor_logo/"]'
const LOGO_ALT_SUFFIX = /\s*icon\s*$/i
const SEARCH_PREFIX = 'جستجو در '
const ANCHOR_RESOLVERS: readonly ((document: Document) => Element | null)[] = [
  (document) => document.querySelector('a[href$="/vendor-info"]')?.parentElement ?? null,
  (document) => document.querySelector('a[href*="/vendor-info"]')?.parentElement ?? null,
  (document) => document.querySelector('[data-testid="pre-order-icon"]')?.parentElement ?? null,
]
const VENDOR_CARD_SELECTORS: readonly string[] = [
  'a[data-testid="vendor-card"]',
  'a[href*="/supermarket/"]',
]

const HOSTNAME = 'snapp.market'

export const snappMarketAdapter: PlatformAdapter = {
  matchesHost(url) {
    return url.hostname === HOSTNAME
  },

  matchesUrl(url) {
    return url.hostname === HOSTNAME && url.pathname.startsWith('/supermarket/')
  },

  extractVendorId(url) {
    const vendorId = url.pathname.split('/').filter(Boolean)[2]
    return vendorId !== undefined && VENDOR_ID_PATTERN.test(vendorId) ? vendorId : null
  },

  extractShopName(document, url) {
    return readLogoAlt(document) ?? readSearchLabel(document) ?? slugFallback(url)
  },

  extractShopImage(document) {
    return document.querySelector<HTMLImageElement>(LOGO_SELECTOR)?.src ?? null
  },

  findAnchors(document) {
    for (const resolve of ANCHOR_RESOLVERS) {
      const element = resolve(document)
      if (!element) continue

      return [{ element, placement: 'append' as const }]
    }
    return []
  },

  findVendorCards(document) {
    for (const selector of VENDOR_CARD_SELECTORS) {
      const cards: VendorCardTarget[] = []
      for (const element of document.querySelectorAll(selector)) {
        const vendorId = vendorIdFromHref(element)
        if (vendorId) cards.push({ element, vendorId, titleElement: findCardTitle(element) })
      }
      if (cards.length > 0) return cards
    }
    return []
  },
}

function vendorIdFromHref(element: Element): string | null {
  const href = element.getAttribute('href')
  if (!href) return null

  try {
    return snappMarketAdapter.extractVendorId(new URL(href, location.href))
  } catch {
    return null
  }
}

function findCardTitle(card: Element): Element | null {
  let name: string | null = null
  for (const logo of card.querySelectorAll<HTMLImageElement>('img[alt]')) {
    if (LOGO_ALT_SUFFIX.test(logo.alt)) {
      name = blankToNull(logo.alt.replace(LOGO_ALT_SUFFIX, ''))
      break
    }
  }
  if (!name) return null

  for (const element of card.querySelectorAll('*')) {
    if (element.children.length === 0 && element.textContent?.trim() === name) return element
  }
  return null
}

function readLogoAlt(document: Document): string | null {
  const alt = document.querySelector<HTMLImageElement>(LOGO_SELECTOR)?.alt ?? ''
  return blankToNull(alt.replace(LOGO_ALT_SUFFIX, ''))
}

function readSearchLabel(document: Document): string | null {
  for (const input of document.querySelectorAll('input[placeholder]')) {
    const placeholder = input.getAttribute('placeholder') ?? ''
    if (placeholder.startsWith(SEARCH_PREFIX)) {
      return blankToNull(placeholder.slice(SEARCH_PREFIX.length))
    }
  }
  return null
}

function blankToNull(value: string): string | null {
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

function slugFallback(url: URL): string {
  return slugSegmentToName(url.pathname.split('/').filter(Boolean)[1] ?? '')
}
