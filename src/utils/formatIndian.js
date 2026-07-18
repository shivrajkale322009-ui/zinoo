export const formatIndianCurrency = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return 'Price on request';
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(amount % 10000000 ? 1 : 0)} Crore`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(amount % 100000 ? 1 : 0)} Lakh`;
  return `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(amount)}`;
};

export const formatPlotArea = (value) => {
  const area = Number(value);
  if (!Number.isFinite(area) || area <= 0) return '';
  return `${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(area)} sq. ft.`;
};

export const formatRelativeDate = (value) => {
  const date = typeof value?.toDate === 'function' ? value.toDate() : new Date(value || 0);
  if (Number.isNaN(date.getTime())) return 'Recently updated';
  const days = Math.max(0, Math.floor((Date.now() - date.getTime()) / 86400000));
  if (days === 0) return 'Updated today';
  if (days === 1) return 'Updated yesterday';
  return `${days} days ago`;
};
