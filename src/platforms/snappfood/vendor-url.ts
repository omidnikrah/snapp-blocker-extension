import { slugSegmentToName } from '@/shared/shop-name'

const VENDOR_CODE_PATTERN = /-r-([a-zA-Z0-9]+)\/?$/

export function readVendorCode(url: URL): string | null {
  return VENDOR_CODE_PATTERN.exec(url.pathname)?.[1] ?? null
}

export function readVendorCodeFromHref(href: string | null): string | null {
  if (!href) return null

  try {
    return readVendorCode(new URL(href, location.href))
  } catch {
    return null
  }
}

export function readShopNameFromSlug(url: URL): string {
  const slug = url.pathname.split('/').filter(Boolean).at(-1) ?? ''
  return slugSegmentToName(slug.replace(VENDOR_CODE_PATTERN, ''))
}
