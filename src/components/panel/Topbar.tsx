//src/components/panel/Topbar.tsx

"use client";

import LogoutButton from "../LogoutButton";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { buildBreadcrumbs, getRouteMeta } from "./routeMeta";
import PanelButton from "@/components/panel/ui/PanelButton";

function getPublicHrefFromSlug(slug: string | null | undefined) {
  const clean = String(slug || "").trim();
  return clean ? `/${encodeURIComponent(clean)}` : "/";
}

function ExternalLinkIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
      <path
        d="M14 5h5v5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 14L19 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M19 14v4a1 1 0 01-1 1h-12a1 1 0 01-1-1v-12a1 1 0 011-1h4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
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
    <header className="sticky top-0 z-10 border-b border-border bg-card/92 shadow-[0_10px_28px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <PanelButton
            type="button"
            onClick={() => onOpenMenu?.()}
            variant="secondary"
            className="shadow-sm sm:hidden"
            aria-label="Abrir menú"
            title="Abrir menú"
          >
            ☰
          </PanelButton>

          <div className="min-w-0">
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

            <div className="truncate text-sm font-semibold text-foreground">{meta.title}</div>

            {meta.subtitle ? (
              <div className="truncate text-xs text-muted-foreground">{meta.subtitle}</div>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <PanelButton
            href={publicHref}
            variant="secondary"
            target="_blank"
            rel="noreferrer"
            className="hidden shadow-sm sm:inline-flex"
            title={activeSlug ? `Abrir /${activeSlug}` : "Abrir web pública (falta slug)"}
          >
            Ver web
          </PanelButton>

          <PanelButton
            href={publicHref}
            variant="secondary"
            target="_blank"
            rel="noreferrer"
            className="px-2.5 shadow-sm sm:hidden"
            aria-label="Ver web"
            title={activeSlug ? `Abrir /${activeSlug}` : "Ver web"}
          >
            <ExternalLinkIcon />
          </PanelButton>

          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
