import { readHeading, readTitleSegment } from '@/shared/shop-name'
import { readStructuredData } from '@/shared/structured-data'
import type { AnchorPlacement, PlatformAdapter } from '../types'
import { findVendorCards } from './vendor-cards'
import { readShopNameFromSlug, readVendorCode } from './vendor-url'

const HOSTNAME = 'snappfood.ir'
const VENDOR_PATH_PATTERN = /^\/[^/]+\/menu\//

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

const VENDOR_ID_SELECTORS: readonly string[] = [
  // "vednor" is their own typo, not ours.
  '#vednor_menu_page[data-vendor-id]',
  '[data-vendor-id][data-vendor-city]',
]

const ANCHOR_CANDIDATES: readonly { selector: string; placement: AnchorPlacement }[] = [
  { selector: '.top-app-bar__left-action', placement: 'prepend' },
  { selector: '[data-testid="VendorShowingReview"]', placement: 'after' },
  { selector: '#vendor-header-information-link', placement: 'append' },
  { selector: '[data-sentry-component="VendorInfo"]', placement: 'append' },
  { selector: '[data-sentry-component="VendorHeader"]', placement: 'append' },
]

export const snappfoodAdapter: PlatformAdapter = {
  matchesHost(url) {
    return url.hostname === HOSTNAME
  },

  matchesUrl(url) {
    return url.hostname === HOSTNAME && VENDOR_PATH_PATTERN.test(url.pathname)
  },

  extractVendorCode(url) {
    return readVendorCode(url)
  },

  extractShopName(document, url) {
    return (
      readStructuredData(document, VENDOR_TYPES, 'name') ??
      readHeading(document) ??
      readTitleSegment(document) ??
      readShopNameFromSlug(url)
    )
  },

  extractShopImage(document) {
    return readStructuredData(document, VENDOR_TYPES, 'logo')
  },

  extractVendorId(document) {
    for (const selector of VENDOR_ID_SELECTORS) {
      const vendorId = document.querySelector(selector)?.getAttribute('data-vendor-id')
      if (vendorId) return vendorId
    }
    return null
  },

  findAnchors(document) {
    for (const candidate of ANCHOR_CANDIDATES) {
      const elements = [...document.querySelectorAll(candidate.selector)]
      if (elements.length === 0) continue

      return elements.map((element) => ({ element, placement: candidate.placement }))
    }
    return []
  },

  findVendorCards,
}
