//src/app/[slug]/page.tsx
import { headers } from "next/headers";
import PublicHero from "@/components/web/hero/PublicHero";
import BrandHydrator from "@/components/brand/BrandHydrator";

export const dynamic = "force-dynamic";

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
};

// ---------- Utils (sin any, sin casts) ----------
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function safeDecodeSlug(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function trimTrailingSlash(url: string): string {
  return url.replace(/\/$/, "");
}

// ---------- Origin / Base URL ----------
async function getBaseUrl(): Promise<string> {
  const explicit =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.APP_URL ||
    process.env.SITE_URL;

  if (explicit && explicit.trim()) return trimTrailingSlash(explicit);

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  if (host && host.trim()) return `${proto}://${host}`;

  const vercelUrl = process.env.VERCEL_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercelUrl && vercelUrl.trim()) return `https://${trimTrailingSlash(vercelUrl)}`;

  return "http://localhost:3000";
}

// ---------- Parsers ----------
function parseBusinessPublicResponse(json: unknown): BusinessPublic | null {
  if (!isRecord(json)) return null;

  const business = json["business"];
  if (!isRecord(business)) return null;

  const slug = business["slug"];
  const activeHeroVariantKey = business["activeHeroVariantKey"];
  const name = business["name"];

  if (!isString(slug)) return null;
  if (!isString(activeHeroVariantKey)) return null;

  const parsed: BusinessPublic = {
    slug,
    activeHeroVariantKey,
  };

  if (isString(name)) parsed.name = name;

  return parsed;
}

function parseHeroResponse(json: unknown): HeroData | null {
  if (!isRecord(json)) return null;

  const data = json["data"];
  if (!isRecord(data)) return null;

  const badge = data["badge"];
  const title = data["title"];
  const description = data["description"];
  const primaryCtaLabel = data["primaryCtaLabel"];
  const primaryCtaHref = data["primaryCtaHref"];
  const secondaryCtaLabel = data["secondaryCtaLabel"];
  const secondaryCtaHref = data["secondaryCtaHref"];

  if (!isString(badge)) return null;
  if (!isString(title)) return null;
  if (!isString(description)) return null;
  if (!isString(primaryCtaLabel)) return null;
  if (!isString(primaryCtaHref)) return null;
  if (!isString(secondaryCtaLabel)) return null;
  if (!isString(secondaryCtaHref)) return null;

  const hero: HeroData = {
    badge,
    title,
    description,
    primaryCtaLabel,
    primaryCtaHref,
    secondaryCtaLabel,
    secondaryCtaHref,
  };

  const backgroundImageUrl = data["backgroundImageUrl"];
  const logoUrl = data["logoUrl"];
  const logoSvg = data["logoSvg"];

  if (isString(backgroundImageUrl)) hero.backgroundImageUrl = backgroundImageUrl;
  if (isString(logoUrl)) hero.logoUrl = logoUrl;
  if (isString(logoSvg)) hero.logoSvg = logoSvg;

  return hero;
}

// ---------- Data fetch ----------
async function getBusinessPublic(slug: string): Promise<BusinessPublic | null> {
  const baseUrl = await getBaseUrl();
  const url = new URL("/api/web/public/business", baseUrl);
  url.searchParams.set("slug", slug);

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) return null;

  const json: unknown = await res.json();
  return parseBusinessPublicResponse(json);
}

async function getPublishedHero(slug: string, variantKey: string): Promise<HeroData | null> {
  const baseUrl = await getBaseUrl();
  const url = new URL("/api/web/hero", baseUrl);
  url.searchParams.set("status", "published");
  url.searchParams.set("slug", slug);
  url.searchParams.set("variantKey", variantKey);

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) return null;

  const json: unknown = await res.json();
  return parseHeroResponse(json);
}

// ---------- Page ----------
export default async function PublicBusinessPage({
  params,
}: {
  params: Promise<{ slug: string }> | { slug: string };
}) {
  const resolved = await Promise.resolve(params);
  const decodedSlug = safeDecodeSlug(resolved.slug);

  const business = await getBusinessPublic(decodedSlug);
  const activeVariantKey = business?.activeHeroVariantKey ?? "default";
  const hero = await getPublishedHero(decodedSlug, activeVariantKey);

  return (
    <>
      {/* ✅ La web pública aplica SU brand (scope web) */}
      <BrandHydrator scope="web" businessSlug={decodedSlug} />

      <main id="public-business-page" className="min-h-svh w-full overflow-x-hidden overflow-y-auto bcc-scrollbar bg-background text-foreground">
        {hero ? (
          <section id="public-business-hero">
            <PublicHero data={hero} business={business ?? undefined} />
          </section>
        ) : (
          <section id="public-business-fallback" className="flex h-full items-center justify-center px-6">
            <div
              id="public-business-fallback-card"
              className="w-full max-w-xl rounded-2xl border border-border bg-card p-6 text-card-foreground"
            >
              <p id="public-business-fallback-meta" className="text-sm text-muted-foreground">
                Web pública (dinámica)
                {business?.name ? ` · ${business.name}` : ""}
              </p>

              <h1 id="public-business-fallback-title" className="mt-1 text-2xl font-extrabold tracking-tight">
                {decodedSlug}
              </h1>

              <p id="public-business-fallback-text" className="mt-3 text-sm text-muted-foreground">
                No hay Hero publicado para el preset activo:&nbsp;
                <span id="public-business-fallback-variant" className="font-semibold text-foreground">
                  {activeVariantKey}
                </span>
              </p>
            </div>
          </section>
        )}
      </main>
    </>
  );
}  
