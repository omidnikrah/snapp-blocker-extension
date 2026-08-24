import type { Platform } from '@/domain/blocked-shop'
import { snappMarketMeta } from './snapp-market/meta'
import { snappfoodMeta } from './snappfood/meta'
import type { PlatformMeta } from './types'

type NonEmptyArray<T> = readonly [T, ...T[]]

export const PLATFORMS: NonEmptyArray<PlatformMeta> = [snappfoodMeta, snappMarketMeta]

export function platformLabel(id: Platform): string {
  return PLATFORMS.find((platform) => platform.id === id)?.label ?? id
}
