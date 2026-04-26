import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { userService } from '../services/user.service';
import { companyService } from '../services/company.service';
import { useAuthStore } from '../store/authStore';
import { useCrud } from '../hooks/crud';
import { DataTable, CrudModal, SearchBar } from '../components/crud';
import { Plus, Loader2, Check } from 'lucide-react';
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
  password: string;
  roleId: string;
  companyId: string;
  position?: string;
  phone?: string;
  isActive: boolean;
}

const emptyForm: UserForm = {
  firstName: '', lastName: '', email: '', password: '',
  roleId: '', companyId: '', position: '', phone: '', isActive: true,
};

export function UsersPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.roleCode === 'SUPER_ADMIN' || user?.roleCode === 'COMPANY_ADMIN' || user?.roleCode === 'DPO';
  const isSuperAdmin = user?.roleCode === 'SUPER_ADMIN';

  const [form, setForm] = useState<UserForm>(emptyForm);

  const crud = useCrud({
    queryKey: 'users',
    getAll: () => userService.getAll(),
    create: (dto: UserForm) => userService.create(dto),
    update: (id: string, dto: Partial<UserForm>) => userService.update(id, dto),
    toggleStatus: (id: string) => userService.toggleStatus(id),
  });

  const { data: companies } = useQuery({
    queryKey: ['companies'],
    queryFn: () => companyService.getAll(),
    enabled: isSuperAdmin,
  });

  const openCreate = () => {
    crud.setEditingId(null);
    setForm({ ...emptyForm, companyId: user?.companyId || '' });
    crud.resetFormError();
    crud.setModalOpen(true);
  };

  const openEdit = (u: any) => {
    crud.setEditingId(u.id);
    setForm({
      firstName: u.firstName || '', lastName: u.lastName || '',
      email: u.email || '', password: '',
      roleId: u.role?.id || '', companyId: u.companyId || '',
      position: u.position || '', phone: u.phone || '', isActive: u.isActive,
    });
    crud.resetFormError();
    crud.setModalOpen(true);
  };

  const closeModal = () => {
    crud.setModalOpen(false);
    crud.setEditingId(null);
    setForm(emptyForm);
    crud.resetFormError();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    crud.resetFormError();

    if (!form.firstName.trim()) { crud.setFormError('El nombre es obligatorio'); return; }
    if (!form.lastName.trim()) { crud.setFormError('El apellido es obligatorio'); return; }
    if (!form.email.trim()) { crud.setFormError('El correo es obligatorio'); return; }
    if (!form.roleId) { crud.setFormError('El rol es obligatorio'); return; }
    if (!crud.editingId && !form.password) { crud.setFormError('La contraseña es obligatoria para nuevos usuarios'); return; }

    const dto: any = { ...form };
    if (crud.editingId && !dto.password) delete dto.password;

    if (crud.editingId) {
      crud.updateItem(crud.editingId, dto, closeModal);
    } else {
      crud.createItem(dto, closeModal);
    }
  };

  const isSubmitting = crud.isCreating || crud.isUpdating;

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

      <SearchBar value={crud.search} onChange={crud.setSearch} placeholder="Buscar usuarios..." />

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <DataTable
          data={crud.filteredItems}
          isLoading={crud.isLoading}
          emptyMessage={crud.search ? 'No se encontraron resultados' : 'No hay usuarios'}
          columns={[
            { key: 'name', header: 'Nombre', render: (u) => `${u.firstName} ${u.lastName}` },
            { key: 'email', header: 'Correo' },
            { key: 'role', header: 'Rol', render: (u) => u.role?.name || '-' },
            { key: 'position', header: 'Cargo', render: (u) => u.position || '-' },
            { key: 'status', header: 'Estado', render: (u) => (
              <span className={clsx('inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium', u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>
                {u.isActive ? 'Activo' : 'Inactivo'}
              </span>
            )},
          ]}
          onEdit={isAdmin ? openEdit : undefined}
          onToggle={isAdmin ? (u) => crud.toggleItemStatus(u.id) : undefined}
          getItemStatus={(u) => u.isActive}
          isToggling={crud.isToggling}
          actions={isAdmin ? ['edit', 'toggle'] : []}
        />
      </div>

      <CrudModal
        open={crud.modalOpen}
        onClose={closeModal}
        title={crud.editingId ? 'Editar usuario' : 'Nuevo usuario'}
        error={crud.formError}
        onErrorDismiss={crud.resetFormError}
      >
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
          {!crud.editingId && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Contraseña <span className="text-red-500">*</span></label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" required={!crud.editingId} />
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Rol <span className="text-red-500">*</span></label>
              <select value={form.roleId} onChange={(e) => setForm({ ...form, roleId: e.target.value })} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" required>
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
                <select value={form.companyId} onChange={(e) => setForm({ ...form, companyId: e.target.value })} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500">
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
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={closeModal} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {crud.editingId ? 'Guardar cambios' : 'Crear usuario'}
            </button>
          </div>
        </form>
      </CrudModal>
    </div>
  );
}
