# Sistema RAT - Servientrega Ecuador S.A.
## Documento maestro para iniciar desarrollo en VS Code con apoyo de Kimi

---

# 1. Propósito del proyecto

Este proyecto tiene como finalidad desarrollar una **aplicación web corporativa** para el **levantamiento, gestión, revisión, validación, trazabilidad y consolidación del Registro de Actividades de Tratamiento de Datos Personales (RAT)** de **Servientrega Ecuador S.A.**, alineada a la **Ley Orgánica de Protección de Datos Personales del Ecuador (LOPDP)** y a la operativa real de la empresa.

La aplicación debe permitir que los **líderes de proceso o responsables de área** reporten de manera sencilla los tratamientos de datos personales que realizan, mientras que el **DPO** y su equipo puedan revisar, observar, validar, aprobar y consolidar automáticamente dicha información en un **RAT maestro**.

La solución debe estar pensada primero para Servientrega Ecuador S.A., pero con una arquitectura suficientemente flexible para reutilizarse luego en otras empresas mediante parametrización.

---

# 2. Principio funcional del sistema

La lógica principal del sistema debe responder a esta regla:

> **El usuario operativo describe, el sistema estructura, y el DPO valida.**

Esto significa que:

- el líder de proceso no debe tener que escribir como abogado;
- el sistema debe convertir respuestas guiadas en información estructurada;
- el DPO debe tener control jurídico y funcional sobre el resultado final.

---

# 3. Problema actual que resuelve la aplicación

Actualmente el levantamiento del RAT se realiza mediante archivos Excel con mucha información valiosa, pero con varias limitaciones:

- el llenado no es intuitivo;
- existen campos demasiado abiertos;
- se mezcla contenido jurídico con contenido operativo;
- no se diferencia claramente lo que debe llenar el área y lo que debe validar el DPO;
- no existe una trazabilidad robusta de estados, observaciones y versiones;
- consolidar el RAT maestro consume mucho tiempo;
- mantener actualizado el registro resulta difícil.

La aplicación debe transformar ese proceso manual en un flujo digital guiado, auditable y escalable.

---

# 4. Alcance general de la aplicación

La aplicación debe cubrir, como mínimo, los siguientes objetivos:

1. Registrar tratamientos de datos personales por área y proceso.
2. Permitir que cada área complete formularios guiados por pasos.
3. Gestionar titulares, categorías de datos, finalidades, bases de legitimación, terceros, transferencias, conservación, seguridad y riesgo.
4. Permitir revisión, observación y aprobación por parte del DPO.
5. Generar automáticamente el RAT maestro consolidado.
6. Mantener historial, trazabilidad, bitácora y control de versiones.
7. Permitir exportaciones a Excel y PDF.
8. Detectar automáticamente alertas y posibles tratamientos de alto riesgo.
9. Preparar el sistema para soportar otras empresas en el futuro.

## 4.1 Qué es el RAT en el contexto ecuatoriano

Para este proyecto, el Registro de Actividades de Tratamiento no debe entenderse como una simple ficha operativa ni como una copia del Registro Nacional de Proteccion de Datos Personales.

En Ecuador, el RAT es el instrumento interno con el que el responsable del tratamiento demuestra que conoce y gobierna sus operaciones de tratamiento. Su finalidad es permitir trazabilidad, control, gestion de riesgo y evidencia de cumplimiento bajo la LOPDP y su Reglamento.

Esto implica que el sistema no debe limitarse a capturar texto libre. Debe ayudar a transformar informacion operativa de las areas en una estructura juridicamente util para el DPO y, posteriormente, para eventuales requerimientos de la autoridad.

## 4.2 Cuándo debe existir el RAT

Como criterio funcional para el sistema, debe asumirse que la organizacion necesita llevar RAT cuando:

- tenga cien o mas trabajadores;
- el tratamiento no sea ocasional;
- el tratamiento pueda implicar riesgo para los derechos y libertades del titular; o
- el tratamiento incluya categorias especiales de datos personales.

En la practica, esto significa que el sistema debe diseñarse para documentar la mayoria de tratamientos corporativos recurrentes, no solo casos excepcionales.

## 4.3 Contenido mínimo que el sistema debe poder demostrar

El flujo RAT debe ser capaz de documentar, como minimo:

1. identificacion del responsable, corresponsable si existe y delegado de proteccion de datos;
2. fines del tratamiento;
3. categorias de destinatarios;
4. titulares y categorias de datos personales;
5. uso de perfiles, cuando aplique;
6. transferencias internacionales, cuando existan;
7. bases de legitimacion;
8. plazos de conservacion; y
9. medidas tecnicas, juridicas, administrativas y organizativas.

