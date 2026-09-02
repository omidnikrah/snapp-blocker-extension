import type { PlatformAdapter, PlatformTheme, VendorCardTarget } from '@/platforms/types'
import { onDocumentMutation } from '@/shared/dom-mutations'
import {
  INJECTED_ATTRIBUTE,
  isOverlayShowing,
  mountInlineRoot,
  mountListingStyles,
} from './ui/shadow-root'

const BLOCKED_CLASS = 'snapp-blocker-blocked'
const RELATIVE_CLASS = 'snapp-blocker-relative'
const BADGE_HOST_STYLE = 'position:absolute;top:0.5rem;inset-inline-end:0.5rem;pointer-events:none'

const LISTING_STYLES = `
.${BLOCKED_CLASS} > *:not([${INJECTED_ATTRIBUTE}]) {
  filter: grayscale(1) opacity(0.5) !important;
}

.${RELATIVE_CLASS} {
  position: relative !important;
}
`

export interface BlockedVendors {
  readonly codes: ReadonlySet<string>
  readonly ids: ReadonlySet<string>
}

interface Mount {
  readonly card: Element
  readonly host: HTMLElement
  readonly needsRelativeStyle: boolean
}

export class ListingBadges {
  private readonly stopWatchingMutations: () => void
  private scheduledFrame = 0
  private blocked: BlockedVendors = { codes: new Set(), ids: new Set() }
  private mounts: Mount[] = []

  constructor(
    private readonly adapter: PlatformAdapter,
    private readonly theme: PlatformTheme,
  ) {
    this.stopWatchingMutations = onDocumentMutation(this.schedule)
  }

  setBlocked(blocked: BlockedVendors): void {
    this.blocked = blocked
    this.reconcile()
  }

  dispose(): void {
    this.stopWatchingMutations()
    if (this.scheduledFrame) cancelAnimationFrame(this.scheduledFrame)
    this.unmountAll()
  }

  private readonly schedule = (): void => {
    this.scheduledFrame ||= requestAnimationFrame(() => {
      this.scheduledFrame = 0
      this.reconcile()
    })
  }

  private readonly reconcile = (): void => {
    const createBadge = this.theme.createBlockedCardBadge
    if (!createBadge) return

    if (isOverlayShowing()) {
      this.unmountAll()
      return
    }

    const blockedCards = (this.adapter.findVendorCards?.(document) ?? []).filter(this.isBlocked)

    this.mounts = this.mounts.filter((mount) => {
      const stillBlocked =
        mount.host.isConnected && blockedCards.some((card) => card.element === mount.card)
      if (!stillBlocked) {
        this.unmount(mount)
        return false
      }

      markCard(mount)
      return true
    })

    for (const card of blockedCards) {
      if (this.mounts.some((mount) => mount.card === card.element)) continue
      this.mounts.push(this.render(card, createBadge))
    }
  }

  private readonly isBlocked = (card: VendorCardTarget): boolean => {
    const { codes, ids } = this.blocked
    return (
      (card.vendorCode !== null && codes.has(card.vendorCode)) ||
      (card.vendorId !== null && ids.has(card.vendorId))
    )
  }

  private render(card: VendorCardTarget, createBadge: () => HTMLElement): Mount {
    mountListingStyles(LISTING_STYLES)

    const inline = mountInlineRoot(
      { element: card.element, placement: 'append' },
      this.theme.listingBadgeStyles ?? '',
    )

    inline.host.style.cssText = BADGE_HOST_STYLE
    inline.container.append(createBadge())

    const mount: Mount = {
      card: card.element,
      host: inline.host,
      needsRelativeStyle: getComputedStyle(card.element).position === 'static',
    }
    markCard(mount)

    return mount
  }

  private unmountAll(): void {
    for (const mount of this.mounts) this.unmount(mount)
    this.mounts = []
  }

  private unmount(mount: Mount): void {
    mount.host.remove()
    mount.card.classList.remove(BLOCKED_CLASS, RELATIVE_CLASS)
  }
}

function markCard(mount: Mount): void {
  mount.card.classList.add(BLOCKED_CLASS)
  if (mount.needsRelativeStyle) mount.card.classList.add(RELATIVE_CLASS)
}
