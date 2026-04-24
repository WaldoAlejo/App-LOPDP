import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { companyService } from '../../../services/company.service';
import { areaService } from '../../../services/area.service';
import { processService } from '../../../services/process.service';
import { userService } from '../../../services/user.service';
import { useAuthStore } from '../../../store/authStore';
import { HelpCircle } from 'lucide-react';

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
  generatedCode?: string;
  isGeneratingCode?: boolean;
  errors?: string[];
}

function HelpTooltip({ text }: { text: string }) {
  return (
    <div className="group relative inline-block ml-1">
      <HelpCircle size={14} className="text-gray-400 cursor-help" />
      <div className="absolute bottom-full left-1/2 z-10 mb-2 hidden w-64 -translate-x-1/2 rounded-lg bg-gray-800 px-3 py-2 text-xs text-white shadow-lg group-hover:block">
        {text}
        <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
      </div>
    </div>
  );
}

export function Step1Identification({ values, onChange, generatedCode, isGeneratingCode = false, errors = [] }: Props) {
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (generatedCode && generatedCode !== values.code) {
      onChange({ code: generatedCode });
    }
  }, [generatedCode, values.code, onChange]);

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
  const dpoUsers = users?.filter((u) => u.role?.code === 'DPO') || [];

  const selectedCompany = companies?.find((c) => c.id === values.companyId);
  const hasError = (field: string) => errors.some((e) => e.toLowerCase().includes(field.toLowerCase()));
  const lockAreaSelection = user?.roleCode === 'PROCESS_LEADER' && !!values.areaId;
  const lockProcessSelection = user?.roleCode === 'PROCESS_LEADER' && !!values.processId;

  return (
    <div className="space-y-5">
      {/* Título con explicación simple */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Paso 1: ¿Quién es responsable de este tratamiento?</h3>
        <p className="mt-1 text-sm text-gray-500">
          Aquí identificamos quién está a cargo de los datos personales. Es como ponerle un nombre y dirección a la persona que cuida la información.
        </p>
      </div>

      {/* Info box explicativo */}
      <div className="rounded-lg bg-blue-50 border border-blue-100 p-4">
        <p className="text-sm text-blue-800">
          <strong>¿Qué es un "tratamiento"?</strong> Es cualquier cosa que hacemos con datos personales: guardarlos, usarlos, compartirlos, etc. 
          Por ejemplo: "Guardar los datos de los clientes para enviarles sus pedidos".
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Empresa responsable *
            <HelpTooltip text="La empresa que decide qué hacer con los datos personales. Es como el dueño de la información." />
          </label>
          <select
            value={values.companyId}
            onChange={(e) => onChange({
              companyId: e.target.value,
              areaId: '',
              processId: '',
              treatmentResponsibleUserId: undefined,
              dpoId: undefined,
              dpoName: undefined,
              dpoContactEmail: undefined,
              dpoContactPhone: undefined,
            })}
            disabled={user?.roleCode !== 'SUPER_ADMIN'}
            className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${hasError('empresa') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'}`}
          >
            <option value="">Seleccione la empresa...</option>
            {filteredCompanies?.map((c) => (
              <option key={c.id} value={c.id}>{c.legalName}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Área *
            <HelpTooltip text="El departamento o área de la empresa que usa estos datos. Ejemplo: Ventas, Logística, Recursos Humanos." />
          </label>
          <select
            value={values.areaId}
            onChange={(e) => onChange({ areaId: e.target.value, processId: '' })}
            disabled={!values.companyId || lockAreaSelection}
            className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1 disabled:bg-gray-100 ${hasError('área') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'}`}
          >
            <option value="">Seleccione el área...</option>
            {areas?.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Proceso *
            <HelpTooltip text="La actividad específica dentro del área. Ejemplo: Si el área es Ventas, el proceso puede ser 'Atención al cliente'." />
          </label>
          <select
            value={values.processId}
            onChange={(e) => onChange({ processId: e.target.value })}
            disabled={!values.areaId || lockProcessSelection}
            className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1 disabled:bg-gray-100 ${hasError('proceso') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'}`}
          >
            <option value="">Seleccione el proceso...</option>
            {processes?.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Código RAT *
            <HelpTooltip text="Un código único que identifica este tratamiento. Se genera automáticamente como una placa de carro para el tratamiento." />
          </label>
          <div className={`rounded-md border px-3 py-2 text-sm ${hasError('código') ? 'border-red-500' : 'border-gray-300'} bg-gray-50 text-gray-800`}>
            {isGeneratingCode ? 'Generando código...' : (generatedCode || values.code || 'Seleccione área y proceso para generar el código')}
          </div>
          <p className="mt-1 text-xs text-gray-500">Formato automático: RAT-AREA-PROC-001</p>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Nombre del tratamiento *
          <HelpTooltip text="Un nombre claro y corto que describa qué hacemos con los datos. Ejemplo: 'Gestión de envíos a clientes'." />
        </label>
        <input
          type="text"
          value={values.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="Ej: Gestión de envíos - clientes"
          className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${hasError('nombre') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'}`}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Descripción breve
          <HelpTooltip text="Una explicación corta de qué hacemos con los datos y por qué. Piensa en explicárselo a alguien que no sabe nada del tema." />
        </label>
        <textarea
          value={values.shortDescription || ''}
          onChange={(e) => onChange({ shortDescription: e.target.value })}
          rows={3}
          placeholder="Ej: Guardamos los datos de los clientes (nombre, dirección, teléfono) para poder entregarles sus pedidos de forma correcta."
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
      </div>

      {/* Datos de contacto del responsable */}
      {selectedCompany && (
        <div className="rounded-md bg-green-50 border border-green-100 p-4">
          <p className="font-medium text-green-900">📋 Datos de contacto del responsable del tratamiento</p>
          <p className="mt-1 text-xs text-green-700">Estos datos se llenan automáticamente de la empresa seleccionada.</p>
          <div className="mt-2 grid gap-1 text-sm text-green-800">
            <p><span className="font-medium">Razón social:</span> {selectedCompany.legalName}</p>
            <p><span className="font-medium">RUC:</span> {selectedCompany.ruc}</p>
            <p><span className="font-medium">Dirección:</span> {selectedCompany.address || 'No registrada'}</p>
            <p><span className="font-medium">Email:</span> {selectedCompany.email}</p>
            <p><span className="font-medium">Teléfono:</span> {selectedCompany.phone || 'No registrado'}</p>
          </div>
        </div>
      )}

      {/* Responsable del tratamiento */}
      <div className="rounded-lg border border-gray-200 p-4">
        <p className="mb-3 text-sm font-semibold text-gray-800">👤 Personas responsables del tratamiento</p>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Responsable operativo
              <HelpTooltip text="La persona del día a día que se encarga de este tratamiento. Es quien usa los datos regularmente." />
            </label>
            <select
              value={values.treatmentResponsibleUserId || ''}
              onChange={(e) => onChange({ treatmentResponsibleUserId: e.target.value || undefined })}
              disabled={!values.companyId}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:bg-gray-100"
            >
              <option value="">Seleccione una persona...</option>
              {users?.map((u) => (
                <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.email})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Delegado de Protección de Datos (DPO)
              <HelpTooltip text="El experto en protección de datos de la empresa. Es como el 'policía' de los datos personales que se asegura de que todo esté bien." />
            </label>
            <select
              value={values.dpoId || ''}
              onChange={(e) => {
                const dpoId = e.target.value || undefined;
                const dpoUser = dpoUsers.find((u) => u.id === dpoId);
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
              <option value="">Seleccione el DPO...</option>
              {dpoUsers.map((u) => (
                <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.email})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Datos de contacto del DPO */}
        {values.dpoId && (
          <div className="mt-3 grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Nombre del DPO</label>
              <input type="text" value={values.dpoName || ''} readOnly className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600 cursor-not-allowed" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Email del DPO</label>
              <input type="email" value={values.dpoContactEmail || ''} readOnly className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600 cursor-not-allowed" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Teléfono del DPO</label>
              <input type="text" value={values.dpoContactPhone || ''} readOnly className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600 cursor-not-allowed" />
            </div>
          </div>
        )}
      </div>

      {/* Corresponsable del tratamiento - AHORA CON SELECTOR DE USUARIO */}
      <div className="rounded-lg border border-gray-200 p-4">
        <p className="mb-1 text-sm font-semibold text-gray-800">🤝 Corresponsable del tratamiento (si aplica)</p>
        <p className="mb-3 text-xs text-gray-500">
          El corresponsable es otra empresa o persona que también decide qué hacer con estos datos. 
          Es como cuando dos personas son dueñas de algo juntas.
        </p>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Seleccionar corresponsable
              <HelpTooltip text="Si otra empresa o persona dentro de la organización también es responsable de estos datos, selecciónela aquí. Sus datos de contacto se llenarán automáticamente." />
            </label>
            <select
              value={values.jointControllerId || ''}
              onChange={(e) => {
                const jointControllerId = e.target.value || undefined;
                const jointUser = users?.find((u) => u.id === jointControllerId);
                onChange({
                  jointControllerId,
                  jointControllerName: jointUser ? `${jointUser.firstName} ${jointUser.lastName}` : undefined,
                  jointControllerContact: jointUser 
                    ? `Email: ${jointUser.email}${jointUser.phone ? `, Tel: ${jointUser.phone}` : ''}` 
                    : undefined,
                });
              }}
              disabled={!values.companyId}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:bg-gray-100"
            >
              <option value="">No aplica / Seleccione...</option>
              {users?.map((u) => (
                <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.email})</option>
              ))}
            </select>
          </div>
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
        </div>
        <div className="mt-3">
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
  );
}