Sobre este minimo, el sistema puede y debe agregar capas de gobernanza utiles para Servientrega: ciclo de vida, trazabilidad, adjuntos, riesgo, EIPD, IA, versionado y reporteria.

---

# 5. Tipo de solución requerida

Se requiere una **aplicación web empresarial**, moderna, modular y escalable.

## Stack tecnológico recomendado

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- React Hook Form
- Zod
- TanStack Query
- Zustand o Context API para estado global
- Componentes reutilizables tipo UI empresarial

### Backend
- Node.js
- TypeScript
- NestJS o Express estructurado en módulos
- Prisma ORM
- PostgreSQL
- JWT + refresh tokens
- RBAC (Role Based Access Control)

### Infraestructura recomendada
- Variables de entorno por ambiente
- Docker
- Despliegue en nube
- Arquitectura preparada para CI/CD
- Almacenamiento para adjuntos
- Logs y trazabilidad

---

# 6. Roles del sistema

## 6.1 Super Administrador
Responsabilidades:
- administrar la plataforma completa;
- crear empresas;
- habilitar módulos;
- gestionar configuraciones globales;
- gestionar roles y permisos globales;
- visualizar todo el sistema.

## 6.2 Administrador de Empresa
Responsabilidades:
- administrar la configuración interna de la empresa;
- crear áreas, procesos y usuarios;
- gestionar catálogos internos;
- apoyar al DPO;
- generar reportes y exportaciones.

## 6.3 DPO / Delegado de Protección de Datos
Responsabilidades:
- revisar tratamientos enviados;
- observar, corregir o aprobar;
- validar bases de legitimación;
- marcar alto riesgo;
- determinar si se requiere EIPD;
- validar terceros, encargados y transferencias;
- consolidar RAT maestro;
- mantener control normativo del sistema.

## 6.4 Revisor Jurídico / Cumplimiento
Responsabilidades:
- apoyar en revisión;
- comentar tratamientos;
- revisar cláusulas, conservación, terceros y transferencias;
- generar observaciones;
- apoyar al DPO.

## 6.5 Líder de Proceso / Responsable de Área
Responsabilidades:
- completar formularios del RAT;
- enviar tratamientos a revisión;
- responder observaciones;
- actualizar tratamientos de su área;
- mantener la información operativa del proceso.

## 6.6 Colaborador de Apoyo
Responsabilidades:
- ayudar a completar información;
- adjuntar soportes;
- colaborar con el líder de proceso;
- acceso restringido a su ámbito.

## 6.7 Auditor / Solo Lectura
Responsabilidades:
- consultar reportes;
- revisar versiones;
- revisar tratamientos y trazabilidad;
- sin capacidad de edición.

---

# 7. Módulos funcionales de la aplicación

## 7.1 Módulo de autenticación y seguridad
Debe incluir:
- inicio de sesión;
- recuperación de contraseña;
- cambio de contraseña;
- expiración de sesión;
- control de permisos;
- bitácora de acceso;
- gestión de sesión activa.

## 7.2 Módulo de empresas
Debe incluir:
- registro de empresa;
- razón social;
- nombre comercial;
- RUC;
- domicilio;
- correo institucional;
- actividad económica;
- sector;
- configuración visual.

## 7.3 Módulo de usuarios
Debe incluir:
- alta, edición y baja lógica;
- asignación de rol;
- asignación de área;
- activación/inactivación;
- filtros y búsqueda;
- historial.

## 7.4 Módulo de áreas y procesos
Debe incluir:
- áreas;
- subáreas;
- procesos;
- subprocesos;
- responsables;
- criticidad operativa;
- relación con tratamientos.

## 7.5 Módulo de catálogos maestros
Debe administrar:
- tipos de titulares;
- categorías de datos;
- datos específicos;
- bases de legitimación;
- canales de recolección;
- terceros;
- países;
- medidas de seguridad;
- plazos de conservación;
- fases del ciclo de vida;
- riesgos;
- estados;
- tipos de observaciones.

## 7.6 Módulo de levantamiento del RAT
Debe incluir:
- formularios guiados por pasos;
- guardado en borrador;
- validaciones;
- adjuntos;
- resumen previo al envío.

## 7.7 Módulo de revisión DPO
Debe incluir:
- bandeja de tratamientos enviados;
- revisión por secciones;
- observaciones;
- validación jurídica;
- cambio de estado;
- aprobación o devolución.

## 7.8 Módulo de RAT maestro
Debe incluir:
- consolidación automática;
- listado maestro;
- filtros;
- exportación;
- vista resumida;
- vista detallada.

