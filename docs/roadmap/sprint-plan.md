# Roadmap de Sprints

## Sprint 1 — Factory foundation

### TALLER-001
**Título:** Hero + Media a `src/lib/taller`  
**Estado:** Completado

**Resultado:**
- extracción de lógica de Hero
- extracción de lógica de Media
- base modular en `src/lib/taller`

---

### TALLER-002
**Título:** Sections Registry  
**Estado:** En progreso

**Objetivo:**
Crear registro central mínimo de secciones en:
- `src/lib/taller/sections/types.ts`
- `src/lib/taller/sections/registry.ts`

**Criterios:**
- Hero será la primera sección registrada
- no romper Hero existente
- no tocar APIs actuales
- no tocar Capa 2
- no tocar render público
- variants resueltas desde presets reales, no hardcodeadas
- slots fieles al contrato real de HeroData

**Resultado esperado:**
- contrato mínimo de sección
- registry central
- helpers de lectura
- base para futuros blueprints

---

### TALLER-003
**Título:** Blueprint Home  
**Estado:** Pendiente

**Objetivo:**
Definir la composición base de Home a partir de secciones registradas.

---

### TALLER-004
**Título:** Resolver variants desde presets activos  
**Estado:** Pendiente

**Objetivo:**
Conectar registry y presets activos sin romper contratos existentes.

---

### TALLER-005
**Título:** Adaptador registry -> blueprint  
**Estado:** Pendiente

**Objetivo:**
Permitir que los blueprints consuman el catálogo de secciones autorizadas.

---

## Sprint 2 — Safe page composition
Pendiente de definir después de cerrar Sprint 1.