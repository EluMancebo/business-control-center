# BCC Visual Contract (v1)

Estado: oficial para uso operativo en Capa 1, Capa 2 y previews de Brand Lab.
Objetivo: fijar la semantica de superficies y profundidad visual sin crear un sistema paralelo.

---

## 1) Alcance y alineamiento documental

Este contrato complementa y extiende:
- `docs/normas/semantic-operational-contract.md` (semantica y gobernanza de tokens)
- `docs/normas/design-contract.md` (reglas de diseno, layout y consistencia)

Regla de alineamiento:
- `semantic-operational-contract`: define la arquitectura semantica general.
- `design-contract`: define reglas de UI y uso de componentes.
- `bcc-visual-contract-v1`: define especificamente la escalera de superficies, profundidad y modulacion visual.

---

## 2) Cadena operativa oficial (fuente de verdad)

En Brand Lab y flujos relacionados, la lectura oficial es:
1. Input base: `paletteSeedInput` (`primary`, `accent`, `neutral`, `source`)
2. Transformacion: `mode`, `preset`, `harmony`, `accentStyle`, `typography`
3. Output tecnico final: tokens resueltos (`effectiveTokens`)
4. Preview diagnostica: lectura auxiliar local (nunca verdad paralela)

Regla operativa:
- la preview principal representa la salida final del sistema.
- cualquier capa diagnostica adicional debe estar etiquetada como diagnostico.
- el diagnostico no sustituye ni contradice el output tecnico final.

---

## 3) Niveles oficiales de superficie

Niveles semanticos oficiales:
1. `background`
2. `surface`
3. `card`
4. `panel`
5. `popover`

Intencion funcional:
- `background`: base estructural del area de trabajo.
- `surface`: contenedor principal de contenido operativo.
- `card`: bloques de contenido y unidades funcionales dentro de `surface`.
- `panel`: bloques mas asentados o de control dentro del flujo.
- `popover`: primer plano elevado (menus, popups, overlays de lectura local).

Regla estructural:
- mayor altura visual = tono ligeramente mas asentado.
- las capas altas no pueden ser mas blancas que su contenedor en light.
- en dark, las capas altas no pueden colapsar hacia gris plano sin separacion.

---

## 4) Relacion con tokens base ya existentes

Este contrato no rompe tokens legacy; los ordena semanticamente.

Correspondencia operativa:
- `background` -> `--background` (base)
- `surface` -> banda de `--surface-2` / `surface2` segun contexto
- `card` -> `--card` (o banda equivalente local entre `surface` y `panel`)
- `panel` -> banda de `--surface-3` / `surface3`
- `popover` -> superficie mas alta derivada localmente desde `surface3`/`border` sin saltos bruscos
- `task` (zona de trabajo primaria) -> `--task-surface` + `--task-surface-foreground` con `elevationTask`

Notas:
- `surface-1/2/3` se mantienen como infraestructura tecnica.
- la API semantica para lectura de producto es `background/surface/card/panel/popover`.
- `border` y `shadow` son apoyo, no construyen jerarquia por si solos.

---

## 5) Ley perceptiva light / dark

Calibracion perceptiva objetivo:

Light:
- `background`: L ~ 0.965
- `surface`: L ~ 0.940
- `card`: L ~ 0.910
- `panel`: L ~ 0.875
- `popover`: L ~ 0.845

Dark:
- `background`: L ~ 0.145
- `surface`: L ~ 0.185
- `card`: L ~ 0.225
- `panel`: L ~ 0.265
- `popover`: L ~ 0.305

Reglas:
- no es obligatorio OKLCH puro mientras la distancia perceptiva se conserve.
- evitar compresion excesiva entre `card/panel/popover`.
- evitar saltos agresivos que ensucien la UI.

---

## 6) Modulación por preset y harmony

Preset puede modular:
- atmosfera general
- temperatura cromatica
- peso visual de superficies
- matiz ambiental de la escalera

Preset no puede romper:
- legibilidad base
- orden de alturas
- separacion minima entre niveles

Harmony puede modular:
- identidad cromatica
- relacion entre `primary/accent/link`
- tono de acentos y atmosfera de marca

Harmony no puede:
- reescribir la escalera estructural de superficies
- invertir jerarquia `background -> surface -> card -> panel -> popover`

---

## 7) Rol de `primary`

`primary` debe liderar:
- CTA principal
- tabs/segmentos activos
- estados `selected`
- enlaces o acciones de prioridad
- foco (`ring`) y jerarquia de accion

`primary` no debe:
- dominar por defecto las superficies estructurales
- reemplazar la escalera tonal de profundidad
- convertir contenedores base en bloques de marca saturados

---

## 8) Aplicacion por capa del producto

Capa 1 (Studio / Taller):
- intensidad media
- puede expresar atmosfera de preset dentro de superficie local
- no contamina shell global

Capa 2 (Panel cliente):
- intensidad media-baja
- prioridad operativa y legibilidad
- profundidad clara con tono, no con borde duro

Previews / laboratorios:
- la vista principal muestra salida final del sistema
- el diagnostico es auxiliar y explicitamente etiquetado
- nunca debe parecer otra fuente de verdad

Shell global:
- estabilidad prioritaria
- variaciones de identidad controladas
- sin deriva por experimentacion de laboratorio

---

## 9) Sombras y bordes

Sombras:
- soporte secundario de separacion
- suaves, cortas, de baja intensidad
- no sustituyen la ley tonal

Escala oficial de elevacion (v1.1):
- `elevationBase`: cards y contenedores operativos por defecto
- `elevationInteractive`: micro elevacion de hover/focus (sin salto brusco)
- `elevationTask`: paneles de trabajo primario (`taskSurface`)
- `elevationOverlay`: popovers/overlays y capas altas

Reglas:
- usar siempre la escala semantica; no crear sombras ad hoc por pantalla.
- en panel operativo, hover = micro ajuste (`base -> interactive`) con transicion corta.
- la profundidad visual final se resuelve por tono + elevacion, no por borde duro.

Bordes:
- discretos (`borderSubtle` por defecto)
- apoyo de lectura, no mecanismo principal de profundidad
- prohibido endurecer bordes para compensar jerarquia mal calibrada

---

## 10) Anti-patrones oficiales

- usar misma etiqueta semantica para fuentes distintas sin explicitarlo
- comprimir `card/panel/popover` hasta perder lectura de altura
- usar color de marca directo como base estructural sin control
- tratar preview local como fuente de verdad operativa
- corregir pantallas "a ojo" sin ajustar contrato
- resolver profundidad con borde duro en lugar de tono + sombra suave

---

## 11) Checklist de validacion rapida

- la cadena `input -> transformacion -> output -> diagnostico` es legible para el usuario.
- la preview principal coincide con la salida final.
- la capa diagnostica esta etiquetada y es opcional.
- `background/surface/card/panel/popover` se distinguen en light y dark.
- `harmony` no rompe escalera estructural.
- `primary` se percibe en acciones, no en toda la estructura.