## 7.9 Módulo de ciclo de vida
Debe incluir:
- fases del tratamiento;
- actividades por fase;
- medidas por fase;
- riesgos por fase;
- intervinientes;
- soportes y tecnologías.

## 7.10 Módulo de riesgo y EIPD
Debe incluir:
- evaluación preliminar;
- alertas automáticas;
- bandera de alto riesgo;
- gestión de necesidad de EIPD;
- seguimiento y criterio DPO.

## 7.11 Módulo de reportes y dashboard
Debe incluir:
- KPIs;
- pendientes;
- observados;
- aprobados;
- alto riesgo;
- tratamientos por área;
- datos especiales;
- transferencias internacionales;
- revisión periódica.

## 7.12 Módulo de trazabilidad y auditoría
Debe incluir:
- bitácora de cambios;
- comentarios;
- cambios de estado;
- versiones;
- usuario y fecha de cada modificación.

## 7.13 Módulo de exportación
Debe incluir:
- exportación Excel;
- exportación PDF;
- ficha individual;
- resumen ejecutivo;
- RAT maestro consolidado.

---

# 8. Flujo funcional del sistema

## Flujo principal

1. El administrador configura la empresa, áreas, procesos, usuarios y catálogos.
2. El líder de proceso inicia un tratamiento.
3. Completa el formulario guiado por pasos.
4. Guarda borrador o envía a revisión.
5. El DPO recibe el tratamiento.
6. El DPO revisa cada sección.
7. El DPO puede observar o aprobar.
8. Si observa, el área corrige.
9. Si aprueba, el tratamiento se incorpora al RAT maestro.
10. El sistema actualiza reportes, estados y trazabilidad.

## 8.1 Sentido jurídico y operativo de cada paso del wizard RAT

1. Identificacion: individualiza la actividad de tratamiento dentro de la organizacion. Debe vincular empresa, area, proceso, nombre del tratamiento y responsable funcional. Juridicamente sirve para saber quien trata y desde donde nace la operacion.
2. Finalidad: define para que se tratan los datos. Es el eje del principio de finalidad y condiciona minimizacion, conservacion y base legitimadora.
3. Titulares: identifica a quienes pertenecen los datos. No basta con decir "clientes"; debe permitir distinguir tipos de titulares y su relacion con la empresa.
4. Datos personales tratados: especifica que categorias y datos concretos se usan. Este paso es clave para clasificar riesgo y detectar categorias especiales.
5. Base de legitimacion: documenta el habilitante juridico del tratamiento. Debe poder justificar por que aplica esa base y cual es la principal.
6. Sistemas, soportes y tecnologias: no es un minimo literal del articulo 38, pero es indispensable para trazabilidad, seguridad, arquitectura del dato y futura auditoria.
7. Terceros, encargados y destinatarios: cubre a quienes reciben, acceden o intervienen en el tratamiento. Es la traduccion operativa del bloque de destinatarios del RAT.
8. Transferencias internacionales: identifica salidas de datos fuera del Ecuador, destino, finalidad, base y salvaguardas. Es un bloque obligatorio cuando aplique.
9. Conservacion y eliminacion: documenta por cuanto tiempo se mantienen los datos, con que criterio, y como se bloquean, anonimizar o eliminan.
10. Medidas de seguridad: debe recoger medidas tecnicas, juridicas, administrativas y organizativas. Es un bloque obligatorio del RAT, no un accesorio.
11. Ciclo de vida: extiende el RAT hacia una vista de extremo a extremo del tratamiento. No es minimo normativo estricto, pero es muy valioso para gobernanza y auditoria.
12. Evaluacion preliminar de riesgo: soporta responsabilidad proactiva, alto riesgo, EIPD, gran escala, IA y decisiones automatizadas. Complementa el RAT aunque no sustituye un analisis formal cuando corresponda.
13. Resumen y envio: consolida evidencia minima antes de pasar a control DPO. Debe funcionar como control de completitud material, no solo visual.

## 8.2 Ajustes requeridos al flujo actual

- El paso 1 debe ampliarse para contemplar responsable funcional del tratamiento, corresponsable cuando aplique y referencia del DPO o canal de contacto.
- Los pasos 7, 8, 10 y 11 no pueden quedarse como placeholders si el sistema pretende sostener un RAT maestro juridicamente util.
- El sistema debe persistir todos los bloques del wizard antes de permitir el envio a revision; de lo contrario, la regla de completitud queda rota.
- El flujo debe distinguir entre campos minimos obligatorios del RAT y campos ampliados de gobernanza, pero ambos deben poder almacenarse.
- El reporte maestro solo tendra valor real si su informacion nace del flujo guiado y no de cargas manuales posteriores o ediciones avanzadas separadas.

