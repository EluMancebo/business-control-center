

# 📘 BCC — Content-Lab Approval Framework v1

## 🧿 Estado
**APROBADO como marco oficial de validación, scoring y aprobación de piezas en Content-Lab (Capa 1).**

Este documento define cómo se evalúan, validan, aprueban y habilitan piezas antes de su consumo en Capa 2 y publicación en web.

---

# 1. 🎯 Propósito

Evitar que la aprobación dependa de criterios subjetivos (“me gusta / no me gusta”) y establecer un sistema:

- objetivo  
- medible  
- reproducible  
- trazable  
- escalable  

---

# 2. 🧠 Principio rector

> **Una pieza no se aprueba por gusto.  
Se aprueba porque supera un marco de evaluación con criterios definidos, puntuación suficiente y sin fallos críticos.**

---

# 3. 🧱 Relación con arquitectura BCC

Este framework se integra en:

Media → Content-Lab → Capa 2 → Web pública

Y respeta:

- Capa 1 autoriza  
- Capa 2 consume  
- Web solo renderiza  

---

# 4. 🧩 Objeto evaluado

## `LabPiece`

Unidad principal del sistema.

Debe contener:

- intención (ContextBrief)  
- estructura (Block / Preset)  
- contenido (copy + media)  
- estado  
- validación  
- destino  

---

# 5. ⚖️ Dimensiones de evaluación

Se evalúan **6 dimensiones obligatorias**.

---

## 5.1 Dimensión: Conversión / Funnel fit (25%)

### Pregunta rectora
¿Esta pieza ayuda de verdad a que el usuario haga lo que queremos que haga?

### Qué se mira
- CTA principal clara y visible  
- alineación con el objetivo del brief  
- presencia de incentivo o lead magnet cuando toca  
- encaje con funnel base del negocio:  
  - WhatsApp visible  
  - CTA hero clara  
  - formulario simple  
  - teléfono clicable  
  - Google Maps o contacto contextual si aplica  
- si es campaña:  
  - coherencia con oferta, landing o popup  
  - conexión con origen de lead esperado  

### Escala
0–100

### Reglas duras
Bloquea aprobación si:

- no hay CTA clara cuando la pieza es de captación  
- el objetivo del brief no se entiende  
- la pieza distrae más de lo que empuja  
- el incentivo es irrelevante o confuso  

---

## 5.2 Dimensión: Comunicación e impacto (20%)

### Pregunta rectora
¿Se entiende rápido, comunica valor y genera reacción?

### Qué se mira
- claridad del titular  
- jerarquía del mensaje  
- beneficio explícito  
- longitud adecuada  
- tono correcto para público y canal  
- compatibilidad con el contexto del brief  
- microcopy y CTA sin ambigüedad  

### Escala
0–100

### Reglas duras
Bloquea aprobación si:

- el titular no se entiende  
- el mensaje es genérico o no diferenciado  
- el CTA no comunica acción concreta  
- hay sobrecarga de texto que mata impacto  

---

## 5.3 Dimensión: Diseño visual (20%)

### Pregunta rectora
¿La pieza se ve profesional, consistente, legible y alineada con la identidad?

### Qué se mira
- jerarquía visual  
- equilibrio  
- densidad  
- uso correcto de superficie, contraste y tokens  
- peso visual de CTA  
- relación entre media, texto y espacio negativo  
- consistencia con preset, semántica y design system  
- no contaminar shell global ni romper la capa visual definida  

### Escala
0–100

### Reglas duras
Bloquea aprobación si:

- contraste insuficiente  
- CTA enterrada visualmente  
- saturación o ruido  
- uso incoherente de color / tipografía / superficie  
- la pieza parece “parche” y no parte del sistema  

---

## 5.4 Dimensión: UX/UI y friendly use (15%)

### Pregunta rectora
¿La pieza es fácil de entender, usar y operar sin fricción?

### Qué se mira
- legibilidad  
- affordance clara de botones y campos  
- ausencia de fricción innecesaria  
- sensación de control guiado  
- no exigir más datos de los necesarios  
- en popups/forms:  
  - solo campos útiles  
  - consentimiento claro  
  - cierre o escape razonable  

### Escala
0–100

### Reglas duras
Bloquea aprobación si:

- una popup es invasiva sin valor  
- el formulario pide demasiado  
- los controles no son evidentes  
- la pieza introduce confusión de uso  

---

## 5.5 Dimensión: Responsive / implementación segura (10%)

### Pregunta rectora
¿La pieza aguanta móvil, tablet y desktop sin romper el sistema?

### Qué se mira
- sin scroll horizontal  
- sin clipping  
- sin desbordes  
- sin saltos raros de layout  
- ratios y media válidos  
- jerarquía correcta en móvil  
- consistencia con diseño blindado y slots autorizados  
- compatibilidad con la regla de layout fijo + contenido variable del proyecto  

