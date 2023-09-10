export function formatBigNumber(number: number): string {
  return new Intl.NumberFormat('fr-FR', { notation: 'compact', compactDisplay: 'short' }).format(number);
}

export function formatDollarAmount(amount: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'USD' }).format(amount);
}