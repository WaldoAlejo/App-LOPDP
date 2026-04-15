import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { catalogService, type CatalogType } from '../services/catalog.service';
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

export function CatalogsPage() {
  const [activeTab, setActiveTab] = useState<CatalogType>('data-subject-types');

  const { data: items, isLoading } = useQuery({
    queryKey: ['catalogs', activeTab],
    queryFn: () => catalogService.getAll(activeTab),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Catálogos maestros</h2>
        <button className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
          Nuevo ítem
        </button>
      </div>

      <div className="flex flex-wrap gap-2 border-b pb-2">
        {catalogTabs.map((tab) => (
          <button
            key={tab.type}
            onClick={() => setActiveTab(tab.type)}
            className={clsx(
              'rounded-t-md px-3 py-2 text-sm font-medium transition-colors',
              activeTab === tab.type
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-600 hover:bg-gray-100'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Código</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Nombre</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Descripción</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              <tr><td colSpan={4} className="px-4 py-4 text-center text-sm text-gray-500">Cargando...</td></tr>
            ) : (
              items?.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.code || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{item.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.description || '-'}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${item.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {item.isActive !== false ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
