 //src/app/panel/taller/presets/hero/page.tsx
 
"use client";

import { useEffect, useMemo, useState } from "react";
import PageHeader from "@/components/panel/PageHeader";
import type { HeroData, HeroPresetItem } from "@/lib/taller/presets/hero/types";
import {
  archiveHeroPresetClient,
  createHeroPresetClient,
  fetchHeroPresetByIdClient,
  fetchHeroPresetsClient,
  normalizeHeroPresetKey,
  tagsArrayToText,
  tagsTextToArray,
  updateHeroPresetClient,
} from "@/lib/taller/presets/hero/service";

const EMPTY_HERO_DATA: HeroData = {
  badge: "",
  title: "",
  description: "",
  primaryCtaLabel: "",
  primaryCtaHref: "",
  secondaryCtaLabel: "",
  secondaryCtaHref: "",
  backgroundImageUrl: "",
  logoUrl: "",
  logoSvg: "",
};

const NEW_PRESET_TEMPLATE: {
  key: string;
  label: string;
  description: string;
  tagsText: string;
  data: HeroData;
} = {
  key: "",
  label: "",
  description: "",
  tagsText: "",
  data: {
    badge: "Caballeros Barbería",
    title: "Tradición y elegancia.",
    description: "Corte de pelo esculpido a navaja. Tradición y profesionalidad.",
    primaryCtaLabel: "Reservar cita",
    primaryCtaHref: "#reservar",
    secondaryCtaLabel: "Servicios",
    secondaryCtaHref: "#servicios",
    backgroundImageUrl: "",
    logoUrl: "",
    logoSvg: "",
  } satisfies HeroData,
};

