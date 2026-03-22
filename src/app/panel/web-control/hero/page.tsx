//src/app/panel/web-control/hero/page.tsx 
 
"use client";

import { useEffect, useMemo, useState } from "react";
import type { HeroData } from "@/lib/web/hero/types";
import { DEFAULT_HERO } from "@/lib/web/hero/types";

type BusinessPublic = {
  name: string;
  slug: string;
  activeHeroVariantKey: string;
};

type HeroPresetOption = {
  key: string;
  label: string;
  description: string;
  tags: string[];
  status: "active" | "archived";
};

type AccountContext = {
  ok: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  business?: {
    id: string;
    slug: string;
    name: string;
  } | null;
};

type ViewportMode = "desktop" | "mobile";
type MobileTab = "edit" | "preview";

const ALLOWED_LOGOS = [
  { label: "Logo mark (BCC)", url: "/brand/logo-mark.svg" },
  { label: "Caballeros (PNG) antiguo", url: "/brand/caballeros-logo.png" },
  { label: "Caballeros · Logo HERO (PNG)", url: "/brand/LogoHeroCaballerosBarberia.png" },
  { label: "Caballeros · Logo Header/Footer (PNG)", url: "/brand/LogoHeadCaballerosBarberia.png" },
] as const;

const ALLOWED_HERO_BACKGROUNDS = [
  { label: "Barber tools", url: "/hero/barber-tools.jpg" },
  { label: "Barber close", url: "/hero/barber-close.jpg" },
  { label: "Dark abstract", url: "/hero/dark-abstract.jpg" },
] as const;

function normalizeVariantKey(value: string) {
  const v = String(value || "").trim().toLowerCase();
  return v.length ? v : "default";
}

async function fetchAccountContext(): Promise<AccountContext | null> {
  const res = await fetch("/api/panel/account", { cache: "no-store" });
  if (!res.ok) return null;
  return (await res.json()) as AccountContext;
}

async function fetchBusinessPublic(slug: string): Promise<BusinessPublic | null> {
  const res = await fetch(`/api/web/public/business?slug=${encodeURIComponent(slug)}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { ok: boolean; business?: BusinessPublic };
  return json?.business ?? null;
}

async function fetchHeroPresets(): Promise<HeroPresetOption[]> {
  const res = await fetch("/api/web/presets/hero", { cache: "no-store" });
  if (!res.ok) throw new Error("No se pudieron cargar los presets");

  const json = (await res.json()) as { ok: boolean; presets?: HeroPresetOption[] };
  return Array.isArray(json?.presets) ? json.presets : [];
}

async function fetchHero(args: {
  status: "draft" | "published";
  slug: string;
  variantKey: string;
}) {
  const res = await fetch(
    `/api/web/hero?status=${args.status}&slug=${encodeURIComponent(args.slug)}&variantKey=${encodeURIComponent(
      args.variantKey
    )}`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error("No se pudo cargar el hero");
  return (await res.json()) as { ok: boolean; status: string; data: HeroData };
}

async function saveDraft(args: { slug: string; variantKey: string; next: HeroData }) {
  const res = await fetch(
    `/api/web/hero?slug=${encodeURIComponent(args.slug)}&variantKey=${encodeURIComponent(args.variantKey)}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(args.next),
    }
  );
  if (!res.ok) throw new Error("No se pudo guardar el draft");
}

async function publishDraft(args: { slug: string; variantKey: string }) {
  const res = await fetch(
    `/api/web/hero/publish?slug=${encodeURIComponent(args.slug)}&variantKey=${encodeURIComponent(args.variantKey)}`,
    { method: "POST" }
  );
  if (!res.ok) throw new Error("No se pudo publicar");
}

async function setActivePreset(args: { variantKey: string; slug: string }) {
  const res = await fetch("/api/panel/business/hero-active", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ variantKey: args.variantKey, slug: args.slug }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "No se pudo cambiar el preset activo");
  }

  return (await res.json()) as { ok: boolean; business?: BusinessPublic };
}

