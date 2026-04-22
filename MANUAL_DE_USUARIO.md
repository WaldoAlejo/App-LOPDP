# Manual de Usuario - RAT Servientrega

## Registro de Actividades de Tratamiento (RAT)

**Versión:** 1.0  
**Fecha:** Abril 2026  
**Empresa:** Servientrega Ecuador S.A.

---

## 📋 Índice

1. [Introducción](#introducción)
2. [Acceso al Sistema](#acceso-al-sistema)
3. [Primer Inicio de Sesión](#primer-inicio-de-sesión)
4. [Navegación Principal](#navegación-principal)
5. [Dashboard](#dashboard)
6. [Tratamientos](#tratamientos)
7. [Revisión y Aprobación](#revisión-y-aprobación)
8. [Riesgos](#riesgos)
9. [Reportes](#reportes)
10. [Auditoría](#auditoría)
11. [Preguntas Frecuentes](#preguntas-frecuentes)

---

## Introducción

El **Registro de Actividades de Tratamiento (RAT)** es el sistema oficial de Servientrega Ecuador para cumplir con la Ley Orgánica de Protección de Datos Personales (LOPDP) del Ecuador.

### ¿Qué es el RAT?

El RAT es un registro obligatorio que documenta cómo Servientrega trata los datos personales de clientes, empleados y terceros. Cada área de la empresa debe registrar sus actividades de tratamiento de datos.

### Objetivos del Sistema

- Cumplir con la normativa ecuatoriana de protección de datos
- Centralizar el registro de actividades de tratamiento
- Facilitar la gestión de riesgos de privacidad
- Generar reportes para auditorías y la Autoridad de Control

---

## Acceso al Sistema

### URL de Acceso

```
http://35.222.179.61
```

> **Nota:** Próximamente estará disponible con dominio propio.

### Credenciales de Acceso

Cada usuario recibe sus credenciales por correo electrónico corporativo:

- **Usuario:** Su correo electrónico de Servientrega (ej: `nombre.apellido@servientrega.com.ec`)
- **Contraseña temporal:** `Servientrega2024!`

### Requisitos Técnicos

- Navegador web actualizado (Chrome, Firefox, Edge, Safari)
- Conexión a Internet
- Resolución mínima de pantalla: 1280x720

---

## Primer Inicio de Sesión

### Paso 1: Ingresar al Sistema

1. Abra su navegador y vaya a: `http://35.222.179.61`
2. Ingrese su **correo electrónico** en el campo correspondiente
3. Ingrese la **contraseña temporal**: `Servientrega2024!`
4. Haga clic en **"Ingresar al sistema"**

![Pantalla de Login](assets/login-screen.png)

### Paso 2: Cambio de Contraseña Obligatorio

**Por seguridad, el sistema exige cambiar la contraseña en el primer ingreso.**

Aparecerá automáticamente una ventana de **"Cambio de contraseña obligatorio"**:

1. **Contraseña actual:** Ingrese `Servientrega2024!`
2. **Nueva contraseña:** Cree una contraseña segura
3. **Confirmar nueva contraseña:** Repita la nueva contraseña

### Requisitos de la Nueva Contraseña

Su contraseña debe cumplir con:

| Requisito | Ejemplo |
|-----------|---------|
| Mínimo 8 caracteres | ✅ `Pass123!` |
| Al menos una mayúscula | ✅ `Password1!` |
| Al menos una minúscula | ✅ `PASSWORD1!` ❌ |
| Al menos un número | ✅ `Password!` ❌ |
| Al menos un símbolo | ✅ `Password1` ❌ |
| No puede ser igual a la anterior | ✅ |

**Ejemplo de contraseña válida:** `Servientrega2025#`

### Paso 3: Confirmar Cambio

- Haga clic en **"Cambiar contraseña"**
- Si todos los requisitos están en verde ✅, la contraseña se guardará
- Será redirigido automáticamente al **Dashboard**

> **Importante:** Guarde su nueva contraseña en un lugar seguro. No la comparta con nadie.

---

## Navegación Principal

### Menú Lateral (Sidebar)

El menú lateral izquierdo contiene todas las opciones del sistema:

```
📊 Dashboard          → Resumen general
📋 Tratamientos       → Gestionar actividades de tratamiento
✅ Revisión           → Revisar y aprobar tratamientos
⚠️ Riesgos            → Evaluar riesgos de privacidad
📈 Reportes           → Generar reportes RAT
🔍 Auditoría          → Ver historial de auditoría
```

> **Nota:** Algunas opciones pueden estar restringidas según su rol.

### Barra Superior (Topbar)

- **Nombre de la empresa:** Servientrega Ecuador S.A.
- **Usuario activo:** Muestra su nombre y rol
- **Cerrar sesión:** Botón para salir del sistema

### Cerrar Sesión

Para salir del sistema de forma segura:

1. Haga clic en su nombre en la barra superior
2. Seleccione **"Cerrar sesión"**
3. Será redirigido a la pantalla de login

> **Recomendación:** Siempre cierre sesión cuando termine de usar el sistema, especialmente en computadoras compartidas.

---

## Dashboard

El Dashboard es la pantalla principal que muestra un resumen visual del estado del RAT.

### Elementos del Dashboard

#### 1. Tarjetas de Resumen (KPIs)

| Indicador | Descripción |
|-----------|-------------|
| **Total Tratamientos** | Cantidad total de actividades registradas |
| **Pendientes** | Tratamientos en estado borrador |
| **En Revisión** | Tratamientos enviados a revisión |
| **Aprobados** | Tratamientos aprobados y activos |
| **Rechazados** | Tratamientos que requieren correcciones |

#### 2. Gráfico de Estado

Muestra la distribución de tratamientos por estado en formato de pastel o barras.

#### 3. Actividad Reciente

Lista los últimos tratamientos modificados o creados.

#### 4. Tratamientos por Área

Muestra cuántos tratamientos tiene cada área de la empresa.

### Acciones desde el Dashboard

- Haga clic en cualquier número para ver el detalle
- Use los filtros para ver datos específicos
- Exporte los datos si tiene permisos

---

## Tratamientos

Los **Tratamientos** son el núcleo del sistema. Cada tratamiento representa una actividad donde Servientrega procesa datos personales.

### ¿Qué es un Tratamiento?

Un tratamiento documenta:
- **Qué datos** se procesan (nombre, cédula, teléfono, etc.)
- **Para qué** se usan (facturación, envíos, nómina, etc.)
- **Quién** es responsable
- **Cómo** se protegen esos datos

### Lista de Tratamientos

#### Vista Principal

Muestra todos los tratamientos con:
- **Código RAT:** Identificador único (ej: `RAT-ME-AD-001`)
- **Nombre:** Descripción del tratamiento
- **Área:** Departamento responsable
- **Estado:** Borrador, En Revisión, Aprobado, Rechazado
- **Fecha:** Última modificación

#### Filtros y Búsqueda

- **Buscar:** Escriba palabras clave en la barra de búsqueda
- **Filtrar por estado:** Use los botones de filtro (Todos, Borrador, En Revisión, Aprobado)
- **Filtrar por área:** Seleccione un área específica

#### Estados de Color

| Estado | Color | Significado |
|--------|-------|-------------|
| Borrador | ⚪ Gris | En construcción, no visible para revisores |
| En Revisión | 🟡 Amarillo | Enviado para aprobación del DPO |
| Aprobado | 🟢 Verde | Activo y cumple con la normativa |
| Rechazado | 🔴 Rojo | Requiere correcciones |

### Crear Nuevo Tratamiento

#### Paso 1: Iniciar Creación

1. Vaya a **Tratamientos** en el menú lateral
2. Haga clic en el botón **"Nuevo Tratamiento"**
3. Se abrirá el asistente de creación

#### Paso 2: Completar el Formulario

El formulario tiene varias secciones:

**Sección 1: Información General**
- **Nombre del tratamiento:** Describa claramente la actividad
  - ✅ Ejemplo: "Registro de clientes para servicio de mensajería"
  - ❌ Ejemplo: "Clientes" (muy vago)
- **Área responsable:** Seleccione su área del listado
- **Proceso:** Seleccione el proceso macro
- **Responsable:** Persona encargada del tratamiento

**Sección 2: Datos Personales**
- **Categorías de datos:** Seleccione qué tipo de datos se procesan
  - Datos de identidad (nombre, cédula)
  - Datos de contacto (teléfono, email, dirección)
  - Datos financieros (cuentas bancarias)
  - Datos laborales (cargo, salario)
- **Datos sensibles:** Marque si aplica (salud, creencias, etc.)

**Sección 3: Finalidad y Base Legal**
- **Finalidad:** ¿Para qué se usan los datos?
  - ✅ Ejemplo: "Gestionar el envío de paquetes y notificar al destinatario"
- **Base legal:** Fundamento para el tratamiento
  - Ejecución de contrato
  - Consentimiento del titular
  - Obligación legal
  - Interés legítimo

**Sección 4: Transferencias**
- **¿Se transfieren datos?** Sí / No
- **¿A qué países?** Si aplica, seleccione los países
- **¿Con quién se comparten?** Proveedores, aliados, etc.

**Sección 5: Medidas de Seguridad**
- Seleccione las medidas implementadas:
  - Encriptación de datos
  - Control de acceso
  - Auditorías periódicas
  - Capacitación del personal

#### Paso 3: Guardar

- **Guardar como borrador:** Para continuar después
- **Enviar a revisión:** Cuando esté completo

> **Importante:** No puede editar un tratamiento después de enviarlo a revisión. Debe esperar a que sea aprobado o rechazado.

### Editar un Tratamiento

1. Busque el tratamiento en la lista
2. Haga clic en el botón **"Editar"** (✏️)
3. Modifique los campos necesarios
4. Guarde los cambios

> **Restricción:** Solo puede editar tratamientos en estado "Borrador" o "Rechazado".

### Ver Detalle de un Tratamiento

Haga clic en el nombre del tratamiento para ver:
- Toda la información completa
- Historial de versiones
- Observaciones del revisor
- Estado actual

---

## Revisión y Aprobación

### Proceso de Revisión

Todos los tratamientos deben ser revisados y aprobados por el **Delegado de Protección de Datos (DPO)** antes de estar activos.

#### Flujo de Estados

```
Borrador → En Revisión → [Aprobado / Rechazado]
```

### Para el Creador del Tratamiento

#### Enviar a Revisión

1. Abra el tratamiento en estado "Borrador"
2. Verifique que toda la información esté completa
3. Haga clic en **"Enviar a Revisión"**
4. Confirme la acción

#### Recibir Aprobación

- Recibirá una notificación cuando el DPO apruebe
- El tratamiento pasará a estado "Aprobado"
- Aparecerá en los reportes oficiales

#### Recibir Rechazo

- Recibirá una notificación con las observaciones
- El tratamiento pasará a estado "Rechazado"
- Podrá editarlo y reenviarlo

### Para el Revisor (DPO)

#### Revisar Tratamientos Pendientes

1. Vaya a **Revisión** en el menú lateral
2. Verá la lista de tratamientos "En Revisión"
3. Haga clic en **"Revisar"** para ver el detalle

#### Acciones de Revisión

| Acción | Resultado |
|--------|-----------|
| **Aprobar** | El tratamiento queda activo |
| **Rechazar** | Se solicitan correcciones |
| **Solicitar información** | Se piden datos adicionales |

#### Agregar Observaciones

Al rechazar, debe indicar:
- Qué información falta
- Qué debe corregirse
- Sugerencias de mejora

---

## Riesgos

### Evaluación de Riesgos de Privacidad

Cada tratamiento debe tener una evaluación de riesgos que determine el nivel de impacto si los datos se ven comprometidos.

#### Niveles de Riesgo

| Nivel | Color | Descripción |
|-------|-------|-------------|
| **Bajo** | 🟢 Verde | Impacto mínimo, medidas básicas suficientes |
| **Medio** | 🟡 Amarillo | Impacto moderado, requiere controles adicionales |
| **Alto** | 🔴 Rojo | Impacto severo, requiere medidas extraordinarias |

#### Factores de Evaluación

- **Cantidad de datos:** ¿Cuántas personas afecta?
- **Sensibilidad:** ¿Son datos sensibles?
- **Transferencias:** ¿Salen del país?
- **Terceros:** ¿Comparten con externos?

### Acciones según el Riesgo

| Riesgo | Acción Requerida |
|--------|------------------|
| Bajo | Documentar y monitorear |
| Medio | Implementar controles adicionales |
| Alto | Revisar con el DPO y aprobar medidas extraordinarias |

---

## Reportes

### Reportes Disponibles

#### 1. RAT Maestro (Excel)

Exporta todos los tratamientos aprobados en formato Excel para:
- Auditorías internas
- Presentación a la Autoridad de Control
- Análisis de cumplimiento

**Columnas incluidas:**
- Código RAT
- Nombre del tratamiento
- Área responsable
- Estado
- Fecha de aprobación
- Datos tratados
- Finalidad
- Base legal

#### 2. RAT Maestro (PDF)

Genera un documento PDF formal con:
- Portada institucional
- Índice de tratamientos
- Detalle de cada tratamiento
- Firmas digitales

#### 3. KPIs y Estadísticas

Muestra indicadores clave:
- Tratamientos por área
- Tratamientos por estado
- Tiempo promedio de aprobación
- Cumplimiento por departamento

### Generar un Reporte

1. Vaya a **Reportes** en el menú lateral
2. Seleccione el tipo de reporte
3. Aplique filtros si es necesario (por fecha, área, estado)
4. Haga clic en **"Generar"**
5. Descargue el archivo

---

## Auditoría

### Registro de Actividades

El sistema guarda automáticamente un historial de:

| Acción | Descripción |
|--------|-------------|
| **LOGIN_SUCCESS** | Inicio de sesión exitoso |
| **LOGOUT** | Cierre de sesión |
| **CREATE** | Creación de un tratamiento |
| **UPDATE** | Modificación de un tratamiento |
| **DELETE** | Eliminación de un tratamiento |
| **SUBMIT_REVIEW** | Envío a revisión |
| **APPROVE** | Aprobación de tratamiento |
| **REJECT** | Rechazo de tratamiento |
| **CHANGE_PASSWORD** | Cambio de contraseña |

### Consultar Auditoría

1. Vaya a **Auditoría** en el menú lateral
2. Use los filtros para buscar eventos específicos:
   - Por fecha
   - Por usuario
   - Por tipo de acción
   - Por entidad (tratamiento, usuario, etc.)
3. Haga clic en un evento para ver el detalle

### Exportar Auditoría

- Use el botón **"Exportar"** para descargar en Excel
- Útil para auditorías externas

---

## Preguntas Frecuentes

### Acceso y Seguridad

**P: ¿Qué hago si olvido mi contraseña?**
> R: Haga clic en "¿Olvidaste tu contraseña?" en la pantalla de login. Se enviará un enlace a su correo para restablecerla.

**P: ¿Puedo compartir mi cuenta con un compañero?**
> R: **No.** Cada usuario debe tener su propia cuenta. Compartir cuentas es una violación de seguridad.

**P: ¿Cuánto tiempo dura la sesión?**
> R: La sesión expira después de 15 minutos de inactividad por seguridad.

**P: ¿Por qué me pide cambiar la contraseña?**
> R: Es una medida de seguridad obligatoria en el primer ingreso para proteger sus datos.

### Tratamientos

**P: ¿Quién puede crear tratamientos?**
> R: Los líderes de proceso y usuarios con permisos específicos.

**P: ¿Puedo eliminar un tratamiento aprobado?**
> R: No. Los tratamientos aprobados no se eliminan, se desactivan si ya no aplican.

**P: ¿Cuánto tiempo tarda la aprobación?**
> R: Depende del DPO. Generalmente 1-3 días hábiles.

**P: ¿Qué pasa si rechazan mi tratamiento?**
> R: Recibirá observaciones detalladas. Corrija lo indicado y vuelva a enviarlo.

### Técnico

**P: ¿El sistema funciona en celular?**
> R: Sí, es responsive. Sin embargo, recomendamos usar computadora para una mejor experiencia.

**P: ¿Qué navegador recomiendan?**
> R: Google Chrome o Mozilla Firefox en sus versiones más recientes.

**P: ¿Puedo trabajar sin conexión a Internet?**
> R: No. El sistema requiere conexión a Internet en todo momento.

**P: ¿Dónde reporto un error técnico?**
> R: Contacte al DPO o al área de Seguridad de la Información.

---

## Contacto y Soporte

| Rol | Contacto | Correo |
|-----|----------|--------|
| **DPO (Delegado de Protección de Datos)** | Oswaldo Cevallos | dpo@servientrega.com.ec |
| **Seguridad de la Información** | Christian Díaz | christian.diaz@servientrega.com.ec |
| **Soporte Técnico** | Área de TI | soporte@servientrega.com.ec |

---

## Glosario

| Término | Definición |
|---------|------------|
| **RAT** | Registro de Actividades de Tratamiento |
| **LOPDP** | Ley Orgánica de Protección de Datos Personales |
| **DPO** | Delegado de Protección de Datos |
| **Tratamiento** | Cualquier operación con datos personales (recolección, almacenamiento, uso, etc.) |
| **Titular** | Persona cuyos datos son tratados |
| **Responsable** | Persona o entidad que decide sobre el tratamiento |
| **Encargado** | Persona que trata datos por cuenta del responsable |
| **Datos Sensibles** | Datos que pueden causar discriminación (salud, creencias, origen racial, etc.) |
| **Transferencia** | Envío de datos a otro país |
| **Base Legal** | Fundamento que autoriza el tratamiento |

---

## Anexos

### Anexo 1: Estructura del Código RAT

Los códigos RAT siguen el formato: `RAT-{Área}-{Proceso}-{Secuencia}`

**Ejemplo:** `RAT-ME-AD-001`
- **ME** = Macroproceso (ej: Mensajería)
- **AD** = Área (ej: Alta Dirección)
- **001** = Número secuencial

### Anexo 2: Áreas de la Empresa

| Código | Área |
|--------|------|
| AD | Alta Dirección |
| ME | Mensajería Express |
| LO | Logística |
| TI | Tecnología de la Información |
| RH | Recursos Humanos |
| FI | Finanzas |
| LE | Legal |

### Anexo 3: Procesos Macros

| Código | Proceso |
|--------|---------|
| ME | Mensajería Express |
| LO | Logística |
| CO | Comercial |
| FI | Financiero |
| RH | Recursos Humanos |
| TI | Tecnología |

---

**Documento elaborado por:** Delegado de Protección de Datos  
**Fecha de elaboración:** Abril 2026  
**Versión:** 1.0  
**Próxima revisión:** Octubre 2026

---

> **Nota Legal:** Este manual es propiedad de Servientrega Ecuador S.A. Queda prohibida su reproducción total o parcial sin autorización escrita.
