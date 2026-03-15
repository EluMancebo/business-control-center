# Project Context — BUSINESS CONTROL CENTER

Business Control Center es un sistema que permite a pequeñas empresas
controlar su presencia digital desde un único panel.

## Problema

Los pequeños negocios suelen tener:

- webs desactualizadas
- marketing disperso
- falta de captación estructurada
- herramientas desconectadas

## Solución

Un **centro de control digital** que integra:

- web profesional
- marketing
- leads
- campañas
- automatizaciones

## Stack actual
- Next.js App Router
- TypeScript
- Tailwind CSS
- MongoDB
- Vercel Blob
- arquitectura modular por features en `src/lib`
- uso de AI agents: Codex / Copilot / ChatGPT

## Objetivo del sistema
Construir un SaaS donde:

### Taller (admin sistema)
define:
- presets
- secciones
- media
- branding
- blueprints de página

### Panel cliente
configura:
- contenido permitido
- presets aprobados
- media aprobada

### Web pública
renderiza:
- blueprint
- sections
- payload
- presets

## Principio fundamental
Configurar ≠ editar

El usuario nunca edita HTML/CSS libremente.
Solo selecciona estructuras y contenido permitido.

## Arquitectura por capas
- Capa -1: Taller Admin (factory)
- Capa 2: Panel cliente
- Capa 3: Web pública renderizada

## Estado actual del proyecto
Completado:
- sistema Brand por scope
- Hero funcional end-to-end
- Media upload a Vercel Blob
- presets Hero
- refactor a módulos `src/lib/taller`
- fix de contaminación de paletas panel/taller

## Sprint actual
Sprint 1 — Factory foundation

### Tareas completadas
- TALLER-001 Refactor Hero + Media a `src/lib/taller`

### Tarea en curso
- TALLER-002 Sections Registry

## Objetivo inmediato
Crear:
- `src/lib/taller/sections/types.ts`
- `src/lib/taller/sections/registry.ts`

Hero será la primera sección registrada.

## Restricciones actuales
- no romper Hero existente
- no modificar APIs actuales
- no modificar Capa 2
- no modificar render público
- no introducir sobreingeniería
- cambios pequeños y revisables

## Flujo de trabajo
1. definir ticket
2. generar prompt
3. ejecutar en Codex
4. revisar diff
5. commit pequeño
6. generar documentación
