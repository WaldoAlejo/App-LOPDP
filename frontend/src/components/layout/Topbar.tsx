import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { LogOut, ChevronDown, Building2 } from 'lucide-react';
import { clsx } from 'clsx';

export function Topbar() {
  const { user, logout } = useAuthStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials =
    (user?.firstName?.[0] || '') + (user?.lastName?.[0] || '') || 'U';

  const roleLabels: Record<string, string> = {
    SUPER_ADMIN: 'Super Administrador',
    COMPANY_ADMIN: 'Administrador',
    DPO: 'Delegado de Protección',
    LEGAL_REVIEWER: 'Revisor Jurídico',
    PROCESS_LEADER: 'Líder de Proceso',
    SUPPORT: 'Colaborador',
    AUDITOR: 'Auditor',
    SECURITY_LEAD: 'Seguridad',
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-4 md:px-6">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-servi-gray md:hidden">
          RAT Servientrega
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Company badge */}
        <div className="hidden items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 sm:flex">
          <Building2 size={14} className="text-servi-gray" />
          <span className="text-xs font-medium text-servi-gray-dark">
            {user?.companyId ? 'Servientrega' : 'Sin empresa'}
          </span>
        </div>

        {/* User dropdown */}
        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen(!open)}
            className={clsx(
              'flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors',
              open ? 'bg-gray-100' : 'hover:bg-gray-50'
            )}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-servi-green/10 text-sm font-bold text-servi-green-dark">
              {initials}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-sm font-medium text-servi-black">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-servi-gray">
                {roleLabels[user?.roleCode || ''] || user?.roleCode}
              </p>
            </div>
            <ChevronDown
              size={14}
              className={clsx(
                'text-servi-gray transition-transform',
                open && 'rotate-180'
              )}
            />
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-56 rounded-lg border bg-white py-1 shadow-lg">
              <div className="border-b px-4 py-3">
                <p className="text-sm font-medium text-servi-black">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-servi-gray">{user?.email}</p>
              </div>
              <button
                onClick={() => {
                  setOpen(false);
                  logout();
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
              >
                <LogOut size={14} />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
