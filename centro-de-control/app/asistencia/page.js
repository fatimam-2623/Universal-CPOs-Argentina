import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import AsistenciaRoster from '@/components/AsistenciaRoster';

export default async function AsistenciaPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  if (!profile?.role) redirect('/cpos');

  const { data: provincias } = await supabase.from('provincias').select('*').order('name');
  const { data: workers } = await supabase.from('workers').select('*').order('name');
  const { data: attendance } = await supabase.from('attendance_records').select('*');

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--paper)' }}>
      <Sidebar profile={profile} />
      <div className="flex-1 min-w-0 p-8 max-w-2xl">
        <div className="flex justify-end mb-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-wordmark.png" alt="Universal" className="h-7 w-auto opacity-90" />
        </div>
        <AsistenciaRoster profile={profile} provincias={provincias || []} workers={workers || []} attendance={attendance || []} />
      </div>
    </div>
  );
}
