'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateProfile(profileId, { role, provinciaId, fullName }) {
  const supabase = createClient();
  const { error } = await supabase
    .from('profiles')
    .update({
      role: role || null,
      provincia_id: role === 'provincia_manager' ? provinciaId || null : null,
      full_name: fullName,
    })
    .eq('id', profileId);
  if (error) return { error: error.message };
  revalidatePath('/personas');
  return { success: true };
}
