'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2, ArrowRightLeft, Search } from 'lucide-react';
import { createWorker, updateWorker, deleteWorker, transferWorker } from '@/app/cpos/actions';
import { ModalShell, Field, inputCls, IconButton, EvalBadge, FaultBadge, ProvinciaBadge } from './ui';
import { monthLabel } from '@/lib/helpers';

export default function CpoTable({ profile, provincias, workers, records }) {
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [transferring, setTransferring] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const isSenior = profile.role === 'senior_management';

  const rows = useMemo(() => {
    return workers
      .filter((w) => w.name.toLowerCase().includes(search.toLowerCase()))
      .map((w) => {
        const wRecords = records.filter((r) => r.worker_id === w.id).sort((a, b) => b.month.localeCompare(a.month));
        const latest = wRecords[0] || null;
        const cumulative = wRecords.reduce((s, r) => s + r.faults, 0);
        const provincia = provincias.find((p) => p.id === w.provincia_id);
        return { worker: w, latest, cumulative, provincia };
      });
  }, [workers, records, provincias, search]);

  const provinciaName = profile.provincia_id ? provincias.find((p) => p.id === profile.provincia_id)?.name : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold" style={{ color: 'var(--ink)' }}>
            {isSenior ? 'Todos los CPOs' : `CPOs — ${provinciaName || 'tu partido/provincia'}`}
          </h1>
          <p className="text-sm mt-0.5" style={{ color: '#5B6472' }}>
            {rows.length} en total
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-1.5 text-sm font-medium px-3.5 py-2 rounded-lg text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: 'var(--blue)' }}
        >
          <Plus size={15} /> Nuevo CPO
        </button>
      </div>

      <div className="relative max-w-xs">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--gray)' }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar CPO…"
          className="w-full text-sm pl-9 pr-3 py-2 rounded-lg border border-line bg-white focus:outline-none"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-line bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-line" style={{ backgroundColor: 'var(--paper)' }}>
              <th className="px-4 py-2.5 font-medium text-xs uppercase tracking-wide" style={{ color: '#5B6472' }}>
                CPO
              </th>
              {isSenior && (
                <th className="px-4 py-2.5 font-medium text-xs uppercase tracking-wide" style={{ color: '#5B6472' }}>
                  Partido/Provincia
                </th>
              )}
              <th className="px-4 py-2.5 font-medium text-xs uppercase tracking-wide" style={{ color: '#5B6472' }}>
                Último mes
              </th>
              <th className="px-4 py-2.5 font-medium text-xs uppercase tracking-wide" style={{ color: '#5B6472' }}>
                Faltas (mes)
              </th>
              <th className="px-4 py-2.5 font-medium text-xs uppercase tracking-wide" style={{ color: '#5B6472' }}>
                Faltas acum.
              </th>
              <th className="px-4 py-2.5 font-medium text-xs uppercase tracking-wide" style={{ color: '#5B6472' }}>
                Evaluación
              </th>
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm" style={{ color: 'var(--gray)' }}>
                  Todavía no hay CPOs cargados.
                </td>
              </tr>
            )}
            {rows.map(({ worker, latest, cumulative, provincia }) => (
              <tr key={worker.id} className="border-b border-line last:border-0 hover:bg-black/[0.02]">
                <td className="px-4 py-2.5">
                  <Link href={`/cpos/${worker.id}`} className="font-medium hover:underline" style={{ color: 'var(--ink)' }}>
                    {worker.name}
                  </Link>
                  {worker.position && (
                    <div className="text-xs" style={{ color: 'var(--gray)' }}>
                      {worker.position}
                    </div>
                  )}
                </td>
                {isSenior && (
                  <td className="px-4 py-2.5">
                    <ProvinciaBadge name={provincia?.name || '—'} />
                  </td>
                )}
                <td className="px-4 py-2.5 font-mono text-xs" style={{ color: '#5B6472' }}>
                  {latest ? monthLabel(latest.month.slice(0, 7)) : '—'}
                </td>
                <td className="px-4 py-2.5">
                  <FaultBadge value={latest?.faults} />
                </td>
                <td className="px-4 py-2.5">
                  <FaultBadge value={cumulative} />
                </td>
                <td className="px-4 py-2.5">
                  <EvalBadge value={latest?.evaluation} />
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-1 justify-end">
                    <IconButton title="Editar" onClick={() => setEditing(worker)}>
                      <Pencil size={14} />
                    </IconButton>
                    {isSenior && (
                      <IconButton title="Trasladar" onClick={() => setTransferring(worker)}>
                        <ArrowRightLeft size={14} />
                      </IconButton>
                    )}
                    <IconButton title="Eliminar" onClick={() => setDeleting(worker)}>
                      <Trash2 size={14} />
                    </IconButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <WorkerFormModal
          provincias={provincias}
          profile={profile}
          onClose={() => setShowAdd(false)}
          onSave={async (data) => {
            const result = await createWorker(data);
            if (!result?.error) setShowAdd(false);
            return result;
          }}
        />
      )}
      {editing && (
        <WorkerFormModal
          provincias={provincias}
          profile={profile}
          initial={editing}
          onClose={() => setEditing(null)}
          onSave={async (data) => {
            const result = await updateWorker(editing.id, data);
            if (!result?.error) setEditing(null);
            return result;
          }}
        />
      )}
      {transferring && (
        <TransferModal
          worker={transferring}
          provincias={provincias}
          onClose={() => setTransferring(null)}
          onSave={async (newProvinciaId, note) => {
            const result = await transferWorker(transferring.id, newProvinciaId, note);
            if (!result?.error) setTransferring(null);
            return result;
          }}
        />
      )}
      {deleting && (
        <DeleteConfirmModal
          worker={deleting}
          onClose={() => setDeleting(null)}
          onConfirm={async () => {
            const result = await deleteWorker(deleting.id);
            if (!result?.error) setDeleting(null);
            return result;
          }}
        />
      )}
    </div>
  );
}

