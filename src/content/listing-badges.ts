import type { PlatformAdapter, PlatformTheme, VendorCardTarget } from '@/platforms/types'
import { onDocumentMutation } from '@/shared/dom-mutations'
import { mountInlineRoot } from './ui/shadow-root'

const BLOCKED_FILTER = 'grayscale(1) opacity(0.5)'

interface FilteredElement {
  readonly element: HTMLElement
  readonly previousFilter: string
}

interface Mount {
  readonly card: Element
  readonly host: HTMLElement
  readonly filtered: readonly FilteredElement[]
}

export class ListingBadges {
  private readonly stopWatchingMutations: () => void
  private scheduledFrame = 0
  private blockedIds: ReadonlySet<string> = new Set()
  private mounts: Mount[] = []

  constructor(
    private readonly adapter: PlatformAdapter,
    private readonly theme: PlatformTheme,
  ) {
    this.stopWatchingMutations = onDocumentMutation(this.schedule)
  }

  setBlockedIds(ids: ReadonlySet<string>): void {
    this.blockedIds = ids
    this.reconcile()
  }

  dispose(): void {
    this.stopWatchingMutations()
    if (this.scheduledFrame) cancelAnimationFrame(this.scheduledFrame)
    for (const mount of this.mounts) this.unmount(mount)
    this.mounts = []
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

    const blockedCards = (this.adapter.findVendorCards?.(document) ?? []).filter((card) =>
      this.blockedIds.has(card.vendorId),
    )

    this.mounts = this.mounts.filter((mount) => {
      const stillBlocked =
        mount.host.isConnected && blockedCards.some((card) => card.element === mount.card)
      if (stillBlocked) return true
      this.unmount(mount)
      return false
    })

    for (const card of blockedCards) {
      if (this.mounts.some((mount) => mount.card === card.element)) continue
      this.mounts.push(this.render(card, createBadge))
    }
  }

  private render(card: VendorCardTarget, createBadge: () => HTMLElement): Mount {
    return card.titleElement
      ? this.renderBesideTitle(card, card.titleElement, createBadge)
      : this.renderFallback(card, createBadge)
  }

  private renderBesideTitle(
    card: VendorCardTarget,
    titleElement: Element,
    createBadge: () => HTMLElement,
  ): Mount {
    const titleRow = titleElement.parentElement ?? titleElement
    const filtered = grayOutSiblingsAlongPath(titleRow, card.element)
    grayOut(titleElement, filtered)

    const inline = mountInlineRoot(
      { element: titleElement, placement: 'after' },
      this.theme.listingBadgeStyles ?? '',
    )
    inline.container.append(createBadge())

    return { card: card.element, host: inline.host, filtered }
  }

  private renderFallback(card: VendorCardTarget, createBadge: () => HTMLElement): Mount {
    const filtered: FilteredElement[] = []
    grayOut(card.element, filtered)

    const parent = card.element.parentElement
    if (parent instanceof HTMLElement && !parent.style.position) parent.style.position = 'relative'

    const inline = mountInlineRoot(
      { element: card.element, placement: 'after' },
      this.theme.listingBadgeStyles ?? '',
    )
    inline.host.style.cssText = 'position:absolute;inset:0;pointer-events:none'

    const badge = createBadge()
    badge.style.cssText = 'position:absolute;top:0.5rem;inset-inline-end:0.5rem'
    inline.container.append(badge)

    return { card: card.element, host: inline.host, filtered }
  }

  private unmount(mount: Mount): void {
    mount.host.remove()
    for (const { element, previousFilter } of mount.filtered) {
      element.style.filter = previousFilter
    }
  }
}

/** Applies the blocked look to one element, recording how to undo it later. */
function grayOut(element: Element, filtered: FilteredElement[]): void {
  if (!(element instanceof HTMLElement)) return
  const previousFilter = element.style.filter
  filtered.push({ element, previousFilter })
  element.style.filter = `${previousFilter} ${BLOCKED_FILTER}`.trim()
}

function grayOutSiblingsAlongPath(node: Element, root: Element): FilteredElement[] {
  const filtered: FilteredElement[] = []
  let current = node

  while (current !== root && current.parentElement) {
    for (const sibling of current.parentElement.children) {
      if (sibling !== current) grayOut(sibling, filtered)
    }
    current = current.parentElement
  }

  return filtered
}
