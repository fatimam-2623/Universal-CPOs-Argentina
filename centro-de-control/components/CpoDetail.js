'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { Camera, Plus, Pencil, Upload, File as FileIcon, Download, Send, ArrowLeft, Trash2, Check, X as XIcon } from 'lucide-react';
import { setAttendance, setEvaluation, addNote, updateNote, deleteNote, uploadPhoto, uploadFile, getFileUrl } from '@/app/cpos/actions';
import { ModalShell, Field, inputCls, EvalBadge, FaultBadge, ProvinciaBadge } from './ui';
import { classSessions, shortDate } from '@/lib/helpers';

export default function CpoDetail({ profile, worker, provincias, records, transfers, notes, files, photoUrl }) {
  const [showRecordForm, setShowRecordForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteText, setEditingNoteText] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const photoInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const provincia = provincias.find((p) => p.id === worker.provincia_id);
  const totalFaltas = records.filter((r) => !r.attended).length;
  const totalAsistencias = records.filter((r) => r.attended).length;

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

  function startEditingNote(note) {
    setEditingNoteId(note.id);
    setEditingNoteText(note.content);
  }

  async function handleSaveNoteEdit() {
    if (!editingNoteText.trim()) return;
    await updateNote(editingNoteId, worker.id, editingNoteText.trim());
    setEditingNoteId(null);
  }

  async function handleDeleteNote(noteId) {
    if (!window.confirm('¿Eliminar esta nota?')) return;
    await deleteNote(noteId, worker.id);
  }

  async function handleDownload(f) {
    const url = await getFileUrl('worker-files', f.storage_path);
    if (url) window.open(url, '_blank');
  }

  const timeline = [
    ...records.map((r) => ({ type: 'record', date: r.class_date, ...r })),
    ...transfers.map((t) => ({ type: 'transfer', date: t.moved_at.slice(0, 10), ...t })),
  ].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-6">
      <Link
        href="/cpos"
        className="inline-flex items-center gap-1.5 text-sm font-medium hover:opacity-70 transition-opacity"
        style={{ color: 'var(--blue)' }}
      >
        <ArrowLeft size={15} /> Volver a CPOs
      </Link>

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
            style={{ backgroundColor: 'var(--blue)', display: profile.role === 'senior_management' ? 'flex' : 'none' }}
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
            <ProvinciaBadge id={provincia?.id} name={provincia?.name || '—'} />
            <span className="text-xs" style={{ color: 'var(--gray)' }}>
              Asistencias: <FaultBadge value={totalAsistencias} />
            </span>
            <span className="text-xs" style={{ color: 'var(--gray)' }}>
              Faltas: <FaultBadge value={totalFaltas} />
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-sm font-semibold uppercase tracking-wide" style={{ color: '#5B6472' }}>
                Asistencia
              </h2>
              <button
                onClick={() => setShowRecordForm(true)}
                className="text-xs font-medium inline-flex items-center gap-1"
                style={{ color: 'var(--blue)' }}
              >
                <Plus size={13} /> Marcar clase
              </button>
            </div>
            <div className="rounded-xl border border-line bg-white divide-y divide-line max-h-80 overflow-y-auto">
              {records.length === 0 && (
                <p className="px-4 py-6 text-sm text-center" style={{ color: 'var(--gray)' }}>
                  Sin asistencia registrada todavía.
                </p>
              )}
              {records.map((r) => (
                <div key={r.id} className="px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: r.attended ? 'var(--blue-soft)' : 'var(--red-soft)' }}
                    >
                      {r.attended ? <Check size={11} style={{ color: 'var(--blue)' }} /> : <XIcon size={11} style={{ color: 'var(--red)' }} />}
                    </span>
                    <span className="font-mono text-xs font-medium" style={{ color: 'var(--ink)' }}>
                      {shortDate(r.class_date)}
                    </span>
                    {!r.attended && (
                      <span className="text-xs" style={{ color: r.justified === false ? 'var(--red)' : 'var(--gray)' }}>
                        {r.justified == null ? 'Sin clasificar' : r.justified ? 'Justificada' : 'No justificada'}
                      </span>
                    )}
                    {r.evaluation != null && (
                      <span className="text-xs" style={{ color: '#5B6472' }}>
                        Eval: <EvalBadge value={r.evaluation} />
                      </span>
                    )}
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
                {notes.map((n) =>
                  editingNoteId === n.id ? (
                    <div key={n.id} className="text-sm border-l-2 pl-3" style={{ borderColor: 'var(--blue)' }}>
                      <input
                        autoFocus
                        value={editingNoteText}
                        onChange={(e) => setEditingNoteText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveNoteEdit();
                          if (e.key === 'Escape') setEditingNoteId(null);
                        }}
                        className={inputCls}
                      />
                      <div className="flex gap-2 mt-1.5">
                        <button
                          onClick={handleSaveNoteEdit}
                          className="inline-flex items-center gap-1 text-xs font-medium"
                          style={{ color: 'var(--blue)' }}
                        >
                          <Check size={12} /> Guardar
                        </button>
                        <button
                          onClick={() => setEditingNoteId(null)}
                          className="inline-flex items-center gap-1 text-xs font-medium"
                          style={{ color: 'var(--gray)' }}
                        >
                          <XIcon size={12} /> Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div key={n.id} className="text-sm border-l-2 pl-3 group flex items-start justify-between gap-2" style={{ borderColor: 'var(--line)' }}>
                      <div className="min-w-0">
                        <p style={{ color: 'var(--ink)' }}>{n.content}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--gray)' }}>
                          {new Date(n.created_at).toLocaleDateString('es-AR')}
                        </p>
                      </div>
                      <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEditingNote(n)}
                          className="w-6 h-6 inline-flex items-center justify-center rounded-md hover:bg-black/5"
                          style={{ color: 'var(--blue)' }}
                          title="Editar nota"
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          onClick={() => handleDeleteNote(n.id)}
                          className="w-6 h-6 inline-flex items-center justify-center rounded-md hover:bg-black/5"
                          style={{ color: 'var(--red)' }}
                          title="Eliminar nota"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  )
                )}
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
                            {shortDate(item.class_date)}
                          </span>
                          <span style={{ color: '#5B6472' }}>
                            {' '}
                            —{' '}
                            {item.attended
                              ? 'asistió'
                              : `faltó (${item.justified == null ? 'sin clasificar' : item.justified ? 'justificada' : 'no justificada'})`}
                            {item.evaluation != null ? `, eval ${item.evaluation}/10` : ''}
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
        <AttendanceModal
          worker={worker}
          existingDates={records.map((r) => r.class_date)}
          initial={editingRecord}
          onClose={() => {
            setShowRecordForm(false);
            setEditingRecord(null);
          }}
          onSave={async (data) => {
            const attResult = await setAttendance(worker.id, data.classDate, data.attended, data.justified, data.justificationNote);
            if (attResult?.error) return attResult;
            if (data.evaluation != null) {
              await setEvaluation(worker.id, data.classDate, data.evaluation);
            }
            setShowRecordForm(false);
            setEditingRecord(null);
            return { success: true };
          }}
        />
      )}
    </div>
  );
}

