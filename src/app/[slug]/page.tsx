// src/app/[slug]/page.tsx

import { headers } from "next/headers";
import { PublicHero } from "@/components/web/hero/PublicHero";

type HeroData = {
  badge: string;
  title: string;
  description: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  backgroundImageUrl?: string;
  logoUrl?: string;
  logoSvg?: string;
};

async function getOrigin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  return host ? `${proto}://${host}` : "";
}

async function getBusinessPublic(slug: string) {
  const origin = await getOrigin();
  const res = await fetch(
    `${origin}/api/web/public/business?slug=${encodeURIComponent(slug)}`,
    { cache: "no-store" }
  );
  if (!res.ok) return null;
  const json = await res.json();
  return json?.business ?? null;
}

async function getPublishedHero(slug: string, variantKey: string): Promise<HeroData | null> {
  const origin = await getOrigin();
  const res = await fetch(
    `${origin}/api/web/hero?status=published&slug=${encodeURIComponent(slug)}&variantKey=${encodeURIComponent(variantKey)}`,
    { cache: "no-store" }
  );
  if (!res.ok) return null;
  const json = await res.json();
  return (json?.data ?? null) as HeroData | null;
}

export default async function PublicBusinessPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const business = await getBusinessPublic(decodedSlug);
  const activeVariantKey = business?.activeHeroVariantKey || "default";

  const hero = await getPublishedHero(decodedSlug, activeVariantKey);

  return (
    <main className="min-h-screen bg-background text-foreground">
      {hero ? (
        <PublicHero data={hero} />
      ) : (
        <header className="border-b border-border bg-background/80 backdrop-blur">
          <div className="mx-auto max-w-6xl px-4 py-10">
            <p className="text-sm text-muted-foreground">
              Web pública (dinámica)
              {business?.name ? ` · ${business.name}` : ""}
            </p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight">
              {decodedSlug}
            </h1>
            <p className="mt-2 text-muted-foreground">
              No hay Hero publicado para el preset activo: <span className="font-semibold">{activeVariantKey}</span>
            </p>
          </div>
        </header>
      )}

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="rounded-2xl border border-border bg-background p-8 text-sm text-muted-foreground">
          Secciones futuras: Servicios, Precios, Reserva, Galería, Testimonios, Localización…
        </div>
      </section>
    </main>
  );
}


