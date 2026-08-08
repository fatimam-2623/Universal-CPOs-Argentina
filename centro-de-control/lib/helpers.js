export const MONTH_NAMES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

export function monthLabel(m) {
  if (!m) return '—';
  const [y, mo] = m.split('-');
  return `${MONTH_NAMES[parseInt(mo, 10) - 1]} ${y}`;
}

// Returns the last 6 months (including the current one) as 'YYYY-MM' strings, oldest first.
export function last6Months() {
  const out = [];
  const d = new Date();
  d.setDate(1);
  for (let i = 0; i < 6; i++) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    out.unshift(`${y}-${m}`);
    d.setMonth(d.getMonth() - 1);
  }
  return out;
}

export const ROLE_LABEL = {
  provincia_manager: 'Responsable Bloque',
  senior_management: 'Gerencia General',
};
