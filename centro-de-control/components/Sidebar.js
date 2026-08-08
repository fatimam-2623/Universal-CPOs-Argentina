import Link from 'next/link';
import { LogOut, Users, ClipboardCheck } from 'lucide-react';
import { logout } from '@/app/login/actions';
import { ROLE_LABEL } from '@/lib/helpers';

export default function Sidebar({ profile }) {
  return (
    <div className="w-64 shrink-0 flex flex-col text-white" style={{ backgroundColor: 'var(--blue)' }}>
      <Link href="/cpos" className="px-5 py-5 flex items-center gap-2.5 border-b border-white/10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-icon.png" alt="" className="w-8 h-8 rounded-lg shrink-0 object-contain bg-white/10 p-0.5" />
        <div>
          <div className="font-display font-semibold text-sm leading-tight">Centro de Control</div>
          <div className="text-xs text-white/50">Gestión de CPOs</div>
        </div>
      </Link>

      <div className="px-5 py-4">
        <div className="text-sm font-medium">{profile.full_name}</div>
        <div className="text-xs text-white/60 mt-0.5">{ROLE_LABEL[profile.role] || 'Sin rol'}</div>
      </div>

      {profile.role && (
        <div className="px-5 pb-4 space-y-2">
          <Link
            href="/asistencia"
            className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors"
          >
            <ClipboardCheck size={14} /> Tomar asistencia
          </Link>
          {profile.role === 'senior_management' && (
            <Link
              href="/personas"
              className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors"
            >
              <Users size={14} /> Personas
            </Link>
          )}
        </div>
      )}

      <div className="mt-auto px-5 py-4 border-t border-white/10">
        <form action={logout}>
          <button type="submit" className="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors">
            <LogOut size={13} /> Cerrar sesión
          </button>
        </form>
      </div>
    </div>
  );
}
