  "use client";

import LogoutButton from "../LogoutButton";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { buildBreadcrumbs, getRouteMeta } from "./routeMeta";

export default function Topbar({ onOpenMenu }: { onOpenMenu?: () => void }) {
  const pathname = usePathname();

  const meta = getRouteMeta(pathname);
  const crumbs = buildBreadcrumbs(pathname);

  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        {/* IZQUIERDA */}
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => onOpenMenu?.()}
            className="inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm sm:hidden"
            aria-label="Abrir menú"
            title="Abrir menú"
          >
            ☰
          </button>

          <div className="min-w-0">
            {/* Breadcrumbs */}
            {crumbs.length > 0 ? (
              <nav className="mb-0.5 flex min-w-0 items-center gap-2 text-xs text-zinc-500">
                {crumbs.map((c, idx) => (
                  <div key={c.href} className="flex min-w-0 items-center gap-2">
                    {idx === crumbs.length - 1 ? (
                      <span className="truncate text-zinc-600">{c.label}</span>
                    ) : (
                      <Link
                        href={c.href}
                        className="truncate hover:text-zinc-900"
                      >
                        {c.label}
                      </Link>
                    )}
                    {idx < crumbs.length - 1 ? (
                      <span className="text-zinc-300">/</span>
                    ) : null}
                  </div>
                ))}
              </nav>
            ) : null}

            {/* Título */}
            <div className="truncate text-sm font-semibold text-zinc-900">
              {meta.title}
            </div>

            {/* Subtítulo */}
            {meta.subtitle ? (
              <div className="truncate text-xs text-zinc-500">
                {meta.subtitle}
              </div>
            ) : null}
          </div>
        </div>

        {/* DERECHA */}
        <div className="flex items-center gap-2">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="hidden rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm hover:bg-zinc-50 sm:inline-flex"
          >
            Ver web
          </a>

          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm hover:bg-zinc-50 sm:hidden"
            aria-label="Ver web"
            title="Ver web"
          >
            ↗
          </a>

          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
