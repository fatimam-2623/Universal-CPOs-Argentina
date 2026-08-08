'use client';

import { useState, useMemo } from 'react';
import { Check } from 'lucide-react';
import { setAttendanceBulk } from '@/app/cpos/actions';
import { inputCls } from './ui';
import { classSessions, shortDate, currentSession } from '@/lib/helpers';

export default function AsistenciaRoster({ profile, provincias, workers, attendance }) {
  const isSenior = profile.role === 'senior_management';
  const sessions = classSessions();

  const [selectedDate, setSelectedDate] = useState(currentSession());
  const [selectedProvincia, setSelectedProvincia] = useState(isSenior ? '' : profile.provincia_id);
  const [checks, setChecks] = useState({});
  const [initialized, setInitialized] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const roster = useMemo(() => {
    if (!selectedProvincia) return [];
    return workers.filter((w) => w.provincia_id === selectedProvincia);
  }, [workers, selectedProvincia]);

  // (Re)initialize checkbox state whenever the date or roster changes, from existing records.
  const key = `${selectedDate}|${selectedProvincia}`;
  if (initialized !== key) {
    const initial = {};
    roster.forEach((w) => {
      const rec = attendance.find((a) => a.worker_id === w.id && a.class_date === selectedDate);
      initial[w.id] = rec ? rec.attended : false;
    });
    setChecks(initial);
    setInitialized(key);
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    const entries = roster.map((w) => ({ workerId: w.id, classDate: selectedDate, attended: !!checks[w.id] }));
    await setAttendanceBulk(entries);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  const presentCount = roster.filter((w) => checks[w.id]).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-semibold" style={{ color: 'var(--ink)' }}>
          Tomar asistencia
        </h1>
        <p className="text-sm mt-0.5" style={{ color: '#5B6472' }}>
          Marcá quién vino a la clase y guardá. Lo que quede sin marcar queda como falta.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="min-w-[160px]">
          <label className="block text-xs font-medium mb-1" style={{ color: '#5B6472' }}>
            Clase (domingo)
          </label>
          <select value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className={inputCls}>
            {sessions.map((s) => (
              <option key={s} value={s}>
                {shortDate(s)}
              </option>
            ))}
          </select>
        </div>
        {isSenior && (
          <div className="min-w-[200px]">
            <label className="block text-xs font-medium mb-1" style={{ color: '#5B6472' }}>
              Partido / Provincia
            </label>
            <select value={selectedProvincia} onChange={(e) => setSelectedProvincia(e.target.value)} className={inputCls}>
              <option value="">Seleccionar…</option>
              {provincias.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {selectedProvincia && (
        <>
          <div className="rounded-xl border border-line bg-white divide-y divide-line">
            {roster.length === 0 && (
              <p className="px-4 py-6 text-sm text-center" style={{ color: 'var(--gray)' }}>
                No hay CPOs cargados en este partido/provincia todavía.
              </p>
            )}
            {roster.map((w) => (
              <label key={w.id} className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-black/[0.02]">
                <span className="text-sm" style={{ color: 'var(--ink)' }}>
                  {w.name}
                </span>
                <input
                  type="checkbox"
                  checked={!!checks[w.id]}
                  onChange={(e) => setChecks({ ...checks, [w.id]: e.target.checked })}
                  className="w-5 h-5 rounded"
                  style={{ accentColor: 'var(--blue)' }}
                />
              </label>
            ))}
          </div>

          {roster.length > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: '#5B6472' }}>
                {presentCount} de {roster.length} presentes
              </span>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg text-white disabled:opacity-60"
                style={{ backgroundColor: saved ? 'var(--gray)' : 'var(--blue)' }}
              >
                {saved ? (
                  <>
                    <Check size={14} /> Guardado
                  </>
                ) : saving ? (
                  'Guardando…'
                ) : (
                  'Guardar asistencia'
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
