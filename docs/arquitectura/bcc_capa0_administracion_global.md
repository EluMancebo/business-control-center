# BCC — Capa 0: Administración Global del SaaS

## Estado del documento
Documento operativo para fijar la definición, contenido, estructura y evolución de Capa 0 dentro de Business Control Center.

Este documento debe añadirse al cronograma y usarse como referencia antes de implementar la administración global del SaaS.

---

## 1. Propósito de Capa 0

Capa 0 es el backoffice global del SaaS. No es el panel cliente, no es Content-Lab y no es la web pública.

Su misión es definir y gobernar:

- qué clientes/tenants existen,
- qué dominio/slug tienen,
- qué sector y tipo de negocio representan,
- qué tipo de web necesitan,
- qué módulos tienen activos,
- qué nivel de control tiene el cliente,
- qué nivel de intervención asume la plataforma,
- qué IA y automatizaciones se habilitan,
- qué presets base se les asignan,
- qué estado comercial y contractual tienen.

Frase operativa:

```text
Capa 0 asigna.
Capa 1 fabrica.
Capa 2 opera.
Capa 3 publica.
```

---

## 2. Separación por capas

### Capa 0 — Administración global
Solo para el dueño del SaaS o equipo interno.

Responsabilidades:

- gestión de tenants/clientes,
- alta y configuración inicial,
- asignación de módulos,
- modelo operativo por ámbito,
- nivel de IA y automatización,
- tipo de web,
- estado comercial,
- límites del cliente,
- preparación del entorno de trabajo.

### Capa 1 — Studio/Admin interno
Donde se fabrican y aprueban piezas.

Responsabilidades:

- Brand-Lab,
- Content-Lab,
- Media,
- Preset Vault,
- piezas, componentes, assets,
- aprobación y salida a Capa 2.

Content-Lab no es editor libre. Es sistema de ensamblaje, evaluación, aprobación, versionado y publicación controlada hacia Capa 2.

### Capa 2 — Panel Cliente
Donde el negocio opera su día a día.

Responsabilidades:

- citas,
- leads,
- campañas,
- CRM,
- ajustes permitidos,
- consumo de presets aprobados,
- uso de automatizaciones permitidas.

### Capa 3 — Web pública
Donde se renderiza lo publicado.

Responsabilidades:

- hero,
- servicios,
- contacto,
- reservas,
- formularios,
- campañas,
- landings,
- contenido publicado.

La web pública no decide ni edita. Renderiza snapshots o configuraciones aprobadas.

---

## 3. Dónde habita Capa 0

### Implementación ahora / TFG
Capa 0 puede vivir dentro del mismo proyecto Next.js como ruta protegida.

Propuesta:

```text
/admin
```

o

```text
/bcc-admin
```

Condiciones:

- protegida por rol interno,
- no visible al cliente,
- no mezclada con `/panel`,
- sin acceso desde navegación normal del cliente.

### Implementación post-TFG / clientes reales
Capa 0 debe aislarse profesionalmente por subdominio.

Propuesta:

```text
admin.businesscontrolcenter.es
```

Con separación lógica de:

```text
admin.businesscontrolcenter.es   → Capa 0
studio.businesscontrolcenter.es  → Capa 1
app.businesscontrolcenter.es     → Capa 2
cliente.com / slug.bcc.es        → Capa 3
```

### Recomendación
Para TFG: una app, rutas protegidas.  
Para clientes reales: subdominio aislado para Capa 0.

---

## 4. Entidad principal: Tenant

```ts
Tenant {
  id: string;
  name: string;
  slug: string;
  domain?: string;

  sector: SectorKey;
  businessType: BusinessTypeKey;

  webProfile: TenantWebProfile;

  modules: TenantModules;
  scopePolicies: ScopePolicy[];

  aiLevel: AiLevel;
  automationLevel: AutomationLevel;

  activeBrandPresetId?: string;
  activeBasePresetId?: string;
  pipelineTemplateId?: string;

  commercialProfile: CommercialProfile;

  status: "onboarding" | "active" | "paused" | "archived";

  createdAt: string;
  updatedAt: string;
}
```

