export const FREE_SHIPPING = 999;
export const DELIVERY_FEE = 79;
export const RETURN_WINDOW_DAYS = 10;

export const inr = (n) => '₹' + Math.round(Number(n) || 0).toLocaleString('en-IN');

export const discountPct = (price, old) =>
  old > price ? Math.round((1 - price / old) * 100) : 0;

export const toDate = (v) => {
  if (!v) return null;
  if (typeof v.toDate === 'function') return v.toDate();
  const d = new Date(v);
  return isNaN(d) ? null : d;
};

export const fmtDate = (v, opts = { day: 'numeric', month: 'short', year: 'numeric' }) => {
  const d = toDate(v);
  return d ? d.toLocaleDateString('en-IN', opts) : '—';
};

export const isoDate = (v) => {
  const d = toDate(v);
  return d ? d.toISOString().slice(0, 10) : null;
};

export const addDays = (n) => new Date(Date.now() + n * 864e5);
