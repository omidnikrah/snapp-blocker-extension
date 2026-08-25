export type Attributes = Record<string, string | number | null | undefined>

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attributes: Attributes = {},
  children: readonly (Node | string)[] = [],
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag)

  for (const [name, value] of Object.entries(attributes)) {
    if (value === null || value === undefined) continue
    if (name === 'class') element.className = String(value)
    else if (name === 'text') element.textContent = String(value)
    else element.setAttribute(name, String(value))
  }

  element.append(...children)
  return element
}

export function createSvgIcon(markup: string, className: string): SVGElement {
  const svg = new DOMParser().parseFromString(markup, 'image/svg+xml').documentElement
  svg.setAttribute('class', className)
  return svg as unknown as SVGElement
}