function AttendanceModal({ worker, existingDates, initial, onSave, onClose }) {
  const allSessions = classSessions();
  const availableSessions = initial ? [initial.class_date] : allSessions.filter((s) => !existingDates.includes(s));
  const [classDate, setClassDate] = useState(initial?.class_date || availableSessions[0] || allSessions[0]);
  const [attended, setAttended] = useState(initial ? initial.attended : true);
  const [justified, setJustified] = useState(initial?.justified ?? true);
  const [justificationNote, setJustificationNote] = useState(initial?.justification_note || '');
  const [evaluation, setEvaluationValue] = useState(initial?.evaluation ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    const result = await onSave({
      classDate,
      attended,
      justified: attended ? null : justified,
      justificationNote: attended ? null : justificationNote.trim() || null,
      evaluation: evaluation === '' ? null : Number(evaluation),
    });
    if (result?.error) {
      setError(result.error);
      setSaving(false);
    }
  }

  return (
    <ModalShell title={initial ? `Clase del ${shortDate(initial.class_date)}` : 'Marcar clase'} onClose={onClose}>
      <div className="space-y-3">
        {!initial && (
          <Field label="Clase (domingo)">
            <select className={inputCls} value={classDate} onChange={(e) => setClassDate(e.target.value)}>
              {availableSessions.map((s) => (
                <option key={s} value={s}>
                  {shortDate(s)}
                </option>
              ))}
            </select>
          </Field>
        )}
        <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--ink)' }}>
          <input
            type="checkbox"
            checked={attended}
            onChange={(e) => setAttended(e.target.checked)}
            className="w-5 h-5 rounded"
            style={{ accentColor: 'var(--blue)' }}
          />
          Asistió a esta clase
        </label>
        {!attended && (
          <div className="rounded-lg p-3 space-y-2" style={{ backgroundColor: 'var(--paper)' }}>
            <Field label="Falta">
              <select
                className={inputCls}
                value={justified ? 'justified' : 'unjustified'}
                onChange={(e) => setJustified(e.target.value === 'justified')}
              >
                <option value="justified">Justificada</option>
                <option value="unjustified">No justificada</option>
              </select>
            </Field>
            <Field label="Motivo (opcional)">
              <input
                className={inputCls}
                value={justificationNote}
                onChange={(e) => setJustificationNote(e.target.value)}
                placeholder="Ej: turno médico"
              />
            </Field>
          </div>
        )}
        <Field label="Evaluación (1-10, opcional)">
          <input
            type="number"
            min="1"
            max="10"
            className={inputCls}
            value={evaluation}
            onChange={(e) => setEvaluationValue(e.target.value)}
            placeholder="Sin evaluación"
          />
        </Field>
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
