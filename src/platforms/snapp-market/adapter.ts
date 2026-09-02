import { slugSegmentToName } from '@/shared/shop-name'
import type { PlatformAdapter, VendorCardTarget } from '../types'

const VENDOR_CODE_PATTERN = /^[a-zA-Z0-9]+$/
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

  extractVendorCode(url) {
    const vendorCode = url.pathname.split('/').filter(Boolean)[2]
    return vendorCode !== undefined && VENDOR_CODE_PATTERN.test(vendorCode) ? vendorCode : null
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
        const vendorCode = vendorCodeFromHref(element)
        if (vendorCode) cards.push({ element, vendorCode, vendorId: null })
      }
      if (cards.length > 0) return cards
    }
    return []
  },
}

function vendorCodeFromHref(element: Element): string | null {
  const href = element.getAttribute('href')
  if (!href) return null

  try {
    return snappMarketAdapter.extractVendorCode(new URL(href, location.href))
  } catch {
    return null
  }
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
