import { snappMarket } from './snapp-market'
import { snappfood } from './snappfood'
import type { PlatformModule } from './types'

const MODULES: readonly PlatformModule[] = [snappfood, snappMarket]

export function resolvePlatform(url: URL): PlatformModule | null {
  return MODULES.find((platform) => platform.adapter.matchesUrl(url)) ?? null
}

export function resolveSite(url: URL): PlatformModule | null {
  return MODULES.find((platform) => platform.adapter.matchesHost(url)) ?? null
}
