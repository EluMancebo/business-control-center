# BCC Content-Lab — North Star Spec v1

## Estado
Aprobado como marco estratégico y operativo para alinear arquitectura, producto, UX, implementación y prompts de trabajo.

## Propósito del documento
Fijar una visión estable para **Content-Lab** dentro de BCC y evitar desviaciones futuras por simplificación, recorte prematuro o interpretación parcial.

Este documento define:
- qué es Content-Lab,
- qué no es,
- cómo se relaciona con Capa 1, Capa 2, Media y la web pública,
- cuál es su flujo oficial,
- cuáles son sus módulos conceptuales,
- qué slice inicial debe construirse primero,
- y qué reglas deben seguir ChatGPT, Codex y cualquier implementación futura.

---

# 1. Definición del producto

## 1.1 Qué es BCC
**Business Control Center** es un sistema operativo de negocio para pequeñas empresas que centraliza:
- web pública profesional,
- branding guiado,
- captación,
- contenido,
- automatización,
- y operación segura por capas.

## 1.2 Qué es Content-Lab
**Content-Lab** es la capa de gobierno creativo, editorial, visual y técnico de BCC.

No es un editor libre.  
No es un Canva interno.  
No es una carpeta de banners.  
No es un generador de posts aislado.

**Es un sistema de ensamblaje, evaluación, aprobación, versionado y publicación de piezas visuales/editoriales consumibles por Capa 2 sin romper diseño.**

## 1.3 Qué problema resuelve
La mayoría de sistemas permiten editar demasiado pronto, con demasiada libertad y sin gobernanza.  
Eso produce:
- inconsistencia visual,
- deuda técnica,
- roturas responsive,
- mala conversión,
- y dependencia continua del diseñador.

Content-Lab resuelve esto sustituyendo la edición libre por:
- estructuras aprobadas,
- presets seguros,
- zonas editables delimitadas,
- quality gate,
- salida controlada a Capa 2.

---

# 2. Principio rector

## 2.1 Regla maestra
**Capa 1 autoriza. Capa 2 consume.**

### Implicaciones
- Nada pasa a Capa 2 solo por haber sido creado.
- Una pieza solo llega a Capa 2 si:
  - existe,
  - se valida,
  - se aprueba,
  - se versiona,
  - y se expone como preset consumible.

## 2.2 Filosofía operativa
**Creatividad guiada, no libertad caótica.**

El sistema debe permitir:
- rapidez,
- consistencia,
- reutilización,
- autonomía segura del cliente,
- y calidad visual alta.

El sistema no debe permitir:
- maquetación libre,
- alterar layout estructural,
- editar CSS/HTML,
- improvisar bloques fuera del sistema,
- romper responsive,
- degradar branding o UX.

---

# 3. Jerarquía global del sistema

## 3.1 Cadena correcta de responsabilidad

```text
Media piensa sobre el asset
Content-Lab piensa sobre la pieza
Capa 2 usa la pieza aprobada
Web pública consume el resultado final
```

## 3.2 Relación entre dominios

### Media
Responsable de:
- ingestión,
- clasificación,
- derivados,
- optimización,
- ratios,
- formatos,
- análisis SVG,
- variantes técnicas.

### Content-Lab
Responsable de:
- contexto,
- composición,
- copy,
- comparación,
- validación,
- aprobación,
- versionado,
- y publicación lógica hacia Capa 2.

### Capa 2
Responsable de:
- instanciar presets aprobados,
- rellenar texto,
- subir/reemplazar imágenes,
- editar CTA,
- operar dentro de límites seguros.

### Web pública
Responsable de:
- renderizar contenido ya resuelto,
- nunca decidir lógica creativa libre en runtime.

---

# 4. Modelo mental oficial

Para evitar que Content-Lab se convierta en un conjunto de módulos inconexos, se fija esta lectura mental en 4 niveles:

## 4.1 Intención
Qué queremos conseguir.
- objetivo
- canal
- público
- tono
- KPI
- restricciones

