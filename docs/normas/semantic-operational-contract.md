# BCC Semantic Operational Contract (v1)

Estado: aprobado para uso operativo inmediato en Capa 1 y Capa 2.
Alcance: UI interna del panel y laboratorios de branding, sin modificar el modelo de producto.

---

## A0) Referencia de superficies

La definicion oficial de profundidad visual y escalera de superficies vive en:
- `docs/normas/bcc-visual-contract-v1.md`

Este contrato mantiene la semantica global y gobernanza de tokens.
El contrato visual fija la calibracion perceptiva `background/surface/card/panel/popover`.

---

## A) Proposito

BCC usa semantica visual para separar:
- intencion de uso de UI (superficie, accion, estado, legibilidad)
- fuente cromatica (preset, palette seed, modo)

Esto evita:
- acoplar componentes a colores directos
- deriva visual entre modulos
- roturas al cambiar paleta o modo

Regla base:
- color directo describe "como se ve hoy"
- token semantico describe "para que sirve"

---

## B) Capas del sistema semantico

1. Fuente visual
- preset fijo (`bcc`, `ocean`, `sunset`, `mono`) o seed de paleta (`manual`, `logo`, `hero`)

2. Palette seed (Fase 1)
- entrada minima: `primary`, opcional `accent`, opcional `neutral`
- normalizacion hex y derivaciones controladas

3. Core tokens
- conjunto minimo base por modo (`light`/`dark`)
- foco en contraste, superficies y bordes

4. Semantic tokens
- tokens derivados para CTA, acentos, badges, overlays, links, superficies elevadas

5. Primitives
- `PanelCard`, `PanelButton`, `PanelActionBar`

6. UI real
- `PageHeader`, `Topbar`, `Sidebar` y pantallas de negocio

---

## C) Lista oficial inicial de tokens

### C.1 Obligatorios (base operativa)

`background`, `foreground`, `card`, `cardForeground`, `muted`, `mutedForeground`, `primary`, `primaryForeground`, `border`, `ring`

Uso obligatorio:
- toda nueva primitive
- contenedores base
- botones principales/secundarios

### C.2 Extendidos (ya operativos en brand-theme)

`secondary`, `secondaryForeground`, `accent`, `accentForeground`, `accentSoft`, `accentSoftForeground`, `accentStrong`, `accentStrongForeground`, `surface2`, `surface3`, `textSubtle`, `textInverse`, `ctaPrimary`, `ctaPrimaryForeground`, `ctaPrimaryHover`, `ctaSecondary`, `ctaSecondaryForeground`, `ctaSecondaryHover`, `badgeBg`, `badgeFg`, `heroOverlay`, `heroOverlayStrong`, `link`, `linkHover`

Uso recomendado:
- shells, toolbars, badges, previews, bloques de estado visual

### C.3 Futuros opcionales (aun no oficiales)

Solo se podran crear si hay necesidad transversal real:
- `success`, `warning`, `danger` (con foreground y soft)
- `focusStrong` (accesibilidad avanzada)
- `surfaceInverse` (zonas invertidas persistentes)

---

## D) Reglas de uso

Permitido:
- usar tokens semanticos via clases Tailwind mapeadas (`bg-card`, `text-foreground`, `border-border`)
- usar variables semanticas en brackets cuando no exista utilidad directa (`[background:var(--surface-2)]`)
- reutilizar primitives antes de crear estilos locales

Prohibido:
- hardcodear colores hex/rgba en componentes de panel salvo casos tecnicos de algoritmo interno
- crear variantes nuevas por pantalla sin necesidad transversal
- usar semantica de laboratorios para contaminar shell global

Cuando usar token vs clase directa:
- clase utilitaria si existe mapeo oficial (`bg-card`, `text-muted-foreground`)
- variable custom solo si el token no tiene alias utilitario en `@theme`

Cuando crear token nuevo:
- minimo 3 usos reales en modulos distintos
- no debe solaparse con un token existente
- debe tener nombre funcional, no estetico
- requiere actualizar este contrato y el contrato de diseno

---

## E) Mapeo por componente

