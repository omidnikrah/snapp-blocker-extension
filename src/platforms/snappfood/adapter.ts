import { readHeading, readTitleSegment, slugSegmentToName } from '@/shared/shop-name'
import { readStructuredData } from '@/shared/structured-data'
import type { AnchorPlacement, PlatformAdapter } from '../types'

const VENDOR_PATH_PATTERN = /^\/[^/]+\/menu\//
const VENDOR_ID_PATTERN = /-r-([a-zA-Z0-9]+)\/?$/

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

export const snappfoodAdapter: PlatformAdapter = {
  matchesUrl(url) {
    return url.hostname === 'snappfood.ir' && VENDOR_PATH_PATTERN.test(url.pathname)
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
}

function slugFallback(url: URL): string {
  const slug = url.pathname.split('/').filter(Boolean).at(-1) ?? ''
  return slugSegmentToName(slug.replace(VENDOR_ID_PATTERN, ''))
}
