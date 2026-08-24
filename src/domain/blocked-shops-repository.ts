import type { BlockedShop } from './blocked-shop'

export interface BlockedShopsRepository {
  getAll(): Promise<BlockedShop[]>
  get(id: string): Promise<BlockedShop | null>
  save(shop: BlockedShop): Promise<void>
  remove(id: string): Promise<void>
  onChange(listener: (shops: BlockedShop[]) => void): () => void
}

const STORAGE_KEY = 'blockedShops'

type StoredShops = Record<string, BlockedShop>

export class ChromeBlockedShopsRepository implements BlockedShopsRepository {
  async getAll(): Promise<BlockedShop[]> {
    return byMostRecent(Object.values(await this.read()))
  }

  async get(id: string): Promise<BlockedShop | null> {
    return (await this.read())[id] ?? null
  }

  async save(shop: BlockedShop): Promise<void> {
    const shops = await this.read()
    shops[shop.id] = shop
    await this.write(shops)
  }

  async remove(id: string): Promise<void> {
    const shops = await this.read()
    Reflect.deleteProperty(shops, id)
    await this.write(shops)
  }

  onChange(listener: (shops: BlockedShop[]) => void): () => void {
    const handler = (
      changes: Record<string, chrome.storage.StorageChange>,
      area: chrome.storage.AreaName,
    ): void => {
      if (area !== 'local' || !(STORAGE_KEY in changes)) return
      const stored = (changes[STORAGE_KEY].newValue as StoredShops | undefined) ?? {}
      listener(byMostRecent(Object.values(stored)))
    }

    chrome.storage.onChanged.addListener(handler)
    return () => {
      try {
        chrome.storage.onChanged.removeListener(handler)
      } catch {
        // The extension was reloaded and took the listener with it.
      }
    }
  }

  private async read(): Promise<StoredShops> {
    const result = await chrome.storage.local.get(STORAGE_KEY)
    return (result[STORAGE_KEY] as StoredShops | undefined) ?? {}
  }

  private async write(shops: StoredShops): Promise<void> {
    await chrome.storage.local.set({ [STORAGE_KEY]: shops })
  }
}

function byMostRecent(shops: BlockedShop[]): BlockedShop[] {
  return [...shops].sort((a, b) => b.blockedAt - a.blockedAt)
}
