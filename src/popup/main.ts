import type { BlockedShop, Platform } from '@/domain/blocked-shop'
import type { BlockedShopsRepository } from '@/domain/blocked-shops-repository'
import { ChromeBlockedShopsRepository } from '@/domain/blocked-shops-repository'
import storefrontMarkup from '@/icons/storefront.svg?raw'
import { PLATFORMS, platformLabel } from '@/platforms'
import { el } from '@/shared/dom'
import { formatDate } from '@/shared/format-date'
import { formatNumber } from '@/shared/format-number'
import './style.css'

const DEFAULT_PLATFORM = PLATFORMS[0].id

class Popup {
  private readonly tabs = new Map<Platform, HTMLButtonElement>()
  private readonly dom = {
    tabList: getRequiredElement('#tab-list'),
    indicator: getRequiredElement('#tab-indicator'),
    search: getRequiredElement('#search-input') as HTMLInputElement,
    empty: getRequiredElement('#empty-state'),
    emptyText: getRequiredElement('#empty-state-text'),
    list: getRequiredElement('#shop-list') as HTMLUListElement,
  }

  private shops: BlockedShop[] = []
  private active: Platform = DEFAULT_PLATFORM

  constructor(private readonly repository: BlockedShopsRepository) {}

  async start(): Promise<void> {
    this.buildTabs()
    this.dom.empty.prepend(createStorefrontIcon('popup__empty-icon'))
    this.dom.search.addEventListener('input', this.render)
    window.addEventListener('resize', this.positionIndicator)
    this.repository.onChange((shops) => {
      this.shops = shops
      this.render()
    })

    this.shops = await this.repository.getAll()
    // Open on whichever platform has something to show.
    this.active =
      PLATFORMS.map((platform) => platform.id).find((id) => this.on(id).length > 0) ?? this.active
    this.render()
  }

  private on(platform: Platform): BlockedShop[] {
    return this.shops.filter((shop) => shop.platform === platform)
  }

  private buildTabs(): void {
    for (const { id, label } of PLATFORMS) {
      const tab = el('button', { type: 'button', class: 'tab', role: 'tab' }, [
        el('span', { text: label }),
        el('span', { class: 'tab__count' }),
      ])

      tab.addEventListener('click', () => {
        this.active = id
        this.render()
      })

      this.tabs.set(id, tab)
      this.dom.tabList.append(tab)
    }
  }

  private readonly render = (): void => {
    const query = this.dom.search.value.trim().toLowerCase()

    for (const [platform, tab] of this.tabs) {
      const selected = platform === this.active
      tab.setAttribute('aria-selected', String(selected))
      tab.tabIndex = selected ? 0 : -1

      const count = tab.querySelector('.tab__count')
      if (count) count.textContent = formatNumber(this.on(platform).length)
    }

    const shops = this.on(this.active)
    const visible = query ? shops.filter((shop) => shop.name.toLowerCase().includes(query)) : shops

    this.dom.emptyText.textContent = query
      ? 'فروشگاهی به این اسم بلاک نکردی!'
      : `به نظر هنوز تو ${platformLabel(this.active)} دستت رو آلوده نکردی!`
    this.dom.empty.hidden = visible.length > 0
    this.dom.list.hidden = visible.length === 0
    this.dom.list.replaceChildren(...visible.map((shop) => this.createRow(shop)))

    this.positionIndicator()
  }

  private readonly positionIndicator = (): void => {
    const tab = this.tabs.get(this.active)
    if (!tab) return

    const strip = this.dom.tabList.getBoundingClientRect()
    const selected = tab.getBoundingClientRect()

    this.dom.indicator.style.width = `${String(selected.width)}px`
    this.dom.indicator.style.transform = `translateX(${String(selected.right - strip.right)}px)`
  }

  private createRow(shop: BlockedShop): HTMLLIElement {
    const unblock = el('button', {
      type: 'button',
      class: 'shop-row__unblock',
      text: 'رفع مسدودی',
    })
    unblock.addEventListener('click', () => {
      this.repository.remove(shop.id).catch((error: unknown) => {
        console.error('[SnappBlocker]', error)
      })
    })

    return el('li', { class: 'shop-row' }, [
      createAvatar(shop),
      el('div', { class: 'shop-row__info' }, [
        el('a', {
          class: 'shop-row__name',
          href: shop.url,
          target: '_blank',
          rel: 'noreferrer',
          title: shop.name,
          text: shop.name,
        }),
        el('div', { class: 'shop-row__date', text: formatDate(shop.blockedAt) }),
      ]),
      unblock,
    ])
  }
}

function createAvatar(shop: BlockedShop): HTMLElement {
  if (shop.imageUrl === null) return createInitialAvatar(shop.name)

  const image = el('img', {
    class: 'shop-row__image',
    src: shop.imageUrl,
    alt: '',
    loading: 'lazy',
  })
  image.addEventListener('error', () => {
    image.replaceWith(createInitialAvatar(shop.name))
  })
  return image
}

function createInitialAvatar(name: string): HTMLElement {
  const [first] = new Intl.Segmenter('fa').segment(name.trim())
  return el('div', {
    class: 'shop-row__image shop-row__initials',
    text: first?.segment ?? '—',
  })
}

function createStorefrontIcon(className: string): SVGElement {
  const svg = new DOMParser().parseFromString(storefrontMarkup, 'image/svg+xml').documentElement
  svg.setAttribute('class', className)
  return svg as unknown as SVGElement
}

function getRequiredElement(selector: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(selector)
  if (!element) throw new Error(`Popup markup is missing "${selector}"`)
  return element
}

new Popup(new ChromeBlockedShopsRepository()).start().catch((error: unknown) => {
  console.error('[SnappBlocker]', error)
})