## 8.3 Diferencia funcional entre RAT y RNPD

- El RAT es el registro interno de control y cumplimiento del responsable.
- El RNPD es el registro externo ante la autoridad.
- El sistema debe construir primero un RAT robusto y, en una fase posterior, facilitar el cumplimiento del RNPD a partir de informacion ya estructurada.

---

# 9. Estados del flujo

La aplicación debe manejar como mínimo estos estados:

- borrador
- en edición
- enviado
- en revisión DPO
- observado
- en corrección
- subsanado
- validado
- aprobado
- requiere EIPD
- archivado
- reemplazado por nueva versión

Cada cambio de estado debe registrarse en bitácora.

---

# 10. Reglas de negocio principales

## 10.1 Regla de separación de funciones
- el área propone;
- el sistema estructura;
- el DPO valida.

## 10.2 Regla de completitud
No se puede enviar un tratamiento si faltan:
- identificación;
- finalidad;
- titulares;
- datos tratados;
- base de legitimación;
- conservación;
- medidas de seguridad mínimas.

Adicionalmente, cuando aplique, el sistema debe exigir:
- destinatarios o terceros intervinientes;
- transferencias internacionales con su soporte;
- justificacion de perfilamiento o decisiones automatizadas; y
- criterios de alto riesgo o necesidad de EIPD.

## 10.3 Regla de alerta por categorías especiales
Si el usuario marca datos de salud, biometría, discapacidad, antecedentes o datos especialmente sensibles, el sistema debe activar una alerta de revisión reforzada.

## 10.4 Regla de alerta por menores
Si el tratamiento involucra niños, niñas o adolescentes, el sistema debe activar revisión reforzada.

## 10.5 Regla de alerta por perfilamiento, IA o decisiones automatizadas
Si el tratamiento incluye:
- perfilamiento;
- uso de IA;
- decisiones automatizadas;
el sistema debe advertir posible alto riesgo y escalar al DPO.

## 10.6 Regla de transferencias internacionales
Si existe transferencia internacional, el sistema debe obligar a completar:
- país destino;
- tercero o proveedor involucrado;
- datos transferidos;
- finalidad;
- salvaguardas.

## 10.7 Regla de conservación indefinida
Si se selecciona conservación indefinida, el sistema debe exigir justificación obligatoria.

## 10.8 Regla de terceros encargados
Si un tercero actúa como encargado, se deben completar:
- finalidad del acceso;
- datos a los que accede;
- existencia de contrato;
- observaciones.

## 10.9 Regla de observaciones pendientes
No se puede aprobar un tratamiento si tiene observaciones abiertas.

## 10.10 Regla de consolidación automática
Todo tratamiento aprobado debe alimentar automáticamente el RAT maestro.

---

# 11. Modelo de datos general

La base de datos debe ser relacional y contemplar, como mínimo, las siguientes entidades.

## 11.1 Empresa
Campos:
- id
- razón social
- nombre comercial
- RUC
- domicilio
- correo
- teléfono
- actividad económica
- sector
- logo
- estado
- created_at
- updated_at

## 11.2 Usuario
Campos:
- id
- empresa_id
- nombres
- apellidos
- correo
- password_hash
- teléfono
- cargo
- rol_id
- área_id
- activo
- last_login_at
- created_at
- updated_at

## 11.3 Rol
Campos:
- id
- code
- name
- description
- is_system
- created_at
- updated_at

## 11.4 Permiso
Campos:
- id
- code
- name
- description

## 11.5 RolPermiso
Campos:
- id
- role_id
- permission_id

## 11.6 Área
Campos:
- id
- company_id
- name
- description
- responsible_user_id
- status
- created_at
- updated_at

## 11.7 Proceso
Campos:
- id
- company_id
- area_id
- name
- sub_process
- description
- business_objective
- responsible_user_id
- criticality
- status
- created_at
- updated_at

## 11.8 Tratamiento
Entidad principal del RAT.

Campos:
- id
- company_id
- area_id
- process_id
- code
- version
- name
- short_description
- main_purpose
- secondary_purposes
- origin_of_data
- data_collection_channel
- approximate_volume
- processing_frequency
- automated_processing
- profiling
- automated_decisions
- uses_ai
- large_scale_processing
- international_transfer
- draft_legal_basis_id
- validated_legal_basis_id
- created_by_user_id
- reviewed_by_user_id
- current_status
- submission_date
- approval_date
- risk_level
- high_risk_flag
- requires_dpia
- dpia_status
- review_due_date
- created_at
- updated_at

