let observer: MutationObserver | null = null
const listeners = new Set<() => void>()

export function onDocumentMutation(listener: () => void): () => void {
  listeners.add(listener)

  observer ??= new MutationObserver(() => {
    for (const notify of listeners) notify()
  })
  observer.observe(document, { childList: true, subtree: true })

  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) {
      observer?.disconnect()
      observer = null
    }
  }
}