## 4.2 Composición
Qué pieza concreta responde a esa intención.
- asset
- copy
- preset
- estructura
- variantes

## 4.3 Validación
Si la pieza cumple:
- completitud
- reglas
- calidad visual
- responsive
- UX
- SEO
- performance
- accesibilidad

## 4.4 Distribución
Cómo llega lo aprobado a uso real:
- preset vault
- player seguro de Capa 2
- publicación
- consumo posterior

---

# 5. Módulos oficiales de Content-Lab

Estos módulos quedan aprobados como estructura conceptual del producto.  
No implica implementarlos todos ahora, pero sí respetarlos como mapa del sistema.

## 5.1 Context Brief
Módulo de entrada estratégica.

### Responsabilidad
Recoger el contexto antes de crear una pieza.

### Campos núcleo
- objective
- channel
- audience
- tone
- primary KPI
- CTA intent
- restrictions
- strategic priority

### Función
Alimentar:
- generación de copy,
- decisiones de composición,
- variante sugerida,
- calidad esperada,
- y criterio de aprobación.

---

## 5.2 Asset Forge
Módulo de ensamblaje visual guiado.

### Responsabilidad
Preparar y componer piezas visuales a partir de assets ya gobernados por Media.

### Trabaja con
- assets existentes del Media Center,
- variantes SVG,
- overlays,
- recortes,
- ratios,
- composiciones seguras,
- presets visuales.

### Produce
- hero candidates
- banners
- cards
- popups
- bloques de oferta
- testimonios visuales
- bloques para newsletter

### Nota
No debe nacer como editor libre grande.  
Primero debe existir como sistema de composición controlada.

---

## 5.3 Copy Forge
Módulo de generación y curado de texto.

### Responsabilidad
Producir y comparar:
- headlines
- subheadlines
- CTA
- slogans
- microcopy
- claims
- autoridad

### Principio
Prioridad:
1. conversión
2. branding
3. SEO
4. automatización

### Rol de la IA
Copiloto, no soberano.
- sugiere
- propone
- reformula
- compara
- resume
- nunca decide sola la pieza final

---

## 5.4 Variant Arena
Módulo de comparación editorial.

### Responsabilidad
Comparar variantes de:
- diseño,
- copy,
- o combinaciones de ambos.

### Función real
No es testing real todavía.  
Es una **arena de decisión editorial**.

### Debe permitir
- comparación lado a lado,
- destacar diferencias,
- marcar favorita,
- descartar,
- dejar notas rápidas,
- pasar una variante al siguiente gate.

---

## 5.5 Quality Gate
Módulo de validación híbrida.

### Responsabilidad
Aplicar checks automatizados + criterio humano.

### Dimensiones mínimas
- diseño
- responsive
- UX/UI
- accesibilidad
- SEO
- performance

### Estado de madurez esperado
No hace falta automatizarlo todo al inicio, pero sí debe existir como módulo oficial del sistema.

### Regla
Una pieza puede ser:
- corregible,
- aprobable,
- bloqueable,
- o descartable.

---

## 5.6 Preset Vault
Biblioteca oficial de salida.

### Responsabilidad
Guardar únicamente piezas:
- aprobadas,
- versionadas,
- documentadas,
- con reglas de uso,
- listas para consumo seguro.

### Almacena
- nombre
- descripción
- objetivo
- canal
- tipo
- versión
- reglas de uso
- campos editables
- zonas permitidas
- assets asociados
- origen y trazabilidad

### Regla
**Preset Vault es la salida oficial de Capa 1 hacia Capa 2.**

---

## 5.7 Layer 2 Publisher / Player
Zona de consumo guiado.

### Responsabilidad
Exponer a Capa 2 solo lo aprobado y editable dentro de límites.

### Permite
- elegir preset aprobado
- editar texto permitido
- subir imagen
- recortar por ratio permitido
- reemplazar CTA
- optimizar imagen
- publicar sin romper diseño

### No permite
- añadir bloques
- borrar estructura base
- mover CTA libremente
- cambiar diseño fuera de tokens/reglas
- alterar layout protegido

