# BCC Content-Lab / Creative Studio Base Spec (v1)

## 1. Objetivo del documento

Definir una base estable y mantenible para el subdominio Content-Lab / Creative Studio en BCC, con foco en:

- separacion clara de responsabilidades entre Capa 1 y Capa 2
- libertad creativa guiada (sin editor libre)
- convivencia operativa de presets y campos editables
- preparacion del siguiente hito (core foundation) sin implementar logica compleja todavia

Este documento es especificacion base de producto y arquitectura, no brainstorming.

## 2. Definiciones de capa

### 2.1 Capa 1: Content-Lab

Content-Lab es la capa de gobierno creativo del sistema.

Responsabilidades:

- decidir que estructuras pueden existir
- definir bloques autorizados, reglas y limites
- validar calidad antes de habilitar uso en Capa 2
- proteger consistencia visual y semantica de marca

No es un editor libre.
No expone complejidad tecnica al usuario final.

### 2.2 Capa 2: Creative Studio

Creative Studio es la capa de composicion asistida para el usuario final.

Responsabilidades:

- crear piezas dentro de lo autorizado por Content-Lab
- combinar presets con campos editables permitidos
- mantener una experiencia creativa, friendly y util, sin romper reglas de calidad

Creative Studio no diseña desde cero.
Creative Studio ensambla con libertad guiada.

## 3. Modelo de relacion Capa 1 -> Capa 2

Regla principal:

- Capa 1 autoriza
- Capa 2 consume

Implicaciones:

- si una estructura no esta autorizada en Capa 1, no existe en Capa 2
- Capa 2 puede configurar contenido, no redefinir sistema de layout
- toda creatividad en Capa 2 vive dentro de reglas transparentes, no de bloqueos arbitrarios

## 4. Modelo de composicion en Capa 2

En Creative Studio deben convivir dos elementos:

- presets: punto de partida rapido y seguro
- slots/campos editables: ajuste contextual sin romper diseño

Reglas de convivencia:

- cada preset define slots editables explicitos
- cada slot tiene tipo, limites y validaciones
- el sistema permite variacion, pero evita desviacion estructural

Resultado esperado:

- sensacion de libertad creativa real
- resultados consistentes, publicables y alineados con la identidad del sistema

## 5. Principio de libertad creativa guiada

El principio operativo es:

- "libertad dentro de limites utiles"

Esto significa:

- no rigidez tecnica visible para el usuario
- no caos visual ni deuda de mantenimiento para el sistema
- guidance progresiva: sugerir, validar y encauzar sin friccion excesiva

## 6. Entidades base del dominio

Las siguientes entidades definen el lenguaje comun de Content-Lab / Creative Studio.

### 6.1 ContextBrief

Define intencion y contexto de una composicion.

Incluye, de forma conceptual:

- objetivo del bloque/pieza
- tono y enfoque de comunicacion
- audiencia o contexto de uso
- restricciones clave de contenido y diseño

### 6.2 Block

Unidad estructural autorizada por Content-Lab (ej: hero, banner).

Incluye, de forma conceptual:

- tipo de bloque
- slots disponibles
- reglas de composicion
- variantes autorizadas

### 6.3 LabPiece

Pieza concreta creada en Creative Studio a partir de Block + ContextBrief.

Incluye, de forma conceptual:

- referencia a block
- valores reales de slots/campos
- estado de ciclo de vida
- metadatos de validacion

### 6.4 DesignRuleset

Conjunto de reglas que gobierna coherencia visual y semantica.

Incluye, de forma conceptual:

- reglas de layout y jerarquia
- limites de densidad/longitud
- restricciones de combinacion de recursos
- criterios minimos de calidad visual

### 6.5 Quality Gate

Mecanismo de control previo a distribucion/publicacion.

Incluye, de forma conceptual:

- chequeos obligatorios
- resultado (pass/fail con razones)
- señales de riesgo y recomendaciones

### 6.6 Preset

Configuracion base reutilizable y autorizada para iniciar composicion.

Incluye, de forma conceptual:

- bloque objetivo
- distribucion inicial de slots
- defaults recomendados
- compatibilidades y limites

## 7. Flujo principal del sistema

### 7.1 Intencion

Se crea o selecciona un ContextBrief.

### 7.2 Composicion

Creative Studio usa un Block autorizado y parte de un Preset.
El usuario rellena slots/campos editables permitidos.

### 7.3 Validacion

Se ejecutan DesignRuleset + Quality Gate.
Si falla, se devuelve feedback accionable.

### 7.4 Distribucion

Solo piezas validadas pasan a consumo posterior/publicacion segun la arquitectura vigente.

## 8. Primer slice recomendado: Hero / Banner Candidate Flow

Primer hito funcional recomendado para Content-Lab:

- ContextBrief para campaña/contexto de home
- Block tipo hero/banner autorizado
- set corto de Presets iniciales
- slots editables minimos (copy, CTA, media, acentos)
- Quality Gate basico previo a candidate listo para revision

Criterio de exito del slice:

- crear piezas utiles rapidamente
- mantener consistencia visual
- reducir trabajo manual repetitivo
- generar base reutilizable para bloques siguientes

## 9. Naming de Capa 2 (cercano al usuario)

Objetivo:

- evitar terminologia interna o tecnica en la interfaz final

Recomendaciones:

- nombre de capa visible: "Creative Studio"
- lenguaje operativo: "composiciones", "variantes", "bloques", "ajustes"
- evitar en UI final: "schema", "ruleset", "pipeline", "orchestrator"

## 10. Principios visuales para Capa 2

Creative Studio debe sentirse:

- friendly
- limpio
- aireado
- responsive
- creativo y util

Sin perder control:

- jerarquia clara de acciones
- feedback legible y no tecnico por defecto
- guardrails discretos pero firmes

## 11. Preparacion del siguiente hito (core foundation)

Estado de esta iteracion:

- no se implementa logica nueva de Content-Lab
- no se crean pantallas nuevas
- no se abre persistencia adicional

Ruta propuesta para siguiente ticket:

- `src/lib/content-lab/types.ts`

Entidades minimas previstas para implementar en ese archivo:

- `ContextBrief`
- `Block`
- `LabPiece`
- `DesignRuleset`
- `LabPieceStatus`

Orden recomendado:

1. definir tipos puros
2. fijar relaciones minimas entre entidades
3. validar alineacion con Capa 1 autoriza / Capa 2 consume
4. solo despues conectar casos de uso concretos

Razon de este orden:

- reduce riesgo de contratos inestables
- evita UI prematura sin modelo solido
- permite evolucion incremental sin refactor global

## 12. Mantra del sistema

Construir con libertad guiada: creatividad para el usuario, control para el sistema.
