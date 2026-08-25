import type { Platform } from '@/domain/blocked-shop'

export type AnchorPlacement = 'prepend' | 'append' | 'after'

export interface AnchorTarget {
  readonly element: Element
  readonly placement: AnchorPlacement
}

export interface VendorCardTarget {
  readonly element: Element
  readonly vendorId: string
  readonly titleElement: Element | null
}

export interface PlatformAdapter {
  matchesHost(url: URL): boolean
  matchesUrl(url: URL): boolean
  extractVendorId(url: URL): string | null
  extractShopName(document: Document, url: URL): string
  extractShopImage?(document: Document): string | null
  findAnchors?(document: Document): AnchorTarget[]
  findVendorCards?(document: Document): VendorCardTarget[]
}

export type ButtonRole = 'confirm' | 'dismiss' | 'neutral' | 'quiet'

export interface ReasonField {
  readonly wrapper: HTMLElement
  readonly textarea: HTMLTextAreaElement
}

export interface PlatformTheme {
  readonly dialogClass: string | null
  readonly styles: string
  readonly triggerStyles: string
  readonly listingBadgeStyles?: string
  createButton(label: string, role: ButtonRole, onClick?: () => void): HTMLButtonElement
  createReasonField(placeholder: string): ReasonField
  createTriggerButton(anchor: AnchorTarget, label: string, onClick: () => void): HTMLElement
  createBlockedCardBadge?(): HTMLElement
}

export interface PlatformMeta {
  readonly id: Platform
  readonly label: string
}

export interface PlatformModule extends PlatformMeta {
  readonly adapter: PlatformAdapter
  readonly theme: PlatformTheme
}