### Escala
0–100

### Reglas duras
Bloquea aprobación si:

- rompe móvil  
- el texto se desborda  
- la media no respeta contenedores  
- requiere hacks para sostenerse  

---

## 5.6 Dimensión: SEO / accesibilidad / performance (10%)

### Pregunta rectora
¿La pieza comunica bien a buscadores, carga bien y es usable de forma responsable?

### Qué se mira
- headings coherentes si aplica  
- alt / media usable  
- copy visible y no escondida  
- peso de imagen razonable  
- accesibilidad básica  
- posibilidad de LocalBusiness / NAP / Maps cuando corresponda  
- piezas compatibles con tu enfoque de SEO local, landings y campañas  
- performance mínima aceptable  

### Escala
0–100

### Reglas duras
Bloquea aprobación si:

- imagen absurda en peso  
- contraste o accesibilidad muy deficientes  
- pieza dependiente de efectos pesados o problemáticos  
- estructura textual nula en una pieza que debería aportar valor SEO  

---

# 6. 🧮 Resultado final: score total

## Fórmula

ApprovalScore =
  Conversion * 0.25 +
  Communication * 0.20 +
  Design * 0.20 +
  UX * 0.15 +
  Responsive * 0.10 +
  SEO_A11Y_Perf * 0.10

---

# 7. 🚦 Umbrales operativos

## draft
Todavía incompleta o sin evaluar.

## candidate
- pasa validación estructural básica  
- no falla reglas duras  
- score total >= 70  
- al menos sirve para revisión editorial  

## approved
- no falla reglas duras  
- score total >= 82  
- además:  
  - Conversión >= 75  
  - Diseño >= 75  
  - UX >= 70  
  - Responsive >= 80  

## blocked
- falla una regla dura  
- o score total < 70  

## obsolete
- ya fue válida, pero una versión más reciente la sustituye  
- o queda superada por contexto/campaña/branding  

---

# 8. 🔥 Lo más importante: aprobación ≠ publicación

## Aprobación

Una pieza queda `approved` en Capa 1 y puede entrar en el Preset Vault con:

- versión  
- score  
- razones  
- reglas de uso  
- campos editables  
- zonas permitidas  
- trazabilidad de origen  

---

## Publicación

Otra cosa distinta.

La web pública debe leer snapshots publicados, no drafts.

`publishedPages` está planteado como estructura inmutable de producción, donde cada publish crea una versión nueva y la web pública consume snapshots, no estados intermedios.

---

## Traducción operativa

- approved = pieza autorizada para ser usada  
- published = snapshot ya materializado en producción  

---

## Niveles reales del sistema

- Candidate  
- Approved  
- Published Snapshot  

---
# 9. 🧾 Artefacto de aprobación

```ts
type ApprovalArtifact = {
  pieceId: string;
  pieceType: "hero" | "banner" | "card" | "popup" | "testimonial";
  briefId?: string;
  status: "candidate" | "approved" | "blocked" | "obsolete";
  score: {
    conversion: number;
    communication: number;
    design: number;
    ux: number;
    responsive: number;
    seoA11yPerformance: number;
    total: number;
  };
  hardBlockers: string[];
  warnings: string[];
  rationale: string[];
  approvedBy?: string;
  approvedAt?: string;
  version: number;
  presetVaultEligible: boolean;
  publishEligible: boolean;
};

---

# 10. 🧠 Frameworks implícitos (sin postureo)

## Funnel thinking
- captación directa
- lead magnet
- WhatsApp
- formularios
- popups
- landings específicas
- métricas de origen y conversión

## UX/UI heurística
- claridad de CTA
- jerarquía
- fricción
- legibilidad
- consistencia
- responsive
- affordance

## Diseño de sistemas
- tokens
- primitives
- semántica visual
- guardrails
- separación de capas

## Comunicación persuasiva
- valor primero
- branding después
- SEO después
- automatización al servicio del objetivo

---

# 11. 🧭 Criterio de calidad real

Una pieza es buena si:

convierte
comunica
se ve profesional
es usable
funciona en móvil
no rompe el sistema

---


# 12. 🧨 Anti-patrones

“esto me gusta” → inválido
sobre diseño sin conversión
sobre copy sin estructura
hacks responsive
CTA escondida
piezas bonitas pero inútiles

---


# 13. 🧿 Conclusión

Si la aprobación fuera “me gusta”:

arbitrario
difícil de escalar
imposible de delegar
frágil

Si la aprobación se basa en este marco:

sistema serio
defendible
repetible
enseñable
mejorable

Y alineado con el objetivo real:

construir una máquina premium y útil, no una sucesión de ocurrencias bonitas.