---

# 6. Objeto principal del sistema

## 6.1 Regla
Content-Lab no debe girar alrededor de archivos o imágenes sueltas.  
Debe girar alrededor de **LabPiece**.

## 6.2 Qué es LabPiece
Una pieza de laboratorio con:
- intención,
- estructura,
- estado,
- validación,
- variantes,
- versión,
- destino posible.

## 6.3 Dirección aprobada del modelo
La pieza debe poder evolucionar hacia algo de este estilo conceptual:

```ts
type LabPieceStatus =
  | "draft"
  | "candidate"
  | "approved"
  | "obsolete"
  | "blocked";

type LabPieceType =
  | "hero"
  | "banner"
  | "card"
  | "popup"
  | "testimonial"
  | "newsletter-block"
  | "offer-block"
  | "social-post";
```

No implica implementar ya todos esos valores, pero sí fijar la dirección.

## 6.4 Biografía de pieza
Toda pieza debería poder contar:
- brief de origen
- versiones
- variantes previas
- resultado del gate
- motivo de aprobación o bloqueo
- destinos permitidos
- uso actual

Esta trazabilidad es parte del valor premium del sistema.

---

# 7. Estados y workflow oficial

## 7.1 Estados oficiales
Como dirección de producto quedan fijados estos estados:

- draft
- candidate
- approved
- obsolete
- blocked

## 7.2 Regla crítica
**Crear no equivale a aprobar. Aprobar no equivale a publicar.**

## 7.3 Flujo oficial
Este flujo queda fijado como columna vertebral de Content-Lab:

```text
Brief → LabPiece → Variants → Validation → Approval → Preset Vault → Layer 2 consume
```

## 7.4 Significado
- Brief: define intención
- LabPiece: materializa una pieza candidata
- Variants: compara alternativas
- Validation: mide calidad y completitud
- Approval: decisión editorial/técnica
- Preset Vault: salida oficial y versionada
- Layer 2 consume: uso guiado y seguro

---

# 8. Slice inicial obligatorio

## 8.1 Decisión
El primer slice funcional estratégico de Content-Lab será:

**Hero / Banner Candidate Flow**

## 8.2 Motivo
Porque ahí confluyen:
- asset
- copy
- branding
- CTA
- validación
- aprobación
- publicación futura

## 8.3 Flujo esperado del slice
1. definir brief
2. elegir asset
3. generar/curar copy
4. crear pieza tipo hero o banner
5. guardarla como draft o candidate
6. validarla
7. aprobarla manualmente
8. pasarla al vault
9. exponerla luego a Capa 2

## 8.4 Qué no hacer primero
No empezar por:
- social post generator
- editor visual masivo
- popup builder completo
- gran dashboard caótico

El slice correcto es hero/banner porque demuestra el corazón del sistema.

---

# 9. Principios de implementación

## 9.1 Ambición sí, caos no
Se aprueba una visión amplia, pero la implementación debe entrar por fases.

## 9.2 Regla de fase
No construir a la vez:
- Asset Forge completo
- Copy Forge completo
- Variant Arena completa
- Quality Gate completo
- Preset Vault completo
- Player completo

Eso ahogaría el proyecto.

## 9.3 Orden realista
### Fase 1
Núcleo de Content-Lab
- Context Brief
- LabPiece base
- validación mínima
- approval mínima
- preset vault simple

### Fase 2
Asset Forge + Copy Forge básicos

### Fase 3
Variant Arena mínima

### Fase 4
Quality Gate inicial

### Fase 5
Layer 2 Publisher / consumo seguro

---

# 10. UI/UX — dirección visual oficial

## 10.1 Sensación buscada
Content-Lab no debe sentirse como:
- WordPress,
- CMS genérico,
- Canva,
- builder caótico.

Debe sentirse como:
- estudio premium,
- sala de control,
- laboratorio creativo de precisión.

## 10.2 Estructura visual recomendada
### Layout base
- izquierda: navegación por fase / piezas / estados
- centro: preview/canvas/comparación
- derecha: contexto, reglas, scores, acciones

