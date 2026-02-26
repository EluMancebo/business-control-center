"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import PageHeader from "@/components/panel/PageHeader";

type AssetItem = {
  _id: string;
  scope: "system" | "tenant";
  kind: "image" | "svg" | "video";
  bucket: string;
  key: string;
  url: string;
  label: string;
  tags: string[];
  allowedIn: string[];
  mime: string;
  bytes: number;
  status: "active" | "archived";
  createdAt?: string;
};

function formatBytes(bytes: number) {
  if (!bytes || bytes < 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i += 1;
  }
  return `${n.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export default function TallerMediaPage() {
  const [items, setItems] = useState<AssetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [tagFilter, setTagFilter] = useState("");

  const fileRef = useRef<HTMLInputElement | null>(null);
  const [label, setLabel] = useState("");
  const [tags, setTags] = useState(""); // "hero:background hero:logo"
  const [allowedIn, setAllowedIn] = useState(""); // "hero.background hero.logo"

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams();
      qs.set("scope", "system");
      qs.set("status", "active");
      if (tagFilter.trim()) qs.set("tag", tagFilter.trim());

      const res = await fetch(`/api/taller/media?${qs.toString()}`, {
        method: "GET",
        cache: "no-store",
      });

      const json = await res.json();
      if (!res.ok || !json?.ok) throw new Error(json?.error || "Error loading assets");

      setItems((json.items || []) as AssetItem[]);
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

    try {
      const file = fileRef.current?.files?.[0];
      if (!file) throw new Error("Selecciona un archivo.");

      const form = new FormData();
      form.set("file", file);
      if (label.trim()) form.set("label", label.trim());
      if (tags.trim()) form.set("tag", tags.trim());
      if (allowedIn.trim()) form.set("allowedIn", allowedIn.trim());

      const res = await fetch("/api/taller/media", {
        method: "POST",
        body: form,
      });

      const json = await res.json();
      if (!res.ok || !json?.ok) throw new Error(json?.error || "Upload failed");

      const created = json.item as AssetItem;
      setItems((prev) => [created, ...prev]);

      // reset
      if (fileRef.current) fileRef.current.value = "";
      setLabel("");
      setTags("");
      setAllowedIn("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
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
            className="shrink-0 rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-muted"
          >
            Recargar
          </button>
        }
      />

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
              className="mt-2 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              {busy ? "Subiendo..." : "Subir"}
            </button>

            {error ? (
              <div className="rounded-lg border border-border bg-background p-3 text-sm text-red-500">
                {error}
              </div>
            ) : null}
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
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted"
              >
                Filtrar
              </button>
            </div>
          </div>

          <div className="mt-4 overflow-hidden rounded-xl border border-border">
            <div className="grid grid-cols-12 gap-0 bg-muted px-3 py-2 text-xs font-semibold text-muted-foreground">
              <div className="col-span-4">Label</div>
              <div className="col-span-2">Tipo</div>
              <div className="col-span-3">Tags</div>
              <div className="col-span-2">Peso</div>
              <div className="col-span-1 text-right">Acción</div>
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
                  <div
                    key={it._id}
                    className="grid grid-cols-12 items-center gap-0 px-3 py-3 text-sm"
                  >
                    <div className="col-span-4">
                      <div className="font-medium">{it.label}</div>
                      <div className="truncate text-xs text-muted-foreground">
                        {it.url}
                      </div>
                    </div>

                    <div className="col-span-2">
                      <span className="rounded-full border border-border bg-background px-2 py-1 text-xs">
                        {it.kind}
                      </span>
                    </div>

                    <div className="col-span-3">
                      <div className="flex flex-wrap gap-1">
                        {(it.tags || []).slice(0, 4).map((t) => (
                          <span
                            key={t}
                            className="rounded-full border border-border bg-background px-2 py-0.5 text-xs text-muted-foreground"
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
                    </div>

                    <div className="col-span-2 text-xs text-muted-foreground">
                      {formatBytes(it.bytes)}
                    </div>

                    <div className="col-span-1 flex justify-end gap-2">
                      <a
                        href={it.url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg border border-border bg-background px-2 py-1 text-xs hover:bg-muted"
                      >
                        Ver
                      </a>
                      <button
                        onClick={() => copy(it.url)}
                        className="rounded-lg border border-border bg-background px-2 py-1 text-xs hover:bg-muted"
                      >
                        Copiar
                      </button>
                    </div>
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