import { onDocumentMutation } from './dom-mutations'

interface NavigationEvents extends EventTarget {
  addEventListener(type: 'navigatesuccess', listener: () => void): void
  removeEventListener(type: 'navigatesuccess', listener: () => void): void
}

export function onLocationChange(callback: (url: URL) => void): () => void {
  let lastHref = location.href

  const checkForChange = (): void => {
    if (location.href === lastHref) return
    lastHref = location.href
    callback(new URL(location.href))
  }

  const unsubscribers: (() => void)[] = [onDocumentMutation(checkForChange)]

  window.addEventListener('popstate', checkForChange)
  unsubscribers.push(() => {
    window.removeEventListener('popstate', checkForChange)
  })

  const navigation = (window as Window & { navigation?: NavigationEvents }).navigation
  if (navigation) {
    navigation.addEventListener('navigatesuccess', checkForChange)
    unsubscribers.push(() => {
      navigation.removeEventListener('navigatesuccess', checkForChange)
    })
  }

  return () => {
    for (const unsubscribe of unsubscribers) unsubscribe()
  }
}