## 10.3 Reglas visuales
- mucho protagonismo de la preview
- estados muy visibles
- mucha jerarquía
- aire visual
- pocas distracciones
- paneles laterales discretos
- semántica de color muy clara por estado

## 10.4 Lectura rápida obligatoria
En cualquier pantalla importante deben ser visibles:
- brief activo
- estado de la pieza
- calidad / score / faltantes
- salida permitida hacia Capa 2

## 10.5 Diferencia entre capas
### Capa 1
Debe sentirse:
- técnica
- premium
- decisional
- editorial
- rigurosa

### Capa 2
Debe sentirse:
- simple
- guiada
- segura
- operativa
- casi inviolable

---

# 11. Relación con la arquitectura ya construida

## 11.1 Lo ya construido no se invalida
Se valida y se conserva:
- `src/lib/content/types.ts`
- `src/lib/content-lab/types.ts`
- mappers de payload
- validación mínima de required
- summary de validación
- integración con `sections`

## 11.2 Qué significa eso
No estamos rehaciendo el sistema.  
Estamos elevando su dirección de producto y alineando los siguientes pasos.

## 11.3 Ventaja actual del proyecto
A diferencia de visiones meramente conceptuales, BCC ya tiene:
- runtime real de sections
- tipado real
- puente técnico hacia consumo
- base de validación mínima
- pipeline media real

Eso es una fortaleza y debe preservarse.

---

# 12. Reglas obligatorias para ChatGPT y Codex

## 12.1 Prohibiciones
No simplificar Content-Lab a:
- generador de posts
- editor libre
- carpeta de presets sin workflow
- mapeo técnico sin gobernanza
- UI genérica de dashboard

No construir sistemas paralelos a:
- `taller/sections`
- media pipeline
- presets existentes

No mezclar Capa 1 y Capa 2 hasta que pierdan identidad.

## 12.2 Obligaciones
Toda propuesta futura debe respetar:
- Capa 1 autoriza, Capa 2 consume
- crear ≠ aprobar ≠ publicar
- Preset Vault como salida oficial
- LabPiece como objeto principal
- Quality Gate como módulo estructural
- Hero/Banner Candidate Flow como slice inicial recomendado
- UI premium, limpia y con foco en preview
- IA como copiloto, no como centro del sistema
- cambio mínimo y aterrizado al repo real

## 12.3 Orden mental obligatorio antes de proponer cambios
1. ¿Esto refuerza la gobernanza del sistema?
2. ¿Esto evita un editor libre?
3. ¿Esto preserva la separación entre capas?
4. ¿Esto se apoya en la estructura real del repo?
5. ¿Esto mejora la velocidad sin degradar calidad?
6. ¿Esto ayuda a construir un producto premium y seguro?

Si la respuesta es no, el cambio debe revisarse.

---

# 13. North Star del producto

## Frase oficial
**Content-Lab es el sistema de ensamblaje, evaluación, aprobación y publicación de piezas editoriales y visuales de BCC.**

## Traducción práctica
No es un módulo auxiliar.  
No es una pantalla más.  
No es un experimento.

Es una de las piezas troncales del valor diferencial de BCC.

---

# 14. Criterio de éxito

Content-Lab se considerará bien encaminado si permite esto:

> Producir una pieza hero o banner de nivel profesional, validarla, aprobarla, versionarla y exponerla a Capa 2 para consumo guiado sin romper diseño, con velocidad razonable y trazabilidad clara.

Si eso se cumple, el sistema merece seguir creciendo.  
Si no, hay que corregir antes de expandirlo.

---

# 15. Cierre

Este documento queda fijado como referencia de producto y arquitectura para evitar:
- simplificaciones peligrosas,
- desvíos hacia editores libres,
- duplicidades,
- y pérdida de ambición.

La implementación debe ser ambiciosa, sí, pero siempre:
- realista,
- incremental,
- aterrizada al repo,
- y fiel al objetivo de construir un producto premium, útil, eficaz, escalable y seguro.
