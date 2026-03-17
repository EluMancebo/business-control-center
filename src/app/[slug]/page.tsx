// src/app/[slug]/page.tsx
import { headers } from "next/headers";
import PublicHero from "@/components/web/hero/PublicHero";
import BrandHydrator from "@/components/brand/BrandHydrator";
import { resolvePublicSitePage, type PublicSiteRepository } from "@/lib/public-site";
import { buildBusinessSite } from "@/lib/site/helpers";
import type { RenderableHeroSection, RenderableLocationSection, RenderableSection } from "@/lib/site-renderer";

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

type PublishedPagePublic = {
  businessSlug: string;
  pageKey: string;
  latestVersion: number;
  version: number;
  hero: {
    variantKey: string;
    data: HeroData;
  };
};

// ---------- Utils ----------
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
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

function parsePublishedPageResponse(json: unknown): PublishedPagePublic | null {
  if (!isRecord(json)) return null;

  const page = json["page"];
  if (!isRecord(page)) return null;

  const businessSlug = page["businessSlug"];
  const pageKey = page["pageKey"];
  const latestVersion = page["latestVersion"];
  const version = page["version"];
  const hero = page["hero"];

  if (!isString(businessSlug)) return null;
  if (!isString(pageKey)) return null;
  if (!isNumber(latestVersion)) return null;
  if (!isNumber(version)) return null;
  if (!isRecord(hero)) return null;

  const variantKey = hero["variantKey"];
  const data = hero["data"];

  if (!isString(variantKey)) return null;
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

  const heroData: HeroData = {
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

  if (isString(backgroundImageUrl)) heroData.backgroundImageUrl = backgroundImageUrl;
  if (isString(logoUrl)) heroData.logoUrl = logoUrl;
  if (isString(logoSvg)) heroData.logoSvg = logoSvg;

  return {
    businessSlug,
    pageKey,
    latestVersion,
    version,
    hero: {
      variantKey,
      data: heroData,
    },
  };
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

async function getPublishedPage(slug: string): Promise<PublishedPagePublic | null> {
  const baseUrl = await getBaseUrl();
  const url = new URL("/api/web/public/page", baseUrl);
  url.searchParams.set("slug", slug);
  url.searchParams.set("pageKey", "home");

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) return null;

  const json: unknown = await res.json();
  return parsePublishedPageResponse(json);
}

function normalizeLookupSlug(value: string): string {
  return String(value || "").trim().toLowerCase();
}

function isRenderableHeroSection(section: RenderableSection): section is RenderableHeroSection {
  return section.type === "hero";
}

function isRenderableLocationSection(section: RenderableSection): section is RenderableLocationSection {
  return section.type === "location";
}

function createPublicSiteRepository(args: {
  lookupSlug: string;
  business: BusinessPublic | null;
  publishedPage: PublishedPagePublic | null;
}): PublicSiteRepository {
  const normalizedLookupSlug = normalizeLookupSlug(args.lookupSlug);

  return {
    async findByDomain() {
      return null;
    },
    async findBySlug(slug) {
      const normalizedRequestedSlug = normalizeLookupSlug(safeDecodeSlug(slug));
      if (normalizedRequestedSlug !== normalizedLookupSlug) return null;
      if (!args.business) return null;

      return buildBusinessSite({
        businessId: args.business.slug,
        slug: args.business.slug,
        brandConfig: args.business.name ? { brandName: args.business.name } : undefined,
        homeHero: args.publishedPage
          ? {
              variantKey: args.publishedPage.hero.variantKey,
              data: args.publishedPage.hero.data,
            }
          : undefined,
      });
    },
  };
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
  const publishedPage = await getPublishedPage(decodedSlug);
  const publicSiteLookup = {
    slug: decodedSlug,
    pageKey: "home",
  } as const;

  let resolvedPublicSitePage: Awaited<ReturnType<typeof resolvePublicSitePage>> | null = null;

  try {
    resolvedPublicSitePage = await resolvePublicSitePage(
      publicSiteLookup,
      createPublicSiteRepository({
        lookupSlug: decodedSlug,
        business,
        publishedPage,
      })
    );
  } catch {
    resolvedPublicSitePage = null;
  }

  if (resolvedPublicSitePage?.ok) {
    void resolvedPublicSitePage.site;
    void resolvedPublicSitePage.page;
    void resolvedPublicSitePage.render;
  } else if (resolvedPublicSitePage?.reason === "site_not_found") {
    // Safe fallback path: keep current page behavior unchanged.
  } else if (resolvedPublicSitePage?.reason === "page_not_found") {
    // Safe fallback path: keep current page behavior unchanged.
  }

  const resolvedHeroSection = resolvedPublicSitePage?.ok
    ? resolvedPublicSitePage.render.sections.find(isRenderableHeroSection)
    : undefined;
  const resolvedLocationSection = resolvedPublicSitePage?.ok
    ? resolvedPublicSitePage.render.sections.find(isRenderableLocationSection)
    : undefined;
  const hero = resolvedHeroSection?.payload ?? publishedPage?.hero?.data ?? null;
  const location = resolvedLocationSection?.payload;
  const activeVariantKey = business?.activeHeroVariantKey ?? "default";

  return (
    <>
      <BrandHydrator scope="web" businessSlug={decodedSlug} />

      <main
        id="public-business-page"
        className="min-h-svh w-full overflow-x-hidden overflow-y-auto bcc-scrollbar bg-background text-foreground"
      >
        {hero ? (
          <>
            <section id="public-business-hero">
              <PublicHero data={hero} business={business ?? undefined} />
            </section>

            {location ? (
              <section id="public-business-location" className="border-t border-border bg-card/50">
                <div className="mx-auto w-full max-w-6xl px-6 py-8">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Ubicacion y contacto
                  </p>

                  <div className="mt-3 grid gap-3 text-sm text-foreground sm:grid-cols-2">
                    {location.address ? (
                      <p>
                        <span className="font-semibold">Direccion:</span> {location.address}
                      </p>
                    ) : null}

                    {location.phone ? (
                      <p>
                        <span className="font-semibold">Telefono:</span>{" "}
                        <a className="underline-offset-2 hover:underline" href={`tel:${location.phone}`}>
                          {location.phone}
                        </a>
                      </p>
                    ) : null}

                    {location.email ? (
                      <p>
                        <span className="font-semibold">Email:</span>{" "}
                        <a className="underline-offset-2 hover:underline" href={`mailto:${location.email}`}>
                          {location.email}
                        </a>
                      </p>
                    ) : null}

                    {location.mapsUrl ? (
                      <p>
                        <a
                          className="font-semibold underline-offset-2 hover:underline"
                          href={location.mapsUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Ver en mapa
                        </a>
                      </p>
                    ) : null}
                  </div>
                </div>
              </section>
            ) : null}
          </>
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
                No hay Home publicada para el preset activo:&nbsp;
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
