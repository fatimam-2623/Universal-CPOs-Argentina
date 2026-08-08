'use client';

import { useState, useRef } from 'react';
import { Camera, Plus, Pencil, Upload, File as FileIcon, Download, Send } from 'lucide-react';
import { addRecord, updateRecord, addNote, uploadPhoto, uploadFile, getFileUrl } from '@/app/cpos/actions';
import { ModalShell, Field, inputCls, EvalBadge, FaultBadge, ProvinciaBadge } from './ui';
import { monthLabel, last6Months } from '@/lib/helpers';

export default function CpoDetail({ profile, worker, provincias, records, transfers, notes, files, photoUrl }) {
  const [showRecordForm, setShowRecordForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const photoInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const provincia = provincias.find((p) => p.id === worker.provincia_id);
  const cumulative = records.reduce((s, r) => s + r.faults, 0);

  async function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingPhoto(true);
    const fd = new FormData();
    fd.append('photo', file);
    await uploadPhoto(worker.id, fd);
    setUploadingPhoto(false);
  }

  async function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingFile(true);
    const fd = new FormData();
    fd.append('file', file);
    await uploadFile(worker.id, fd);
    setUploadingFile(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleAddNote() {
    if (!noteText.trim()) return;
    setSavingNote(true);
    await addNote(worker.id, noteText.trim());
    setNoteText('');
    setSavingNote(false);
  }

  async function handleDownload(f) {
    const url = await getFileUrl('worker-files', f.storage_path);
    if (url) window.open(url, '_blank');
  }

  const timeline = [
    ...records.map((r) => ({ type: 'record', date: r.month, ...r })),
    ...transfers.map((t) => ({ type: 'transfer', date: t.moved_at.slice(0, 10), ...t })),
  ].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-5">
        <div className="relative shrink-0">
          <div className="w-20 h-20 rounded-2xl overflow-hidden border border-line bg-white flex items-center justify-center">
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoUrl} alt={worker.name} className="w-full h-full object-cover" />
            ) : (
              <span className="font-display text-xl font-semibold" style={{ color: 'var(--gray)' }}>
                {worker.name
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')}
              </span>
            )}
          </div>
          <button
            onClick={() => photoInputRef.current?.click()}
            disabled={uploadingPhoto}
            className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full flex items-center justify-center text-white shadow-sm disabled:opacity-60"
            style={{ backgroundColor: 'var(--blue)' }}
            title="Cambiar foto"
          >
            <Camera size={13} />
          </button>
          <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-xl font-semibold" style={{ color: 'var(--ink)' }}>
            {worker.name}
          </h1>
          {worker.position && (
            <p className="text-sm mt-0.5" style={{ color: '#5B6472' }}>
              {worker.position}
            </p>
          )}
          <div className="flex items-center gap-3 mt-2">
            <ProvinciaBadge name={provincia?.name || '—'} />
            <span className="text-xs" style={{ color: 'var(--gray)' }}>
              Faltas acumuladas: <FaultBadge value={cumulative} />
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-sm font-semibold uppercase tracking-wide" style={{ color: '#5B6472' }}>
                Registros mensuales
              </h2>
              <button
                onClick={() => setShowRecordForm(true)}
                className="text-xs font-medium inline-flex items-center gap-1"
                style={{ color: 'var(--blue)' }}
              >
                <Plus size={13} /> Cargar mes
              </button>
            </div>
            <div className="rounded-xl border border-line bg-white divide-y divide-line">
              {records.length === 0 && (
                <p className="px-4 py-6 text-sm text-center" style={{ color: 'var(--gray)' }}>
                  Sin registros todavía.
                </p>
              )}
              {records.map((r) => (
                <div key={r.id} className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <div className="font-mono text-xs font-medium" style={{ color: 'var(--ink)' }}>
                      {monthLabel(r.month.slice(0, 7))}
                    </div>
                    <div className="text-xs mt-0.5 flex gap-3" style={{ color: '#5B6472' }}>
                      <span>Asist: {r.attendance_days ?? '—'}d</span>
                      <span>
                        Faltas: <FaultBadge value={r.faults} />
                      </span>
                      <span>
                        Eval: <EvalBadge value={r.evaluation} />
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setEditingRecord(r)}
                    className="w-7 h-7 inline-flex items-center justify-center rounded-md hover:bg-black/5"
                    style={{ color: 'var(--blue)' }}
                  >
                    <Pencil size={13} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-sm font-semibold uppercase tracking-wide" style={{ color: '#5B6472' }}>
                Archivos
              </h2>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingFile}
                className="text-xs font-medium inline-flex items-center gap-1 disabled:opacity-60"
                style={{ color: 'var(--blue)' }}
              >
                <Upload size={13} /> {uploadingFile ? 'Subiendo…' : 'Subir archivo'}
              </button>
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
            </div>
            <div className="rounded-xl border border-line bg-white divide-y divide-line">
              {files.length === 0 && (
                <p className="px-4 py-6 text-sm text-center" style={{ color: 'var(--gray)' }}>
                  Sin archivos todavía.
                </p>
              )}
              {files.map((f) => (
                <button
                  key={f.id}
                  onClick={() => handleDownload(f)}
                  className="w-full px-4 py-3 flex items-center gap-2.5 text-left hover:bg-black/[0.02]"
                >
                  <FileIcon size={15} style={{ color: 'var(--gray)' }} />
                  <span className="text-sm flex-1 truncate" style={{ color: 'var(--ink)' }}>
                    {f.file_name}
                  </span>
                  <Download size={13} style={{ color: 'var(--gray)' }} />
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section>
            <h2 className="font-display text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: '#5B6472' }}>
              Notas
            </h2>
            <div className="rounded-xl border border-line bg-white p-4 space-y-3">
              <div className="flex gap-2">
                <input
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Agregar una nota…"
                  className={inputCls}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddNote();
                  }}
                />
                <button
                  onClick={handleAddNote}
                  disabled={savingNote || !noteText.trim()}
                  className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-white disabled:opacity-60"
                  style={{ backgroundColor: 'var(--blue)' }}
                >
                  <Send size={14} />
                </button>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {notes.length === 0 && (
                  <p className="text-sm text-center py-3" style={{ color: 'var(--gray)' }}>
                    Sin notas todavía.
                  </p>
                )}
                {notes.map((n) => (
                  <div key={n.id} className="text-sm border-l-2 pl-3" style={{ borderColor: 'var(--line)' }}>
                    <p style={{ color: 'var(--ink)' }}>{n.content}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--gray)' }}>
                      {new Date(n.created_at).toLocaleDateString('es-AR')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-display text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: '#5B6472' }}>
              Historial
            </h2>
            <div className="rounded-xl border border-line bg-white p-4">
              {timeline.length === 0 ? (
                <p className="text-sm text-center py-3" style={{ color: 'var(--gray)' }}>
                  Sin historial todavía.
                </p>
              ) : (
                <div className="relative pl-5 space-y-4">
                  <div className="absolute left-[7px] top-1 bottom-1 w-px" style={{ backgroundColor: 'var(--line)' }} />
                  {timeline.map((item, i) => (
                    <div key={i} className="relative">
                      <div
                        className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full border-2 bg-white"
                        style={{ borderColor: item.type === 'transfer' ? 'var(--red)' : 'var(--blue)' }}
                      />
                      {item.type === 'record' ? (
                        <div className="text-sm">
                          <span className="font-mono text-xs font-medium" style={{ color: 'var(--ink)' }}>
                            {monthLabel(item.month.slice(0, 7))}
                          </span>
                          <span style={{ color: '#5B6472' }}>
                            {' '}
                            — {item.faults} faltas, eval {item.evaluation}/10
                          </span>
                        </div>
                      ) : (
                        <div className="text-sm">
                          <span className="font-mono text-xs font-medium" style={{ color: 'var(--red)' }}>
                            Traslado
                          </span>
                          <div style={{ color: '#5B6472' }}>
                            {provincias.find((p) => p.id === item.from_provincia_id)?.name || '—'} →{' '}
                            {provincias.find((p) => p.id === item.to_provincia_id)?.name}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {(showRecordForm || editingRecord) && (
        <RecordFormModal
          initial={editingRecord}
          onClose={() => {
            setShowRecordForm(false);
            setEditingRecord(null);
          }}
          onSave={async (data) => {
            const result = editingRecord
              ? await updateRecord(editingRecord.id, worker.id, data)
              : await addRecord({ worker_id: worker.id, ...data });
            if (!result?.error) {
              setShowRecordForm(false);
              setEditingRecord(null);
            }
            return result;
          }}
        />
      )}
    </div>
  );
}

function RecordFormModal({ initial, onSave, onClose }) {
  const months = last6Months();
  const [month, setMonth] = useState(initial ? initial.month.slice(0, 7) : months[months.length - 1]);
  const [attendance, setAttendance] = useState(initial?.attendance_days ?? 20);
  const [faults, setFaults] = useState(initial?.faults ?? 0);
  const [evaluation, setEvaluation] = useState(initial?.evaluation ?? 7);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    const result = await onSave({ month, attendance_days: attendance, faults, evaluation });
    if (result?.error) {
      setError(result.error);
      setSaving(false);
    }
  }

  return (
    <ModalShell title={initial ? 'Editar registro' : 'Cargar registro mensual'} onClose={onClose}>
      <div className="space-y-3">
        {!initial && (
          <Field label="Mes">
            <select className={inputCls} value={month} onChange={(e) => setMonth(e.target.value)}>
              {months.map((m) => (
                <option key={m} value={m}>
                  {monthLabel(m)}
                </option>
              ))}
            </select>
          </Field>
        )}
        <div className="grid grid-cols-3 gap-2">
          <Field label="Asistencia (días)">
            <input
              type="number"
              min="0"
              max="31"
              className={inputCls}
              value={attendance}
              onChange={(e) => setAttendance(Number(e.target.value))}
            />
          </Field>
          <Field label="Faltas">
            <input type="number" min="0" className={inputCls} value={faults} onChange={(e) => setFaults(Number(e.target.value))} />
          </Field>
          <Field label="Evaluación (1-10)">
            <input
              type="number"
              min="1"
              max="10"
              className={inputCls}
              value={evaluation}
              onChange={(e) => setEvaluation(Number(e.target.value))}
            />
          </Field>
        </div>
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
          disabled={saving}
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
