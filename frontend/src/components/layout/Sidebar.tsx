import { useState } from 'react';
import {
  Menu,
  X,
  LayoutDashboard,

  Users,
  Building2,
  FolderTree,
  GitBranch,
  Library,
  FileText,
  Gavel,
  AlertTriangle,
  BarChart3,
  ClipboardList,
  Shield,
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import { useAuthStore } from '../../store/authStore';
import {
  canAccessAudits,
  canAccessManagement,
  canAccessReports,
  canAccessReviews,
  canAccessRisks,
} from '../../utils/roleAccess';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', isVisible: () => true },
  { to: '/treatments', icon: FileText, label: 'Tratamientos', isVisible: () => true },
  { to: '/reviews', icon: Gavel, label: 'Revisión DPO', isVisible: canAccessReviews },
  { to: '/risks', icon: AlertTriangle, label: 'Riesgos / EIPD', isVisible: canAccessRisks },
  { to: '/reports', icon: BarChart3, label: 'Reportes', isVisible: canAccessReports },
  { to: '/audits', icon: ClipboardList, label: 'Auditoría', isVisible: canAccessAudits },
  { to: '/companies', icon: Building2, label: 'Empresas', isVisible: canAccessManagement },
  { to: '/areas', icon: FolderTree, label: 'Áreas', isVisible: canAccessManagement },
  { to: '/processes', icon: GitBranch, label: 'Procesos', isVisible: canAccessManagement },
  { to: '/users', icon: Users, label: 'Usuarios', isVisible: canAccessManagement },
  { to: '/catalogs', icon: Library, label: 'Catálogos', isVisible: canAccessManagement },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  const visibleItems = navItems.filter((item) => item.isVisible(user?.roleCode));

  const isActivePath = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-4 top-4 z-50 rounded-lg bg-servi-green p-2 text-white shadow-lg shadow-servi-green/30 transition-transform hover:scale-105 active:scale-95 md:hidden"
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm transition-opacity md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-40 w-64 transform border-r border-gray-200 bg-white transition-transform duration-300 ease-out md:static md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center gap-3 border-b border-gray-100 px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-servi-green shadow-sm shadow-servi-green/20">
            <Shield size={18} className="text-white" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-servi-black">
              RAT
            </span>
            <span className="ml-1 text-xs font-medium text-servi-green">
              Servientrega
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="space-y-0.5 p-3">
          {visibleItems.map((item) => {
            const active = isActivePath(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsOpen(false)}
                className={clsx(
                  'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                  active
                    ? 'bg-servi-green/10 text-servi-green-dark'
                    : 'text-servi-gray-dark hover:bg-gray-50 hover:text-servi-black'
                )}
              >
                <item.icon
                  size={18}
                  className={clsx(
                    'transition-colors',
                    active
                      ? 'text-servi-green'
                      : 'text-servi-gray group-hover:text-servi-gray-dark'
                  )}
                />
                {item.label}
                {active && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-servi-green" />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-gray-100 p-4">
          <p className="text-xs text-gray-400">
            v1.0 — LOPDP Ecuador
          </p>
        </div>
      </aside>
    </>
  );
}
