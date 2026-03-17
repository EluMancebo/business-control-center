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

export default function TallerMediaPage() {
  const [items, setItems] = useState<AssetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [rowBusyId, setRowBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [tagFilter, setTagFilter] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editTags, setEditTags] = useState("");
  const [editAllowedIn, setEditAllowedIn] = useState("");

  const fileRef = useRef<HTMLInputElement | null>(null);
  const [label, setLabel] = useState("");
  const [tags, setTags] = useState(""); // "hero:background hero:logo"
  const [allowedIn, setAllowedIn] = useState(""); // "hero.background hero.logo"

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const nextItems = await fetchSystemMediaClient(tagFilter);
      setItems(nextItems);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error loading assets");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => items, [items]);

  async function onUpload(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);

    try {
      const file = fileRef.current?.files?.[0];
      if (!file) throw new Error("Selecciona un archivo.");

      const created = await uploadSystemMediaClient({
        file,
        label,
        tags,
        allowedIn,
      });
      setItems((prev) => [created, ...prev]);

      // reset
      if (fileRef.current) fileRef.current.value = "";
      setLabel("");
      setTags("");
      setAllowedIn("");
      setNotice("Asset subido correctamente ✓");
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
    } catch {
      // fallback silencioso (no bloqueamos)
    }
  }

  return (
    <>
      <PageHeader
        title="Media Center (Taller)"
        description="Sube assets al sistema (Vercel Blob) y reutilízalos en presets y slots permitidos."
        actions={
          <button
            onClick={load}
            className="shrink-0 rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-muted [background:var(--cta-secondary)] [color:var(--cta-secondary-foreground)] hover:[background:var(--cta-secondary-hover)]"
          >
            Recargar
          </button>
        }
      />

      {error ? (
        <div className="mb-4 rounded-lg border border-border bg-background p-3 text-sm text-red-500">
          {error}
        </div>
      ) : null}

      {notice ? (
        <div className="mb-4 rounded-lg border border-border bg-background p-3 text-sm text-foreground [background:var(--surface-2,var(--background))]">
          {notice}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upload */}
        <section className="rounded-xl border border-border bg-card p-5 text-card-foreground lg:col-span-1">
          <div className="text-sm font-semibold">Subir asset</div>
          <p className="mt-1 text-sm text-muted-foreground">
            MVP: se sube a Vercel Blob y se guarda referencia en Mongo.
          </p>

          <form onSubmit={onUpload} className="mt-4 grid gap-3">
            <div className="grid gap-1">
              <label htmlFor="taller-media-file" className="text-xs font-medium text-muted-foreground">
                Archivo
              </label>
              <input id="taller-media-file"
                ref={fileRef}
                type="file"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                accept="image/*,video/*,.svg"
              />
            </div>

            <div className="grid gap-1">
              <label className="text-xs font-medium text-muted-foreground">
                Label (opcional)
              </label>
              <input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                placeholder="Ej: Barber tools (Hero bg)"
              />
            </div>

            <div className="grid gap-1">
              <label className="text-xs font-medium text-muted-foreground">
                Tags (opcional)
              </label>
              <input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                placeholder='Ej: hero:background hero:logo'
              />
              <div className="text-xs text-muted-foreground">
                Separa por espacios o comas.
              </div>
            </div>

            <div className="grid gap-1">
              <label className="text-xs font-medium text-muted-foreground">
                AllowedIn (opcional)
              </label>
              <input
                value={allowedIn}
                onChange={(e) => setAllowedIn(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                placeholder='Ej: hero.background hero.logo'
              />
            </div>

            <button
              disabled={busy}
              className="mt-2 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60 [background:var(--cta-primary)] [color:var(--cta-primary-foreground)] hover:[background:var(--cta-primary-hover)]"
            >
              {busy ? "Subiendo..." : "Subir"}
            </button>
          </form>
        </section>

        {/* List */}
        <section className="rounded-xl border border-border bg-card p-5 text-card-foreground lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">Assets</div>
              <div className="text-sm text-muted-foreground">
                {loading ? "Cargando..." : `${filtered.length} items`}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
                className="w-48 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                placeholder="Filtrar por tag..."
              />
              <button
                onClick={load}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted [background:var(--cta-secondary)] [color:var(--cta-secondary-foreground)] hover:[background:var(--cta-secondary-hover)]"
              >
                Filtrar
              </button>
            </div>
          </div>

          <div className="mt-4 overflow-hidden rounded-xl border border-border">
            <div className="grid grid-cols-12 gap-0 bg-muted px-3 py-2 text-xs font-semibold text-muted-foreground [background:var(--surface-3)] [color:var(--text-subtle)]">
              <div className="col-span-4">Label</div>
              <div className="col-span-2">Tipo</div>
              <div className="col-span-2">Tags</div>
              <div className="col-span-1">Peso</div>
              <div className="col-span-3 text-right">Acciones</div>
            </div>

            {loading ? (
              <div className="p-4 text-sm text-muted-foreground">Cargando...</div>
            ) : filtered.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground">
                No hay assets aún.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filtered.map((it) => (
                  <div key={it._id}>
                    <div className="grid grid-cols-12 items-center gap-0 px-3 py-3 text-sm">
                      <div className="col-span-4">
                        <div className="font-medium">{it.label}</div>
                        <div className="truncate text-xs text-muted-foreground">
                          {it.url}
                        </div>
                      </div>

                      <div className="col-span-2">
                        <span className="rounded-full border border-border bg-background px-2 py-1 text-xs [background:var(--badge-bg)] [color:var(--badge-fg)] [border-color:var(--badge-bg)]">
                          {it.kind}
                        </span>
                      </div>

                      <div className="col-span-2">
                        <div className="flex flex-wrap gap-1">
                          {(it.tags || []).slice(0, 4).map((t) => (
                            <span
                              key={t}
                              className="rounded-full border border-border bg-background px-2 py-0.5 text-xs text-muted-foreground [background:var(--badge-bg)] [color:var(--badge-fg)] [border-color:var(--badge-bg)]"
                            >
                              {t}
                            </span>
                          ))}
                          {(it.tags || []).length > 4 ? (
                            <span className="text-xs text-muted-foreground">
                              +{(it.tags || []).length - 4}
                            </span>
                          ) : null}
                        </div>
                        <div className="mt-1 truncate text-xs text-muted-foreground">
                          allowedIn: {(it.allowedIn || []).join(", ") || "—"}
                        </div>
                      </div>

                      <div className="col-span-1 text-xs text-muted-foreground">
                        {formatBytes(it.bytes)}
                      </div>

                      <div className="col-span-3 flex flex-wrap justify-end gap-2">
                        <a
                          href={it.url}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg border border-border bg-background px-2 py-1 text-xs hover:bg-muted [color:var(--link)] hover:[color:var(--link-hover)]"
                        >
                          Ver
                        </a>
                        <button
                          onClick={() => copy(it.url)}
                          className="rounded-lg border border-border bg-background px-2 py-1 text-xs hover:bg-muted [background:var(--cta-secondary)] [color:var(--cta-secondary-foreground)] hover:[background:var(--cta-secondary-hover)]"
                        >
                          Copiar
                        </button>
                        <button
                          onClick={() => startEdit(it)}
                          disabled={rowBusyId === it._id}
                          className="rounded-lg border border-border bg-background px-2 py-1 text-xs hover:bg-muted disabled:opacity-60 [background:var(--cta-secondary)] [color:var(--cta-secondary-foreground)] hover:[background:var(--cta-secondary-hover)]"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => removeAsset(it)}
                          disabled={rowBusyId === it._id}
                          className="rounded-lg border border-border bg-background px-2 py-1 text-xs hover:opacity-90 disabled:opacity-60 [background:var(--accent-soft,var(--muted))] [color:var(--accent-strong,var(--foreground))]"
                        >
                          Borrar
                        </button>
                      </div>
                    </div>

                    {editingId === it._id ? (
                      <div className="border-t border-border bg-background p-3 [background:var(--surface-2,var(--background))]">
                        <div className="grid gap-3 md:grid-cols-3">
                          <label className="grid gap-1">
                            <span className="text-xs font-medium text-muted-foreground">Label</span>
                            <input
                              value={editLabel}
                              onChange={(e) => setEditLabel(e.target.value)}
                              className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                            />
                          </label>

                          <label className="grid gap-1">
                            <span className="text-xs font-medium text-muted-foreground">Tags</span>
                            <input
                              value={editTags}
                              onChange={(e) => setEditTags(e.target.value)}
                              className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                              placeholder="hero:background, hero:logo"
                            />
                          </label>

                          <label className="grid gap-1">
                            <span className="text-xs font-medium text-muted-foreground">AllowedIn</span>
                            <input
                              value={editAllowedIn}
                              onChange={(e) => setEditAllowedIn(e.target.value)}
                              className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                              placeholder="hero.background, hero.logo"
                            />
                          </label>
                        </div>

                        <div className="mt-3 flex items-center justify-end gap-2">
                          <button
                            onClick={cancelEdit}
                            disabled={rowBusyId === it._id}
                            className="rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium hover:bg-muted disabled:opacity-60 [background:var(--cta-secondary)] [color:var(--cta-secondary-foreground)] hover:[background:var(--cta-secondary-hover)]"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={saveEdit}
                            disabled={rowBusyId === it._id}
                            className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60 [background:var(--cta-primary)] [color:var(--cta-primary-foreground)] hover:[background:var(--cta-primary-hover)]"
                          >
                            {rowBusyId === it._id ? "Guardando..." : "Guardar"}
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-3 text-xs text-muted-foreground">
            Nota: para que el upload funcione en Vercel necesitas BLOB_READ_WRITE_TOKEN configurado.
          </div>
        </section>
      </div>
    </>
  );
}    
