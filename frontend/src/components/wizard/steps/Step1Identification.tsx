import { useQuery } from '@tanstack/react-query';
import { companyService } from '../../../services/company.service';
import { areaService } from '../../../services/area.service';
import { processService } from '../../../services/process.service';
import { useAuthStore } from '../../../store/authStore';

interface Props {
  values: {
    companyId: string;
    areaId: string;
    processId: string;
    code: string;
    name: string;
    shortDescription?: string;
  };
  onChange: (values: Partial<Props['values']>) => void;
}

export function Step1Identification({ values, onChange }: Props) {
  const user = useAuthStore((s) => s.user);
  const { data: companies } = useQuery({
    queryKey: ['companies'],
    queryFn: () => companyService.getAll(),
  });
  const { data: areas } = useQuery({
    queryKey: ['areas', values.companyId],
    queryFn: () => areaService.getAll(values.companyId),
    enabled: !!values.companyId,
  });
  const { data: processes } = useQuery({
    queryKey: ['processes', values.areaId],
    queryFn: () => processService.getAll({ areaId: values.areaId }),
    enabled: !!values.areaId,
  });

  const filteredCompanies = user?.roleCode === 'SUPER_ADMIN'
    ? companies
    : companies?.filter((c) => c.id === user?.companyId);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Paso 1: Identificación</h3>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Empresa *</label>
          <select
            value={values.companyId}
            onChange={(e) => onChange({ companyId: e.target.value, areaId: '', processId: '' })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="">Seleccione...</option>
            {filteredCompanies?.map((c) => (
              <option key={c.id} value={c.id}>{c.legalName}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Área *</label>
          <select
            value={values.areaId}
            onChange={(e) => onChange({ areaId: e.target.value, processId: '' })}
            disabled={!values.companyId}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:bg-gray-100"
          >
            <option value="">Seleccione...</option>
            {areas?.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Proceso *</label>
          <select
            value={values.processId}
            onChange={(e) => onChange({ processId: e.target.value })}
            disabled={!values.areaId}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:bg-gray-100"
          >
            <option value="">Seleccione...</option>
            {processes?.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Código RAT *</label>
          <input
            type="text"
            value={values.code}
            onChange={(e) => onChange({ code: e.target.value })}
            placeholder="Ej: RAT-001"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Nombre del tratamiento *</label>
        <input
          type="text"
          value={values.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="Ej: Gestión de envíos - clientes"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Descripción breve</label>
        <textarea
          value={values.shortDescription || ''}
          onChange={(e) => onChange({ shortDescription: e.target.value })}
          rows={3}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
      </div>
    </div>
  );
}
