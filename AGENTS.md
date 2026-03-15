# AGENTS.md

# AGENTS.md

## Proyecto
BUSINESS CONTROL CENTER (BCC)

## Stack
- Next.js 15 (App Router)
- React 19
- Tailwind CSS v4
- TypeScript
- MongoDB
- Deploy en Vercel
- Vercel Blob para media storage

## Principio rector
Configurar ≠ editar

El usuario final no edita HTML/CSS libremente.
El sistema solo permite:
- seleccionar estructuras autorizadas
- rellenar campos permitidos
- activar/desactivar elementos
- escoger presets y assets válidos

## Arquitectura por capas
- Capa -1: Taller Admin (factory del sistema)
- Capa 2: Panel cliente
- Capa 3: Web pública renderizada

## Estado actual
Sprint actual: Sprint 1 — Factory foundation

### Tickets
- TALLER-001 Hero + Media a src/lib/taller ✅ completado
- TALLER-002 Sections Registry 🔄 en progreso
- TALLER-003 Blueprint Home ⏳ pendiente

## Prioridad actual
Formalizar Taller como fábrica:
- registro central de secciones
- Hero como primera sección registrada
- base para futuros blueprints
- base para payloads y variantes seguras

## Fuera de alcance por ahora
- CRM completo
- automatismos avanzados
- IA como capa funcional cerrada
- landing final completa
- refactors generales del panel
- cambios en render público salvo necesidad crítica

## Reglas operativas obligatorias
1. Antes de modificar código, revisar el archivo real actual.
2. Si no se ha visto el archivo, no proponer reemplazo ciego.
3. Cambio mínimo siempre.
4. No romper Hero existente.
5. No tocar APIs actuales salvo bug puntual.
6. No tocar Capa 2 ni web pública salvo necesidad estricta.
7. Código completo siempre en la respuesta.
8. Justificar técnicamente cada cambio.
9. No introducir sobreingeniería.
10. Validar con:
   - npm run lint
   - npm run build
11. Commits atómicos:
   - un problema = un commit
12. Mantener coherencia con App Router, SSR y arquitectura modular.

## Flujo oficial de trabajo
1. Definir ticket exacto
2. Revisar archivos reales implicados
3. Generar prompt concreto para Codex
4. Ejecutar en Codex
5. Revisar diff
6. Aceptar solo cambio mínimo correcto
7. Validar con lint/build
8. Commit pequeño
9. Documentar decisión

## Convención de trabajo con secciones
- Cada sección tendrá contrato explícito
- Cada sección tendrá slots permitidos
- Variants vendrán de presets reales cuando aplique
- El panel configura datos, no layout
- El render público consume configuración publicada, no edición libre

## Convención media
- Storage externo + metadata en Mongo
- Assets tipados por uso
- Render controlado por layout fijo
- Nada de libertad visual que rompa responsive