# Brand system regression checklist

## Capa 1 (Admin / Taller)

Ruta:
`/panel/settings/appearance`

- [ ] Cambiar paleta modifica el panel admin
- [ ] Recargar mantiene el cambio
- [ ] No afecta a web pública

---

## Capa 2 (Cliente)

Ruta:
`/panel/settings/appearance`

- [ ] Cambiar paleta modifica solo el panel cliente
- [ ] Recargar mantiene el cambio
- [ ] No afecta a capa 1

---

## Web control

Ruta:
`/panel/web-control/brand`

- [ ] Cambiar paleta modifica la web pública
- [ ] No cambia la UI del panel
- [ ] Recargar mantiene el cambio

---

## Aislamiento

- [ ] Capa 1 no contamina capa 2
- [ ] Capa 2 no contamina web
- [ ] Web no contamina panel

---

## Slug

- [ ] scope web nunca usa slug vacío
- [ ] no aparece key genérica `bcc.brand.v0.web`    