---

## 5. sector

### Definición
`sector` es el contexto comercial y visual del negocio.

No define por sí solo la estructura de la web ni el funcionamiento del sistema. Sirve para orientar presets, media, copy, ejemplos, tono y plantillas iniciales.

### Propuesta inicial

```ts
type SectorKey =
  | "barberia"
  | "peluqueria"
  | "estetica"
  | "salud"
  | "dental"
  | "taller"
  | "inmobiliaria"
  | "fitness"
  | "restauracion"
  | "comercio"
  | "servicios"
  | "profesional"
  | "educacion"
  | "turismo"
  | "general";
```

### Uso real
- filtrar media,
- sugerir presets,
- orientar Copy Forge/IA futura,
- elegir kits iniciales,
- preparar servicios típicos,
- adaptar vocabulario de Capa 2.

---

## 6. businessType

### Definición
`businessType` define cómo convierte o genera valor el negocio.

Es más estructural que `sector`, porque afecta a módulos, CTA, formularios, CRM, citas y campañas.

### Propuesta

```ts
type BusinessTypeKey =
  | "appointment-based"
  | "local-services"
  | "lead-generation"
  | "catalog"
  | "ecommerce"
  | "content"
  | "membership"
  | "directory"
  | "mixed";
```

### Lectura práctica

- `appointment-based`: negocio basado en citas.
- `local-services`: servicio local con contacto, cita o presupuesto.
- `lead-generation`: negocio que convierte por formulario, llamada o visita.
- `catalog`: muestra productos/servicios sin compra directa.
- `ecommerce`: venta online.
- `content`: autoridad, blog, marca personal.
- `membership`: acceso privado, comunidad, suscripción.
- `directory`: listados, fichas, buscador.
- `mixed`: combinación controlada.

---

## 7. TenantWebProfile

`websiteType` no debe nacer corto. Debe trabajar junto a estructura, objetivo y tipos de página habilitados.

```ts
TenantWebProfile {
  websiteType: WebsiteTypeKey;
  websiteStructure: WebsiteStructureKey;
  primaryGoal: PrimaryGoalKey;
  enabledPageTypes: PageTypeKey[];
}
```

### websiteType

```ts
type WebsiteTypeKey =
  | "onepage"
  | "multipage"
  | "landing"
  | "campaign-site"
  | "portfolio"
  | "blog"
  | "catalog"
  | "booking-site"
  | "lead-site"
  | "ecommerce"
  | "membership"
  | "directory"
  | "microsite"
  | "hybrid";
```

### Definiciones

- `onepage`: web de scroll único con anclas.
- `multipage`: web clásica con varias rutas.
- `landing`: página de conversión concreta.
- `campaign-site`: mini sitio de campaña temporal.
- `portfolio`: exposición de trabajos, casos o proyectos.
- `blog`: publicación periódica de contenidos.
- `catalog`: catálogo sin compra directa.
- `booking-site`: web centrada en citas/reservas.
- `lead-site`: web centrada en captación de leads.
- `ecommerce`: venta online.
- `membership`: acceso privado o comunidad.
- `directory`: listado/fichas/buscador.
- `microsite`: sitio reducido para producto, marca o evento.
- `hybrid`: mezcla controlada.

### websiteStructure

```ts
type WebsiteStructureKey =
  | "single-scroll"
  | "routes"
  | "mixed";
```

### primaryGoal

```ts
type PrimaryGoalKey =
  | "booking"
  | "lead-capture"
  | "sales"
  | "authority"
  | "portfolio-showcase"
  | "information"
  | "community";
```

### enabledPageTypes

```ts
type PageTypeKey =
  | "home"
  | "services"
  | "service-detail"
  | "gallery"
  | "portfolio"
  | "portfolio-case"
  | "blog"
  | "blog-post"
  | "catalog"
  | "catalog-item"
  | "landing"
  | "campaign"
  | "booking"
  | "contact"
  | "about"
  | "legal";
```

