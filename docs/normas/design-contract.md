# BCC Design Contract (v1)

## 1. Principio rector

Business Control Center se diseña **mobile-first**.

El usuario principal es el dueño del negocio operando desde móvil.

Toda interfaz debe:
- funcionar primero en móvil
- escalar después a desktop
- priorizar claridad, operatividad y velocidad de uso

---

## 2. Tipografía (CRÍTICO)

BCC adopta un sistema tipográfico dual:

- **UI font** → Inter
- **Brand font** → Poppins

### Uso

**Inter**
- inputs
- labels
- tablas
- botones
- metadata
- formularios
- texto operativo del panel

**Poppins**
- títulos de página
- branding
- hero
- nombres de módulos
- elementos con intención expresiva

### Escala tipográfica base

- Page title → `text-xl font-semibold`
- Section title → `text-sm font-semibold`
- Body → `text-sm`
- Meta → `text-xs text-muted`
- Labels → `text-xs font-medium`

No se deben introducir tamaños arbitrarios fuera de esta escala sin justificarlo antes en este documento.

---

## 3. Tokens semánticos

Los componentes no pueden depender de colores directos.

Siempre deben consumir tokens del sistema, incluyendo:

- `--surface-1`
- `--surface-2`
- `--surface-3`

- `--cta-primary`
- `--cta-primary-hover`
- `--cta-primary-foreground`

- `--cta-secondary`
- `--cta-secondary-hover`
- `--cta-secondary-foreground`

- `--badge-bg`
- `--badge-fg`

- `--accent-soft`
- `--accent-strong`

- `--text-subtle`
- `--link`
- `--link-hover`

Referencia obligatoria:
- la escalera semántica oficial de superficies (`background/surface/card/panel/popover`)
  se define en `docs/normas/bcc-visual-contract-v1.md`.
- `surface-1/2/3` siguen existiendo como base técnica, pero la lectura de producto se hace
  con niveles semánticos.

---

## 4. Sistema de superficies

Escalera oficial:
- `background`
- `surface`
- `card`
- `panel`
- `popover`

Relación con tokens base existentes:
- `surface-1`: base de `background`
- `surface-2`: banda de `surface`
- `surface-3`: banda de `panel/popover` (según elevación)
- `card`: capa intermedia entre `surface` y `panel`

Regla:
- la jerarquía de profundidad se construye primero con tono.
- borde y sombra solo apoyan, no reemplazan la jerarquía tonal.

---

## 5. Sombras

Solo se permiten niveles de sombra controlados:

- `shadow-xs`
- `shadow-sm`
- `shadow-md`

No se deben inventar sombras arbitrarias en cada pantalla.

---

## 6. Iconografía

BCC usará un único sistema de iconos.

Recomendación actual:
- **Lucide**

Tamaños base:
- `h-4 w-4`
- `h-5 w-5`
- `h-6 w-6`

---

## 7. Componentes base obligatorios

Todas las interfaces deben construirse con patrones repetibles y reconocibles.

### Card
- `rounded-xl`
- `border`
- `shadow-sm`
- padding consistente

### Section
Estructura:
- título
- descripción
- contenido

### Action Bar
Contiene:
- filtros
- búsqueda
- acciones principales

### Form
Patrón:
- label
- input
- help text

---

## 8. Layout rules

Jerarquía estándar:

1. `PageHeader`
2. `ActionBar`
3. `Content`

Evitar pantallas con mezcla caótica de:
- formularios
- tablas
- botones
- bloques sin agrupación clara

---

## 9. Mobile-first

Toda nueva pantalla debe resolverse primero en móvil.

Esto implica:

- evitar tablas rígidas como patrón principal
- priorizar listas y cards
- acciones visibles y agrupadas
- scroll vertical limpio
- formularios y filtros compactos
- uso cómodo con pulgar y una mano

Desktop es una ampliación del diseño móvil, no el punto de partida.

---

## 10. Estados obligatorios

Todo módulo debe contemplar:

- loading
- empty
- error
- success

---

## 11. Consistencia obligatoria

Ninguna nueva pantalla puede introducir:

- nuevas tipografías
- nuevos patrones visuales
- nuevos layouts base
- nuevos sistemas de iconos

sin actualizar antes este contrato.    
