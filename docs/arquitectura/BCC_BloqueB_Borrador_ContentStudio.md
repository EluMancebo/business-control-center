 # BCC — Bloque A v2: Media Pipeline (Definitivo)

## Estado actual (real)
- Existe CRUD funcional de media:
  - Asset.ts (Mongo)
  - /api/taller/media
  - repository.ts + service.ts
- Media Center operativo (Capa 1)
- Tipos en taller/media/types.ts parcialmente usados
- vectorization.ts es mock
- No existe pipeline real de derivados

## Objetivo
Convertir Media en el núcleo del sistema:
- ingestión
- normalización
- derivados
- vectorización (futuro)
- metadata
- ownership

## Fuente de verdad
- Asset.ts (modelo central)
- taller/media/types.ts (contrato canónico)

## Contratos legacy
- media/types.ts → compat temporal
- pipeline-types.ts → puente temporal

---

## Evolución mínima (MVP)

### Campos nuevos en Asset

- sourceAssetId (relación original → derivado)
- variantKey ("original" | "optimized" | "vectorized-svg")
- pipelineStatus ("queued" | "processing" | "ready" | "failed" | "skipped")
- pipelineStage ("ingest" | "analyze" | "derive" | "vectorize" | "done")
- pipelineError (string)

---

## Pipeline MVP

1. ingest → upload + Asset original
2. analyze → metadata básica
3. derive → variantes mínimas
4. done → estado listo

---

## Estados

- pipelineStatus (técnico)
- status (negocio): active | archived

---

## Ownership

Preparado para:
- system (Capa 1)
- tenant (Capa 2)

---

## Resultado

Media pasa de:
- librería de imágenes

a:

- sistema de assets inteligente y trazable   