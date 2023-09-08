export function formatBigNumber(number: number): string {
  return new Intl.NumberFormat('fr-FR', { notation: 'compact', compactDisplay: 'short' }).format(number);
}
