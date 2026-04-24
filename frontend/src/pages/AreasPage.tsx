import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { areaService } from '../services/area.service';
import { companyService } from '../services/company.service';
import { useAuthStore } from '../store/authStore';
import { Plus, Pencil, X, Check, Loader2, AlertTriangle, Search, ToggleLeft, ToggleRight } from 'lucide-react';
import { clsx } from 'clsx';

interface AreaForm {
  name: string;
  description?: string;
  companyId: string;
  isActive: boolean;
}

const emptyForm: AreaForm = {
  name: '',
  description: '',
  companyId: '',
  isActive: true,
};

export function AreasPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const isAdmin = user?.roleCode === 'SUPER_ADMIN' || user?.roleCode === 'COMPANY_ADMIN' || user?.roleCode === 'DPO';

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AreaForm>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  const { data: areas, isLoading } = useQuery({
    queryKey: ['areas'],
    queryFn: () => areaService.getAll(),
  });

  const { data: companies } = useQuery({
    queryKey: ['companies'],
    queryFn: () => companyService.getAll(),
    enabled: isAdmin,
  });

  const createMutation = useMutation({
    mutationFn: (dto: AreaForm) => areaService.create(dto),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['areas'] }); closeModal(); },
    onError: (err: any) => setError(err.response?.data?.message || 'Error al crear'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<AreaForm> }) => areaService.update(id, dto),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['areas'] }); closeModal(); },
    onError: (err: any) => setError(err.response?.data?.message || 'Error al actualizar'),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => areaService.toggleStatus(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['areas'] }),
  });

  const filtered = areas?.filter((a) =>
    a.name?.toLowerCase().includes(search.toLowerCase()) ||
    a.company?.legalName?.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, companyId: user?.companyId || '' });
    setError(null);
    setModalOpen(true);
  };

  const openEdit = (area: any) => {
    setEditingId(area.id);
    setForm({
      name: area.name || '',
      description: area.description || '',
      companyId: area.companyId || '',
      isActive: area.isActive,
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
    if (!form.name.trim()) { setError('El nombre es obligatorio'); return; }
    if (!form.companyId) { setError('La empresa es obligatoria'); return; }

    if (editingId) {
      updateMutation.mutate({ id: editingId, dto: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

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
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Empresa</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Descripción</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Estado</th>
              {isAdmin && <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Acciones</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              <tr><td colSpan={isAdmin ? 5 : 4} className="px-4 py-8 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin" /></td></tr>
            ) : filtered?.length === 0 ? (
              <tr><td colSpan={isAdmin ? 5 : 4} className="px-4 py-8 text-center text-sm text-gray-500">{search ? 'No se encontraron resultados' : 'No hay áreas'}</td></tr>
            ) : (
              filtered?.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{a.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{a.company?.legalName || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{a.description || '-'}</td>
                  <td className="px-4 py-3 text-sm">
                    <button onClick={() => isAdmin && toggleMutation.mutate(a.id)} disabled={!isAdmin}
                      className={clsx('inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium', a.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700', isAdmin && 'cursor-pointer hover:opacity-80')}>
                      {a.isActive ? <><ToggleRight className="h-3.5 w-3.5" /> Activa</> : <><ToggleLeft className="h-3.5 w-3.5" /> Inactiva</>}
                    </button>
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => openEdit(a)} className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-primary-600" title="Editar">
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
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">{editingId ? 'Editar área' : 'Nueva área'}</h3>
              <button onClick={closeModal} className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Nombre <span className="text-red-500">*</span></label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Descripción</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" rows={2} />
              </div>
              {user?.roleCode === 'SUPER_ADMIN' && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Empresa <span className="text-red-500">*</span></label>
                  <select value={form.companyId} onChange={(e) => setForm({ ...form, companyId: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" required>
                    <option value="">Seleccionar empresa</option>
                    {companies?.map((c) => <option key={c.id} value={c.id}>{c.legalName}</option>)}
                  </select>
                </div>
              )}
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isActive" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="h-4 w-4 rounded border-gray-300 text-primary-600" />
                <label htmlFor="isActive" className="text-sm text-gray-700">Activa</label>
              </div>
              {error && <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700"><AlertTriangle className="h-4 w-4" />{error}</div>}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeModal} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  {editingId ? 'Guardar cambios' : 'Crear área'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
