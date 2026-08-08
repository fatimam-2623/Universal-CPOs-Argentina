'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

function friendlyError(error) {
  if (!error) return null;
  if (error.code === '23505') return 'Ya existe un registro para ese CPO en ese mes.';
  return error.message;
}

export async function createWorker(data) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase.from('workers').insert({
    name: data.name,
    position: data.position || null,
    provincia_id: data.provincia_id,
    created_by: user.id,
  });
  if (error) return { error: friendlyError(error) };
  revalidatePath('/cpos');
  return { success: true };
}

export async function updateWorker(id, data) {
  const supabase = createClient();
  const { error } = await supabase
    .from('workers')
    .update({ name: data.name, position: data.position || null })
    .eq('id', id);
  if (error) return { error: friendlyError(error) };
  revalidatePath('/cpos');
  revalidatePath(`/cpos/${id}`);
  return { success: true };
}

export async function deleteWorker(id) {
  const supabase = createClient();

  // Storage isn't touched by the database's own cascade delete, so clean it up first.
  const { data: files } = await supabase.from('worker_files').select('storage_path').eq('worker_id', id);
  if (files?.length) {
    await supabase.storage.from('worker-files').remove(files.map((f) => f.storage_path));
  }
  const { data: worker } = await supabase.from('workers').select('photo_path').eq('id', id).single();
  if (worker?.photo_path) {
    await supabase.storage.from('cpo-photos').remove([worker.photo_path]);
  }

  const { error } = await supabase.from('workers').delete().eq('id', id);
  if (error) return { error: friendlyError(error) };
  revalidatePath('/cpos');
  return { success: true };
}

export async function transferWorker(workerId, newProvinciaId, note) {
  const supabase = createClient();
  const { error } = await supabase.rpc('transfer_worker', {
    p_worker_id: workerId,
    p_new_provincia_id: newProvinciaId,
    p_note: note || null,
  });
  if (error) return { error: friendlyError(error) };
  revalidatePath('/cpos');
  revalidatePath(`/cpos/${workerId}`);
  return { success: true };
}

export async function addRecord(data) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase.from('monthly_records').insert({
    worker_id: data.worker_id,
    month: `${data.month}-01`,
    attendance_days: data.attendance_days,
    faults: data.faults,
    evaluation: data.evaluation,
    submitted_by: user.id,
  });
  if (error) return { error: friendlyError(error) };
  revalidatePath('/cpos');
  revalidatePath(`/cpos/${data.worker_id}`);
  return { success: true };
}

export async function updateRecord(id, workerId, data) {
  const supabase = createClient();
  const { error } = await supabase
    .from('monthly_records')
    .update({
      attendance_days: data.attendance_days,
      faults: data.faults,
      evaluation: data.evaluation,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);
  if (error) return { error: friendlyError(error) };
  revalidatePath('/cpos');
  revalidatePath(`/cpos/${workerId}`);
  return { success: true };
}

export async function addNote(workerId, content) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase.from('worker_notes').insert({
    worker_id: workerId,
    author: user.id,
    content,
  });
  if (error) return { error: friendlyError(error) };
  revalidatePath(`/cpos/${workerId}`);
  return { success: true };
}

export async function updateNote(noteId, workerId, content) {
  const supabase = createClient();
  const { error } = await supabase.from('worker_notes').update({ content }).eq('id', noteId);
  if (error) return { error: friendlyError(error) };
  revalidatePath(`/cpos/${workerId}`);
  return { success: true };
}

export async function deleteNote(noteId, workerId) {
  const supabase = createClient();
  const { error } = await supabase.from('worker_notes').delete().eq('id', noteId);
  if (error) return { error: friendlyError(error) };
  revalidatePath(`/cpos/${workerId}`);
  return { success: true };
}

export async function uploadPhoto(workerId, formData) {
  const supabase = createClient();
  const file = formData.get('photo');
  if (!file || file.size === 0) return { error: 'No se seleccionó ningún archivo.' };

  const ext = file.name.split('.').pop();
  const path = `${workerId}/photo.${ext}`;

  const { error: uploadError } = await supabase.storage.from('cpo-photos').upload(path, file, { upsert: true });
  if (uploadError) return { error: friendlyError(uploadError) };

  const { error: updateError } = await supabase.from('workers').update({ photo_path: path }).eq('id', workerId);
  if (updateError) return { error: friendlyError(updateError) };

  revalidatePath('/cpos');
  revalidatePath(`/cpos/${workerId}`);
  return { success: true };
}

export async function uploadFile(workerId, formData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const file = formData.get('file');
  if (!file || file.size === 0) return { error: 'No se seleccionó ningún archivo.' };

  const path = `${workerId}/${Date.now()}-${file.name}`;

  const { error: uploadError } = await supabase.storage.from('worker-files').upload(path, file);
  if (uploadError) return { error: friendlyError(uploadError) };

  const { error: insertError } = await supabase.from('worker_files').insert({
    worker_id: workerId,
    storage_path: path,
    file_name: file.name,
    uploaded_by: user.id,
  });
  if (insertError) return { error: friendlyError(insertError) };

  revalidatePath(`/cpos/${workerId}`);
  return { success: true };
}

export async function getFileUrl(bucket, path) {
  const supabase = createClient();
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 3600);
  if (error) return null;
  return data.signedUrl;
}
