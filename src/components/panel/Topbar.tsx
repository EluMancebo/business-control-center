"use client";

import LogoutButton from "../LogoutButton";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { buildBreadcrumbs, getRouteMeta } from "./routeMeta";

function getPublicHrefFromSlug(slug: string | null | undefined) {
  const clean = String(slug || "").trim();
  return clean ? `/${encodeURIComponent(clean)}` : "/";
}

export default function Topbar({ onOpenMenu }: { onOpenMenu?: () => void }) {
  const pathname = usePathname();

  const meta = getRouteMeta(pathname);
  const crumbs = buildBreadcrumbs(pathname);

  const [activeSlug, setActiveSlug] = useState<string>("");

  useEffect(() => {
    const fromEnv = (process.env.NEXT_PUBLIC_DEMO_BUSINESS_SLUG as string | undefined) || "";

    const read = () => {
      try {
        const fromLS = window.localStorage.getItem("bcc:activeBusinessSlug") || "";
        setActiveSlug(fromLS || fromEnv);
      } catch {
        setActiveSlug(fromEnv);
      }
    };

    read();

    const onStorage = () => read();
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const publicHref = getPublicHrefFromSlug(activeSlug);

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        {/* IZQUIERDA */}
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => onOpenMenu?.()}
            className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-3 py-2 text-sm sm:hidden"
            aria-label="Abrir menú"
            title="Abrir menú"
          >
            ☰
          </button>

          <div className="min-w-0">
            {/* Breadcrumbs */}
            {crumbs.length > 0 ? (
              <nav className="mb-0.5 flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
                {crumbs.map((c, idx) => (
                  <div key={c.href} className="flex min-w-0 items-center gap-2">
                    {idx === crumbs.length - 1 ? (
                      <span className="truncate text-muted-foreground">{c.label}</span>
                    ) : (
                      <Link href={c.href} className="truncate hover:text-foreground">
                        {c.label}
                      </Link>
                    )}
                    {idx < crumbs.length - 1 ? (
                      <span className="text-muted-foreground/40">/</span>
                    ) : null}
                  </div>
                ))}
              </nav>
            ) : null}

            {/* Título */}
            <div className="truncate text-sm font-semibold text-foreground">{meta.title}</div>

            {/* Subtítulo */}
            {meta.subtitle ? (
              <div className="truncate text-xs text-muted-foreground">{meta.subtitle}</div>
            ) : null}
          </div>
        </div>

        {/* DERECHA */}
        <div className="flex items-center gap-2">
          <a
            href={publicHref}
            target="_blank"
            rel="noreferrer"
            className="hidden rounded-lg border border-border bg-background px-3 py-2 text-sm hover:bg-muted sm:inline-flex"
            title={activeSlug ? `Abrir /${activeSlug}` : "Abrir web pública (falta slug)"}
          >
            Ver web
          </a>

          <a
            href={publicHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-3 py-2 text-sm hover:bg-muted sm:hidden"
            aria-label="Ver web"
            title={activeSlug ? `Abrir /${activeSlug}` : "Ver web"}
          >
            ↗
          </a>

          <LogoutButton />
        </div>
      </div>
    </header>
  );
}  