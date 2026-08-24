export function navigateBack(): void {
  if (history.length > 1) {
    history.back()
    return
  }
  location.href = location.origin
}
