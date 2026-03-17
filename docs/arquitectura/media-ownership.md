# Media Ownership & Multitenant Rules

## 1. Principio

BCC es multitenant.

Los assets deben respetar aislamiento por cliente y trazabilidad de uso.

---

## 2. Tipos de assets

### Assets del sistema
Propiedad del sistema o del equipo.

Ejemplos:
- recursos base
- demos
- assets genéricos
- recursos reutilizables de Capa 1

### Assets del tenant
Propiedad del cliente o negocio.

Ejemplos:
- logos del negocio
- heros propios
- imágenes privadas
- campañas del cliente
- fotografías de su local o equipo

---

## 3. Regla por defecto

Todo asset subido para un cliente debe considerarse **privado del cliente**, salvo decisión explícita del equipo para marcarlo como compartible.

---

## 4. Ownership mínimo recomendado

Cada asset debe poder expresar como mínimo:

- `scope: system | tenant`
- `ownerBusinessId`
- `visibility: private | shared`
- `allowedIn`
- `usageRefs`

---

## 5. Reglas de aislamiento

- un asset `tenant` no debe aparecer para otros tenants
- un asset privado no debe reutilizarse automáticamente
- si un asset ya está asociado a un cliente, no debe proponerse a otro como recurso general
- los heros particulares de un cliente deben permanecer en su contexto

---

## 6. Implicaciones para Media Center

Media Center deberá evolucionar para distinguir al menos:

- biblioteca del sistema
- biblioteca del cliente
- assets privados
- assets en uso

Y permitir filtros como:
- scope
- tenant
- visibility
- usage state

---

## 7. Objetivo

Garantizar:

- coherencia de marca
- privacidad
- aislamiento multitenant
- trazabilidad de uso    