export default function TallerPresetsHeroPage() {
  const [items, setItems] = useState<HeroPresetItem[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const [createMode, setCreateMode] = useState(false);

  const [form, setForm] = useState<{
    id?: string;
    key: string;
    label: string;
    description: string;
    tagsText: string;
    status: "active" | "archived";
    data: HeroData;
  }>({
    key: "",
    label: "",
    description: "",
    tagsText: "",
    status: "active",
    data: EMPTY_HERO_DATA,
  });

  const selectedItem = useMemo(
    () => items.find((item) => item._id === selectedId) ?? null,
    [items, selectedId]
  );

  async function loadList(nextSelectedId?: string) {
    setLoadingList(true);

    try {
      const activeItems = await fetchHeroPresetsClient("active");
      setItems(activeItems);

      const preferredId =
        nextSelectedId && activeItems.some((item) => item._id === nextSelectedId)
          ? nextSelectedId
          : activeItems[0]?._id || "";

      setSelectedId(preferredId);
    } catch (error) {
      console.error(error);
      setItems([]);
      setSelectedId("");
      setMsg("Error cargando presets.");
    } finally {
      setLoadingList(false);
    }
  }

  async function loadDetail(id: string) {
    if (!id) return;

    setLoadingDetail(true);
    setMsg("");

    try {
      const item = await fetchHeroPresetByIdClient(id);

      setForm({
        id: item._id,
        key: item.key,
        label: item.label,
        description: item.description ?? "",
        tagsText: tagsArrayToText(item.tags),
        status: item.status,
        data: {
          badge: item.data?.badge ?? "",
          title: item.data?.title ?? "",
          description: item.data?.description ?? "",
          primaryCtaLabel: item.data?.primaryCtaLabel ?? "",
          primaryCtaHref: item.data?.primaryCtaHref ?? "",
          secondaryCtaLabel: item.data?.secondaryCtaLabel ?? "",
          secondaryCtaHref: item.data?.secondaryCtaHref ?? "",
          backgroundImageUrl: item.data?.backgroundImageUrl ?? "",
          logoUrl: item.data?.logoUrl ?? "",
          logoSvg: item.data?.logoSvg ?? "",
        },
      });
    } catch (error) {
      console.error(error);
      setMsg("Error cargando detalle del preset.");
    } finally {
      setLoadingDetail(false);
    }
  }

  useEffect(() => {
    loadList();
  }, []);

  useEffect(() => {
    if (createMode) return;
    if (!selectedId) return;

    loadDetail(selectedId);
  }, [selectedId, createMode]);

  function startCreateMode() {
    setCreateMode(true);
    setSelectedId("");
    setMsg("");

    setForm({
      key: NEW_PRESET_TEMPLATE.key,
      label: NEW_PRESET_TEMPLATE.label,
      description: NEW_PRESET_TEMPLATE.description,
      tagsText: NEW_PRESET_TEMPLATE.tagsText,
      status: "active",
      data: { ...NEW_PRESET_TEMPLATE.data },
    });
  }

  function cancelCreateMode() {
    setCreateMode(false);
    setMsg("");

    if (items[0]?._id) {
      setSelectedId(items[0]._id);
    } else {
      setForm({
        key: "",
        label: "",
        description: "",
        tagsText: "",
        status: "active",
        data: EMPTY_HERO_DATA,
      });
    }
  }

  function updateRootField<K extends "key" | "label" | "description" | "tagsText" | "status">(
    key: K,
    value: (typeof form)[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateDataField<K extends keyof HeroData>(key: K, value: HeroData[K]) {
    setForm((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        [key]: value,
      },
    }));
  }

  async function handleCreate() {
    try {
      setSaving(true);
      setMsg("");

      const payload = {
        key: normalizeHeroPresetKey(form.key),
        label: form.label.trim(),
        description: form.description.trim(),
        tags: tagsTextToArray(form.tagsText),
        data: {
          ...form.data,
          badge: form.data.badge.trim(),
          title: form.data.title.trim(),
          description: form.data.description.trim(),
          primaryCtaLabel: form.data.primaryCtaLabel.trim(),
          primaryCtaHref: form.data.primaryCtaHref.trim(),
          secondaryCtaLabel: form.data.secondaryCtaLabel.trim(),
          secondaryCtaHref: form.data.secondaryCtaHref.trim(),
          backgroundImageUrl: form.data.backgroundImageUrl.trim(),
          logoUrl: form.data.logoUrl.trim(),
          logoSvg: form.data.logoSvg,
        },
      };

      const created = await createHeroPresetClient(payload);

      await loadList(created._id);
      setCreateMode(false);
      setMsg(`Preset "${created.label}" creado ✓`);
    } catch (error) {
      console.error(error);
      setMsg(error instanceof Error ? error.message : "Error creando preset");
    } finally {
      setSaving(false);
    }
  }

  async function handleSave() {
    if (!form.id) return;

    try {
      setSaving(true);
      setMsg("");

      const saved = await updateHeroPresetClient(form.id, {
        label: form.label.trim(),
        description: form.description.trim(),
        tags: tagsTextToArray(form.tagsText),
        status: form.status,
        data: {
          ...form.data,
          badge: form.data.badge.trim(),
          title: form.data.title.trim(),
          description: form.data.description.trim(),
          primaryCtaLabel: form.data.primaryCtaLabel.trim(),
          primaryCtaHref: form.data.primaryCtaHref.trim(),
          secondaryCtaLabel: form.data.secondaryCtaLabel.trim(),
          secondaryCtaHref: form.data.secondaryCtaHref.trim(),
          backgroundImageUrl: form.data.backgroundImageUrl.trim(),
          logoUrl: form.data.logoUrl.trim(),
          logoSvg: form.data.logoSvg,
        },
      });

      await loadList(saved._id);
      setSelectedId(saved._id);
      setMsg(`Preset "${saved.label}" guardado ✓`);
    } catch (error) {
      console.error(error);
      setMsg(error instanceof Error ? error.message : "Error guardando preset");
    } finally {
      setSaving(false);
    }
  }

  async function handleArchive() {
    if (!form.id) return;

    const confirmed = window.confirm(
      `¿Archivar el preset "${form.label}"? Dejará de aparecer en Capa 2.`
    );
    if (!confirmed) return;

    try {
      setSaving(true);
      setMsg("");

      await archiveHeroPresetClient(form.id);
      await loadList();
      setCreateMode(false);
      setMsg("Preset archivado ✓");
    } catch (error) {
      console.error(error);
      setMsg(error instanceof Error ? error.message : "Error archivando preset");
    } finally {
      setSaving(false);
    }
  }

  const isBusy = saving || loadingDetail;
  const canSaveExisting = Boolean(form.id) && !createMode;
  const canCreate =
    createMode &&
    Boolean(normalizeHeroPresetKey(form.key)) &&
    Boolean(form.label.trim()) &&
    Boolean(form.data.badge.trim()) &&
    Boolean(form.data.title.trim()) &&
    Boolean(form.data.description.trim()) &&
    Boolean(form.data.primaryCtaLabel.trim()) &&
    Boolean(form.data.primaryCtaHref.trim()) &&
    Boolean(form.data.secondaryCtaLabel.trim()) &&
    Boolean(form.data.secondaryCtaHref.trim());

  return (
    <div className="min-h-full overflow-y-visible">
      <div className="flex min-h-full flex-col">
        <div className="shrink-0 px-4 py-4 sm:px-6">
          <PageHeader
            title="Taller · Presets · Hero"
            description="Crea y mantiene presets reales que Capa 2 podrá consumir sin hardcodes."
          />
        </div>

        <div className="min-h-0 flex-1 px-4 pb-12 sm:px-6 sm:pb-14">
          <div className="grid h-full min-h-0 gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
            <section className="flex min-h-0 flex-col rounded-xl border border-border bg-card p-4 text-card-foreground">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">Biblioteca de presets</div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Presets activos disponibles para clientes.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={startCreateMode}
                  className="shrink-0 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
                  disabled={saving}
                >
                  Nuevo
                </button>
              </div>

              <div className="mt-4 shrink-0">
                <button
                  type="button"
                  onClick={() => loadList(selectedId)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted"
                  disabled={loadingList || saving}
                >
                  {loadingList ? "Cargando…" : "Refrescar lista"}
                </button>
              </div>

              <div className="mt-4 min-h-0 flex-1 overflow-y-auto bcc-scrollbar space-y-2 pr-1">
                {createMode && (
                  <button
                    type="button"
                    onClick={() => setCreateMode(true)}
                    className="w-full rounded-lg border border-primary bg-primary/10 px-3 py-3 text-left"
                  >
                    <div className="text-sm font-semibold text-foreground">Nuevo preset</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Modo creación activo
                    </div>
                  </button>
                )}

                {!loadingList && items.length === 0 && !createMode && (
                  <div className="rounded-lg border border-dashed border-border bg-background px-3 py-4 text-sm text-muted-foreground">
                    No hay presets activos todavía.
                  </div>
                )}

                {items.map((item) => {
                  const active = !createMode && item._id === selectedId;

                  return (
                    <button
                      key={item._id}
                      type="button"
                      onClick={() => {
                        setCreateMode(false);
                        setSelectedId(item._id);
                        setMsg("");
                      }}
                      className={[
                        "w-full rounded-lg border px-3 py-3 text-left transition",
                        active
                          ? "border-primary bg-primary/10"
                          : "border-border bg-background hover:bg-muted",
                      ].join(" ")}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-semibold">{item.label}</div>
                        <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                          {item.key}
                        </div>
                      </div>

                      <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {item.description || "Sin descripción"}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 shrink-0 rounded-lg border border-border bg-background px-3 py-3 text-xs text-muted-foreground">
                Lo que crees aquí aparecerá automáticamente en:
                <div className="mt-1 font-semibold text-foreground">
                  GET /api/web/presets/hero → Capa 2 → Business.activeHeroVariantKey
                </div>
              </div>
            </section>

            <section className="flex min-h-0 flex-col rounded-xl border border-border bg-card text-card-foreground">
              <div className="shrink-0 border-b border-border px-4 py-4 sm:px-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold">
                      {createMode
                        ? "Crear preset"
                        : selectedItem
                        ? `Editar: ${selectedItem.label}`
                        : "Editor de preset"}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Define estructura base, copy inicial, CTAs y recursos visuales del hero.
                    </p>
                    <div className="mt-3 text-sm text-muted-foreground">
                      {msg || (loadingDetail ? "Cargando detalle…" : "Listo.")}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {createMode ? (
                      <>
                        <button
                          type="button"
                          onClick={cancelCreateMode}
                          className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-muted"
                          disabled={saving}
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={handleCreate}
                          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
                          disabled={!canCreate || saving}
                        >
                          {saving ? "Creando…" : "Crear preset"}
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={handleArchive}
                          className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-muted disabled:opacity-50"
                          disabled={!canSaveExisting || isBusy}
                        >
                          Archivar
                        </button>
                        <button
                          type="button"
                          onClick={handleSave}
                          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
                          disabled={!canSaveExisting || isBusy}
                        >
                          {saving ? "Guardando…" : "Guardar cambios"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto bcc-scrollbar px-4 py-4 sm:px-5">
                <div className="grid gap-4 lg:grid-cols-2">
                  <Field
                    label="Key técnica"
                    value={form.key}
                    onChange={(value) => updateRootField("key", normalizeHeroPresetKey(value))}
                    placeholder="default"
                    disabled={!createMode || saving}
                    helpText={
                      createMode
                        ? "Se normaliza automáticamente. Debe ser única."
                        : "La key no se modifica una vez creado el preset."
                    }
                  />

                  <Field
                    label="Label"
                    value={form.label}
                    onChange={(value) => updateRootField("label", value)}
                    placeholder="Barbería premium"
                    disabled={isBusy}
                  />

                  <Field
                    label="Descripción"
                    value={form.description}
                    onChange={(value) => updateRootField("description", value)}
                    placeholder="Preset elegante para negocios de imagen y detalle."
                    disabled={isBusy}
                    textarea
                  />

                  <Field
                    label="Tags (separadas por coma)"
                    value={form.tagsText}
                    onChange={(value) => updateRootField("tagsText", value)}
                    placeholder="barberia, premium, elegante"
                    disabled={isBusy}
                  />
                </div>

                <div className="mt-6 rounded-xl border border-border bg-background p-4">
                  <div className="text-sm font-semibold">Contenido base del Hero</div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Este contenido servirá como base al crear draft para un negocio en ese preset.
                  </p>

                  <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    <Field
                      label="Badge"
                      value={form.data.badge}
                      onChange={(value) => updateDataField("badge", value)}
                      placeholder="Caballeros Barbería"
                      disabled={isBusy}
                    />

                    <Field
                      label="Título"
                      value={form.data.title}
                      onChange={(value) => updateDataField("title", value)}
                      placeholder="Tradición y elegancia."
                      disabled={isBusy}
                    />

                    <Field
                      label="CTA primaria (label)"
                      value={form.data.primaryCtaLabel}
                      onChange={(value) => updateDataField("primaryCtaLabel", value)}
                      placeholder="Reservar cita"
                      disabled={isBusy}
                    />

                    <Field
                      label="CTA primaria (href)"
                      value={form.data.primaryCtaHref}
                      onChange={(value) => updateDataField("primaryCtaHref", value)}
                      placeholder="#reservar"
                      disabled={isBusy}
                    />

                    <Field
                      label="CTA secundaria (label)"
                      value={form.data.secondaryCtaLabel}
                      onChange={(value) => updateDataField("secondaryCtaLabel", value)}
                      placeholder="Servicios"
                      disabled={isBusy}
                    />

                    <Field
                      label="CTA secundaria (href)"
                      value={form.data.secondaryCtaHref}
                      onChange={(value) => updateDataField("secondaryCtaHref", value)}
                      placeholder="#servicios"
                      disabled={isBusy}
                    />
                  </div>

                  <div className="mt-4 grid gap-4">
                    <Field
                      label="Descripción"
                      value={form.data.description}
                      onChange={(value) => updateDataField("description", value)}
                      placeholder="Corte de pelo esculpido a navaja. Tradición y profesionalidad."
                      disabled={isBusy}
                      textarea
                    />

                    <Field
                      label="Background image URL"
                      value={form.data.backgroundImageUrl}
                      onChange={(value) => updateDataField("backgroundImageUrl", value)}
                      placeholder="/hero/barber-tools.jpg"
                      disabled={isBusy}
                    />

                    <Field
                      label="Logo URL"
                      value={form.data.logoUrl}
                      onChange={(value) => updateDataField("logoUrl", value)}
                      placeholder="/brand/LogoHeroCaballerosBarberia.png"
                      disabled={isBusy}
                    />

                    <Field
                      label="Logo SVG inline"
                      value={form.data.logoSvg}
                      onChange={(value) => updateDataField("logoSvg", value)}
                      placeholder="<svg>...</svg>"
                      disabled={isBusy}
                      textarea
                    />
                  </div>
                </div>

                <section className="mt-6 rounded-xl border border-border bg-background p-4">
                  <div className="text-sm font-semibold">Dirección del sistema</div>
                  <div className="mt-2 space-y-2 text-sm text-muted-foreground">
                    <p>
                      Taller define presets base reutilizables. El cliente no diseña libremente:
                      selecciona una opción autorizada.
                    </p>
                    <p>
                      Este flujo deja preparado el camino para escalar después a HeaderPreset,
                      FooterPreset, LayoutPreset y sistema de marca.
                    </p>
                  </div>
                </section>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  textarea,
  disabled,
  helpText,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  textarea?: boolean;
  disabled?: boolean;
  helpText?: string;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-muted-foreground">{label}</label>

      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="bcc-scrollbar mt-2 min-h-28 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/70 focus:ring-2 focus:ring-ring disabled:opacity-60"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="mt-2 h-10 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none placeholder:text-muted-foreground/70 focus:ring-2 focus:ring-ring disabled:opacity-60"
        />
      )}

      {helpText ? <p className="mt-2 text-xs text-muted-foreground">{helpText}</p> : null}
    </div>
  );
}
