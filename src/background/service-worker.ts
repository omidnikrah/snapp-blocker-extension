import type { BlockedShop } from '@/domain/blocked-shop'
import { ChromeBlockedShopsRepository } from '@/domain/blocked-shops-repository'
import { formatNumber } from '@/shared/format-number'

const BADGE_COLOR = '#ff4242'

const repository = new ChromeBlockedShopsRepository()

function updateBadge(shops: BlockedShop[]): void {
  chrome.action
    .setBadgeText({ text: shops.length > 0 ? formatNumber(shops.length) : '' })
    .catch((error: unknown) => {
      console.error('[SnappBlocker]', error)
    })
}

async function init(): Promise<void> {
  await chrome.action.setBadgeBackgroundColor({ color: BADGE_COLOR })
  updateBadge(await repository.getAll())
}

function start(): void {
  init().catch((error: unknown) => {
    console.error('[SnappBlocker]', error)
  })
}

chrome.runtime.onInstalled.addListener(start)
chrome.runtime.onStartup.addListener(start)
repository.onChange(updateBadge)
