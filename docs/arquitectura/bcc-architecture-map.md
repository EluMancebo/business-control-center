# BCC Architecture Map (v1)

## 1. Visión general

Business Control Center (BCC) es un sistema multicapas para construir, configurar y operar la presencia digital de negocios locales.

No es un website builder libre.
Es un sistema gobernado por reglas, presets y branding controlado.

---

## 2. Capas del producto

### Capa 1 — Taller / Studio
Uso interno del sistema o del equipo.

Responsabilidades:
- branding
- presets
- layouts
- assets globales
- composición
- reglas de diseño
- laboratorios de preview

### Capa 2 — Panel cliente
Centro de control operativo del negocio.

Responsabilidades:
- gestión del negocio
- contenido autorizado
- opciones seguras
- configuración limitada

### Capa 3 — Web pública
Resultado final publicado para usuarios del negocio.

Responsabilidades:
- renderizar configuración publicada
- proyectar la identidad del negocio
- consumir snapshots y datos aprobados

---

## 3. Núcleos del sistema

### Brand System
Incluye:
- brand base
- brand-theme
- tokens semánticos
- preview local
- hydrators

### Media System
Incluye:
- upload a Vercel Blob
- metadata en MongoDB
- ownership multitenant
- allowedIn
- future usage tracking

### Preset System
Incluye:
- hero presets
- futuros presets de header, footer, layout
- plantillas reutilizables por el sistema

### Site System
Incluye:
- studio
- site
- site-reader
- site-renderer
- public-site

---

## 4. Flujo general

1. El sistema define capacidades base
2. Capa 1 diseña, configura y valida
3. Capa 2 opera dentro de reglas
4. Capa 3 publica y muestra

---

## 5. Principios de arquitectura

- mobile-first
- multitenant
- branding semántico
- separación entre sistema y cliente
- aislamiento por tenant
- cambios mínimos
- tipado estricto

---

## 6. Tecnología base

- Next.js
- React
- Tailwind
- TypeScript
- MongoDB
- Vercel Blob

---

## 7. Objetivo estructural

Que el sistema permita:

- identidad visual fuerte
- consistencia entre interfaces
- escalado por módulos
- control seguro del branding
- experiencia operativa real para negocio local 