---

## 8. Módulos del tenant

```ts
TenantModules {
  web: boolean;
  crm: boolean;
  appointments: boolean;
  campaigns: boolean;
  landingPages: boolean;
  seo: boolean;
  social: boolean;
  automation: boolean;
  media: boolean;
}
```

### Uso
Los módulos determinan qué aparece en Capa 2 y qué herramientas se habilitan en Capa 1.

Ejemplo:

- sin `appointments`, no aparece agenda.
- sin `campaigns`, no aparecen campañas.
- sin `landingPages`, no se habilita creación/uso de landings.
- sin `seo`, el cliente no ve herramientas SEO avanzadas.

---

## 9. ScopePolicies

### Definición
Las `scopePolicies` definen quién decide y quién ejecuta por ámbito.

```ts
ScopePolicy {
  scope: OperationalScope;
  controlLevel: ControlLevel;
  interventionLevel: InterventionLevel;
}
```

### OperationalScope

```ts
type OperationalScope =
  | "web"
  | "brand"
  | "content"
  | "media"
  | "appointments"
  | "campaigns"
  | "crm"
  | "seo"
  | "social"
  | "automation";
```

### ControlLevel

```ts
type ControlLevel =
  | "platform"
  | "shared"
  | "client";
```

Interpretación:

- `platform`: decide la plataforma/equipo interno.
- `shared`: decisión guiada o validada.
- `client`: decide el cliente dentro de límites.

### InterventionLevel

```ts
type InterventionLevel =
  | "high"
  | "medium"
  | "low";
```

Interpretación:

- `high`: ejecuta principalmente la plataforma.
- `medium`: co-ejecución.
- `low`: ejecuta principalmente el cliente.

### Ejemplo

```ts
scopePolicies: [
  { scope: "web", controlLevel: "platform", interventionLevel: "high" },
  { scope: "appointments", controlLevel: "client", interventionLevel: "low" },
  { scope: "campaigns", controlLevel: "shared", interventionLevel: "medium" },
  { scope: "seo", controlLevel: "platform", interventionLevel: "high" },
  { scope: "social", controlLevel: "shared", interventionLevel: "medium" }
]
```

---

## 10. IA y automatización

### aiLevel

```ts
type AiLevel =
  | "none"
  | "assistive"
  | "guided"
  | "advanced";
```

Interpretación:

- `none`: sin IA visible.
- `assistive`: ayuda puntual, sugerencias.
- `guided`: IA integrada en flujos con revisión.
- `advanced`: automatizaciones más fuertes con reglas y aprobación.

### automationLevel

```ts
type AutomationLevel =
  | "none"
  | "basic"
  | "standard"
  | "advanced";
```

Interpretación:

- `none`: sin automatización.
- `basic`: confirmaciones, avisos sencillos.
- `standard`: recordatorios, campañas programadas, seguimiento.
- `advanced`: flujos complejos, segmentación, reglas por comportamiento.

---

## 11. CommercialProfile

```ts
CommercialProfile {
  plan: "demo" | "basic" | "pro" | "managed" | "custom";
  billingStatus: "trial" | "active" | "pending" | "cancelled";
  serviceNotes?: string;
  contractUrl?: string;
  monthlyFee?: number;
  setupFee?: number;
}
```

---

## 12. Flujo de creación de tenant

### Paso 1 — Identidad
Campos:

- name
- slug
- domain
- sector
- businessType

Resultado: tenant creado en estado `onboarding`.

### Paso 2 — Perfil web
Campos:

- websiteType
- websiteStructure
- primaryGoal
- enabledPageTypes

Resultado: el sistema sabe qué tipo de web y páginas necesita.

### Paso 3 — Módulos
Activar:

- web
- crm
- appointments
- campaigns
- landingPages
- seo
- social
- automation
- media

Resultado: Capa 2 se configura.

### Paso 4 — Modelo operativo
Definir `scopePolicies` por ámbito.

Resultado: se decide qué controla el cliente y qué controla la plataforma.

