const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const usd0 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export const formatPrice = (n: number) => usd.format(n);
/** No cents: for big dashboard numbers. */
export const formatMoney0 = (n: number) => usd0.format(n);

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

/** Percentage off when `compareAtPrice` is genuinely higher than `price`, else 0. */
export const discountPct = (price: number, compareAt?: number | null) =>
  compareAt && compareAt > price ? Math.round((1 - price / compareAt) * 100) : 0;