## 11.9 Titulares del tratamiento
Campos:
- id
- treatment_id
- data_subject_type_id
- approximate_count
- source_type
- relationship_with_company
- notes

## 11.10 Tipos de titulares
Campos:
- id
- company_id nullable
- code
- name
- description
- is_active

## 11.11 Categorías de datos
Campos:
- id
- company_id nullable
- code
- name
- description
- is_special_category
- is_active

## 11.12 Datos específicos
Campos:
- id
- data_category_id
- code
- name
- description
- is_sensitive
- is_active

## 11.13 Datos asociados al tratamiento
Campos:
- id
- treatment_id
- data_item_id
- is_required
- is_optional
- source_direct_or_indirect
- notes

## 11.14 Bases de legitimación
Campos:
- id
- company_id nullable
- code
- name
- description
- legal_reference
- is_active

## 11.15 Bases asociadas al tratamiento
Campos:
- id
- treatment_id
- legal_basis_id
- justification
- is_main_basis
- proposed_by_area
- validated_by_dpo

## 11.16 Terceros
Campos:
- id
- company_id
- name
- identification_number
- country_id
- legal_address
- contact_name
- contact_email
- contact_phone
- third_party_type_id
- acts_as_processor
- acts_as_recipient
- acts_as_joint_controller
- contract_exists
- confidentiality_agreement_exists
- uses_subprocessors
- notes
- is_active

## 11.17 Tipos de terceros
Campos:
- id
- code
- name
- description

## 11.18 Relación tratamiento - terceros
Campos:
- id
- treatment_id
- third_party_id
- access_purpose
- accessed_data_description
- involved_data_subjects
- transfer_outside_country
- notes

## 11.19 Países
Campos:
- id
- iso_code
- name
- region
- is_active

## 11.20 Transferencias internacionales
Campos:
- id
- treatment_id
- country_id
- third_party_id nullable
- destination_name
- transferred_data_description
- purpose
- transfer_legal_basis
- safeguards
- approved_by_dpo
- notes

## 11.21 Reglas de conservación
Campos:
- id
- company_id nullable
- code
- name
- description
- default_term
- legal_reference
- is_active

## 11.22 Conservación del tratamiento
Campos:
- id
- treatment_id
- retention_rule_id nullable
- active_retention_period
- retention_criteria
- legal_or_contractual_basis
- blocking_applies
- anonymization_applies
- deletion_applies
- deletion_method
- review_frequency
- responsible_role
- notes

## 11.23 Medidas de seguridad
Campos:
- id
- company_id nullable
- code
- name
- category
- description
- is_active

## 11.24 Medidas aplicadas al tratamiento
Campos:
- id
- treatment_id
- security_measure_id
- implemented
- evidence
- criticality
- notes

## 11.25 Fases del ciclo de vida
Campos:
- id
- company_id nullable
- code
- name
- order_index
- description
- is_active

## 11.26 Ciclo de vida del tratamiento
Campos:
- id
- treatment_id
- lifecycle_phase_id
- activity_description
- processed_data_description
- participants
- medium_or_support
- technologies
- linked_documents
- security_measures_by_phase
- risks_by_phase
- phase_order

## 11.27 Riesgos
Campos:
- id
- company_id nullable
- code
- name
- description
- category
- severity
- is_active

## 11.28 Evaluación de riesgo del tratamiento
Campos:
- id
- treatment_id
- uses_special_categories
- involves_children
- large_scale
- systematic_monitoring
- profiling
- automated_decisions
- video_surveillance
- geolocation
- biometric_data
- health_data
- criminal_data
- cross_border_transfer
- potential_high_impact
- high_risk_flag
- requires_dpia
- dpo_conclusion
- created_at
- updated_at

## 11.29 Observaciones
Campos:
- id
- treatment_id
- section_code
- created_by_user_id
- creator_role
- message
- status
- created_at

## 11.30 Versiones de tratamiento
Campos:
- id
- treatment_id
- version_number
- snapshot_json
- created_by_user_id
- change_reason
- created_at

## 11.31 Historial de estados
Campos:
- id
- treatment_id
- previous_status
- new_status
- changed_by_user_id
- comment
- changed_at

## 11.32 Adjuntos
Campos:
- id
- company_id
- treatment_id nullable
- uploaded_by_user_id
- file_name
- file_path
- mime_type
- file_size
- document_type
- uploaded_at

## 11.33 Auditoría
Campos:
- id
- user_id
- company_id
- action
- entity_name
- entity_id
- old_values_json
- new_values_json
- ip_address
- user_agent
- created_at

