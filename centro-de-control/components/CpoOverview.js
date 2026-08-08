'use client';

import { useMemo } from 'react';
import { Users, Calendar, AlertTriangle, TrendingUp, ShieldAlert } from 'lucide-react';
import { provinciaColor } from '@/lib/helpers';

function StatCard({ icon, label, value }) {
  return (
    <div className="rounded-xl border border-line bg-white p-4">
      <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide" style={{ color: '#5B6472' }}>
        {icon} {label}
      </div>
      <div className="font-display text-2xl font-semibold mt-1.5" style={{ color: 'var(--ink)' }}>
        {value}
      </div>
    </div>
  );
}

function latestRecord(workerId, records) {
  const recs = records.filter((r) => r.worker_id === workerId).sort((a, b) => b.month.localeCompare(a.month));
  return recs[0] || null;
}

export default function CpoOverview({ profile, provincias, workers, records, activeFilter, onFilterChange }) {
  const isSenior = profile.role === 'senior_management';

  const stats = useMemo(() => {
    const totalCpos = workers.length;
    const totalAsistencias = records.reduce((s, r) => s + (r.attendance_days || 0), 0);
    const totalFaltas = records.reduce((s, r) => s + r.faults, 0);

    const latests = workers.map((w) => latestRecord(w.id, records)).filter(Boolean);
    const promedioEvaluacion = latests.length ? (latests.reduce((s, r) => s + r.evaluation, 0) / latests.length).toFixed(1) : '—';
    const enAlerta = latests.filter((r) => r.faults >= 4 || r.evaluation <= 4).length;

    return { totalCpos, totalAsistencias, totalFaltas, promedioEvaluacion, enAlerta };
  }, [workers, records]);

  const breakdown = useMemo(() => {
    if (!isSenior) return [];
    return provincias
      .map((p) => {
        const pWorkers = workers.filter((w) => w.provincia_id === p.id);
        if (pWorkers.length === 0) return null;
        const pRecords = records.filter((r) => pWorkers.some((w) => w.id === r.worker_id));
        const latests = pWorkers.map((w) => latestRecord(w.id, records)).filter(Boolean);
        const faltasAcum = pRecords.reduce((s, r) => s + r.faults, 0);
        const promEval = latests.length ? (latests.reduce((s, r) => s + r.evaluation, 0) / latests.length).toFixed(1) : '—';
        return { provincia: p, count: pWorkers.length, faltasAcum, promEval };
      })
      .filter(Boolean)
      .sort((a, b) => b.count - a.count);
  }, [isSenior, provincias, workers, records]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard icon={<Users size={13} />} label="Total CPOs" value={stats.totalCpos} />
        <StatCard icon={<Calendar size={13} />} label="Asistencias" value={stats.totalAsistencias} />
        <StatCard icon={<AlertTriangle size={13} />} label="Faltas" value={stats.totalFaltas} />
        <StatCard icon={<TrendingUp size={13} />} label="Eval. promedio" value={stats.promedioEvaluacion} />
        <StatCard icon={<ShieldAlert size={13} />} label="En alerta" value={stats.enAlerta} />
      </div>

      {isSenior && breakdown.length > 0 && (
        <div>
          <h2 className="font-display text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: '#5B6472' }}>
            Por Partido / Provincia
          </h2>
          <div className="overflow-x-auto rounded-xl border border-line bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-line" style={{ backgroundColor: 'var(--paper)' }}>
                  <th className="px-4 py-2.5 font-medium text-xs uppercase tracking-wide" style={{ color: '#5B6472' }}>
                    Partido/Provincia
                  </th>
                  <th className="px-4 py-2.5 font-medium text-xs uppercase tracking-wide" style={{ color: '#5B6472' }}>
                    CPOs
                  </th>
                  <th className="px-4 py-2.5 font-medium text-xs uppercase tracking-wide" style={{ color: '#5B6472' }}>
                    Faltas acum.
                  </th>
                  <th className="px-4 py-2.5 font-medium text-xs uppercase tracking-wide" style={{ color: '#5B6472' }}>
                    Eval. promedio
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  onClick={() => onFilterChange('all')}
                  className="border-b border-line cursor-pointer hover:bg-black/[0.02]"
                  style={activeFilter === 'all' ? { backgroundColor: 'var(--blue-soft)' } : undefined}
                >
                  <td className="px-4 py-2.5 font-medium" style={{ color: 'var(--ink)' }} colSpan={4}>
                    Todas las provincias
                  </td>
                </tr>
                {breakdown.map(({ provincia, count, faltasAcum, promEval }) => {
                  const c = provinciaColor(provincia.id);
                  const active = activeFilter === provincia.id;
                  return (
                    <tr
                      key={provincia.id}
                      onClick={() => onFilterChange(active ? 'all' : provincia.id)}
                      className="border-b border-line last:border-0 cursor-pointer hover:bg-black/[0.02]"
                      style={active ? { backgroundColor: c.bg } : undefined}
                    >
                      <td className="px-4 py-2.5">
                        <span className="inline-flex items-center gap-1.5 font-medium" style={{ color: 'var(--ink)' }}>
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.dot }} />
                          {provincia.name}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 font-mono" style={{ color: '#5B6472' }}>
                        {count}
                      </td>
                      <td className="px-4 py-2.5 font-mono" style={{ color: '#5B6472' }}>
                        {faltasAcum}
                      </td>
                      <td className="px-4 py-2.5 font-mono" style={{ color: '#5B6472' }}>
                        {promEval}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
