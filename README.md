# 🧠 Business Control Center (BCC)

> Panel de administración web full-stack para negocios locales — gestiona tu presencia digital, branding y campañas desde un único lugar, sin tocar código.

**TFG · Grado Superior de Desarrollo de Aplicaciones Web**  
[GitHub](https://github.com/EluMancebo/business-control-center) · Autor: EluMancebo

---

## Índice

- [¿Qué es BCC?](#qué-es-bcc)
- [Funcionalidades implementadas](#funcionalidades-implementadas)
- [Arquitectura](#arquitectura)
- [Flujo del Hero](#flujo-del-hero)
- [Flujo de autenticación](#flujo-de-autenticación)
- [Modelo de datos](#modelo-de-datos)
- [Stack tecnológico y decisiones](#stack-tecnológico-y-decisiones)
- [Instalación y desarrollo local](#instalación-y-desarrollo-local)
- [Variables de entorno](#variables-de-entorno)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Rutas disponibles](#rutas-disponibles)
- [Trabajo pendiente (TFG)](#trabajo-pendiente)
- [Guía de contribución](#guía-de-contribución)

---

## ¿Qué es BCC?

Business Control Center es una aplicación web full-stack que resuelve un problema concreto: los negocios locales dependen de un desarrollador para cualquier cambio en su web. BCC proporciona un **panel de administración protegido** donde el propio negocio puede editar su contenido con un flujo **borrador → publicado**, sin riesgo de romper nada.

El sistema está diseñado para ser **multi-tenant**: cada negocio tiene su propio slug, sus usuarios con roles, y sus datos aislados.

> ⚠️ **Estado actual:** proyecto en desarrollo activo. Las funcionalidades marcadas como _pendiente_ están planificadas para el TFG.

---

## Funcionalidades implementadas

### 🔐 Autenticación
- Registro de negocio + usuario en un solo flujo
- Login con validación Zod, hash bcryptjs y JWT firmado con `jose`
- Sesión en cookie **HTTP-only** (inaccesible desde JS → protección XSS)
- Logout seguro que elimina la cookie en servidor
- Roles: `owner`, `marketing`, `staff`, `admin`

### 🎨 Sistema de Marca
- 4 paletas predefinidas: BCC, Ocean, Sunset, Mono
- Modos: claro, oscuro, sistema
- CSS Custom Properties en `data-brand-palette` y `data-brand-mode`
- Sincronización entre pestañas con `BroadcastChannel` (fallback a `storage` events)

### 🖼️ Hero Section
- Editor completo: badge, título, descripción, CTAs, logo, imagen de fondo
- Flujo **borrador → publicado** con persistencia en MongoDB
- Variantes A/B (`variantKey`)
- Logo como SVG inline animable o URL
- La web pública siempre lee solo `status: "published"`

### 📂 Taller de Medios
- Assets en Vercel Blob: imágenes, SVGs, vídeos
- Ámbito `system` (librería global) o `tenant` (por negocio)
- Etiquetado por slot: `tags: ["hero:logo"]`, `allowedIn: ["hero.logo"]`

### 📣 Campañas
- 4 objetivos: `captacion`, `oferta`, `evento`, `fidelizacion`
- 5 canales: `web`, `landing`, `whatsapp`, `rrss`, `email`
- 4 estados: `draft`, `active`, `paused`, `ended`
- API REST CRUD completa con validación Zod
- _Conexión con la web pública: pendiente (TFG)_

### 🌐 Web Pública (SSR)
- Landing `/` con hero dinámico renderizado en servidor
- Páginas `/[slug]` multi-tenant
- `BrandHydrator` y `HeroHydrator` inicializan el estado cliente

---

## Arquitectura

```mermaid
graph TB
    subgraph PUBLIC["🌐 Web Pública (SSR)"]
        LP["/ — Landing"]
        BP["/[slug] — Negocio"]
    end

    subgraph PANEL["🔧 Panel Admin /panel/*"]
        DASH["dashboard"]
        WC["web-control/*"]
        TALLER["taller/*"]
    end

    subgraph API["⚡ API Routes /api/*"]
        AUTH["/api/auth/*"]
        HERO_API["/api/web/hero"]
        CAMP_API["/api/campaigns"]
        MEDIA_API["/api/taller/media"]
    end

    subgraph DB["🗄️ Persistencia"]
        MONGO[("MongoDB Atlas")]
        BLOB[("Vercel Blob")]
    end

    PANEL -->|JWT cookie| API
    PUBLIC --> API
    API --> MONGO
    API --> BLOB
```

### Patrón de estado cliente

```
Service class  →  Repository (localStorage/DB)  →  useSyncExternalStore  →  Componente
      ↑                                                      ↓
      └──────────────── BroadcastChannel (sync entre tabs) ──┘
```

---

## Flujo del Hero

```mermaid
sequenceDiagram
    actor U as Usuario
    participant P as Panel /web-control/hero
    participant API as PUT /api/web/hero
    participant DB as MongoDB
    participant PUB as POST /api/web/hero/publish
    participant WEB as Web pública

    U->>P: Edita badge, título, CTAs...
    P->>API: PUT {data, status: "draft"}
    API->>DB: Upsert HeroConfig {status: "draft"}
    DB-->>P: 200 OK — borrador guardado
    Note over P: Vista previa en tiempo real
    U->>PUB: Pulsa "Publicar"
    PUB->>DB: Upsert HeroConfig {status: "published"}
    WEB->>DB: SSR lee status = "published"
    DB-->>WEB: Datos actualizados
```

**Índice único compuesto:** `(businessId, businessSlug, status, variantKey)` — garantiza que nunca hay dos publicados para la misma variante.

---

## Flujo de autenticación

```mermaid
sequenceDiagram
    actor U as Usuario
    participant API as /api/auth/login
    participant DB as MongoDB
    participant CK as Cookie HTTP-only

    U->>API: POST {email, password}
    API->>API: Zod LoginSchema.parse()
    API->>DB: findOne({ email })
    DB-->>API: User con passwordHash
    API->>API: bcrypt.compare(password, hash)
    alt Válido
        API->>API: jose.sign({userId, businessId, role}, JWT_SECRET)
        API->>CK: Set-Cookie: session=token#59; HttpOnly
        API-->>U: 200 OK
    else Inválido
        API-->>U: 401 Unauthorized
    end
```

**¿Por qué cookie HTTP-only y no localStorage?**  
Una cookie `HttpOnly` es inaccesible desde JavaScript, eliminando el vector XSS más común (robo de token).

---

## Modelo de datos

### `Business`
| Campo | Tipo | Descripción |
|---|---|---|
| `name` | String | Nombre visible del negocio |
| `slug` | String unique | Identifica al tenant en la URL |
| `activeHeroVariantKey` | String | Variante del hero activa |

### `User`
| Campo | Tipo | Descripción |
|---|---|---|
| `businessId` | ObjectId → Business | Negocio al que pertenece |
| `name` / `email` | String | Datos de acceso |
| `passwordHash` | String | Hash bcryptjs (nunca plaintext) |
| `role` | enum | `owner` \| `marketing` \| `staff` \| `admin` |

### `HeroConfig`
| Campo | Tipo | Descripción |
|---|---|---|
| `businessId` / `businessSlug` | ObjectId / String | Referencia al tenant |
| `status` | enum | `draft` \| `published` |
| `variantKey` | String | Variante A/B/C (default: `"default"`) |
| `data` | HeroData (subdoc) | badge, title, desc, CTAs, logoUrl, logoSvg, backgroundImageUrl |

Índice único: `{ businessId, businessSlug, status, variantKey }`

### `Campaign`
| Campo | Tipo | Descripción |
|---|---|---|
| `businessId` | ObjectId → Business | |
| `objective` | enum | `captacion` \| `oferta` \| `evento` \| `fidelizacion` |
| `channels` | String[] | `web` \| `landing` \| `whatsapp` \| `rrss` \| `email` |
| `status` | enum | `draft` \| `active` \| `paused` \| `ended` |
| `startAt` / `endAt` | Date | Vigencia de la campaña |

### `Asset`
| Campo | Tipo | Descripción |
|---|---|---|
| `businessId` | ObjectId \| null | null = librería del sistema |
| `scope` | enum | `system` \| `tenant` |
| `kind` | enum | `image` \| `svg` \| `video` |
| `key` / `url` | String | Ruta y URL pública (Vercel Blob) |
| `tags` / `allowedIn` | String[] | Etiquetado por slot (`hero:logo`) |

---

## Stack tecnológico y decisiones

| Tecnología | Versión | ¿Por qué? |
|---|---|---|
| **Next.js** | 16.1.4 | App Router: SSR + CSR en un proyecto. API Routes integradas. |
| **React** | 19.2.3 | `useSyncExternalStore` para estado externo sin librerías. |
| **TypeScript** | 5.x | Tipado end-to-end. Errores en compilación, no en runtime. |
| **Tailwind CSS** | 4.x | CSS Custom Properties para el sistema de marca dinámico. |
| **MongoDB + Mongoose** | 9.1.5 | Documentos flexibles para presets que cambian de forma. Índices únicos compuestos. |
| **Vercel Blob** | 2.3.0 | CDN integrado para assets. Sin configurar servidor propio. |
| **bcryptjs** | 3.0.3 | Hash seguro de contraseñas con salt aleatorio. |
| **jose** | 6.1.3 | JWT compatible con Edge Runtime de Next.js. |
| **Zod** | 4.3.6 | Validación runtime en API. Los schemas generan tipos TypeScript. |

---

## Instalación y desarrollo local

### Requisitos
- Node.js 18+
- Cuenta en [MongoDB Atlas](https://www.mongodb.com/atlas)
- Cuenta en [Vercel](https://vercel.com/) (para Vercel Blob)

### Pasos

```bash
# 1. Clona el repositorio
git clone https://github.com/EluMancebo/business-control-center.git
cd business-control-center

# 2. Instala dependencias
npm install

# 3. Configura las variables de entorno
cp .env.example .env.local
# Edita .env.local con tus valores

# 4. (Opcional) Carga datos de prueba
# Con el servidor arrancado: POST http://localhost:3000/api/dev/seed/business

# 5. Arranca el servidor de desarrollo
npm run dev
# → http://localhost:3000
```

### Scripts

```bash
npm run dev      # Servidor de desarrollo con hot reload
npm run build    # Build de producción
npm run start    # Servidor de producción (requiere build)
npm run lint     # ESLint
```

---

## Variables de entorno

Archivo `.env.local` en la raíz del proyecto:

```env
# Cadena de conexión a MongoDB Atlas
# Formato: mongodb+srv://usuario:password@cluster.mongodb.net/bcc
MONGODB_URI=

# Secreto para firmar los JWT (cadena larga y aleatoria)
# Genera una: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=

# Token de Vercel Blob (lectura/escritura)
# Obtenlo en: vercel.com → proyecto → Storage → Blob → Connect
BLOB_READ_WRITE_TOKEN=
```

> **Nunca subas `.env.local` al repositorio.** Está en `.gitignore` por defecto.

---

## Estructura del proyecto

```
src/
├── app/                           # Next.js App Router
│   ├── layout.tsx                 # Layout raíz (BrandHydrator + HeroHydrator)
│   ├── page.tsx                   # Landing pública (SSR)
│   ├── [slug]/page.tsx            # Páginas de negocio dinámicas
│   ├── login/                     # Página de login
│   ├── api/
│   │   ├── auth/login|logout|register/route.ts
│   │   ├── web/hero/route.ts      # GET/PUT — hero borrador
│   │   ├── web/hero/publish/route.ts  # POST — publicar hero
│   │   ├── campaigns/route.ts     # GET/POST
│   │   ├── campaigns/[id]/route.ts
│   │   ├── taller/media/route.ts
│   │   ├── session/route.ts
│   │   └── health/route.ts
│   └── panel/
│       ├── dashboard/
│       ├── web-control/hero|brand|services|hours|location|offers|testimonials/
│       └── taller/media|presets/hero/
│
├── components/
│   ├── brand/                     # BrandHydrator, BrandEditor, DynamicLogo...
│   ├── panel/                     # PanelShell, Sidebar, Topbar, PageHeader...
│   ├── web/                       # HeroSection, PublicHero
│   └── footer/                    # FooterSignature, AnimatedSignature
│
├── lib/
│   ├── db.ts                      # Singleton MongoDB
│   ├── auth/                      # jwt.ts, password.ts, session.ts, serverSession.ts
│   ├── brand/                     # service.ts, hooks.ts, repository.ts, presets.ts...
│   ├── web/hero/                  # service.ts, hooks.ts, storage.ts, types.ts
│   └── tenant/resolveBusiness.ts
│
├── models/                        # Schemas Mongoose: Business, User, HeroConfig, Campaign, Asset
└── validators/                    # Schemas Zod: auth.ts, campaign.ts
```

---

## Rutas disponibles

### Web pública
| Ruta | Descripción |
|---|---|
| `/` | Landing con hero dinámico |
| `/[slug]` | Página pública del negocio |
| `/login` | Acceso al panel |

### Panel (requiere autenticación)
| Ruta | Estado |
|---|---|
| `/panel/dashboard` | ✅ |
| `/panel/web-control/hero` | ✅ |
| `/panel/web-control/brand` | ✅ |
| `/panel/taller` | ✅ |
| `/panel/web-control/services` | 🔧 pendiente |
| `/panel/web-control/hours` | 🔧 pendiente |
| `/panel/web-control/location` | 🔧 pendiente |
| `/panel/web-control/offers` | 🔧 pendiente |
| `/panel/web-control/testimonials` | 🔧 pendiente |

### API principal
| Endpoint | Método | Descripción |
|---|---|---|
| `/api/auth/register` | POST | Registro |
| `/api/auth/login` | POST | Login → JWT cookie |
| `/api/auth/logout` | POST | Elimina cookie |
| `/api/web/hero` | GET / PUT | Lee / guarda borrador |
| `/api/web/hero/publish` | POST | Publica borrador |
| `/api/campaigns` | GET / POST | Campañas |
| `/api/campaigns/[id]` | GET / PUT / DELETE | |
| `/api/taller/media` | GET / POST | Assets |
| `/api/health` | GET | Healthcheck |

---

## Trabajo pendiente

### Contenido web
- [ ] Editor de servicios
- [ ] Horario semanal con excepciones
- [ ] Ubicación con mapa
- [ ] Testimonios / reseñas

### Campañas y marketing
- [ ] Activación de campañas en web pública
- [ ] Ofertas con caducidad
- [ ] Constructor de landing pages
- [ ] Captura de leads

### Mejoras técnicas
- [ ] **Guards de acceso por rol** (middleware que comprueba `role` del JWT)
- [ ] Tests unitarios (Jest / Vitest)
- [ ] Tests e2e (Playwright)
- [ ] Optimización de imágenes con `next/image`
- [ ] SEO dinámico por negocio
- [ ] Despliegue en Vercel con CI/CD

---

## Guía de contribución

### Ramas

```
main        → código estable
develop     → rama de integración (base para PRs)
feature/xxx → nuevas funcionalidades
fix/xxx     → correcciones
```

### Flujo

```bash
git checkout develop && git pull
git checkout -b feature/mi-funcionalidad
# ... haz tus cambios ...
git commit -m "feat: descripción breve"
# Abre PR a develop
```

### Convención de commits (Conventional Commits)

```
feat:     nueva funcionalidad
fix:      corrección de bug
refactor: cambio sin nuevo comportamiento
docs:     documentación
chore:    mantenimiento (deps, config)
test:     tests
```

### Antes de hacer PR

```bash
npm run lint    # Sin errores ESLint
npm run build   # Build limpio sin errores TypeScript
```

### Añadir una nueva sección a Web Control

1. Crea `src/app/panel/web-control/tu-seccion/page.tsx`
2. Añade la entrada en `src/components/panel/nav.ts` (grupo `web-control`)
3. Registra metadatos en `src/components/panel/routeMeta.ts`
4. Crea el endpoint en `src/app/api/web/tu-seccion/route.ts`
5. Define el schema Zod en `src/validators/`
6. Si necesitas modelo de datos, crea el schema en `src/models/`

---

*Creado por [EluMancebo](https://github.com/EluMancebo) · TFG Grado Superior DAW*
