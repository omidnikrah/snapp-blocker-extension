const TITLE_DELIMITERS = [' | ', ' - ', '،']

export function readHeading(document: Document): string | null {
  const text = document.querySelector('h1')?.textContent.trim() ?? ''
  return text === '' ? null : text
}

export function readTitleSegment(document: Document): string | null {
  const title = document.title.trim()
  if (!title) return null

  for (const delimiter of TITLE_DELIMITERS) {
    const index = title.indexOf(delimiter)
    if (index > 0) return title.slice(0, index).trim()
  }

  return title
}

export function slugSegmentToName(segment: string): string {
  return safeDecode(segment).replace(/[_-]+/g, ' ').trim()
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}
