import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { catalogService, type CatalogType, type CatalogItem } from '../services/catalog.service';
import { useAuthStore } from '../store/authStore';
import { DataTable, CrudModal, SearchBar } from '../components/crud';
import { Plus, Loader2, Check } from 'lucide-react';
import { clsx } from 'clsx';

const catalogTabs: { type: CatalogType; label: string }[] = [
  { type: 'data-subject-types', label: 'Tipos de titulares' },
  { type: 'data-categories', label: 'Categorías de datos' },
  { type: 'data-items', label: 'Datos específicos' },
  { type: 'legal-bases', label: 'Bases legales' },
  { type: 'third-parties', label: 'Terceros' },
  { type: 'countries', label: 'Países' },
  { type: 'security-measures', label: 'Medidas de seguridad' },
  { type: 'retention-rules', label: 'Conservación' },
  { type: 'lifecycle-phases', label: 'Fases ciclo de vida' },
  { type: 'risks', label: 'Riesgos' },
];

const extraFields: Record<string, { key: string; label: string; type: 'text' | 'checkbox' | 'select' | 'number' }[]> = {
  'data-categories': [{ key: 'isSpecialCategory', label: 'Categoría especial', type: 'checkbox' }],
  'data-items': [
    { key: 'dataCategoryId', label: 'Categoría', type: 'text' },
    { key: 'isSensitive', label: 'Dato sensible', type: 'checkbox' },
  ],
  'legal-bases': [{ key: 'legalReference', label: 'Referencia legal', type: 'text' }],
  'security-measures': [{ key: 'category', label: 'Categoría', type: 'text' }],
  'retention-rules': [
    { key: 'defaultTerm', label: 'Término por defecto', type: 'text' },
    { key: 'legalReference', label: 'Referencia legal', type: 'text' },
  ],
  'lifecycle-phases': [{ key: 'orderIndex', label: 'Orden', type: 'number' }],
  'countries': [
    { key: 'isoCode', label: 'Código ISO', type: 'text' },
    { key: 'region', label: 'Región', type: 'text' },
  ],
  'risks': [
    { key: 'category', label: 'Categoría', type: 'text' },
    { key: 'severity', label: 'Severidad', type: 'text' },
  ],
  'third-parties': [
    { key: 'identificationNumber', label: 'RUC/Identificación', type: 'text' },
    { key: 'countryId', label: 'País', type: 'text' },
    { key: 'thirdPartyTypeId', label: 'Tipo de tercero', type: 'text' },
    { key: 'legalAddress', label: 'Dirección legal', type: 'text' },
    { key: 'contactName', label: 'Contacto', type: 'text' },
    { key: 'contactEmail', label: 'Email contacto', type: 'text' },
    { key: 'contactPhone', label: 'Teléfono contacto', type: 'text' },
    { key: 'actsAsProcessor', label: 'Encargado del tratamiento', type: 'checkbox' },
    { key: 'actsAsRecipient', label: 'Destinatario', type: 'checkbox' },
    { key: 'actsAsJointController', label: 'Corresponsable', type: 'checkbox' },
    { key: 'contractExists', label: 'Tiene contrato', type: 'checkbox' },
    { key: 'confidentialityAgreementExists', label: 'Tiene acuerdo de confidencialidad', type: 'checkbox' },
    { key: 'usesSubprocessors', label: 'Usa subencargados', type: 'checkbox' },
    { key: 'notes', label: 'Notas', type: 'text' },
  ],
};

