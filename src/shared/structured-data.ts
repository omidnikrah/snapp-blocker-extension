interface StructuredDataNode {
  readonly '@type'?: unknown
  readonly '@graph'?: unknown
  readonly name?: unknown
  readonly logo?: unknown
  readonly image?: unknown
}

export function readStructuredData(
  document: Document,
  types: readonly string[],
  field: 'name' | 'logo' | 'image',
): string | null {
  for (const script of document.querySelectorAll('script[type="application/ld+json"]')) {
    for (const node of flatten(parse(script.textContent))) {
      if (!types.includes(String(node['@type']))) continue
      const value = node[field]
      if (typeof value === 'string' && value !== '') return value
    }
  }
  return null
}

function parse(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

function flatten(value: unknown): StructuredDataNode[] {
  if (Array.isArray(value)) return value.flatMap(flatten)
  if (typeof value !== 'object' || value === null) return []

  const node = value as StructuredDataNode
  return '@graph' in node ? flatten(node['@graph']) : [node]
}
