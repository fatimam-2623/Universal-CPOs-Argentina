'use client';

import { X } from 'lucide-react';
import { provinciaColor } from '@/lib/helpers';

export const inputCls =
  'w-full text-sm px-3 py-2 rounded-lg border border-line bg-white focus:outline-none focus:border-[var(--blue)]';

export function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium mb-1" style={{ color: '#5B6472' }}>
        {label}
      </span>
      {children}
    </label>
  );
}

export function IconButton({ onClick, title, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="w-7 h-7 inline-flex items-center justify-center rounded-md hover:bg-black/5 transition-colors"
      style={{ color: 'var(--blue)' }}
    >
      {children}
    </button>
  );
}

export function ModalShell({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(28,30,34,0.5)' }}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-line shrink-0">
          <h3 className="font-display font-semibold text-base" style={{ color: 'var(--ink)' }}>
            {title}
          </h3>
          <button onClick={onClose} className="w-7 h-7 inline-flex items-center justify-center rounded-md hover:bg-black/5">
            <X size={16} />
          </button>
        </div>
        <div className="p-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

export function ProvinciaBadge({ id, name }) {
  const c = id ? provinciaColor(id) : null;
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full"
      style={c ? { backgroundColor: c.bg, color: c.text } : { backgroundColor: 'var(--blue-soft)', color: 'var(--blue)' }}
    >
      {c && <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.dot }} />}
      {name}
    </span>
  );
}

export function EvalBadge({ value }) {
  if (value == null)
    return (
      <span className="text-sm" style={{ color: 'var(--gray)' }}>
        —
      </span>
    );
  const isLow = value <= 4;
  return (
    <span className="font-mono text-sm font-medium" style={{ color: isLow ? 'var(--red)' : 'var(--ink)' }}>
      {value}
      <span style={{ color: 'var(--gray)' }}>/10</span>
    </span>
  );
}

export function FaultBadge({ value }) {
  if (value == null)
    return (
      <span className="text-sm" style={{ color: 'var(--gray)' }}>
        —
      </span>
    );
  const isHigh = value >= 4;
  return (
    <span className="font-mono text-sm font-medium" style={{ color: isHigh ? 'var(--red)' : 'var(--ink)' }}>
      {value}
    </span>
  );
}
