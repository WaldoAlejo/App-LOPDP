import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { processService } from '../services/process.service';
import { areaService } from '../services/area.service';
import { userService } from '../services/user.service';
import { useAuthStore } from '../store/authStore';
import { useCrud } from '../hooks/crud';
import { DataTable, CrudModal, SearchBar } from '../components/crud';
import { Plus, Loader2, Check } from 'lucide-react';
import { clsx } from 'clsx';

interface ProcessForm {
  name: string;
  description?: string;
  areaId: string;
  companyId: string;
  responsibleUserId?: string;
  criticality?: string;
  isActive: boolean;
}

const emptyForm: ProcessForm = {
  name: '', description: '', areaId: '', companyId: '', responsibleUserId: '', criticality: 'media', isActive: true,
};

export function ProcessesPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.roleCode === 'SUPER_ADMIN' || user?.roleCode === 'COMPANY_ADMIN' || user?.roleCode === 'DPO';

  const [form, setForm] = useState<ProcessForm>(emptyForm);

  const crud = useCrud({
    queryKey: 'processes',
    getAll: () => processService.getAll(),
    create: (dto: ProcessForm) => processService.create(dto),
    update: (id: string, dto: Partial<ProcessForm>) => processService.update(id, dto),
    toggleStatus: (id: string) => processService.toggleStatus(id),
  });

  const { data: areas } = useQuery({
    queryKey: ['areas'],
    queryFn: () => areaService.getAll(),
    enabled: isAdmin,
  });

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getAll(),
    enabled: isAdmin,
  });

  const openCreate = () => {
    crud.setEditingId(null);
    setForm({ ...emptyForm, companyId: user?.companyId || '' });
    crud.resetFormError();
    crud.setModalOpen(true);
  };

  const openEdit = (p: any) => {
    crud.setEditingId(p.id);
    setForm({
      name: p.name || '', description: p.description || '', areaId: p.areaId || '',
      companyId: p.companyId || '', responsibleUserId: p.responsibleUserId || '',
      criticality: p.criticality || 'media', isActive: p.isActive,
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
    if (!form.areaId) { crud.setFormError('El área es obligatoria'); return; }

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
        <h2 className="text-xl font-bold text-gray-900">Procesos</h2>
        {isAdmin && (
          <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
            <Plus className="h-4 w-4" /> Nuevo proceso
          </button>
        )}
      </div>

      <SearchBar value={crud.search} onChange={crud.setSearch} placeholder="Buscar procesos..." />

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <DataTable
          data={crud.filteredItems}
          isLoading={crud.isLoading}
          emptyMessage={crud.search ? 'No se encontraron resultados' : 'No hay procesos'}
          columns={[
            { key: 'name', header: 'Nombre' },
            { key: 'area', header: 'Área', render: (p) => p.area?.name || '-' },
            { key: 'responsible', header: 'Responsable', render: (p) => p.responsibleUserId || '-' },
            { key: 'criticality', header: 'Criticidad', render: (p) => (
              <span className={clsx('rounded-full px-2 py-0.5 text-xs font-medium',
                p.criticality === 'alta' ? 'bg-red-100 text-red-700' :
                p.criticality === 'media' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700')}>
                {p.criticality || 'media'}
              </span>
            )},
            { key: 'status', header: 'Estado', render: (p) => (
              <span className={clsx('inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium', p.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>
                {p.isActive ? 'Activo' : 'Inactivo'}
              </span>
            )},
          ]}
          onEdit={isAdmin ? openEdit : undefined}
          onToggle={isAdmin ? (p) => crud.toggleItemStatus(p.id) : undefined}
          getItemStatus={(p) => p.isActive}
          isToggling={crud.isToggling}
          actions={isAdmin ? ['edit', 'toggle'] : []}
        />
      </div>

      <CrudModal
        open={crud.modalOpen}
        onClose={closeModal}
        title={crud.editingId ? 'Editar proceso' : 'Nuevo proceso'}
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Área <span className="text-red-500">*</span></label>
              <select value={form.areaId} onChange={(e) => setForm({ ...form, areaId: e.target.value })} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" required>
                <option value="">Seleccionar área</option>
                {areas?.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Responsable</label>
              <select value={form.responsibleUserId} onChange={(e) => setForm({ ...form, responsibleUserId: e.target.value })} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500">
                <option value="">Sin responsable</option>
                {users?.map((u) => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Criticidad</label>
            <select value={form.criticality} onChange={(e) => setForm({ ...form, criticality: e.target.value })} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500">
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isActive" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="h-4 w-4 rounded border-gray-300 text-primary-600" />
            <label htmlFor="isActive" className="text-sm text-gray-700">Activo</label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={closeModal} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {crud.editingId ? 'Guardar cambios' : 'Crear proceso'}
            </button>
          </div>
        </form>
      </CrudModal>
    </div>
  );
}
