import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import PersonasTable from '@/components/PersonasTable';

export default async function PersonasPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  if (profile?.role !== 'senior_management') {
    redirect('/cpos');
  }

  const { data: profiles } = await supabase.from('profiles').select('*').order('created_at');
  const { data: provincias } = await supabase.from('provincias').select('*').order('name');

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--paper)' }}>
      <Sidebar profile={profile} />
      <div className="flex-1 min-w-0 p-8 max-w-4xl">
        <PersonasTable profiles={profiles || []} provincias={provincias || []} currentUserId={user.id} />
      </div>
    </div>
  );
}
