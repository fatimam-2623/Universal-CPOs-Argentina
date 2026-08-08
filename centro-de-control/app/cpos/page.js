import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import CposPageClient from '@/components/CposPageClient';

export default async function CposPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  if (!profile?.role) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 text-center" style={{ backgroundColor: 'var(--paper)' }}>
        <div>
          <p className="font-display text-lg font-semibold" style={{ color: 'var(--blue)' }}>
            Cuenta sin rol asignado
          </p>
          <p className="text-sm mt-2" style={{ color: '#5B6472' }}>
            Pedile a Gerencia General que te asigne un rol para poder continuar.
          </p>
        </div>
      </div>
    );
  }

  const { data: provincias } = await supabase.from('provincias').select('*').order('name');
  const { data: workers } = await supabase.from('workers').select('*').order('name');
  const { data: records } = await supabase.from('monthly_records').select('*');

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--paper)' }}>
      <Sidebar profile={profile} />
      <div className="flex-1 min-w-0 p-8">
        <CposPageClient profile={profile} provincias={provincias || []} workers={workers || []} records={records || []} />
      </div>
    </div>
  );
}
