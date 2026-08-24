import type { PlatformModule } from '../types'
import { snappfoodAdapter } from './adapter'
import { snappfoodMeta } from './meta'
import { snappfoodTheme } from './theme'

export const snappfood: PlatformModule = {
  ...snappfoodMeta,
  adapter: snappfoodAdapter,
  theme: snappfoodTheme,
}