### Paso 5 — IA y automatización
Definir:

- aiLevel
- automationLevel

Resultado: se regulan sugerencias, acciones y automatismos.

### Paso 6 — Setup inicial
Asignar:

- activeBrandPresetId,
- activeBasePresetId,
- pipelineTemplateId,
- kit sectorial si existe.

Resultado: Capa 1 puede empezar a fabricar.

### Paso 7 — Activación
Cambiar estado:

```ts
status: "active"
```

Resultado: Capa 2 y Capa 3 pueden operar según módulos.

---

## 13. Relación con Brand-Lab

Capa 0 entrega a Brand-Lab:

- tenantId,
- sector,
- businessType,
- websiteType,
- identidad,
- nivel de control.

Brand-Lab produce:

- BrandPreset,
- tokens,
- paleta,
- tipografía,
- reglas visuales autorizadas.

---

## 14. Relación con Content-Lab

Capa 0 entrega a Content-Lab:

- tenantId,
- sector,
- businessType,
- webProfile,
- módulos activos,
- BrandPreset activo,
- scopePolicies.

Content-Lab produce:

- LabPiece,
- Variant,
- evaluación,
- aprobación,
- Preset Vault item.

El flujo oficial de Content-Lab es:

```text
Brief → LabPiece → Variants → Validation → Approval → Preset Vault → Capa 2 consume
```

---

## 15. Relación con Preset Vault

Preset Vault solo debe almacenar piezas:

- aprobadas,
- versionadas,
- trazables,
- con campos editables definidos,
- con destinos permitidos,
- asociadas a tenant, sector o sistema.

Capa 0 puede definir qué presets quedan disponibles para cada tenant.

---

## 16. Relación con Capa 2

Capa 2 consume lo autorizado según:

- módulos activos,
- scopePolicies,
- presets disponibles,
- tipo de web,
- IA y automatización.

Ejemplo:

Si `appointments=false`, no aparece agenda.  
Si `campaigns=true` pero `controlLevel=platform`, el cliente ve resultados o solicita acciones, pero no lanza campañas libremente.

---

## 17. Relación con Capa 3

Capa 3 renderiza:

- snapshot publicado,
- presets aprobados,
- contenido resuelto,
- módulos públicos activos.

No lee drafts. No decide diseño. No crea contenido.

---

## 18. Implementación ahora / TFG

### Ruta recomendada
```text
/admin
```

### Alcance TFG
Implementar versión mínima:

- listado de tenants,
- crear tenant básico,
- editar perfil web,
- activar módulos,
- definir scopePolicies,
- asignar estado onboarding/active.

No implementar todavía:

- facturación real,
- contratos avanzados,
- permisos de equipo,
- multi-dominio complejo,
- auditoría completa.

---

## 19. Implementación post-TFG

### Arquitectura profesional recomendada

```text
admin.businesscontrolcenter.es   → Capa 0
studio.businesscontrolcenter.es  → Capa 1
app.businesscontrolcenter.es     → Capa 2
cliente.com / slug.bcc.es        → Capa 3
```

### Evolución
- auth interna más estricta,
- auditoría,
- logs,
- backups,
- roles internos,
- límites de plan,
- facturación,
- dominios personalizados,
- separación clara de subdominios.

---

## 20. Impacto en cronograma

### Bloque inmediato
- documentar Capa 0,
- definir tipos TS,
- preparar UI de ficha tenant,
- no implementar todavía sistemas complejos.

### Después
- conectar tenant con Brand-Lab,
- conectar tenant con Content-Lab,
- activar Preset Vault mínimo,
- preparar consumo en Capa 2.

### Post-TFG
- aislar Capa 0 por subdominio,
- añadir facturación,
- dominios reales,
- límites por plan,
- reporting interno.

---

## 21. Regla final

Capa 0 no es una pantalla auxiliar.  
Es el centro de gobierno del SaaS.

Sin Capa 0, BCC es un conjunto de módulos.  
Con Capa 0, BCC se convierte en plataforma multi-cliente gobernada.
