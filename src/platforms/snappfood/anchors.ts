export const APP_BAR_SELECTOR = '.top-app-bar'
export const FLOATING_BAR_MODIFIER = 'top-app-bar--floating'

export function isInAppBar(element: Element): boolean {
  return element.closest(APP_BAR_SELECTOR) !== null
}
