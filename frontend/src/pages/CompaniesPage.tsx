import { useState } from 'react';
import { companyService } from '../services/company.service';
import { useAuthStore } from '../store/authStore';
import { useCrud } from '../hooks/crud';
import { DataTable, CrudModal, SearchBar } from '../components/crud';
import { Plus, Loader2, Check } from 'lucide-react';
import { clsx } from 'clsx';

interface CompanyForm {
  legalName: string;
  ruc: string;
  email: string;
  phone?: string;
  address?: string;
  sector?: string;
  isActive: boolean;
}

const emptyForm: CompanyForm = {
  legalName: '', ruc: '', email: '', phone: '', address: '', sector: '', isActive: true,
};

export function CompaniesPage() {
  const { user } = useAuthStore();
  const isSuperAdmin = user?.roleCode === 'SUPER_ADMIN';

  const [form, setForm] = useState<CompanyForm>(emptyForm);

  const crud = useCrud({
    queryKey: 'companies',
    getAll: () => companyService.getAll(),
    create: (dto: CompanyForm) => companyService.create(dto),
    update: (id: string, dto: Partial<CompanyForm>) => companyService.update(id, dto),
    toggleStatus: (id: string) => companyService.toggleStatus(id),
  });

  const openCreate = () => {
    crud.setEditingId(null);
    setForm(emptyForm);
    crud.resetFormError();
    crud.setModalOpen(true);
  };

  const openEdit = (c: any) => {
    crud.setEditingId(c.id);
    setForm({
      legalName: c.legalName || '', ruc: c.ruc || '', email: c.email || '',
      phone: c.phone || '', address: c.address || '', sector: c.sector || '', isActive: c.isActive,
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
    if (!form.legalName.trim()) { crud.setFormError('La razón social es obligatoria'); return; }
    if (!form.ruc.trim()) { crud.setFormError('El RUC es obligatorio'); return; }
    if (!form.email.trim()) { crud.setFormError('El correo es obligatorio'); return; }

    if (crud.editingId) {
      crud.updateItem(crud.editingId, form, closeModal);
    } else {
      crud.createItem(form, closeModal);
    }
  };

  const isSubmitting = crud.isCreating || crud.isUpdating;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold text-gray-900">Empresas</h2>
        {isSuperAdmin && (
          <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
            <Plus className="h-4 w-4" /> Nueva empresa
          </button>
        )}
      </div>

      <SearchBar value={crud.search} onChange={crud.setSearch} placeholder="Buscar empresas..." />

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <DataTable
          data={crud.filteredItems}
          isLoading={crud.isLoading}
          emptyMessage={crud.search ? 'No se encontraron resultados' : 'No hay empresas'}
          columns={[
            { key: 'legalName', header: 'Razón social' },
            { key: 'ruc', header: 'RUC' },
            { key: 'email', header: 'Correo' },
            { key: 'phone', header: 'Teléfono', render: (c) => c.phone || '-' },
            { key: 'status', header: 'Estado', render: (c) => (
              <span className={clsx('inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium', c.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>
                {c.isActive ? 'Activa' : 'Inactiva'}
              </span>
            )},
          ]}
          onEdit={isSuperAdmin ? openEdit : undefined}
          onToggle={isSuperAdmin ? (c) => crud.toggleItemStatus(c.id) : undefined}
          getItemStatus={(c) => c.isActive}
          isToggling={crud.isToggling}
          actions={isSuperAdmin ? ['edit', 'toggle'] : []}
        />
      </div>

      <CrudModal
        open={crud.modalOpen}
        onClose={closeModal}
        title={crud.editingId ? 'Editar empresa' : 'Nueva empresa'}
        error={crud.formError}
        onErrorDismiss={crud.resetFormError}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Razón social <span className="text-red-500">*</span></label>
              <input type="text" value={form.legalName} onChange={(e) => setForm({ ...form, legalName: e.target.value })} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">RUC <span className="text-red-500">*</span></label>
              <input type="text" value={form.ruc} onChange={(e) => setForm({ ...form, ruc: e.target.value })} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Correo <span className="text-red-500">*</span></label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Teléfono</label>
              <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Dirección</label>
            <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Sector</label>
            <input type="text" value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isActive" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="h-4 w-4 rounded border-gray-300 text-primary-600" />
            <label htmlFor="isActive" className="text-sm text-gray-700">Activa</label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={closeModal} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {crud.editingId ? 'Guardar cambios' : 'Crear empresa'}
            </button>
          </div>
        </form>
      </CrudModal>
    </div>
  );
}
