import type { PlatformModule } from '../types'
import { snappMarketAdapter } from './adapter'
import { snappMarketMeta } from './meta'
import { snappMarketTheme } from './theme'

export const snappMarket: PlatformModule = {
  ...snappMarketMeta,
  adapter: snappMarketAdapter,
  theme: snappMarketTheme,
}