---

# 12. Wizard del tratamiento

El levantamiento del tratamiento debe realizarse mediante un wizard por pasos.

## Paso 1. Identificación
Campos:
- empresa
- área
- proceso
- nombre del tratamiento
- descripción breve
- responsable del área
- usuario que registra
- fecha

## Paso 2. Finalidad
Campos:
- finalidad principal
- finalidades secundarias
- descripción detallada
- frecuencia
- volumen aproximado
- origen de los datos
- canal de recolección

## Paso 3. Titulares
Campos:
- tipo de titular
- cantidad estimada
- relación con la empresa
- fuente del dato
- observaciones

## Paso 4. Datos personales tratados
Campos:
- categorías
- datos específicos
- obligatorios
- opcionales
- fuente directa / indirecta
- observaciones

## Paso 5. Base de legitimación
Campos:
- base propuesta por área
- justificación operativa
- notas
- ayuda contextual

## Paso 6. Sistemas, soportes y tecnologías
Campos:
- sistema de captura
- sistema de almacenamiento
- soporte físico o digital
- tecnologías usadas
- documentos vinculados
- aplicativos involucrados

## Paso 7. Terceros, encargados y destinatarios
Campos:
- comparte con terceros sí/no
- tipo de tercero
- nombre
- país
- finalidad del acceso
- datos a los que accede
- si actúa como encargado
- si existe contrato
- observaciones

## Paso 8. Transferencias internacionales
Campos:
- existe sí/no
- país destino
- proveedor o destinatario
- datos transferidos
- finalidad
- base
- salvaguardas
- observaciones

## Paso 9. Conservación y eliminación
Campos:
- plazo de conservación
- criterio
- base legal o contractual
- bloqueo
- anonimización
- eliminación
- método de eliminación
- frecuencia de revisión

## Paso 10. Medidas de seguridad
Campos:
- técnicas
- jurídicas
- administrativas
- organizativas
- físicas
- evidencia
- criticidad

## Paso 11. Ciclo de vida
Campos:
- fase
- actividad
- datos involucrados
- intervinientes
- soporte
- tecnologías
- documentos vinculados
- medidas por fase
- riesgos por fase

## Paso 12. Evaluación preliminar de riesgo
Preguntas:
- ¿trata datos especiales?
- ¿trata datos de menores?
- ¿usa biometría?
- ¿usa videovigilancia?
- ¿hay perfilamiento?
- ¿hay decisiones automatizadas?
- ¿usa IA?
- ¿hay monitoreo sistemático?
- ¿hay transferencia internacional?
- ¿hay gran escala?
- ¿puede afectar significativamente al titular?

## Paso 13. Resumen y envío
Acciones:
- resumen consolidado
- ver errores de validación
- guardar borrador
- enviar a revisión
- descargar vista previa

---

# 13. Pantallas principales del sistema

## 13.1 Login
- correo
- contraseña
- recuperar contraseña
- branding
- mensajes de error

## 13.2 Dashboard principal
Debe variar por rol.

### DPO
- total tratamientos
- pendientes
- observados
- aprobados
- alto riesgo
- requiere EIPD
- datos especiales
- transferencias internacionales
- por área
- próximos a revisión

### Líder de proceso
- mis tratamientos
- borradores
- observados
- subsanaciones pendientes
- aprobados

## 13.3 Gestión de empresas
- listado
- crear
- editar
- ver detalle

## 13.4 Gestión de usuarios
- listado
- filtros
- crear
- editar
- activar / desactivar
- asignar roles

## 13.5 Gestión de áreas
- listado
- crear
- editar
- responsable
- relación con procesos

## 13.6 Gestión de procesos
- listado
- crear
- editar
- criticidad
- responsable

## 13.7 Listado maestro de tratamientos
- tabla
- filtros
- exportar
- badges por estado
- alerta de riesgo
- indicador de observaciones
- indicador de transferencias
- indicador de datos especiales

## 13.8 Crear nuevo tratamiento
Inicia wizard.

## 13.9 Revisión DPO
- ficha completa
- revisión por pestañas
- observaciones por sección
- validar base legal
- validar terceros
- validar conservación
- validar seguridad
- marcar alto riesgo
- marcar requiere EIPD
- aprobar / devolver

## 13.10 Observaciones
- historial
- sección afectada
- comentario
- fecha
- usuario
- respuesta del área

## 13.11 Versiones
- comparar versiones
- fecha
- usuario
- motivo de cambio

