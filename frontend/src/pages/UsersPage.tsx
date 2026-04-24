import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/user.service';
import { companyService } from '../services/company.service';
import { useAuthStore } from '../store/authStore';
import { Plus, Pencil, X, Check, Loader2, AlertTriangle, Search, ToggleLeft, ToggleRight } from 'lucide-react';
import { clsx } from 'clsx';

const ROLES = [
  { id: '7236ad2e-02b6-4270-a6c1-8060181034e3', code: 'PROCESS_LEADER', name: 'Líder de Proceso' },
  { id: '960e65f8-4cb8-4919-ac1f-cdb18965ecb3', code: 'SUPPORT', name: 'Colaborador de Apoyo' },
  { id: 'd5b23cae-0d0c-4991-9a3d-a07e3936add2', code: 'DPO', name: 'Delegado de Protección de Datos' },
  { id: 'bfad8f28-ee6a-4025-a93f-7dbc2194da42', code: 'LEGAL_REVIEWER', name: 'Revisor Jurídico' },
  { id: '40955f6e-ce7e-4eec-9094-8b72a4704206', code: 'AUDITOR', name: 'Auditor' },
  { id: 'f0704b72-d469-45cd-a771-dcc511882506', code: 'SECURITY_LEAD', name: 'Líder de Seguridad' },
  { id: 'aead770b-dabd-4a58-8f66-14deed2aa241', code: 'COMPANY_ADMIN', name: 'Administrador de Empresa' },
];

interface UserForm {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  roleId: string;
  companyId: string;
  position?: string;
  phone?: string;
  isActive: boolean;
}

const emptyForm: UserForm = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  roleId: '',
  companyId: '',
  position: '',
  phone: '',
  isActive: true,
};

export function UsersPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const isAdmin = user?.roleCode === 'SUPER_ADMIN' || user?.roleCode === 'COMPANY_ADMIN' || user?.roleCode === 'DPO';
  const isSuperAdmin = user?.roleCode === 'SUPER_ADMIN';

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getAll(),
  });

  const { data: companies } = useQuery({
    queryKey: ['companies'],
    queryFn: () => companyService.getAll(),
    enabled: isSuperAdmin,
  });

  const createMutation = useMutation({
    mutationFn: (dto: any) => userService.create(dto),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); closeModal(); },
    onError: (err: any) => setError(err.response?.data?.message || 'Error al crear'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<UserForm> }) => userService.update(id, dto),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); closeModal(); },
    onError: (err: any) => setError(err.response?.data?.message || 'Error al actualizar'),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => userService.toggleStatus(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  const filtered = users?.filter((u) =>
    u.firstName?.toLowerCase().includes(search.toLowerCase()) ||
    u.lastName?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.role?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, companyId: user?.companyId || '' });
    setError(null);
    setModalOpen(true);
  };

  const openEdit = (u: any) => {
    setEditingId(u.id);
    setForm({
      firstName: u.firstName || '',
      lastName: u.lastName || '',
      email: u.email || '',
      password: '',
      roleId: u.role?.id || '',
      companyId: u.companyId || '',
      position: u.position || '',
      phone: u.phone || '',
      isActive: u.isActive,
    });
    setError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.firstName.trim()) { setError('El nombre es obligatorio'); return; }
    if (!form.lastName.trim()) { setError('El apellido es obligatorio'); return; }
    if (!form.email.trim()) { setError('El correo es obligatorio'); return; }
    if (!form.roleId) { setError('El rol es obligatorio'); return; }
    if (!editingId && !form.password) { setError('La contraseña es obligatoria para nuevos usuarios'); return; }

    const dto: any = { ...form };
    if (editingId && !dto.password) delete dto.password;
    // El backend espera roleId, no roleCode
    delete dto.roleCode;

    if (editingId) {
      updateMutation.mutate({ id: editingId, dto });
    } else {
      if (!dto.password) { setError('La contraseña es obligatoria'); return; }
      createMutation.mutate(dto);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold text-gray-900">Usuarios</h2>
        {isAdmin && (
          <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
            <Plus className="h-4 w-4" /> Nuevo usuario
          </button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 sm:w-80" />
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Nombre</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Correo</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Rol</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Cargo</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Estado</th>
              {isAdmin && <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Acciones</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              <tr><td colSpan={isAdmin ? 6 : 5} className="px-4 py-8 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin" /></td></tr>
            ) : filtered?.length === 0 ? (
              <tr><td colSpan={isAdmin ? 6 : 5} className="px-4 py-8 text-center text-sm text-gray-500">{search ? 'No se encontraron resultados' : 'No hay usuarios'}</td></tr>
            ) : (
              filtered?.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{u.firstName} {u.lastName}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{u.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{u.role?.name || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{u.position || '-'}</td>
                  <td className="px-4 py-3 text-sm">
                    <button onClick={() => isAdmin && toggleMutation.mutate(u.id)} disabled={!isAdmin}
                      className={clsx('inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium', u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700', isAdmin && 'cursor-pointer hover:opacity-80')}>
                      {u.isActive ? <><ToggleRight className="h-3.5 w-3.5" /> Activo</> : <><ToggleLeft className="h-3.5 w-3.5" /> Inactivo</>}
                    </button>
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => openEdit(u)} className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-primary-600" title="Editar">
                        <Pencil className="h-4 w-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">{editingId ? 'Editar usuario' : 'Nuevo usuario'}</h3>
              <button onClick={closeModal} className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Nombre <span className="text-red-500">*</span></label>
                  <input type="text" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" required />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Apellido <span className="text-red-500">*</span></label>
                  <input type="text" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" required />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Correo <span className="text-red-500">*</span></label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" required />
              </div>
              {!editingId && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Contraseña <span className="text-red-500">*</span></label>
                  <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" required={!editingId} />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Rol <span className="text-red-500">*</span></label>
                  <select value={form.roleId} onChange={(e) => setForm({ ...form, roleId: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" required>
                    <option value="">Seleccionar rol</option>
                    {ROLES.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Cargo</label>
                  <input type="text" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Teléfono</label>
                  <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
                </div>
                {isSuperAdmin && (
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Empresa</label>
                    <select value={form.companyId} onChange={(e) => setForm({ ...form, companyId: e.target.value })}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500">
                      <option value="">Seleccionar empresa</option>
                      {companies?.map((c) => <option key={c.id} value={c.id}>{c.legalName}</option>)}
                    </select>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isActive" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="h-4 w-4 rounded border-gray-300 text-primary-600" />
                <label htmlFor="isActive" className="text-sm text-gray-700">Activo</label>
              </div>
              {error && <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700"><AlertTriangle className="h-4 w-4" />{error}</div>}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeModal} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  {editingId ? 'Guardar cambios' : 'Crear usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