export function CatalogsPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const isAdmin = user?.roleCode === 'SUPER_ADMIN' || user?.roleCode === 'COMPANY_ADMIN' || user?.roleCode === 'DPO';

  const [activeTab, setActiveTab] = useState<CatalogType>('data-subject-types');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
  const [form, setForm] = useState<Partial<CatalogItem>>({ isActive: true });
  const [error, setError] = useState<string | null>(null);

  const { data: items, isLoading } = useQuery({
    queryKey: ['catalogs', activeTab],
    queryFn: () => catalogService.getAll(activeTab),
  });

  const createMutation = useMutation({
    mutationFn: (dto: Partial<CatalogItem>) => catalogService.create(activeTab, dto),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['catalogs', activeTab] }); closeModal(); },
    onError: (err: any) => setError(err.response?.data?.message || 'Error al crear'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<CatalogItem> }) => catalogService.update(activeTab, id, dto),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['catalogs', activeTab] }); closeModal(); },
    onError: (err: any) => setError(err.response?.data?.message || 'Error al actualizar'),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => catalogService.toggleStatus(activeTab, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['catalogs', activeTab] }),
  });

  const filteredItems = items?.filter((item) => {
    const term = search.toLowerCase();
    return item.name?.toLowerCase().includes(term) || item.code?.toLowerCase().includes(term) || item.description?.toLowerCase().includes(term);
  });

  const openCreate = () => {
    setEditingItem(null);
    setForm({ isActive: true });
    setError(null);
    setModalOpen(true);
  };

  const openEdit = (item: CatalogItem) => {
    setEditingItem(item);
    setForm({ ...item });
    setError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingItem(null);
    setForm({ isActive: true });
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.name?.trim()) { setError('El nombre es obligatorio'); return; }
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, dto: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const fields = extraFields[activeTab] || [];
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleTabChange = (tab: CatalogType) => {
    setActiveTab(tab);
    setSearch('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold text-gray-900">Catálogos maestros</h2>
        {isAdmin && (
          <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
            <Plus className="h-4 w-4" /> Nuevo ítem
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1 border-b pb-2">
        {catalogTabs.map((tab) => (
          <button key={tab.type} onClick={() => handleTabChange(tab.type)}
            className={clsx('rounded-t-md px-3 py-2 text-sm font-medium transition-colors',
              activeTab === tab.type ? 'bg-primary-50 text-primary-700 border-b-2 border-primary-600' : 'text-gray-600 hover:bg-gray-100')}>
            {tab.label}
          </button>
        ))}
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Buscar ítems..." />

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <DataTable
          data={filteredItems}
          isLoading={isLoading}
          emptyMessage={search ? 'No se encontraron resultados' : 'No hay ítems en este catálogo'}
          columns={[
            { key: 'code', header: 'Código', render: (item) => item.code || '-' },
            { key: 'name', header: 'Nombre' },
            { key: 'description', header: 'Descripción', render: (item) => item.description || '-' },
            { key: 'status', header: 'Estado', render: (item) => (
              <span className={clsx('inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium',
                item.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>
                {item.isActive !== false ? 'Activo' : 'Inactivo'}
              </span>
            )},
          ]}
          onEdit={isAdmin ? openEdit : undefined}
          onToggle={isAdmin ? (item) => toggleMutation.mutate(item.id) : undefined}
          getItemStatus={(item) => item.isActive !== false}
          isToggling={toggleMutation.isPending}
          actions={isAdmin ? ['edit', 'toggle'] : []}
        />
      </div>

      <CrudModal
        open={modalOpen}
        onClose={closeModal}
        title={editingItem ? 'Editar ítem' : 'Nuevo ítem'}
        error={error}
        onErrorDismiss={() => setError(null)}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Código</label>
              <input type="text" value={form.code || ''} onChange={(e) => setForm({ ...form, code: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" placeholder="Código" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Nombre <span className="text-red-500">*</span></label>
              <input type="text" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" placeholder="Nombre" required />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Descripción</label>
            <textarea value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" placeholder="Descripción" rows={2} />
          </div>

          {fields.length > 0 && (
            <div className="rounded-md border border-gray-200 bg-gray-50 p-4 space-y-3">
              <p className="text-xs font-semibold uppercase text-gray-500">Campos adicionales</p>
              <div className="grid grid-cols-2 gap-3">
                {fields.map((field) => (
                  <div key={field.key} className={field.type === 'checkbox' ? 'flex items-center gap-2' : ''}>
                    {field.type === 'checkbox' ? (
                      <>
                        <input type="checkbox" id={field.key} checked={!!(form as Record<string, unknown>)[field.key]}
                          onChange={(e) => setForm({ ...form, [field.key]: e.target.checked })}
                          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                        <label htmlFor={field.key} className="text-sm text-gray-700">{field.label}</label>
                      </>
                    ) : (
                      <>
                        <label className="mb-1 block text-sm font-medium text-gray-700">{field.label}</label>
                        <input type={field.type === 'number' ? 'number' : 'text'}
                          value={((form as Record<string, unknown>)[field.key] as string | number) || ''}
                          onChange={(e) => setForm({ ...form, [field.key]: field.type === 'number' ? Number(e.target.value) : e.target.value })}
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <input type="checkbox" id="isActive" checked={form.isActive !== false}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
            <label htmlFor="isActive" className="text-sm text-gray-700">Activo</label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={closeModal} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {editingItem ? 'Guardar cambios' : 'Crear ítem'}
            </button>
          </div>
        </form>
      </CrudModal>
    </div>
  );
}
