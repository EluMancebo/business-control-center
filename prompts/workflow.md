# Workflow de trabajo con Codex

## Regla general
Cambio mínimo, archivo real, validación final.

## Flujo obligatorio
1. Identificar el ticket exacto.
2. Identificar el error o necesidad exacta.
3. Revisar los archivos reales implicados.
4. Confirmar alcance y fuera de alcance.
5. Redactar prompt cerrado para Codex.
6. Ejecutar prompt.
7. Revisar el diff.
8. Aceptar solo cambios mínimos y coherentes.
9. Ejecutar:
   - npm run lint
   - npm run build
10. Hacer commit atómico.
11. Documentar lo decidido.

## Estructura obligatoria de cada prompt
- tarea
- contexto fijo
- estado actual
- objetivo
- restricciones
- revisión obligatoria previa
- implementación esperada
- formato de salida obligatorio

## Prohibido
- reemplazar archivos sin verlos
- refactors amplios no pedidos
- inventar contratos no presentes en el repo
- mezclar varios problemas en un solo commit
- tocar UI o UX sin necesidad técnica

## Patrón mental
- primero entender
- luego tocar
- después validar
- por último documentar    