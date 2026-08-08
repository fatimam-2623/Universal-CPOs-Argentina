import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import CpoDetail from '@/components/CpoDetail';

export default async function CpoDetailPage({ params }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  const { data: worker } = await supabase.from('workers').select('*').eq('id', params.id).single();
  if (!worker) notFound();

  const { data: provincias } = await supabase.from('provincias').select('*').order('name');
  const { data: records } = await supabase
    .from('attendance_records')
    .select('*')
    .eq('worker_id', params.id)
    .order('class_date', { ascending: false });
  const { data: transfers } = await supabase
    .from('worker_transfers')
    .select('*')
    .eq('worker_id', params.id)
    .order('moved_at', { ascending: false });
  const { data: notes } = await supabase
    .from('worker_notes')
    .select('*')
    .eq('worker_id', params.id)
    .order('created_at', { ascending: false });
  const { data: files } = await supabase
    .from('worker_files')
    .select('*')
    .eq('worker_id', params.id)
    .order('uploaded_at', { ascending: false });

  let photoUrl = null;
  if (worker.photo_path) {
    const { data } = await supabase.storage.from('cpo-photos').createSignedUrl(worker.photo_path, 3600);
    photoUrl = data?.signedUrl || null;
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--paper)' }}>
      <Sidebar profile={profile} />
      <div className="flex-1 min-w-0 p-8 max-w-4xl">
        <div className="flex justify-end mb-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-wordmark.png" alt="Universal" className="h-7 w-auto opacity-90" />
        </div>
        <CpoDetail
          profile={profile}
          worker={worker}
          provincias={provincias || []}
          records={records || []}
          transfers={transfers || []}
          notes={notes || []}
          files={files || []}
          photoUrl={photoUrl}
        />
      </div>
    </div>
  );
}
