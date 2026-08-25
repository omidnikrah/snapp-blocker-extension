import type { BlockedShop } from '@/domain/blocked-shop'
import { makeBlockedShopId } from '@/domain/blocked-shop'
import type { BlockedShopsRepository } from '@/domain/blocked-shops-repository'
import { resolvePlatform, resolveSite } from '@/platforms/registry'
import type { PlatformModule } from '@/platforms/types'
import { isContextInvalidated, isExtensionAlive } from '@/shared/extension-context'
import { navigateBack } from '@/shared/history'
import { onLocationChange } from '@/shared/spa-navigation'
import { ListingBadges } from './listing-badges'
import { TriggerPlacement } from './trigger-placement'
import { createBlockDialog } from './ui/block-dialog'
import { createBlockedOverlay } from './ui/blocked-overlay'
import { mountFloatingRoot, mountOverlayHost, unmountExtensionUi } from './ui/shadow-root'

interface Ui {
  readonly triggerLayer: HTMLDivElement
  readonly overlayHost: HTMLDivElement
}

export class ContentApp {
  private ui: Ui | null = null
  private trigger: TriggerPlacement | null = null
  private listingBadges: ListingBadges | null = null
  private subscriptions: (() => void)[] = []

  constructor(private readonly repository: BlockedShopsRepository) {}

  start(): void {
    this.evaluate()
    this.subscriptions = [onLocationChange(this.evaluate), this.repository.onChange(this.evaluate)]
    this.startListingBadges()
  }

  readonly stop = (): void => {
    this.disposeTrigger()
    this.listingBadges?.dispose()
    this.listingBadges = null
    for (const unsubscribe of this.subscriptions) unsubscribe()
    this.subscriptions = []
    unmountExtensionUi()
    this.ui = null
  }

  private startListingBadges(): void {
    const platform = resolveSite(new URL(location.href))
    if (!platform?.theme.createBlockedCardBadge) return

    const badges = new ListingBadges(platform.adapter, platform.theme)
    this.listingBadges = badges

    const sync = (shops: BlockedShop[]): void => {
      const ids = shops.filter((shop) => shop.platform === platform.id).map((shop) => shop.vendorId)
      badges.setBlockedIds(new Set(ids))
    }

    this.guard(this.repository.getAll().then(sync))
    this.subscriptions.push(this.repository.onChange(sync))
  }

  private readonly evaluate = (): void => {
    if (!isExtensionAlive()) {
      this.stop()
      return
    }
    this.guard(this.render(new URL(location.href)))
  }

  private async render(url: URL): Promise<void> {
    this.disposeTrigger()
    this.ui?.overlayHost.replaceChildren()

    const platform = resolvePlatform(url)
    const vendorId = platform?.adapter.extractVendorId(url) ?? null
    if (!platform || !vendorId) return

    const id = makeBlockedShopId(platform.id, vendorId)
    const blocked = await this.repository.get(id)
    const { triggerLayer, overlayHost } = this.ensureUi(platform)

    if (blocked) {
      overlayHost.replaceChildren(
        createBlockedOverlay({
          theme: platform.theme,
          shop: blocked,
          onBack: navigateBack,
          onUnblock: () => {
            this.guard(this.repository.remove(id))
          },
        }),
      )
      return
    }

    this.trigger = new TriggerPlacement(platform.adapter, platform.theme, triggerLayer, () => {
      overlayHost.replaceChildren(this.buildDialog(platform, url, id, vendorId, overlayHost))
    })
  }

  private buildDialog(
    platform: PlatformModule,
    url: URL,
    id: string,
    vendorId: string,
    host: HTMLElement,
  ): HTMLElement {
    const shopName = platform.adapter.extractShopName(document, url)

    return createBlockDialog({
      theme: platform.theme,
      shopName,
      onCancel: () => {
        host.replaceChildren()
      },
      onSubmit: (reason) => {
        this.guard(
          this.repository.save({
            id,
            platform: platform.id,
            vendorId,
            name: shopName,
            url: url.toString(),
            imageUrl: platform.adapter.extractShopImage?.(document) ?? null,
            reason,
            blockedAt: Date.now(),
          }),
        )
      },
    })
  }

  private ensureUi(platform: PlatformModule): Ui {
    if (!this.ui) {
      unmountExtensionUi()
      this.ui = {
        triggerLayer: mountFloatingRoot().triggerLayer,
        overlayHost: mountOverlayHost(platform.theme.styles),
      }
    }
    return this.ui
  }

  private guard(work: Promise<unknown>): void {
    work.catch((error: unknown) => {
      if (isContextInvalidated(error)) {
        this.stop()
        return
      }
      console.error('[SnappBlocker]', error)
    })
  }

  private disposeTrigger(): void {
    this.trigger?.dispose()
    this.trigger = null
  }
}
