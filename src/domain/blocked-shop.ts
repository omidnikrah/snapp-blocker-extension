export type Platform = 'snappfood' | 'snapp-market'

export interface BlockedShop {
  readonly id: string
  readonly platform: Platform
  readonly vendorId: string
  readonly name: string
  readonly url: string
  readonly imageUrl: string | null
  readonly reason: string
  readonly blockedAt: number
}

export function makeBlockedShopId(platform: Platform, vendorId: string): string {
  return `${platform}:${vendorId}`
}
