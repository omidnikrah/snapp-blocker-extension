import type { AnchorTarget, PlatformAdapter, PlatformTheme } from '@/platforms/types'
import { onDocumentMutation } from '@/shared/dom-mutations'
import { BLOCK_BUTTON_LABEL, createFloatingButton } from './ui/block-button'
import { mountInlineRoot } from './ui/shadow-root'

const FLOATING_FALLBACK_DELAY_MS = 20_000

interface Mount {
  readonly anchor: Element
  readonly node: Element
}

export class TriggerPlacement {
  private readonly deadline = Date.now() + FLOATING_FALLBACK_DELAY_MS
  private readonly stopWatchingMutations: () => void
  private readonly graceTimer: ReturnType<typeof setTimeout>

  private mounts: Mount[] = []
  private hasFloatingButton = false
  private scheduledFrame = 0
  private pageLoaded = document.readyState === 'complete'

  constructor(
    private readonly adapter: PlatformAdapter,
    private readonly theme: PlatformTheme,
    private readonly floatingContainer: HTMLElement,
    private readonly onActivate: () => void,
  ) {
    this.reconcile()

    if (!this.pageLoaded) window.addEventListener('load', this.onPageLoad, { once: true })
    this.stopWatchingMutations = onDocumentMutation(this.schedule)
    this.graceTimer = setTimeout(this.reconcile, FLOATING_FALLBACK_DELAY_MS)
  }

  dispose(): void {
    window.removeEventListener('load', this.onPageLoad)
    this.stopWatchingMutations()
    clearTimeout(this.graceTimer)
    if (this.scheduledFrame) cancelAnimationFrame(this.scheduledFrame)
    this.removeMounted()
    this.floatingContainer.replaceChildren()
  }

  private readonly onPageLoad = (): void => {
    this.pageLoaded = true
    this.reconcile()
  }

  private readonly schedule = (): void => {
    this.scheduledFrame ||= requestAnimationFrame(() => {
      this.scheduledFrame = 0
      this.reconcile()
    })
  }

  private readonly reconcile = (): void => {
    const anchors = this.adapter.findAnchors?.(document) ?? []

    if (anchors.length > 0) {
      if (this.matchesMounted(anchors)) return

      this.removeMounted()
      this.clearFloating()
      this.mounts = anchors.map((anchor) => ({
        anchor: anchor.element,
        node: this.render(anchor),
      }))
      return
    }

    this.removeMounted()

    if (!this.pageLoaded || Date.now() < this.deadline) {
      this.clearFloating()
      return
    }

    if (this.hasFloatingButton) return
    this.floatingContainer.replaceChildren(createFloatingButton(this.onActivate))
    this.hasFloatingButton = true
  }

  private matchesMounted(anchors: readonly AnchorTarget[]): boolean {
    return (
      anchors.length === this.mounts.length &&
      anchors.every((anchor, index) => {
        const mount = this.mounts[index]
        return mount?.anchor === anchor.element && mount.node.isConnected
      })
    )
  }

  private render(anchor: AnchorTarget): Element {
    const inline = mountInlineRoot(anchor, this.theme.triggerStyles)
    inline.container.append(
      this.theme.createTriggerButton(anchor, BLOCK_BUTTON_LABEL, this.onActivate),
    )
    return inline.host
  }

  private removeMounted(): void {
    for (const mount of this.mounts) mount.node.remove()
    this.mounts = []
  }

  private clearFloating(): void {
    this.floatingContainer.replaceChildren()
    this.hasFloatingButton = false
  }
}
