# BCC — Bloque A: Arquitectura alineada de SVG / Logos / Derivados / Media

## Objetivo del documento
Alinear futuros chats y decisiones técnicas con el estado real del proyecto BCC, evitando propuestas paralelas, reinventadas o desligadas de la estructura existente.

## Principio rector
No crear sistemas nuevos en paralelo si ya existe un dominio equivalente en el proyecto. Toda mejora debe:
1. partir de la estructura y contratos existentes,
2. extenderlos con cambio mínimo coherente,
3. mantener la lógica Capa 1 autoriza / Capa 2 consume,
4. preservar el diseño blindado y el flujo de trabajo construido.

## Estado real observado en la estructura actual
Ya existen dominios base que deben ser la raíz de cualquier evolución:
- `src/lib/brand-theme/*`: pipeline, presets, resolver, runtime, extraction, authorized.
- `src/lib/media/*`: tipos, mock, `vectorization.ts`, `pipeline-types.ts`.
- `src/lib/taller/media/*`: policies, repository, service, types.
- `src/models/Asset.ts`: modelo raíz de asset.
- `src/app/api/panel/media/route.ts` y `src/app/api/taller/media/route.ts`: entrada API para media.
- `src/app/panel/taller/media/*`: UI natural de Capa 1 para media.
- `src/app/panel/taller/web-brand/*`: punto natural para reconvertir hacia estudio de piezas / derivados.
- `src/lib/taller/presets/hero/*`: patrón de catálogo real ya iniciado.
- `src/lib/taller/sections/*` y `src/lib/content/types.ts`: base para composición tipada.

## Decisión de arquitectura
El Bloque A NO crea un módulo nuevo aislado. El Bloque A se implementa como una ampliación coordinada de:
- `media`
- `taller/media`
- `Asset`
- `brand-theme`
- `web-brand` (reorientado)

## Qué es Bloque A realmente
Bloque A no es solo “vectorizar logos”.
Es el sistema que permite:
- ingresar assets,
- clasificarlos,
- derivarlos,
- vectorizarlos cuando proceda,
- optimizarlos,
- prepararlos para animación,
- decidir en qué componentes pueden usarse,
- y dejarlos listos para ser reutilizados en hero, header, footer, popup, banner, card, rrss o PDF.

## Dónde encaja en la app actual
### Capa 1 — Taller
Lugar principal de trabajo:
- `src/app/panel/taller/media/page.tsx`
- `src/app/panel/taller/web-brand/page.tsx`
- futuro: tabs o submódulos para revisión de derivados, SVG y variantes.

### Capa 2 — Panel cliente
No crea pipeline ni modifica assets raíz.
Solo consume:
- assets autorizados,
- variantes permitidas,
- composiciones ya aprobadas.

### Web pública
Solo consume derivados o snapshots ya resueltos.

## Flujo operativo propuesto (alineado)
1. Subida de asset en Taller > Media.
2. Clasificación automática inicial.
3. Si procede, derivación raster.
4. Si procede, vectorización SVG.
5. Optimización SVG.
6. Análisis del SVG y cálculo de animabilidad.
7. Generación de variantes útiles.
8. Revisión humana.
9. Publicación/autorización a catálogo o a tenant.
10. Consumo posterior en Hero/Header/Footer/Content Studio.

## Qué NO hacer
- No crear otro “media studio” paralelo al actual.
- No meter lógica fuerte de derivados directamente en componentes React.
- No convertir `web-brand` en editor libre tipo Canva.
- No publicar automáticamente un SVG vectorizado sin revisión humana.
- No mezclar assets del sistema, sector y tenant sin ownership claro.

## Qué SÍ hacer
- Extender `Asset` y los tipos de `media`.
- Añadir un sistema de jobs/pipeline reutilizable.
- Guardar derivados y recipes.
- Integrar el resultado con hero presets y futuros header/footer/layouts.

## Propuesta técnica precisa

### 1. Extender `src/models/Asset.ts`
Añadir o consolidar campos como:
- `kind`: `logo | photo | hero | banner | card | popup | video | pdf | texture | icon`
- `scope`: `system | sector | tenant-shared | tenant-private`
- `sectorScopes: string[]`
- `allowedComponents: string[]`
- `styleTags: string[]`
- `reviewStatus: draft | processed | approved | rejected`
- `sourceFormat`
- `derivatives: AssetDerivative[]`
- `pipelineSummary`
- `isBrandCritical`

### 2. Ampliar `src/lib/media/types.ts`
Tipos transversales:
- `MediaKind`
- `MediaScope`
- `AllowedComponent`
- `AssetDerivativeKind`
- `AssetPipelineSummary`
- `AssetAnalysisResult`
- `AnimationSuitability`

### 3. Ampliar `src/lib/media/pipeline-types.ts`
Debe modelar los jobs reales del pipeline:
- `ingest`
- `classify`
- `raster-derivatives`
- `vectorize`
- `optimize-svg`
- `analyze-svg`
- `generate-variants`
- `animation-preview`
- `review`

Campos sugeridos:
- `jobId`
- `assetId`
- `stage`
- `status`
- `inputRef`
- `outputRefs`
- `errors`
- `warnings`
- `startedAt`
- `finishedAt`

### 4. Evolucionar `src/lib/media/vectorization.ts`
No sustituirlo. Convertirlo en fachada de vectorización.
Responsabilidades:
- decidir si un asset es vectorizable,
- elegir ruta simple o compleja,
- invocar motor de vectorización,
- devolver SVG provisional + metadatos.

### 5. Crear utilidades nuevas en `src/lib/media/`
Sin desordenar el árbol:
- `analyzer.ts`
- `derivatives.ts`
- `optimizer.ts`
- `animation.ts`
- `jobs.ts`

