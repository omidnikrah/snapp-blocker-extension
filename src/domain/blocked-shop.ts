export type Platform = 'snappfood' | 'snapp-market'

export interface BlockedShop {
  readonly id: string
  readonly platform: Platform
  readonly vendorCode: string
  readonly vendorId: string | null
  readonly name: string
  readonly url: string
  readonly imageUrl: string | null
  readonly reason: string
  readonly blockedAt: number
}

export function makeBlockedShopId(platform: Platform, vendorCode: string): string {
  return `${platform}:${vendorCode}`
}
