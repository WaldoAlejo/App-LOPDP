import { useQuery } from '@tanstack/react-query';
import { companyService } from '../../../services/company.service';
import { areaService } from '../../../services/area.service';
import { processService } from '../../../services/process.service';
import { userService } from '../../../services/user.service';
import { useAuthStore } from '../../../store/authStore';

interface Props {
  values: {
    companyId: string;
    areaId: string;
    processId: string;
    code: string;
    name: string;
    shortDescription?: string;
    treatmentResponsibleUserId?: string;
    dpoId?: string;
    dpoName?: string;
    dpoContactEmail?: string;
    dpoContactPhone?: string;
    jointControllerId?: string;
    jointControllerName?: string;
    jointControllerContact?: string;
  };
  onChange: (values: Partial<Props['values']>) => void;
  errors?: string[];
}

export function Step1Identification({ values, onChange, errors = [] }: Props) {
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
  const { data: users } = useQuery({
    queryKey: ['users', values.companyId],
    queryFn: () => userService.getAll({ companyId: values.companyId }),
    enabled: !!values.companyId,
  });

  const filteredCompanies = user?.roleCode === 'SUPER_ADMIN'
    ? companies
    : companies?.filter((c) => c.id === user?.companyId);

  const selectedCompany = companies?.find((c) => c.id === values.companyId);
  const hasError = (field: string) => errors.some((e) => e.toLowerCase().includes(field.toLowerCase()));

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Paso 1: Identificación del tratamiento</h3>
      <p className="text-sm text-gray-500">
        Art. 38 Reglamento LOPDP: Identificación del responsable, corresponsable (si lo hubiere) y delegado de protección de datos.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Empresa responsable *</label>
          <select
            value={values.companyId}
            onChange={(e) => onChange({ companyId: e.target.value, areaId: '', processId: '' })}
            className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${hasError('empresa') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'}`}
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
            className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1 disabled:bg-gray-100 ${hasError('área') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'}`}
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
            className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1 disabled:bg-gray-100 ${hasError('proceso') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'}`}
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
            className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${hasError('código') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'}`}
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
          className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${hasError('nombre') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'}`}
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

      {/* Datos de contacto del responsable */}
      {selectedCompany && (
        <div className="rounded-md bg-blue-50 p-4 text-sm">
          <p className="font-medium text-blue-900">Datos de contacto del responsable (Art. 38.1)</p>
          <div className="mt-2 grid gap-1 text-blue-800">
            <p><span className="font-medium">Razón social:</span> {selectedCompany.legalName}</p>
            <p><span className="font-medium">RUC:</span> {selectedCompany.ruc}</p>
            <p><span className="font-medium">Dirección:</span> {selectedCompany.address || 'No registrada'}</p>
            <p><span className="font-medium">Email:</span> {selectedCompany.email}</p>
            <p><span className="font-medium">Teléfono:</span> {selectedCompany.phone || 'No registrado'}</p>
          </div>
        </div>
      )}

      {/* Responsable del tratamiento */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Responsable operativo del tratamiento</label>
          <select
            value={values.treatmentResponsibleUserId || ''}
            onChange={(e) => onChange({ treatmentResponsibleUserId: e.target.value || undefined })}
            disabled={!values.companyId}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:bg-gray-100"
          >
            <option value="">Seleccione...</option>
            {users?.map((u) => (
              <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.email})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Delegado de Protección de Datos (DPO)</label>
          <select
            value={values.dpoId || ''}
            onChange={(e) => {
              const dpoId = e.target.value || undefined;
              const dpoUser = users?.find((u) => u.id === dpoId);
              onChange({
                dpoId,
                dpoName: dpoUser ? `${dpoUser.firstName} ${dpoUser.lastName}` : undefined,
                dpoContactEmail: dpoUser?.email,
                dpoContactPhone: dpoUser?.phone,
              });
            }}
            disabled={!values.companyId}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:bg-gray-100"
          >
            <option value="">Seleccione...</option>
            {users?.map((u) => (
              <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.email})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Datos de contacto del DPO (manual o autocompletado) */}
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Nombre del DPO</label>
          <input
            type="text"
            value={values.dpoName || ''}
            onChange={(e) => onChange({ dpoName: e.target.value })}
            placeholder="Nombre completo del DPO"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Email del DPO</label>
          <input
            type="email"
            value={values.dpoContactEmail || ''}
            onChange={(e) => onChange({ dpoContactEmail: e.target.value })}
            placeholder="dpo@empresa.com"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Teléfono del DPO</label>
          <input
            type="text"
            value={values.dpoContactPhone || ''}
            onChange={(e) => onChange({ dpoContactPhone: e.target.value })}
            placeholder="+593..."
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Corresponsable del tratamiento */}
      <div className="rounded-md border border-gray-200 p-4">
        <p className="mb-3 text-sm font-medium text-gray-700">Corresponsable del tratamiento (si aplica)</p>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Nombre del corresponsable</label>
            <input
              type="text"
              value={values.jointControllerName || ''}
              onChange={(e) => onChange({ jointControllerName: e.target.value })}
              placeholder="Ej: Otra empresa del grupo"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Datos de contacto del corresponsable</label>
            <input
              type="text"
              value={values.jointControllerContact || ''}
              onChange={(e) => onChange({ jointControllerContact: e.target.value })}
              placeholder="Email, teléfono, dirección"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