## 13.12 Reportes
- por área
- por estado
- por riesgo
- por base legal
- por tipo de titular
- por transferencia
- por datos especiales

## 13.13 Configuración
- empresa
- branding
- catálogos
- reglas automáticas
- parámetros

---

# 14. Catálogos iniciales sugeridos para Servientrega

## 14.1 Áreas
- Talento Humano
- Operaciones
- Logística
- Seguridad Física
- Tecnología
- Jurídico
- Comercial
- Servicio al Cliente
- Marketing
- Finanzas
- Compras
- Proveedores
- Archivo
- Aduanas
- Puntos de atención
- Cumplimiento
- DPO

## 14.2 Procesos
- gestión de envíos
- entrega y distribución
- rastreo y trazabilidad
- atención al cliente
- reclamos
- contratación de personal
- administración laboral
- salud ocupacional
- videovigilancia
- control de accesos
- facturación
- cobranza
- pagos
- proveedores
- marketing
- campañas publicitarias
- web y app
- cookies y analítica
- litigios
- requerimientos de autoridad
- archivo documental
- seguros
- selección de personal

## 14.3 Tipos de titulares
- remitente
- destinatario
- cliente
- cliente corporativo
- trabajador
- postulante
- ex trabajador
- proveedor
- representante de proveedor
- visitante
- accionista
- arrendatario
- usuario web
- usuario app
- reclamante
- contacto de emergencia
- transportista
- tercero autorizado

## 14.4 Categorías de datos
- identificación
- contacto
- ubicación
- laborales
- financieros
- comerciales
- académicos
- familiares
- imágenes
- biométricos
- salud
- judiciales
- geolocalización
- navegación
- firma
- datos operativos de guía
- historial de reclamos

## 14.5 Datos específicos sugeridos
- nombres
- apellidos
- cédula
- pasaporte
- RUC
- correo
- teléfono
- dirección
- firma
- imagen
- video
- huella
- reconocimiento facial
- cuenta bancaria
- historial de envíos
- tracking
- geolocalización
- antecedentes
- discapacidad
- cookies
- IP
- dispositivo
- historial de navegación

## 14.6 Tipos de terceros
- encargado
- destinatario independiente
- autoridad pública
- proveedor cloud
- proveedor TI
- operador logístico aliado
- entidad financiera
- aseguradora
- proveedor de marketing
- call center
- digitalización documental
- mensajería SMS
- estudio jurídico
- salud ocupacional

---

# 15. Requerimientos de UI / UX

La aplicación debe tener una interfaz:
- moderna;
- corporativa;
- clara;
- fácil de usar;
- responsiva;
- basada en componentes reutilizables.

Debe incluir:
- sidebar;
- topbar;
- tablas con filtros;
- badges por estado;
- tarjetas KPI;
- formularios con ayuda contextual;
- tooltips;
- wizard visual con avance;
- alertas y mensajes claros;
- colores sobrios y profesionales.

---

# 16. Seguridad de la aplicación

Debe contemplar como mínimo:

- autenticación segura;
- hash de contraseñas;
- autorización por roles y permisos;
- protección de rutas;
- validación frontend y backend;
- sanitización de entradas;
- bitácora de acciones;
- auditoría;
- manejo seguro de adjuntos;
- expiración de sesión;
- logs de cambios;
- control de acciones críticas.

---

# 17. Endpoints sugeridos para la API

## Auth
- POST /auth/login
- POST /auth/refresh
- POST /auth/logout
- POST /auth/forgot-password
- POST /auth/reset-password

## Users
- GET /users
- POST /users
- GET /users/:id
- PATCH /users/:id
- PATCH /users/:id/status

## Roles
- GET /roles
- POST /roles
- PATCH /roles/:id

## Companies
- GET /companies
- POST /companies
- GET /companies/:id
- PATCH /companies/:id

## Areas
- GET /areas
- POST /areas
- GET /areas/:id
- PATCH /areas/:id

## Processes
- GET /processes
- POST /processes
- GET /processes/:id
- PATCH /processes/:id

## Catalogs
- GET /catalogs/:type
- POST /catalogs/:type
- PATCH /catalogs/:type/:id

## Treatments
- GET /treatments
- POST /treatments
- GET /treatments/:id
- PATCH /treatments/:id
- POST /treatments/:id/submit
- POST /treatments/:id/observe
- POST /treatments/:id/approve
- POST /treatments/:id/request-dpia
- GET /treatments/:id/versions
- GET /treatments/:id/observations

## Reports
- GET /reports/master-rat
- GET /reports/by-area
- GET /reports/by-risk
- GET /reports/international-transfers
- GET /reports/special-data

