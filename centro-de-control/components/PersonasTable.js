'use client';

import { useState } from 'react';
import { AlertCircle, Check } from 'lucide-react';
import { updateProfile } from '@/app/personas/actions';
import { Field, inputCls } from './ui';
import { ROLE_LABEL } from '@/lib/helpers';

function PersonaRow({ persona, provincias, isSelf }) {
  const [role, setRole] = useState(persona.role || '');
  const [provinciaId, setProvinciaId] = useState(persona.provincia_id || '');
  const [fullName, setFullName] = useState(persona.full_name || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  const dirty =
    role !== (persona.role || '') || provinciaId !== (persona.provincia_id || '') || fullName !== (persona.full_name || '');

  async function handleSave() {
    setSaving(true);
    setError(null);
    const result = await updateProfile(persona.id, { role, provinciaId, fullName });
    setSaving(false);
    if (result?.error) {
      setError(result.error);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    }
  }

  return (
    <tr className="border-b border-line last:border-0">
      <td className="px-4 py-3">
        <div className="text-sm" style={{ color: 'var(--ink)' }}>
          {persona.email}
        </div>
        {isSelf && (
          <div className="text-xs mt-0.5" style={{ color: 'var(--gray)' }}>
            Vos
          </div>
        )}
      </td>
      <td className="px-4 py-3">
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Nombre"
          className={`${inputCls} text-xs py-1.5`}
        />
      </td>
      <td className="px-4 py-3">
        <select value={role} onChange={(e) => setRole(e.target.value)} className={`${inputCls} text-xs py-1.5`}>
          <option value="">Sin rol</option>
          <option value="provincia_manager">Responsable Bloque</option>
          <option value="senior_management">Gerencia General</option>
        </select>
      </td>
      <td className="px-4 py-3">
        {role === 'provincia_manager' ? (
          <select value={provinciaId} onChange={(e) => setProvinciaId(e.target.value)} className={`${inputCls} text-xs py-1.5`}>
            <option value="">Seleccionar…</option>
            {provincias.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        ) : (
          <span className="text-xs" style={{ color: 'var(--gray)' }}>
            —
          </span>
        )}
      </td>
      <td className="px-4 py-3">
        <button
          onClick={handleSave}
          disabled={!dirty || saving || (role === 'provincia_manager' && !provinciaId)}
          className="text-xs font-medium px-3 py-1.5 rounded-lg text-white disabled:opacity-40 inline-flex items-center gap-1"
          style={{ backgroundColor: saved ? 'var(--gray)' : 'var(--blue)' }}
        >
          {saved ? (
            <>
              <Check size={12} /> Guardado
            </>
          ) : saving ? (
            'Guardando…'
          ) : (
            'Guardar'
          )}
        </button>
        {error && (
          <div className="text-xs mt-1" style={{ color: 'var(--red)' }}>
            {error}
          </div>
        )}
      </td>
    </tr>
  );
}

export default function PersonasTable({ profiles, provincias, currentUserId }) {
  const sinRol = profiles.filter((p) => !p.role);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-semibold" style={{ color: 'var(--ink)' }}>
          Personas
        </h1>
        <p className="text-sm mt-0.5" style={{ color: '#5B6472' }}>
          Para dar acceso a alguien nuevo: primero creá su login en Supabase (Authentication → Users → Add user), después
          asignale acá su rol.
        </p>
      </div>

      {sinRol.length > 0 && (
        <div className="rounded-xl border p-3 flex items-center gap-2 text-sm" style={{ borderColor: 'var(--red)', color: 'var(--red)' }}>
          <AlertCircle size={15} className="shrink-0" />
          {sinRol.length === 1
            ? 'Hay 1 persona sin rol asignado todavía — no puede usar la herramienta hasta que le asignes uno.'
            : `Hay ${sinRol.length} personas sin rol asignado todavía — no pueden usar la herramienta hasta que les asignes uno.`}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-line bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-line" style={{ backgroundColor: 'var(--paper)' }}>
              <th className="px-4 py-2.5 font-medium text-xs uppercase tracking-wide" style={{ color: '#5B6472' }}>
                Email
              </th>
              <th className="px-4 py-2.5 font-medium text-xs uppercase tracking-wide" style={{ color: '#5B6472' }}>
                Nombre
              </th>
              <th className="px-4 py-2.5 font-medium text-xs uppercase tracking-wide" style={{ color: '#5B6472' }}>
                Rol
              </th>
              <th className="px-4 py-2.5 font-medium text-xs uppercase tracking-wide" style={{ color: '#5B6472' }}>
                Partido/Provincia
              </th>
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((p) => (
              <PersonaRow key={p.id} persona={p} provincias={provincias} isSelf={p.id === currentUserId} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
