import { useState } from 'react';
import {
  Menu,
  X,
  LayoutDashboard,
  Settings,
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
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { clsx } from 'clsx';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/treatments', icon: FileText, label: 'Tratamientos' },
  { to: '/reviews', icon: Gavel, label: 'Revisión DPO' },
  { to: '/risks', icon: AlertTriangle, label: 'Riesgos / EIPD' },
  { to: '/reports', icon: BarChart3, label: 'Reportes' },
  { to: '/audits', icon: ClipboardList, label: 'Auditoría' },
  { to: '/companies', icon: Building2, label: 'Empresas' },
  { to: '/areas', icon: FolderTree, label: 'Áreas' },
  { to: '/processes', icon: GitBranch, label: 'Procesos' },
  { to: '/users', icon: Users, label: 'Usuarios' },
  { to: '/catalogs', icon: Library, label: 'Catálogos' },
  { to: '/settings', icon: Settings, label: 'Configuración' },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-4 top-4 z-50 rounded-md bg-primary-600 p-2 text-white md:hidden"
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-40 w-64 transform bg-white shadow-lg transition-transform duration-200 md:static md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center border-b px-6">
          <span className="text-lg font-bold text-primary-700">RAT Servientrega</span>
        </div>
        <nav className="space-y-1 p-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100'
                )
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