## Dashboard
- GET /dashboard/dpo
- GET /dashboard/leader
- GET /dashboard/admin

---

# 18. Estructura sugerida del proyecto

## Frontend
```txt
frontend/
  src/
    app/
    assets/
    components/
      ui/
      forms/
      layout/
      tables/
      charts/
    modules/
      auth/
      dashboard/
      companies/
      users/
      areas/
      processes/
      catalogs/
      treatments/
      reviews/
      reports/
      exports/
      settings/
    hooks/
    layouts/
    pages/
    routes/
    services/
    store/
    styles/
    types/
    utils/
```

## Backend
```txt
backend/
  src/
    main.ts
    app.module.ts
    config/
    common/
      guards/
      decorators/
      filters/
      interceptors/
      pipes/
      utils/
    modules/
      auth/
      users/
      roles/
      permissions/
      companies/
      areas/
      processes/
      catalogs/
      treatments/
      treatment-data-subjects/
      treatment-data-items/
      legal-bases/
      third-parties/
      international-transfers/
      retention/
      security-measures/
      lifecycle/
      risk-assessment/
      observations/
      versions/
      reports/
      dashboard/
      exports/
      audit/
    prisma/
      prisma.service.ts
  prisma/
    schema.prisma
    migrations/
```

---

# 19. Orden recomendado de desarrollo

## Fase 1. Base técnica
1. crear repositorio;
2. configurar frontend;
3. configurar backend;
4. configurar PostgreSQL;
5. configurar Prisma;
6. configurar autenticación;
7. configurar RBAC;
8. crear layout base.

## Fase 2. Módulos base
1. empresas;
2. usuarios;
3. roles y permisos;
4. áreas;
5. procesos;
6. catálogos.

## Fase 3. Núcleo RAT
1. modelo de tratamientos;
2. wizard de levantamiento;
3. validaciones;
4. guardado borrador;
5. envío a revisión;
6. observaciones;
7. aprobación.

## Fase 4. Profundización
1. terceros;
2. transferencias;
3. conservación;
4. seguridad;
5. ciclo de vida;
6. riesgo y EIPD.

## Fase 5. Consolidación y reporting
1. RAT maestro;
2. dashboard;
3. reportes;
4. exportación;
5. auditoría;
6. control de versiones.

---

# 20. Requisitos especiales para Kimi

Cuando uses este documento para que Kimi genere código o arquitectura, debes pedirle que:

1. no entregue respuestas genéricas;
2. genere estructura real de proyecto;
3. separe claramente frontend y backend;
4. genere código por módulos;
5. use TypeScript estricto;
6. aplique buenas prácticas;
7. use validaciones robustas;
8. documente decisiones técnicas;
9. proponga componentes reutilizables;
10. genere primero MVP funcional y luego extensiones.

---

# 21. Peticiones concretas que se pueden hacer luego a Kimi

Después de cargar este documento en el proyecto, las siguientes solicitudes a Kimi deberían funcionar bien:

## Solicitud 1
> Lee este documento maestro y genera la arquitectura técnica final del proyecto.

## Solicitud 2
> Basado en este documento, crea el esquema Prisma completo con todas las relaciones.

## Solicitud 3
> Genera el backend inicial usando NestJS, Prisma, PostgreSQL y JWT.

## Solicitud 4
> Genera el frontend inicial con React, TypeScript, Tailwind y React Router.

## Solicitud 5
> Crea el módulo de autenticación y usuarios completo.

## Solicitud 6
> Crea el módulo de áreas, procesos y catálogos.

## Solicitud 7
> Crea el wizard completo del tratamiento con validaciones por paso.

## Solicitud 8
> Crea el módulo de revisión DPO, observaciones y aprobación.

## Solicitud 9
> Crea el dashboard del DPO y el dashboard del líder de proceso.

## Solicitud 10
> Crea la exportación del RAT maestro a Excel y PDF.

---

# 22. Resultado esperado del proyecto

El resultado esperado es una aplicación corporativa que permita:

- levantar tratamientos por área;
- validar y aprobar con control DPO;
- mantener trazabilidad total;
- detectar alertas de riesgo;
- generar el RAT maestro;
- facilitar el cumplimiento de la LOPDP;
- reemplazar el proceso manual basado en Excel.

---

# 23. Nota final para desarrollo

Este documento debe considerarse el **documento rector inicial del proyecto**.  
Antes de generar código masivo, se recomienda revisar:

- catálogos exactos de Servientrega;
- tratamientos base que se quieren precargar;
- criterios internos de conservación;
- reglas internas de revisión DPO;
- formato esperado del RAT maestro final.