export default function HeroControlPage() {
  const demoSlug =
    (typeof process !== "undefined" &&
      (process.env.NEXT_PUBLIC_DEMO_BUSINESS_SLUG as string | undefined)) ||
    "";

  const [account, setAccount] = useState<AccountContext | null>(null);
  const [bootLoading, setBootLoading] = useState(true);

  const [slug, setSlug] = useState<string>(demoSlug || "");
  const [business, setBusiness] = useState<BusinessPublic | null>(null);
  const [presetOptions, setPresetOptions] = useState<HeroPresetOption[]>([]);

  const fallbackPresetKey = useMemo<string>(() => {
    return presetOptions[0]?.key ?? "default";
  }, [presetOptions]);

  const activeVariantKey = useMemo<string>(() => {
    return normalizeVariantKey(business?.activeHeroVariantKey || fallbackPresetKey);
  }, [business?.activeHeroVariantKey, fallbackPresetKey]);

  const [form, setForm] = useState<HeroData>(DEFAULT_HERO);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string>("");

  const [viewport, setViewport] = useState<ViewportMode>("desktop");
  const [previewNonce, setPreviewNonce] = useState<number>(0);

  const [tab, setTab] = useState<MobileTab>("edit");

  const [dirty, setDirty] = useState<boolean>(false);
  const [saveTick, setSaveTick] = useState<number>(0);

  const role = account?.user?.role ?? "";
  const isAdmin = role === "admin";
  const lockedSlug = !isAdmin;

  useEffect(() => {
    let alive = true;

    (async () => {
      setBootLoading(true);

      try {
        const [presets, ctx] = await Promise.all([fetchHeroPresets(), fetchAccountContext()]);
        if (!alive) return;

        setPresetOptions(presets);
        setAccount(ctx);

        if (ctx?.user?.role && ctx.user.role !== "admin") {
          const ownerSlug = ctx.business?.slug?.trim() || "";
          setSlug(ownerSlug);
        }
      } catch {
        if (!alive) return;
        setPresetOptions([]);
        setMsg("No se pudieron cargar los datos iniciales.");
      } finally {
        if (!alive) return;
        setBootLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (business?.slug) {
      localStorage.setItem("bcc:activeBusinessSlug", business.slug);
    }
  }, [business?.slug]);

  useEffect(() => {
    let alive = true;

    (async () => {
      if (!slug.trim()) {
        if (!alive) return;
        setBusiness(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setMsg("");

      try {
        const b = await fetchBusinessPublic(slug);
        if (!alive) return;

        setBusiness(b);

        if (!b) {
          setForm(DEFAULT_HERO);
          setMsg("Negocio no encontrado (revisa slug).");
        }
      } catch {
        if (!alive) return;
        setBusiness(null);
        setMsg("Error cargando negocio.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [slug]);

  useEffect(() => {
    let alive = true;

    (async () => {
      if (!business?.slug) return;
      if (!activeVariantKey) return;

      setLoading(true);
      setMsg("");

      try {
        const { data } = await fetchHero({
          status: "draft",
          slug: business.slug,
          variantKey: activeVariantKey,
        });

        if (!alive) return;

        setForm(data ?? DEFAULT_HERO);
        setDirty(false);
      } catch {
        if (!alive) return;
        setForm(DEFAULT_HERO);
        setDirty(false);
        setMsg("No se pudo cargar el draft (usando default).");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [business?.slug, activeVariantKey]);

  useEffect(() => {
    if (!business?.slug) return;
    if (!dirty) return;

    const timeoutId = window.setTimeout(async () => {
      try {
        setSaving(true);
        setMsg("");
        await saveDraft({ slug: business.slug, variantKey: activeVariantKey, next: form });
        setMsg("Guardado ✓");
      } catch {
        setMsg("Error guardando draft");
      } finally {
        setSaving(false);
        setDirty(false);
      }
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [saveTick, business?.slug, dirty, activeVariantKey, form]);

  function update<K extends keyof HeroData>(key: K, value: HeroData[K]) {
    if (!business?.slug) return;

    const next: HeroData = { ...form, [key]: value };
    setForm(next);
    setDirty(true);
    setSaveTick((n) => n + 1);
  }

  async function reset() {
    if (!business?.slug) return;

    const next = DEFAULT_HERO;
    setForm(next);

    try {
      setSaving(true);
      setMsg("");
      await saveDraft({ slug: business.slug, variantKey: activeVariantKey, next });
      setDirty(false);
      setMsg("Reset guardado ✓");
      setPreviewNonce((n) => n + 1);
    } catch {
      setMsg("Error en reset");
    } finally {
      setSaving(false);
    }
  }

  async function publish() {
    if (!business?.slug) return;

    try {
      setSaving(true);
      setMsg("");
      await publishDraft({ slug: business.slug, variantKey: activeVariantKey });
      setMsg("Publicado ✅ (Web pública lee PUBLISHED)");
      setPreviewNonce((n) => n + 1);
    } catch {
      setMsg("Error publicando");
    } finally {
      setSaving(false);
    }
  }

  async function changeActivePreset(nextKey: string) {
    if (!business?.slug) return;

    const normalizedKey = normalizeVariantKey(nextKey);
    const businessSlug = business.slug;

    try {
      setSaving(true);
      setMsg("");

      await setActivePreset({ variantKey: normalizedKey, slug: businessSlug });

      const b = await fetchBusinessPublic(businessSlug);
      setBusiness(b);

      setDirty(false);
      setMsg(`Preset activo cambiado a "${normalizedKey}" ✓`);
      setPreviewNonce((n) => n + 1);
    } catch (e) {
      console.error(e);
      setMsg("Error cambiando preset activo");
    } finally {
      setSaving(false);
    }
  }

  const canPreview = Boolean(business?.slug);
  const publishedUrl = business?.slug
    ? `/${encodeURIComponent(business.slug)}?t=${previewNonce}`
    : "/";

  const iframeWrapperClass =
    viewport === "mobile" ? "mx-auto w-[390px] max-w-full" : "w-full";

  if (bootLoading || loading) {
    return <div className="p-4 text-sm text-muted-foreground">Cargando…</div>;
  }

  return (
    <div className="h-full overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3 lg:hidden [background:var(--surface-2,var(--background))]">
        <button
          type="button"
          onClick={() => setTab("edit")}
          className={[
            "inline-flex h-9 flex-1 items-center justify-center rounded-lg border px-3 text-sm font-semibold",
            tab === "edit"
              ? "border-border [background:var(--accent-soft,var(--muted))] [color:var(--accent-soft-foreground,var(--foreground))]"
              : "border-border [background:var(--surface-2,var(--background))] hover:[background:var(--surface-3,var(--muted))]",
          ].join(" ")}
        >
          Editar
        </button>
        <button
          type="button"
          onClick={() => setTab("preview")}
          className={[
            "inline-flex h-9 flex-1 items-center justify-center rounded-lg border px-3 text-sm font-semibold",
            tab === "preview"
              ? "border-border [background:var(--accent-soft,var(--muted))] [color:var(--accent-soft-foreground,var(--foreground))]"
              : "border-border [background:var(--surface-2,var(--background))] hover:[background:var(--surface-3,var(--muted))]",
          ].join(" ")}
          disabled={!canPreview}
        >
          Preview
        </button>
      </div>

      <div className="h-[calc(100vh-56px)]">
        <div className="grid h-full grid-cols-1 lg:grid-cols-[420px_1fr]">
          <aside
            className={[
              "h-full overflow-hidden border-r border-border [background:var(--surface-2,var(--background))]",
              "lg:block",
              tab === "edit" ? "block" : "hidden lg:block",
            ].join(" ")}
          >
            <div className="h-full overflow-y-auto bcc-scrollbar space-y-4 p-4 pb-24">
              <section className="rounded-xl border border-border p-4 text-card-foreground [background:var(--surface-2,var(--card))]">
                <div className="space-y-3">
                  <div>
                    <label htmlFor="business-slug" className="text-sm font-semibold">
                      {isAdmin ? "Business slug (admin)" : "Business slug"}
                    </label>
                    <input
                      id="business-slug"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="caballeros-barberia"
                      disabled={lockedSlug}
                      className="mt-2 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/70 focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-70 [background:var(--surface-3,var(--muted))]"
                    />
                    <p className="mt-2 text-xs text-muted-foreground">
                      Negocio:{" "}
                      <span className="font-semibold text-foreground">
                        {business?.name || account?.business?.name || "—"}
                      </span>{" "}
                      · web:{" "}
                      <span className="font-semibold text-foreground">
                        PUBLISHED/{activeVariantKey}
                      </span>
                    </p>
                    {!isAdmin ? (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Tu panel está bloqueado al negocio asignado en sesión.
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label htmlFor="active-preset" className="text-sm font-semibold">
                      Preset activo (web)
                    </label>
                    <select
                      id="active-preset"
                      value={activeVariantKey}
                      onChange={(e) => changeActivePreset(e.target.value)}
                      className="mt-2 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                      disabled={!business?.slug || saving || presetOptions.length === 0}
                    >
                      {presetOptions.map((preset) => (
                        <option key={preset.key} value={preset.key}>
                          {preset.label}
                        </option>
                      ))}
                    </select>

                    <p className="mt-2 text-xs text-muted-foreground">
                      La web renderiza <b>PUBLISHED</b> del preset activo.
                    </p>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    {saving ? "Guardando…" : msg ? msg : ""}
                  </div>
                </div>
              </section>

              <section className="rounded-xl border border-border p-4 [background:var(--surface-2,var(--card))]">
                <label htmlFor="hero-logo-select" className="text-sm font-semibold text-foreground">
                  Logo (disponibles)
                </label>
                <select
                  id="hero-logo-select"
                  value={form.logoUrl ?? ""}
                  onChange={(e) => update("logoUrl", e.target.value)}
                  className="mt-2 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  disabled={!business?.slug || saving}
                >
                  <option value="">(sin logo)</option>
                  {ALLOWED_LOGOS.map((l) => (
                    <option key={l.url} value={l.url}>
                      {l.label}
                    </option>
                  ))}
                </select>

                <details className="mt-3 rounded-lg border border-border p-3 [background:var(--surface-3,var(--background))]">
                  <summary className="cursor-pointer text-xs font-semibold text-muted-foreground">
                    Avanzado (URL manual)
                  </summary>
                  <div className="mt-3">
                    <label htmlFor="hero-logo-manual" className="text-xs font-medium text-muted-foreground">
                      Logo URL
                    </label>
                    <input
                      id="hero-logo-manual"
                      value={form.logoUrl ?? ""}
                      onChange={(e) => update("logoUrl", e.target.value)}
                      className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/70 focus:ring-2 focus:ring-ring [background:var(--surface-3,var(--muted))]"
                      placeholder="/brand/caballeros-logo.png"
                      disabled={!business?.slug}
                    />
                  </div>
                </details>
              </section>

              <section className="rounded-xl border border-border p-4 [background:var(--surface-2,var(--card))]">
                <label htmlFor="hero-bg-select" className="text-sm font-semibold text-foreground">
                  Fondo Hero (disponibles)
                </label>
                <select
                  id="hero-bg-select"
                  value={form.backgroundImageUrl ?? ""}
                  onChange={(e) => update("backgroundImageUrl", e.target.value)}
                  className="mt-2 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  disabled={!business?.slug || saving}
                >
                  <option value="">(sin fondo / degradado)</option>
                  {ALLOWED_HERO_BACKGROUNDS.map((b) => (
                    <option key={b.url} value={b.url}>
                      {b.label}
                    </option>
                  ))}
                </select>

                <details className="mt-3 rounded-lg border border-border p-3 [background:var(--surface-3,var(--background))]">
                  <summary className="cursor-pointer text-xs font-semibold text-muted-foreground">
                    Avanzado (URL manual)
                  </summary>
                  <div className="mt-3">
                    <label htmlFor="hero-bg-manual" className="text-xs font-medium text-muted-foreground">
                      backgroundImageUrl
                    </label>
                    <input
                      id="hero-bg-manual"
                      value={form.backgroundImageUrl ?? ""}
                      onChange={(e) => update("backgroundImageUrl", e.target.value)}
                      className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/70 focus:ring-2 focus:ring-ring [background:var(--surface-3,var(--muted))]"
                      placeholder="/hero/mi-fondo.jpg"
                      disabled={!business?.slug}
                    />
                  </div>
                </details>
              </section>

              <section className="rounded-xl border border-border p-4 [background:var(--surface-2,var(--card))]">
                <div className="text-sm font-semibold text-foreground">Textos</div>

                <div className="mt-3 space-y-3">
                  <div>
                    <label htmlFor="hero-badge" className="text-xs font-medium text-muted-foreground">
                      Badge
                    </label>
                    <input
                      id="hero-badge"
                      value={form.badge}
                      onChange={(e) => update("badge", e.target.value)}
                      className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring [background:var(--surface-3,var(--muted))]"
                      disabled={!business?.slug}
                    />
                  </div>

                  <div>
                    <label htmlFor="hero-title" className="text-xs font-medium text-muted-foreground">
                      Título
                    </label>
                    <input
                      id="hero-title"
                      value={form.title}
                      onChange={(e) => update("title", e.target.value)}
                      className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring [background:var(--surface-3,var(--muted))]"
                      disabled={!business?.slug}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="hero-description"
                      className="text-xs font-medium text-muted-foreground"
                    >
                      Descripción
                    </label>
                    <textarea
                      id="hero-description"
                      value={form.description}
                      onChange={(e) => update("description", e.target.value)}
                      className="bcc-scrollbar mt-1 min-h-24 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring [background:var(--surface-3,var(--muted))]"
                      disabled={!business?.slug}
                    />
                  </div>
                </div>
              </section>

              <section className="rounded-xl border border-border p-4 [background:var(--surface-2,var(--card))]">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={reset}
                    className="inline-flex h-10 flex-1 items-center justify-center rounded-lg border border-border px-4 text-sm font-semibold [background:var(--cta-secondary,var(--background))] [color:var(--cta-secondary-foreground,var(--foreground))] hover:[background:var(--cta-secondary-hover,var(--muted))]"
                    disabled={!business?.slug || saving}
                  >
                    Reset
                  </button>

                  <button
                    type="button"
                    onClick={publish}
                    className="inline-flex h-10 flex-1 items-center justify-center rounded-lg px-4 text-sm font-semibold [background:var(--cta-primary,var(--primary))] [color:var(--cta-primary-foreground,var(--primary-foreground))] hover:[background:var(--cta-primary-hover,var(--primary))]"
                    disabled={!business?.slug || saving}
                  >
                    Publish
                  </button>
                </div>

                <p className="mt-2 text-xs text-muted-foreground">
                  {saving ? "Guardando…" : msg ? msg : "Listo."}
                </p>
              </section>
            </div>
          </aside>

          <section
            className={[
              "h-full overflow-hidden [background:var(--surface-2,var(--background))]",
              "lg:block",
              tab === "preview" ? "block" : "hidden lg:block",
            ].join(" ")}
          >
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold">Preview real (web pública)</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Lo que ve el cliente: <b>PUBLISHED</b> del preset activo.
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setViewport("desktop")}
                    className={[
                      "inline-flex h-9 items-center justify-center rounded-lg border px-3 text-xs font-semibold",
                      viewport === "desktop"
                        ? "border-border [background:var(--accent-soft,var(--muted))] [color:var(--accent-soft-foreground,var(--foreground))]"
                        : "border-border [background:var(--surface-2,var(--background))] hover:[background:var(--surface-3,var(--muted))]",
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
                        ? "border-border [background:var(--accent-soft,var(--muted))] [color:var(--accent-soft-foreground,var(--foreground))]"
                        : "border-border [background:var(--surface-2,var(--background))] hover:[background:var(--surface-3,var(--muted))]",
                    ].join(" ")}
                    disabled={!canPreview}
                  >
                    Mobile
                  </button>

                  <a
                    href={business?.slug ? `/${encodeURIComponent(business.slug)}` : "/"}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-9 items-center justify-center rounded-lg border border-border px-3 text-xs font-semibold [background:var(--cta-secondary,var(--background))] [color:var(--cta-secondary-foreground,var(--foreground))] hover:[background:var(--cta-secondary-hover,var(--muted))]"
                  >
                    Abrir ↗
                  </a>
                </div>
              </div>

              <div className="flex-1 overflow-hidden p-4">
                <div className={iframeWrapperClass + " h-full min-h-[70vh]"}>
                  <div className="h-full overflow-hidden rounded-xl border border-border [background:var(--surface-3,var(--background))]">
                    {canPreview ? (
                      <iframe
                        title="Preview web pública"
                        src={publishedUrl}
                        className="h-full w-full"
                      />
                    ) : (
                      <div className="p-6 text-sm text-muted-foreground">
                        Introduce un slug válido para ver el preview.
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3 text-xs text-muted-foreground">
                  Tip: si acabas de publicar, el iframe ya “cache-bustea” con <b>?t=nonce</b>.
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
 
