Estamos trabajando en el proyecto Business Control Center (BCC).

⚠️ CONTEXTO CRÍTICO (NO IGNORAR)

BCC NO es un editor web genérico.
Es un sistema para crear y operar webs profesionales de forma eficiente.

Arquitectura:

* Capa 1 (Taller): define sistema, presets, media y contenido reutilizable.
* Capa 2 (Cliente): consume, ajusta y publica dentro de límites.

Eje principal del producto:

👉 Brand → Media → Content Studio

Responsabilidades:

* Brand:
  Define sistema visual (paleta, harmony, surfaces, overlays).
  Incluye preview por contextos (hero, card, promo, popup).
  Permite guardar presets de branding.

* Media:
  Sistema de assets tipados (no URLs libres).
  Organizado por cliente, sector, genérico, creativo.
  Incluye pipeline futuro: imagen → optimización → SVG (cuando proceda).

* Content Studio:
  Creación de piezas reutilizables (banners, promos, popups, cards).
  Usa Brand + Media.
  Basado en ContentBlock (draft/published).

Reglas:

* NO romper sistema actual (BrandEditor, Hero, theme).
* Cambios mínimos, incrementales y aislados.
* NO crear libertad destructiva en Capa 2.
* El cliente NO diseña, solo opera.

Estado actual:

✔ ContentBlock base
✔ Overlay presets
✔ Surface tokens (aislados)
✔ PromoBanner funcional en Content Studio

Objetivo actual:

👉 Consolidar sistema (no añadir complejidad innecesaria)
👉 Preparar integración futura con Media y Theme

Trabajar siempre desde arquitectura, no desde UI aislada.
 