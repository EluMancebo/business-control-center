# Brand Regression Checklist

## Persisted brand baseline

Ruta:
`/panel/settings/appearance` y `/panel/web-control/brand`

- [ ] Cambiar `palette` y `mode` sigue funcionando como antes
- [ ] Recargar mantiene solo los cambios persistidos de `palette/mode`
- [ ] No hay regresiones en `BrandHydrator` ni `applyBrandToDocument`

---

## Runtime preview (no persistence)

Ruta:
`/panel/settings/appearance` y `/panel/web-control/brand`

- [ ] La preview se aplica a un contenedor acotado del editor (target explícito), no al `document.documentElement`
- [ ] Activar preview aplica cambios visuales en tiempo real (harmony, accentStyle, typographyPreset)
- [ ] La preview NO persiste tras refrescar
- [ ] La preview NO cambia el Brand persistido (palette/mode/brandName)
- [ ] `Clear preview` restaura valores visuales originales de la sesión actual
- [ ] Al salir de la pantalla (unmount) se restaura el estado original

---

## Multi-brand isolation

- [ ] Preview de brand A no afecta a brand B
- [ ] Cambiar slug de negocio no arrastra preview anterior
- [ ] Scope web sin slug no aplica preview ni contamina estado
- [ ] La preview no altera visualmente otras zonas del panel fuera del editor

---

## Multi-tab isolation

- [ ] Dos pestañas con brands distintos no se contaminan por preview
- [ ] Activar preview en una pestaña no cambia la otra pestaña
- [ ] Cerrar pestaña con preview no deja residuos en otra pestaña

---

## Failure safety

- [ ] Si falla la preview runtime, el sistema `palette + mode` sigue operativo
- [ ] Sin preview activa, la UI se ve igual que antes del ticket
- [ ] No hay escrituras nuevas en DB/localStorage para harmony/accent/typography
- [ ] `BrandHydrator` y `applyBrandToDocument` mantienen su comportamiento global sin cambios
