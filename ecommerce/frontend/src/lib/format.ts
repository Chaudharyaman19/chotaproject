const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export const formatPrice = (n: number) => usd.format(n);

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
