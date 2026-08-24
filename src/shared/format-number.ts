export function formatNumber(value: number): string {
  return new Intl.NumberFormat('fa-IR').format(value)
}