### `PanelCard`
- base: `card`, `cardForeground`, `border`
- opcional contexto: `surface2` para contenedor secundario

### `PanelButton`
- `primary`: `primary` + `primaryForeground`
- `secondary`: `background` + `foreground` + `border` (hover hacia `muted`)
- `ghost`: texto sutil (`mutedForeground`) con hover controlado

### `PanelActionBar`
- superficie recomendada: `card`/`surface2`
- borde: `border`
- elementos internos deben usar `PanelButton` cuando sean acciones

### `PageHeader`
- titulo: `foreground`
- descripcion: `mutedForeground`
- acciones agrupadas en `PanelActionBar`

### `Topbar`
- fondo: `card` con transparencia controlada
- separacion: `border`
- acciones: `PanelButton` (sin botones ad hoc nuevos)

### `Sidebar`
- contenedor: `card`/`surface2` + `border`
- item activo: `background` + `border` + `foreground`
- item inactivo: `mutedForeground` con hover hacia `foreground`
- bloque accesos: `PanelButton`

### Futuros `PanelField` y `PanelBadge`

`PanelField`:
- input fondo `background`
- borde `border`
- foco `ring`
- helper/error en escala semantica, no color directo

`PanelBadge`:
- default: `badgeBg` + `badgeFg`
- variantes futuras (`success/warning/danger`) solo si se oficializan tokens

---

## F) Intensidad de branding por superficie/capa

Capa 1 (Studio/Taller):
- intensidad media
- shell estable y legible
- laboratorios pueden absorber mas identidad dentro de su superficie local

Capa 2 (Panel cliente):
- intensidad media-baja
- prioridad operativa y consistencia
- branding no debe degradar legibilidad ni densidad de trabajo

Capa 3 (Web publica):
- intensidad alta permitida
- mayor expresividad visual, respetando accesibilidad

Laboratorios y previews:
- pueden explorar variaciones fuertes
- nunca deben contaminar topbar/sidebar/chrome global
- preview runtime siempre local y reversible

---

## G) Reglas para Codex

Antes de tocar UI o branding, Codex debe:
1. leer los archivos reales implicados
2. identificar si existe primitive reutilizable
3. aplicar cambio minimo en capa correcta
4. evitar mezclar scopes (`studio`, `panel`, `web`, `system`)
5. no introducir persistencia extra para previews

Orden de decision obligatorio:
1. token existente
2. primitive existente
3. ajuste pequeno en primitive existente
4. nueva primitive (solo si hay repeticion transversal)
5. nuevo token (solo con justificacion transversal)

---

## H) Anti-patrones

- hardcodear `#...` en componentes del panel para "arreglos rapidos"
- crear botones/cards locales que dupliquen primitives
- resolver cada pantalla con clases diferentes para el mismo patron
- usar preview de brand para alterar shell global
- mezclar decisiones de `Brand` laboratorio con `Apariencia` operativa del shell
- introducir animaciones no contractuales en bloques operativos sin pasar por motion contract

---

## I) Politica de extension

### Crear un nuevo token

Solo si:
- hay necesidad recurrente en al menos 3 contextos
- no se cubre con composicion de tokens existentes
- se define contrato de uso y no solo ejemplo visual

Pasos:
1. propuesta en PR con casos concretos
2. actualizacion de `src/lib/brand-theme/types.ts` y resolucion
3. actualizacion de este contrato
4. migracion progresiva sin refactor masivo

### Crear una nueva primitive

Solo si:
- existe repeticion clara en modulos distintos
- aporta API pequena y estable
- evita duplicacion real de estilos/estructura

### Excepcion local

Permitida solo cuando:
- la necesidad es puntual y no transversal
- se documenta en comentario corto de contexto
- no rompe semantica base ni impone nuevo patron global

---

## Checklist de uso rapido para siguientes tickets

- Se usan tokens semanticos existentes.
- Se reutilizan primitives existentes.
- No se mezcla laboratorio con shell global.
- No se agrega persistencia para preview.
- Si se extiende semantica, se actualiza este contrato en la misma PR.
