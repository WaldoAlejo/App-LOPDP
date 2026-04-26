import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { areaService } from '../services/area.service';
import { companyService } from '../services/company.service';
import { useAuthStore } from '../store/authStore';
import { useCrud } from '../hooks/crud';
import { DataTable, CrudModal, SearchBar } from '../components/crud';
import { Plus, Loader2, Check } from 'lucide-react';
import { clsx } from 'clsx';

interface AreaForm {
  name: string;
  description?: string;
  companyId: string;
  isActive: boolean;
}

const emptyForm: AreaForm = {
  name: '', description: '', companyId: '', isActive: true,
};

export function AreasPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.roleCode === 'SUPER_ADMIN' || user?.roleCode === 'COMPANY_ADMIN' || user?.roleCode === 'DPO';
  const isSuperAdmin = user?.roleCode === 'SUPER_ADMIN';

  const [form, setForm] = useState<AreaForm>(emptyForm);

  const crud = useCrud({
    queryKey: 'areas',
    getAll: () => areaService.getAll(),
    create: (dto: AreaForm) => areaService.create(dto),
    update: (id: string, dto: Partial<AreaForm>) => areaService.update(id, dto),
    toggleStatus: (id: string) => areaService.toggleStatus(id),
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

  const openEdit = (a: any) => {
    crud.setEditingId(a.id);
    setForm({
      name: a.name || '', description: a.description || '', companyId: a.companyId || '', isActive: a.isActive,
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
    if (!form.name.trim()) { crud.setFormError('El nombre es obligatorio'); return; }
    if (!form.companyId) { crud.setFormError('La empresa es obligatoria'); return; }

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
        <h2 className="text-xl font-bold text-gray-900">Áreas</h2>
        {isAdmin && (
          <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
            <Plus className="h-4 w-4" /> Nueva área
          </button>
        )}
      </div>

      <SearchBar value={crud.search} onChange={crud.setSearch} placeholder="Buscar áreas..." />

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <DataTable
          data={crud.filteredItems}
          isLoading={crud.isLoading}
          emptyMessage={crud.search ? 'No se encontraron resultados' : 'No hay áreas'}
          columns={[
            { key: 'name', header: 'Nombre' },
            { key: 'company', header: 'Empresa', render: (a) => a.company?.legalName || '-' },
            { key: 'description', header: 'Descripción', render: (a) => a.description || '-' },
            { key: 'status', header: 'Estado', render: (a) => (
              <span className={clsx('inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium', a.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>
                {a.isActive ? 'Activa' : 'Inactiva'}
              </span>
            )},
          ]}
          onEdit={isAdmin ? openEdit : undefined}
          onToggle={isAdmin ? (a) => crud.toggleItemStatus(a.id) : undefined}
          getItemStatus={(a) => a.isActive}
          isToggling={crud.isToggling}
          actions={isAdmin ? ['edit', 'toggle'] : []}
        />
      </div>

      <CrudModal
        open={crud.modalOpen}
        onClose={closeModal}
        title={crud.editingId ? 'Editar área' : 'Nueva área'}
        error={crud.formError}
        onErrorDismiss={crud.resetFormError}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Nombre <span className="text-red-500">*</span></label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Descripción</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" rows={2} />
          </div>
          {isSuperAdmin && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Empresa <span className="text-red-500">*</span></label>
              <select value={form.companyId} onChange={(e) => setForm({ ...form, companyId: e.target.value })} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" required>
                <option value="">Seleccionar empresa</option>
                {companies?.map((c) => <option key={c.id} value={c.id}>{c.legalName}</option>)}
              </select>
            </div>
          )}
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isActive" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="h-4 w-4 rounded border-gray-300 text-primary-600" />
            <label htmlFor="isActive" className="text-sm text-gray-700">Activa</label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={closeModal} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {crud.editingId ? 'Guardar cambios' : 'Crear área'}
            </button>
          </div>
        </form>
      </CrudModal>
    </div>
  );
}
