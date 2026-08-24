export function isExtensionAlive(): boolean {
  // The types claim this can't be undefined; production has shown otherwise.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const runtimeId: unknown = chrome.runtime?.id
  return typeof runtimeId === 'string'
}

export function isContextInvalidated(error: unknown): boolean {
  return error instanceof Error && error.message.includes('Extension context invalidated')
}
