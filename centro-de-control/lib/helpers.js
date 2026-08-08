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

// The program's fixed schedule: every Sunday for 6 months starting July 5, 2026.
export const SESSION_START = '2026-07-05';

export function classSessions() {
  const start = new Date(`${SESSION_START}T00:00:00`);
  const end = new Date(start);
  end.setMonth(end.getMonth() + 6);
  const sessions = [];
  let d = new Date(start);
  while (d <= end) {
    sessions.push(d.toISOString().slice(0, 10));
    d.setDate(d.getDate() + 7);
  }
  return sessions;
}

export function shortDate(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`);
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`;
}

// Most recent session on or before today; falls back to the first session if the program hasn't started.
export function currentSession() {
  const sessions = classSessions();
  const today = new Date().toISOString().slice(0, 10);
  const past = sessions.filter((s) => s <= today);
  return past.length ? past[past.length - 1] : sessions[0];
}

export const ROLE_LABEL = {
  provincia_manager: 'Responsable Bloque',
  senior_management: 'Gerencia General',
};

// Deterministic, muted color per provincia id — same id always gets the same
// color, spread across hues but kept low-saturation so it stays elegant
// even with 20+ provincias on screen at once.
export function provinciaColor(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return {
    text: `hsl(${hue}, 42%, 36%)`,
    bg: `hsl(${hue}, 55%, 95%)`,
    dot: `hsl(${hue}, 48%, 46%)`,
  };
}
