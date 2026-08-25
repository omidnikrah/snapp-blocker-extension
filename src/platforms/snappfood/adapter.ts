import { readHeading, readTitleSegment, slugSegmentToName } from '@/shared/shop-name'
import { readStructuredData } from '@/shared/structured-data'
import type { AnchorPlacement, PlatformAdapter, VendorCardTarget } from '../types'

const HOSTNAME = 'snappfood.ir'
const VENDOR_PATH_PATTERN = /^\/[^/]+\/menu\//
const VENDOR_ID_PATTERN = /-r-([a-zA-Z0-9]+)\/?$/
const VENDOR_TITLE_SELECTOR = '#vendor-title'

const VENDOR_TYPES = [
  'Restaurant',
  'FoodEstablishment',
  'Store',
  'LocalBusiness',
  'CafeOrCoffeeShop',
  'Bakery',
  'IceCream',
  'Florist',
  'Pharmacy',
  'PetStore',
]

const ANCHOR_CANDIDATES: readonly { selector: string; placement: AnchorPlacement }[] = [
  { selector: '.top-app-bar__left-action', placement: 'prepend' },
  { selector: '[data-testid="VendorShowingReview"]', placement: 'after' },
  { selector: '#vendor-header-information-link', placement: 'append' },
  { selector: '[data-sentry-component="VendorInfo"]', placement: 'append' },
  { selector: '[data-sentry-component="VendorHeader"]', placement: 'append' },
]

const VENDOR_CARD_CANDIDATES: readonly {
  selector: string
  vendorId: (element: Element) => string | null
}[] = [
  {
    selector: 'a[data-sentry-source-file="VendorCard.tsx"][data-vendor-code]',
    vendorId: (element) => element.getAttribute('data-vendor-code'),
  },
  {
    selector: 'a[id="vendorCard"][data-vendor-code]',
    vendorId: (element) => element.getAttribute('data-vendor-code'),
  },
  {
    selector: 'a[href*="-r-"]',
    vendorId: vendorIdFromHref,
  },
]

export const snappfoodAdapter: PlatformAdapter = {
  matchesHost(url) {
    return url.hostname === HOSTNAME
  },

  matchesUrl(url) {
    return url.hostname === HOSTNAME && VENDOR_PATH_PATTERN.test(url.pathname)
  },

  extractVendorId(url) {
    return VENDOR_ID_PATTERN.exec(url.pathname)?.[1] ?? null
  },

  extractShopName(document, url) {
    return (
      readStructuredData(document, VENDOR_TYPES, 'name') ??
      readHeading(document) ??
      readTitleSegment(document) ??
      slugFallback(url)
    )
  },

  extractShopImage(document) {
    return readStructuredData(document, VENDOR_TYPES, 'logo')
  },

  findAnchors(document) {
    for (const candidate of ANCHOR_CANDIDATES) {
      const elements = [...document.querySelectorAll(candidate.selector)]
      if (elements.length === 0) continue

      return elements.map((element) => ({ element, placement: candidate.placement }))
    }
    return []
  },

  findVendorCards(document) {
    for (const candidate of VENDOR_CARD_CANDIDATES) {
      const cards: VendorCardTarget[] = []
      for (const element of document.querySelectorAll(candidate.selector)) {
        const vendorId = candidate.vendorId(element)
        if (vendorId) {
          cards.push({
            element,
            vendorId,
            titleElement: element.querySelector(VENDOR_TITLE_SELECTOR),
          })
        }
      }
      if (cards.length > 0) return cards
    }
    return []
  },
}

function slugFallback(url: URL): string {
  const slug = url.pathname.split('/').filter(Boolean).at(-1) ?? ''
  return slugSegmentToName(slug.replace(VENDOR_ID_PATTERN, ''))
}

function vendorIdFromHref(element: Element): string | null {
  const href = element.getAttribute('href')
  if (!href) return null

  try {
    return snappfoodAdapter.extractVendorId(new URL(href, location.href))
  } catch {
    return null
  }
}