function WorkerFormModal({ provincias, profile, initial, onSave, onClose }) {
  const [name, setName] = useState(initial?.name || '');
  const [position, setPosition] = useState(initial?.position || '');
  const [provinciaId, setProvinciaId] = useState(initial?.provincia_id || profile.provincia_id || provincias[0]?.id || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const isSenior = profile.role === 'senior_management';

  async function handleSave() {
    setSaving(true);
    setError(null);
    const result = await onSave({ name: name.trim(), position, provincia_id: provinciaId });
    if (result?.error) {
      setError(result.error);
      setSaving(false);
    }
  }

  return (
    <ModalShell title={initial ? 'Editar CPO' : 'Nuevo CPO'} onClose={onClose}>
      <div className="space-y-3">
        <Field label="Nombre completo">
          <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre y apellido" />
        </Field>
        <Field label="Puesto (opcional)">
          <input className={inputCls} value={position} onChange={(e) => setPosition(e.target.value)} />
        </Field>
        {isSenior && !initial && (
          <Field label="Partido / Provincia">
            <select className={inputCls} value={provinciaId} onChange={(e) => setProvinciaId(e.target.value)}>
              {provincias.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
        )}
        {error && (
          <p className="text-sm" style={{ color: 'var(--red)' }}>
            {error}
          </p>
        )}
      </div>
      <div className="flex justify-end gap-2 mt-5">
        <button onClick={onClose} className="text-sm font-medium px-3.5 py-2 rounded-lg" style={{ color: '#5B6472' }}>
          Cancelar
        </button>
        <button
          disabled={saving || !name.trim()}
          onClick={handleSave}
          className="text-sm font-medium px-3.5 py-2 rounded-lg text-white disabled:opacity-60"
          style={{ backgroundColor: 'var(--blue)' }}
        >
          {saving ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
    </ModalShell>
  );
}

function TransferModal({ worker, provincias, onSave, onClose }) {
  const [provinciaId, setProvinciaId] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    const result = await onSave(provinciaId, note);
    if (result?.error) {
      setError(result.error);
      setSaving(false);
    }
  }

  return (
    <ModalShell title={`Trasladar a ${worker.name}`} onClose={onClose}>
      <div className="space-y-3">
        <Field label="Nuevo partido / provincia">
          <select className={inputCls} value={provinciaId} onChange={(e) => setProvinciaId(e.target.value)}>
            <option value="">Seleccionar…</option>
            {provincias
              .filter((p) => p.id !== worker.provincia_id)
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
          </select>
        </Field>
        <Field label="Nota (opcional)">
          <textarea className={inputCls} rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
        </Field>
        <p className="text-xs" style={{ color: 'var(--gray)' }}>
          Todo el historial de {worker.name} se conserva y viaja con el traslado.
        </p>
        {error && (
          <p className="text-sm" style={{ color: 'var(--red)' }}>
            {error}
          </p>
        )}
      </div>
      <div className="flex justify-end gap-2 mt-5">
        <button onClick={onClose} className="text-sm font-medium px-3.5 py-2 rounded-lg" style={{ color: '#5B6472' }}>
          Cancelar
        </button>
        <button
          disabled={!provinciaId || saving}
          onClick={handleSave}
          className="text-sm font-medium px-3.5 py-2 rounded-lg text-white disabled:opacity-60"
          style={{ backgroundColor: 'var(--blue)' }}
        >
          Confirmar traslado
        </button>
      </div>
    </ModalShell>
  );
}

function DeleteConfirmModal({ worker, onConfirm, onClose }) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState(null);

  async function handleConfirm() {
    setConfirming(true);
    setError(null);
    const result = await onConfirm();
    if (result?.error) {
      setError(result.error);
      setConfirming(false);
    }
  }

  return (
    <ModalShell title="Eliminar CPO" onClose={onClose}>
      <p className="text-sm" style={{ color: '#5B6472' }}>
        Se eliminará a <strong style={{ color: 'var(--ink)' }}>{worker.name}</strong> junto con todos sus registros, notas y
        archivos. Esta acción no se puede deshacer.
      </p>
      {error && (
        <p className="text-sm mt-2" style={{ color: 'var(--red)' }}>
          {error}
        </p>
      )}
      <div className="flex justify-end gap-2 mt-5">
        <button onClick={onClose} className="text-sm font-medium px-3.5 py-2 rounded-lg" style={{ color: '#5B6472' }}>
          Cancelar
        </button>
        <button
          disabled={confirming}
          onClick={handleConfirm}
          className="text-sm font-medium px-3.5 py-2 rounded-lg text-white disabled:opacity-60"
          style={{ backgroundColor: 'var(--red)' }}
        >
          {confirming ? 'Eliminando…' : 'Eliminar definitivamente'}
        </button>
      </div>
    </ModalShell>
  );
}
