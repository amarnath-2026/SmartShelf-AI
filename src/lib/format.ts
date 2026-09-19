/**
 * Deterministic number & currency formatter to prevent SSR hydration mismatches
 * between server (Node.js) and client (Browser).
 */
export function formatNumber(val: number): string {
  if (val === undefined || val === null || isNaN(val)) return '0';
  return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function formatCurrency(val: number, symbol: string = '₹'): string {
  return `${symbol}${formatNumber(val)}`;
}
