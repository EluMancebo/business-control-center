"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import PageHeader from "@/components/panel/PageHeader";
import type { AssetItem } from "@/lib/taller/media/types";
import {
  deleteSystemMediaClient,
  fetchSystemMediaClient,
  formatBytes,
  updateSystemMediaMetadataClient,
  uploadSystemMediaClient,
} from "@/lib/taller/media/service";

type KindFilter = "all" | AssetItem["kind"];
type ScopeFilter = "all" | AssetItem["scope"];
type RestrictionFilter = "all" | "restricted" | "open";

export default function TallerMediaPage() {
  const [items, setItems] = useState<AssetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [rowBusyId, setRowBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [searchFilter, setSearchFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [kindFilter, setKindFilter] = useState<KindFilter>("all");
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>("all");
  const [restrictionFilter, setRestrictionFilter] = useState<RestrictionFilter>("all");
  const [thumbFallbackById, setThumbFallbackById] = useState<Record<string, true>>({});

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editTags, setEditTags] = useState("");
  const [editAllowedIn, setEditAllowedIn] = useState("");

  const [isUploadSheetOpen, setIsUploadSheetOpen] = useState(false);

  const fileRef = useRef<HTMLInputElement | null>(null);
  const mobileFileRef = useRef<HTMLInputElement | null>(null);
  const [label, setLabel] = useState("");
  const [tags, setTags] = useState("");
  const [allowedIn, setAllowedIn] = useState("");

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const nextItems = await fetchSystemMediaClient("");
      setItems(nextItems);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error loading assets");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const shouldLockBody = isUploadSheetOpen || Boolean(editingId);
    if (!shouldLockBody) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [editingId, isUploadSheetOpen]);

  const tagStats = useMemo(() => {
    const counter = new Map<string, number>();
    items.forEach((item) => {
      item.tags.forEach((tag) => {
        const clean = tag.trim();
        if (!clean) return;
        counter.set(clean, (counter.get(clean) ?? 0) + 1);
      });
    });

    return Array.from(counter.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count;
        return a.tag.localeCompare(b.tag);
      });
  }, [items]);

  const filteredItems = useMemo(() => {
    const search = searchFilter.trim().toLowerCase();
    const tag = tagFilter.trim().toLowerCase();

    return items.filter((item) => {
      if (kindFilter !== "all" && item.kind !== kindFilter) return false;
      if (scopeFilter !== "all" && item.scope !== scopeFilter) return false;

      if (restrictionFilter === "restricted" && item.allowedIn.length === 0) return false;
      if (restrictionFilter === "open" && item.allowedIn.length > 0) return false;

      if (search && !item.label.toLowerCase().includes(search)) return false;

      if (tag) {
        const tagsText = item.tags.join(" ").toLowerCase();
        if (!tagsText.includes(tag)) return false;
      }

      return true;
    });
  }, [items, searchFilter, tagFilter, kindFilter, scopeFilter, restrictionFilter]);

  const hasActiveFilters = Boolean(
    searchFilter.trim() ||
      tagFilter.trim() ||
      kindFilter !== "all" ||
      scopeFilter !== "all" ||
      restrictionFilter !== "all"
  );

  const editingItem = useMemo(
    () => items.find((item) => item._id === editingId) ?? null,
    [editingId, items]
  );

  const selectedTagFromCatalog = tagStats.some((entry) => entry.tag === tagFilter) ? tagFilter : "";

  async function onUpload(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    const closeSheetAfterSave = isUploadSheetOpen;

    try {
      const file = fileRef.current?.files?.[0] ?? mobileFileRef.current?.files?.[0];
      if (!file) throw new Error("Selecciona un archivo.");

      const created = await uploadSystemMediaClient({
        file,
        label,
        tags,
        allowedIn,
      });
      setItems((prev) => [created, ...prev]);

      if (fileRef.current) fileRef.current.value = "";
      if (mobileFileRef.current) mobileFileRef.current.value = "";
      setLabel("");
      setTags("");
      setAllowedIn("");
      setNotice("Asset subido correctamente ✓");
      if (closeSheetAfterSave) setIsUploadSheetOpen(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  function startEdit(item: AssetItem) {
    setEditingId(item._id);
    setEditLabel(item.label);
    setEditTags((item.tags || []).join(", "));
    setEditAllowedIn((item.allowedIn || []).join(", "));
    setError(null);
    setNotice(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditLabel("");
    setEditTags("");
    setEditAllowedIn("");
  }

  async function saveEdit() {
    if (!editingId) return;

    setRowBusyId(editingId);
    setError(null);
    setNotice(null);

    try {
      await updateSystemMediaMetadataClient({
        id: editingId,
        label: editLabel,
        tags: editTags,
        allowedIn: editAllowedIn,
      });
      cancelEdit();
      setNotice("Asset actualizado ✓");
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setRowBusyId(null);
    }
  }

  async function removeAsset(item: AssetItem) {
    const confirmed = window.confirm(
      `¿Borrar asset "${item.label}"? Esta acción elimina el archivo y su metadata.`
    );
    if (!confirmed) return;

    setRowBusyId(item._id);
    setError(null);
    setNotice(null);

    try {
      await deleteSystemMediaClient(item._id);
      if (editingId === item._id) {
        cancelEdit();
      }
      setNotice("Asset eliminado ✓");
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setRowBusyId(null);
    }
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setNotice("URL copiada ✓");
    } catch {
      setNotice("No se pudo copiar la URL");
    }
  }

  function clearFilters() {
    setSearchFilter("");
    setTagFilter("");
    setKindFilter("all");
    setScopeFilter("all");
    setRestrictionFilter("all");
  }

  function markThumbFallback(id: string) {
    setThumbFallbackById((prev) => {
      if (prev[id]) return prev;
      return { ...prev, [id]: true };
    });
  }

  function renderThumb(item: AssetItem) {
    if (item.kind === "video") {
      return (
        <div className="flex h-full w-full items-center justify-center text-[10px] font-semibold [background:var(--surface-3,var(--muted))] [color:var(--text-subtle)]">
          VIDEO
        </div>
      );
    }

    if (thumbFallbackById[item._id]) {
      return (
        <div className="flex h-full w-full items-center justify-center text-[10px] font-semibold [background:var(--surface-3,var(--muted))] [color:var(--text-subtle)]">
          {item.kind.toUpperCase()}
        </div>
      );
    }

    const thumbClass =
      item.kind === "svg" ? "h-full w-full object-contain p-1.5" : "h-full w-full object-cover";

    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={item.url}
        alt={`Preview de ${item.label}`}
        className={thumbClass}
        loading="lazy"
        onError={() => markThumbFallback(item._id)}
      />
    );
  }

  const inputClass =
    "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors duration-180 focus:ring-2 focus:ring-ring";
  const selectClass =
    "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors duration-180 focus:ring-2 focus:ring-ring";
  const secondaryButtonClass =
    "inline-flex h-10 items-center justify-center rounded-lg border border-border px-3 text-sm font-semibold transition-colors duration-180 [background:var(--cta-secondary)] [color:var(--cta-secondary-foreground)] hover:[background:var(--cta-secondary-hover)] disabled:opacity-60";
  const primaryButtonClass =
    "inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-semibold transition-colors duration-180 [background:var(--cta-primary)] [color:var(--cta-primary-foreground)] hover:[background:var(--cta-primary-hover)] disabled:opacity-60";
  const quietButtonClass =
    "inline-flex h-9 items-center justify-center rounded-lg border border-border px-3 text-xs font-semibold transition-colors duration-180 [background:var(--cta-secondary)] [color:var(--cta-secondary-foreground)] hover:[background:var(--cta-secondary-hover)] disabled:opacity-60";

  return (
    <div className="mx-auto w-full max-w-[1180px] space-y-6 px-3 pb-4 sm:px-4 lg:px-0">
      <PageHeader
        title="Media Center (Taller)"
        description="Gestiona libreria de assets del sistema con filtros, restricciones y metadatos operativos."
        actions={
          <div className="flex items-center gap-2">
            <button type="button" onClick={load} className={secondaryButtonClass}>
              Recargar
            </button>
            <button
              type="button"
              onClick={() => setIsUploadSheetOpen(true)}
              className={`${primaryButtonClass} lg:hidden`}
            >
              Nuevo asset
            </button>
          </div>
        }
      />

      {error ? (
        <div className="rounded-xl border border-border p-3 text-sm shadow-sm [background:var(--surface-2,var(--background))] [color:var(--accent-strong,var(--foreground))]">
          {error}
        </div>
      ) : null}

      {notice ? (
        <div className="rounded-xl border border-border p-3 text-sm text-foreground shadow-sm [background:var(--surface-2,var(--background))]">
          {notice}
        </div>
      ) : null}

      <section className="rounded-xl border border-border p-5 shadow-sm [background:var(--surface-3,var(--card))]">
        <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-[1.4fr_1fr_1fr_1fr_1fr_auto]">
          <label className="grid gap-1">
            <span className="text-xs font-medium text-muted-foreground">Buscar por label</span>
            <input
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className={inputClass}
              placeholder="Ej: hero, footer, logo"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-xs font-medium text-muted-foreground">Tag libre</span>
            <input
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className={inputClass}
              placeholder="Ej: hero:background"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-xs font-medium text-muted-foreground">Tag guiado</span>
            <select
              value={selectedTagFromCatalog}
              onChange={(e) => setTagFilter(e.target.value)}
              className={selectClass}
            >
              <option value="">Todos los tags</option>
              {tagStats.map((entry) => (
                <option key={entry.tag} value={entry.tag}>
                  {entry.tag} ({entry.count})
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1">
            <span className="text-xs font-medium text-muted-foreground">Tipo</span>
            <select
              value={kindFilter}
              onChange={(e) => setKindFilter(e.target.value as KindFilter)}
              className={selectClass}
            >
              <option value="all">Todos</option>
              <option value="image">Imagen</option>
              <option value="svg">SVG</option>
              <option value="video">Video</option>
            </select>
          </label>

          <label className="grid gap-1">
            <span className="text-xs font-medium text-muted-foreground">Scope</span>
            <select
              value={scopeFilter}
              onChange={(e) => setScopeFilter(e.target.value as ScopeFilter)}
              className={selectClass}
            >
              <option value="all">Todos</option>
              <option value="system">System</option>
              <option value="tenant">Tenant</option>
            </select>
          </label>

          <div className="flex items-end">
            <button type="button" onClick={clearFilters} className={`${secondaryButtonClass} w-full`}>
              Limpiar
            </button>
          </div>
        </div>

        {tagStats.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {tagStats.slice(0, 10).map((entry) => (
              <button
                key={entry.tag}
                type="button"
                onClick={() => setTagFilter(entry.tag)}
                className="inline-flex items-center rounded-full border border-border px-2 py-1 text-xs transition-colors duration-180 [background:var(--badge-bg)] [color:var(--badge-fg)] [border-color:var(--badge-bg)] hover:opacity-90"
              >
                {entry.tag} · {entry.count}
              </button>
            ))}
          </div>
        ) : null}

        <div className="mt-4 rounded-lg border border-border px-3 py-2 text-xs shadow-sm [background:var(--surface-2,var(--background))] [color:var(--text-subtle)]">
          {loading
            ? "Cargando assets..."
            : `${filteredItems.length} visibles de ${items.length} activos · filtro de restriccion: ${restrictionFilter}`}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Uso:</span>
          <button
            type="button"
            onClick={() => setRestrictionFilter("all")}
            className="rounded-full border border-border px-2 py-1 text-xs [background:var(--surface-2,var(--background))] [color:var(--text-subtle)]"
          >
            Todos
          </button>
          <button
            type="button"
            onClick={() => setRestrictionFilter("restricted")}
            className="rounded-full border border-border px-2 py-1 text-xs [background:var(--surface-2,var(--background))] [color:var(--text-subtle)]"
          >
            Restringidos (`allowedIn`)
          </button>
          <button
            type="button"
            onClick={() => setRestrictionFilter("open")}
            className="rounded-full border border-border px-2 py-1 text-xs [background:var(--surface-2,var(--background))] [color:var(--text-subtle)]"
          >
            Uso libre
          </button>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        <section className="hidden rounded-xl border border-border p-5 shadow-sm [background:var(--surface-2,var(--card))] lg:block">
          <div className="text-sm font-semibold">Subir nuevo asset</div>
          <p className="mt-1 text-sm text-muted-foreground">
            Alta rapida para libreria del sistema (Capa 1).
          </p>

          <form onSubmit={onUpload} className="mt-4 grid gap-3">
            <label className="grid gap-1">
              <span className="text-xs font-medium text-muted-foreground">Archivo</span>
              <input
                id="taller-media-file-desktop"
                ref={fileRef}
                type="file"
                className={`${inputClass} h-auto py-2`}
                accept="image/*,video/*,.svg"
              />
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-medium text-muted-foreground">Label (opcional)</span>
              <input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className={inputClass}
                placeholder="Ej: Footer silueta"
              />
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-medium text-muted-foreground">Tags (opcional)</span>
              <input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className={inputClass}
                placeholder="hero:background footer:shape"
              />
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-medium text-muted-foreground">AllowedIn (opcional)</span>
              <input
                value={allowedIn}
                onChange={(e) => setAllowedIn(e.target.value)}
                className={inputClass}
                placeholder="hero.background footer.pattern"
              />
            </label>

            <button disabled={busy} className={primaryButtonClass}>
              {busy ? "Subiendo..." : "Subir asset"}
            </button>
          </form>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Biblioteca de assets</h2>
            <span className="text-xs text-muted-foreground">Desktop-optimized, responsive-safe</span>
          </div>

          {loading ? (
            <div className="space-y-3">
              <div className="h-32 animate-pulse rounded-xl border border-border [background:var(--surface-2,var(--card))]" />
              <div className="h-32 animate-pulse rounded-xl border border-border [background:var(--surface-2,var(--card))]" />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="rounded-xl border border-border p-5 text-sm text-muted-foreground shadow-sm [background:var(--surface-2,var(--card))]">
              {hasActiveFilters
                ? "No hay assets que coincidan con los filtros actuales."
                : "No hay assets todavia. Crea el primero desde Nuevo asset."}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((item) => {
                const isRestricted = item.allowedIn.length > 0;
                const pipelineBadgeClass =
                  item.pipelineStatus === "failed"
                    ? "inline-flex items-center rounded-full border border-border px-2 py-0.5 text-xs [background:var(--accent-soft,var(--muted))] [color:var(--accent-strong,var(--foreground))]"
                    : "inline-flex items-center rounded-full border border-border px-2 py-0.5 text-xs [background:var(--surface-3,var(--muted))] [color:var(--text-subtle)]";

                return (
                  <article
                    key={item._id}
                    className="rounded-xl border border-border p-4 shadow-sm [background:var(--surface-2,var(--card))] sm:p-5"
                  >
                    <div className="flex items-start gap-4">
                      <div className="h-18 w-18 shrink-0 overflow-hidden rounded-lg border border-border [background:var(--surface-1,var(--background))]">
                        {renderThumb(item)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-semibold text-foreground">{item.label}</h3>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {formatBytes(item.bytes)} · {item.mime || item.kind}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-1">
                            <span className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-xs [background:var(--badge-bg)] [color:var(--badge-fg)] [border-color:var(--badge-bg)]">
                              {item.kind}
                            </span>
                            <span className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-xs [background:var(--surface-3,var(--muted))] [color:var(--text-subtle)]">
                              {item.scope}
                            </span>
                            <span className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-xs [background:var(--surface-3,var(--muted))] [color:var(--text-subtle)]">
                              {isRestricted ? "restringido" : "uso libre"}
                            </span>
                            <span className={pipelineBadgeClass}>pipeline: {item.pipelineStatus}</span>
                            <span className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-xs [background:var(--surface-3,var(--muted))] [color:var(--text-subtle)]">
                              variant: {item.variantKey}
                            </span>
                          </div>
                        </div>

                        <div className="mt-2 truncate text-[11px] [color:var(--text-subtle)]">{item.url}</div>

                        <div className="mt-2 flex flex-wrap gap-1">
                          {item.tags.length > 0 ? (
                            item.tags.slice(0, 6).map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full border border-border px-2 py-0.5 text-xs [background:var(--badge-bg)] [color:var(--badge-fg)] [border-color:var(--badge-bg)]"
                              >
                                {tag}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">Sin tags</span>
                          )}
                          {item.tags.length > 6 ? (
                            <span className="text-xs text-muted-foreground">+{item.tags.length - 6}</span>
                          ) : null}
                        </div>

                        <div className="mt-1 text-[11px] [color:var(--text-subtle)]">
                          Destinos permitidos:{" "}
                          {isRestricted ? item.allowedIn.slice(0, 3).join(", ") : "cualquier slot"}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <a href={item.url} target="_blank" rel="noreferrer" className={quietButtonClass}>
                        Ver
                      </a>
                      <button type="button" onClick={() => copy(item.url)} className={quietButtonClass}>
                        Copiar URL
                      </button>
                      <button
                        type="button"
                        onClick={() => startEdit(item)}
                        disabled={rowBusyId === item._id}
                        className={quietButtonClass}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => removeAsset(item)}
                        disabled={rowBusyId === item._id}
                        className="inline-flex h-9 items-center justify-center rounded-lg border border-border px-3 text-xs font-semibold transition-colors duration-180 [background:var(--accent-soft,var(--muted))] [color:var(--accent-strong,var(--foreground))] hover:opacity-90 disabled:opacity-60"
                      >
                        Borrar
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Nota: para upload en Vercel necesitas `BLOB_READ_WRITE_TOKEN`.
          </p>
        </section>
      </div>

      {isUploadSheetOpen ? (
        <div className="fixed inset-0 z-110 bg-black/35 lg:hidden">
          <button
            type="button"
            aria-label="Cerrar alta de asset"
            className="absolute inset-0"
            onClick={() => setIsUploadSheetOpen(false)}
          />

          <section className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-hidden rounded-t-2xl border border-border [background:var(--surface-2,var(--card))]">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h3 className="text-sm font-semibold">Nuevo asset</h3>
              <button type="button" onClick={() => setIsUploadSheetOpen(false)} className={quietButtonClass}>
                Cerrar
              </button>
            </div>

            <div className="max-h-[calc(88vh-64px)] overflow-y-auto p-4">
              <form onSubmit={onUpload} className="grid gap-3">
                <label className="grid gap-1">
                  <span className="text-xs font-medium text-muted-foreground">Archivo</span>
                  <input
                    id="taller-media-file-mobile"
                    ref={mobileFileRef}
                    type="file"
                    className={`${inputClass} h-auto py-2`}
                    accept="image/*,video/*,.svg"
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-xs font-medium text-muted-foreground">Label (opcional)</span>
                  <input
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className={inputClass}
                    placeholder="Ej: Hero ilustracion"
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-xs font-medium text-muted-foreground">Tags (opcional)</span>
                  <input
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className={inputClass}
                    placeholder="hero:background"
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-xs font-medium text-muted-foreground">AllowedIn (opcional)</span>
                  <input
                    value={allowedIn}
                    onChange={(e) => setAllowedIn(e.target.value)}
                    className={inputClass}
                    placeholder="hero.background"
                  />
                </label>

                <button disabled={busy} className={primaryButtonClass}>
                  {busy ? "Subiendo..." : "Guardar asset"}
                </button>
              </form>
            </div>
          </section>
        </div>
      ) : null}

      {editingItem ? (
        <div className="fixed inset-0 z-120 flex items-end bg-black/40 lg:items-stretch lg:justify-end">
          <button
            type="button"
            aria-label="Cerrar edicion"
            className="absolute inset-0"
            onClick={cancelEdit}
          />

          <section className="relative flex max-h-[90vh] w-full flex-col rounded-t-2xl border border-border [background:var(--surface-2,var(--card))] lg:h-full lg:max-h-none lg:w-[460px] lg:rounded-none lg:border-l">
            <div className="border-b border-border px-4 py-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="truncate text-sm font-semibold">Editar asset</h3>
                <button type="button" onClick={cancelEdit} className={quietButtonClass}>
                  Cerrar
                </button>
              </div>
              <p className="mt-1 truncate text-xs text-muted-foreground">{editingItem.label}</p>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
              <div className="flex items-start gap-3 rounded-lg border border-border p-3 [background:var(--surface-1,var(--background))]">
                <div className="h-14 w-14 overflow-hidden rounded-md border border-border">
                  {renderThumb(editingItem)}
                </div>
                <div className="min-w-0 text-xs [color:var(--text-subtle)]">
                  <div className="truncate">kind: {editingItem.kind}</div>
                  <div className="truncate">scope: {editingItem.scope}</div>
                  <div className="truncate">
                    uso: {editingItem.allowedIn.length > 0 ? "restringido" : "libre"}
                  </div>
                </div>
              </div>

              <label className="grid gap-1">
                <span className="text-xs font-medium text-muted-foreground">Label</span>
                <input
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  className={inputClass}
                />
              </label>

              <label className="grid gap-1">
                <span className="text-xs font-medium text-muted-foreground">Tags</span>
                <input
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                  className={inputClass}
                  placeholder="hero:background, hero:logo"
                />
              </label>

              <label className="grid gap-1">
                <span className="text-xs font-medium text-muted-foreground">AllowedIn</span>
                <input
                  value={editAllowedIn}
                  onChange={(e) => setEditAllowedIn(e.target.value)}
                  className={inputClass}
                  placeholder="hero.background, hero.logo"
                />
                <span className="text-xs text-muted-foreground">
                  Restriccion funcional de uso por slot.
                </span>
              </label>
            </div>

            <div className="sticky bottom-0 border-t border-border px-4 py-3 [background:var(--surface-3,var(--card))]">
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={cancelEdit}
                  disabled={rowBusyId === editingItem._id}
                  className={secondaryButtonClass}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={saveEdit}
                  disabled={rowBusyId === editingItem._id}
                  className={primaryButtonClass}
                >
                  {rowBusyId === editingItem._id ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
