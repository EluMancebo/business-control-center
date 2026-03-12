# AGENTS.md

## Reglas del proyecto

- Stack: Next.js 15, React 19, Tailwind CSS v4, TypeScript, MongoDB
- App Router obligatorio
- No usar inline styles salvo excepción justificada
- No usar `any`
- Cambio mínimo siempre
- No modificar archivos sin revisar su contenido real
- Siempre usar rutas completas al referirse a archivos
- No proponer estructuras genéricas si el árbol real ya define una convención
- Respetar la organización actual por feature dentro de `src/lib/<feature>/`

## Convención de `src/lib`

Cada módulo debe agrupar su propia lógica:

- `types.ts`
- `repository.ts`
- `service.ts`
- `storage.ts`
- `hooks.ts`
- `apply.ts`

No crear `src/lib/services` global salvo necesidad transversal claramente justificada.

## Forma de responder

Antes de proponer cambios:
1. leer archivo real
2. identificar módulo responsable
3. aplicar cambio mínimo
4. justificar por qué ese archivo es el correcto

## Reglas críticas de brand / apariencia

- Solo puede existir un BrandHydrator activo para panel.
- No se debe aplicar brand al documentElement desde más de un hidratador para el mismo scope.
- El scope "web" no debe aplicar estilos al DOM del panel cuando applyToDocument sea false.
- No se debe hidratar brand con slug vacío para scope web.
- El fallback legacy de panel solo puede usarse como migración puntual, nunca como fuente normal.
- Cualquier cambio en BrandHydrator, BrandEditor, brand/storage, brand/service, layout.tsx o PanelShell.tsx requiere verificación manual de no contaminación entre panel/web/taller.


## Invariantes críticas de Brand

- En /panel/* solo puede existir un BrandHydrator activo.
- BrandHydrator es el único punto autorizado para aplicar data-brand-* al DOM.
- scope="web" nunca debe hidratar ni guardar con slug vacío.
- El fallback legacy de panel solo puede usarse como migración puntual.
- En /panel/settings/appearance, el scope del hidrator y del editor deben estar alineados.
- Si se modifica BrandHydrator, BrandEditor, PanelShell, layout.tsx o brand/service.ts, hay que validar que no exista contaminación entre capa 1, capa 2 y web.




## Flujo de trabajo:

1 analizar archivos existentes
2 listar archivos afectados
3 proponer cambios
4 implementar