#### `analyzer.ts`
Detecta:
- complejidad visual,
- número de colores,
- presencia de alpha,
- si parece logo o foto,
- ratio,
- destino probable.

#### `derivatives.ts`
Genera:
- webp,
- png retina,
- mono,
- negativo,
- tint,
- hero-safe,
- navbar-safe,
- footer-safe.

#### `optimizer.ts`
Limpieza final del SVG.

#### `animation.ts`
No renderiza todavía el vídeo final. Calcula:
- tipo de animación sugerida,
- duración,
- si el SVG es apto para draw/reveal/fade/stagger.

#### `jobs.ts`
Orquestación simple del pipeline y persistencia de estado.

### 6. Extender `src/lib/taller/media/`
Aprovechar lo que ya existe:
- `policies.ts`
- `repository.ts`
- `service.ts`
- `types.ts`

Añadir ahí la lógica de negocio de Taller:
- qué puede procesarse,
- quién puede aprobar,
- cuándo un asset pasa de privado a reutilizable,
- qué derivados son obligatorios según tipo.

### 7. Reorientar `src/app/panel/taller/web-brand/`
No borrarlo. Reposicionarlo.

#### Función nueva propuesta
`Web Brand` pasa a ser el estudio de:
- variantes de logo,
- overlays,
- tintes,
- B/N,
- composiciones de marca reutilizables,
- futuras piezas conectadas con Content Studio.

#### Función de `Taller > Media`
`Media` sigue siendo el banco y la entrada principal.

#### Relación entre ambos
- Media = almacén + clasificación + pipeline.
- Web Brand = explotación creativa controlada de assets ya aprobados.

## Cómo se conecta con lo ya existente

### Con `brand-theme`
No se sustituye. Se amplía.
Se aprovecha para:
- tintes,
- variantes de color,
- overlays relacionados con paleta,
- integración con tokens de marca.

### Con Hero Presets
Los derivados del logo y media deben poder marcar:
- `allowedComponents: ['hero', 'header', 'footer', ...]`
- `preferredUsage: 'hero-logo' | 'navbar-logo' | 'footer-mark'`

### Con `content/types.ts` y `sections`
Más adelante, los banners/cards/popups creados usarán assets ya derivados y aprobados, no media cruda arbitraria.

## Herramientas recomendadas (por qué)
- `sharp`: preproceso, metadata y derivados raster. La documentación oficial lo presenta como un módulo rápido para convertir imágenes grandes a formatos web-friendly y permite leer metadata rápidamente sin decodificar toda la imagen. citeturn386856search0turn386856search12turn386856search16
- `SVGO`: optimización de SVG como librería y CLI de Node.js. citeturn386856search1turn386856search5
- `VTracer`: vectorización raster→SVG, incluyendo gráficos y fotografías, útil para logos/recursos más complejos o a color. citeturn386856search2
- `Motion`: animación SVG en React mediante componentes `motion.*`, útil para preview y runtime web. citeturn386856search3turn386856search7turn386856search11

## MVP realista (sin pasarse)

### MVP 1 — Asset intake + derivados
- Subir asset
- Clasificar tipo
- Guardar metadata
- Generar derivados raster
- Filtrar por tipo/sector/scope

### MVP 2 — SVG pipeline básico
- Detectar si el asset es logo/vectorizable
- Vectorizar
- Optimizar SVG
- Guardar salida
- Permitir revisión

### MVP 3 — Variantes de marca
Desde `Web Brand`:
- mono
- negativo
- tintado
- overlay light/dark
- navbar/footer/hero safe

### MVP 4 — Preview de animación
- draw
- fade
- reveal
No export complejo todavía.

## Ventajas concretas de esta evolución
1. Aprovecha estructura existente.
2. Evita otro módulo paralelo.
3. Convierte `web-brand` en algo potente y coherente.
4. Hace de `media` una base real del producto.
5. Prepara el terreno para banners/cards/popups/landings sin meter un editor libre.
6. Refuerza la diferenciación del proyecto con logos/animaciones/derivados de marca.

## Decisiones que sí valen la pena cambiar a tiempo
1. **Renombrar mentalmente `web-brand`**: no borrarlo, pero redefinirlo funcionalmente como estudio de derivados y composiciones de marca.
2. **Fortalecer `Asset`**: es una decisión de estructura que compensa muchísimo.
3. **Convertir `vectorization.ts` en puerta oficial del pipeline**: evita lógica dispersa.
4. **Introducir `jobs` y estados de pipeline**: porque el flujo ya no será instantáneo ni trivial.
5. **Marcar ownership y allowedComponents desde el principio**: evita caos futuro con tenants y reutilización.

## Preguntas de validación antes de implementar
1. ¿`Asset.ts` hoy ya soporta derivados o habría que ampliarlo mucho?
2. ¿`web-brand` hoy es solo UI placeholder o ya tiene flujo real que convenga preservar?
3. ¿`vectorization.ts` ya tiene una implementación utilizable o solo es un boceto de tipos/utilidades?
4. ¿la subida actual de media ya persiste ownership/sector o aún no?
5. ¿el repositorio actual de media es local/mock o ya habla con Mongo en serio?

## Próximo paso correcto
No pasar todavía a código final.
Antes:
1. revisar `Asset.ts`
2. revisar `src/lib/media/types.ts`
3. revisar `src/lib/taller/media/types.ts`
4. revisar `src/lib/media/vectorization.ts`
5. revisar `src/app/panel/taller/web-brand/WebBrandStudioClient.tsx`

Con eso se puede cerrar la versión definitiva de Bloque A ya totalmente aterrizada al proyecto.
