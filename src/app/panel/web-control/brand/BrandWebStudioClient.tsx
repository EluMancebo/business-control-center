// src/app/panel/web-control/brand/BrandWebStudioClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import BrandEditor from "@/components/panel/brand/BrandEditor";

type ViewportMode = "desktop" | "mobile";

function readActiveBusinessSlug(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem("bcc:activeBusinessSlug")?.trim() || "";
}

function defer(fn: () => void) {
  const q =
    typeof queueMicrotask === "function"
      ? queueMicrotask
      : (cb: () => void) => Promise.resolve().then(cb);
  q(fn);
}

export default function BrandWebStudioClient() {
  const [slug, setSlug] = useState<string>("");
  const [viewport, setViewport] = useState<ViewportMode>("desktop");
  const [nonce, setNonce] = useState<number>(0);

  useEffect(() => {
    defer(() => setSlug(readActiveBusinessSlug()));
  }, []);

  const canPreview = Boolean(slug.trim());

  const previewUrl = useMemo(() => {
    if (!slug.trim()) return "/";
    return `/${encodeURIComponent(slug)}?t=${nonce}`;
  }, [slug, nonce]);

  const iframeWrapperClass =
    viewport === "mobile" ? "mx-auto w-[390px] max-w-full" : "w-full";

  return (
    <div className="h-full overflow-hidden">
      <div className="h-[calc(100vh-56px)]">
        <div className="grid h-full grid-cols-1 lg:grid-cols-[420px_1fr]">
          {/* LEFT: editor */}
          <aside className="h-full overflow-hidden border-r border-border bg-background">
            <div className="h-full overflow-y-auto bcc-scrollbar p-4 pb-24 space-y-4">
              <section className="rounded-xl border border-border bg-card p-4 text-card-foreground">
                <div className="space-y-3">
                  <div className="text-sm font-semibold">Apariencia web pública</div>
                  <p className="text-xs text-muted-foreground">
                    Editas solo la marca de la web. El panel no cambia.
                  </p>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground">
                      Business slug activo
                    </label>
                    <input
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="caballeros-barberia"
                      className="mt-1 w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                    />
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      Tip: se toma de <code>bcc:activeBusinessSlug</code> si existe.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setNonce((n) => n + 1)}
                      className="inline-flex h-9 flex-1 items-center justify-center rounded-lg border border-border bg-background px-3 text-xs font-semibold hover:bg-muted"
                      disabled={!canPreview}
                    >
                      Refrescar preview
                    </button>

                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-background px-3 text-xs font-semibold hover:bg-muted"
                    >
                      Abrir ↗
                    </a>
                  </div>
                </div>
              </section>

              <BrandEditor scope={"web" as const} businessSlug={slug} />
            </div>
          </aside>

          {/* RIGHT: preview real */}
          <section className="h-full overflow-hidden bg-background">
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold">Preview real (web pública)</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Vista real. Scroll dentro del iframe solo si la web lo necesita.
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setViewport("desktop")}
                    className={[
                      "inline-flex h-9 items-center justify-center rounded-lg border px-3 text-xs font-semibold",
                      viewport === "desktop"
                        ? "border-border bg-muted"
                        : "border-border bg-background hover:bg-muted",
                    ].join(" ")}
                    disabled={!canPreview}
                  >
                    Desktop
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewport("mobile")}
                    className={[
                      "inline-flex h-9 items-center justify-center rounded-lg border px-3 text-xs font-semibold",
                      viewport === "mobile"
                        ? "border-border bg-muted"
                        : "border-border bg-background hover:bg-muted",
                    ].join(" ")}
                    disabled={!canPreview}
                  >
                    Mobile
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-hidden p-4">
                <div className={iframeWrapperClass + " h-full"}>
                  <div className="h-full overflow-hidden rounded-xl border border-border bg-background">
                    {canPreview ? (
                      <iframe
                        title="Preview web pública"
                        src={previewUrl}
                        className="h-full w-full"
                      />
                    ) : (
                      <div className="p-6 text-sm text-muted-foreground">
                        Introduce un slug válido para ver preview.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}  
