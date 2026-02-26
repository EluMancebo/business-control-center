import { headers } from "next/headers";
import  PublicHero  from "@/components/web/hero/PublicHero";

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

type BusinessPublic = {
  name?: string;
  slug: string;
  activeHeroVariantKey: string;
  // (futuro: address, phone, whatsapp, email…)
};

async function getOrigin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  return host ? `${proto}://${host}` : "";
}

async function getBusinessPublic(slug: string): Promise<BusinessPublic | null> {
  const origin = await getOrigin();
  const res = await fetch(
    `${origin}/api/web/public/business?slug=${encodeURIComponent(slug)}`,
    { cache: "no-store" }
  );
  if (!res.ok) return null;
  const json = await res.json();
  return (json?.business ?? null) as BusinessPublic | null;
}

async function getPublishedHero(slug: string, variantKey: string): Promise<HeroData | null> {
  const origin = await getOrigin();
  const res = await fetch(
    `${origin}/api/web/hero?status=published&slug=${encodeURIComponent(
      slug
    )}&variantKey=${encodeURIComponent(variantKey)}`,
    { cache: "no-store" }
  );
  if (!res.ok) return null;
  const json = await res.json();
  return (json?.data ?? null) as HeroData | null;
}

export default async function PublicBusinessPage({
  params,
}: {
  params: Promise<{ slug: string }> | { slug: string };
}) {
  const resolved = await Promise.resolve(params);
  const decodedSlug = decodeURIComponent(resolved.slug);

  const business = await getBusinessPublic(decodedSlug);
  const activeVariantKey = business?.activeHeroVariantKey || "default";
  const hero = await getPublishedHero(decodedSlug, activeVariantKey);

  return (
    <main className="h-svh w-full overflow-hidden bg-background text-foreground">
      {hero ? (
        <PublicHero data={hero} business={business ?? undefined} />
      ) : (
        <div className="flex h-full items-center justify-center px-6">
          <div className="w-full max-w-xl rounded-2xl border border-border bg-card p-6 text-card-foreground">
            <p className="text-sm text-muted-foreground">
              Web pública (dinámica)
              {business?.name ? ` · ${business.name}` : ""}
            </p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight">{decodedSlug}</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              No hay Hero publicado para el preset activo:&nbsp;
              <span className="font-semibold text-foreground">{activeVariantKey}</span>
            </p>
          </div>
        </div>
      )}
    </main>
  );
}  
