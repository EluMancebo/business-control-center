// src/components/panel/Sidebar.tsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { NAV, type NavItem } from "./nav";

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

export default function Sidebar({
  onNavigate,
  isAdmin = false,
}: {
  onNavigate?: () => void;
  isAdmin?: boolean;
}) {
  const pathname = usePathname();

  const defaultOpenGroups = useMemo(() => {
    const open = new Set<string>();
    for (const item of NAV) {
      if (item.type === "group") {
        const hasActiveChild = item.items.some((x) => isActivePath(pathname, x.href));
        if (hasActiveChild) open.add(item.label);
      }
    }
    return open;
  }, [pathname]);

  const [openGroups, setOpenGroups] = useState<Set<string>>(defaultOpenGroups);

  return (
    <aside className="flex h-full w-64 flex-col border-r border-border bg-background p-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-muted ring-1 ring-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/logo-mark.svg"
              alt="Business Control Center"
              className="h-10 w-10"
              draggable={false}
            />
          </div>

          <div className="min-w-0">
            <div className="truncate text-sm font-semibold tracking-tight text-foreground">
              Business Control Center
            </div>
            <div className="text-xs text-muted-foreground">
              {isAdmin ? "Taller (Admin)" : "Panel cliente"}
            </div>
          </div>
        </div>
      </div>

      {/* Admin / Taller arriba */}
      {isAdmin && (
        <div className="mb-3">
          <div className="px-1 text-xs font-medium text-muted-foreground">
            Admin / Taller
          </div>

          <div className="mt-2 grid gap-1">
            <Link
              href="/panel/taller"
              onClick={onNavigate}
              className={[
                "rounded-lg px-3 py-2 text-sm transition-colors",
                isActivePath(pathname, "/panel/taller")
                  ? "bg-muted text-foreground font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              ].join(" ")}
            >
              Vista general
            </Link>

            <Link
              href="/panel/taller/presets/hero"
              onClick={onNavigate}
              className={[
                "rounded-lg px-3 py-2 text-sm transition-colors",
                isActivePath(pathname, "/panel/taller/presets/hero")
                  ? "bg-muted text-foreground font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              ].join(" ")}
            >
              Presets · Hero
            </Link>

            <div
              className="rounded-lg px-3 py-2 text-sm text-muted-foreground/70"
              title="Próximamente"
            >
              Políticas cliente <span className="ml-2 text-xs">(pronto)</span>
            </div>

            <div
              className="rounded-lg px-3 py-2 text-sm text-muted-foreground/70"
              title="Próximamente"
            >
              Media Center <span className="ml-2 text-xs">(pronto)</span>
            </div>
          </div>

          <div className="mt-3 border-b border-border" />
        </div>
      )}

      {/* Nav original */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
        {NAV.map((item: NavItem) => {
          if (item.type === "link") {
            const active = isActivePath(pathname, item.href);
            const disabled = item.disabled === true;

            if (disabled) {
              return (
                <div
                  key={item.href}
                  className="rounded-lg px-3 py-2 text-sm text-muted-foreground/70"
                  title="Próximamente"
                >
                  {item.label}
                  <span className="ml-2 text-xs">(pronto)</span>
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={[
                  "rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-muted text-foreground font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          }

          // group
          const isOpen = openGroups.has(item.label) === true;
          const groupHasActive = item.items.some((x) => isActivePath(pathname, x.href));
          const groupDisabled = item.disabled === true;

          return (
            <div key={item.label} className="mt-2">
              <button
                type="button"
                onClick={() => {
                  if (groupDisabled) return;
                  setOpenGroups((prev) => {
                    const next = new Set(prev);
                    if (next.has(item.label)) next.delete(item.label);
                    else next.add(item.label);
                    return next;
                  });
                }}
                className={[
                  "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                  groupDisabled
                    ? "text-muted-foreground/70 cursor-not-allowed"
                    : groupHasActive
                      ? "text-foreground font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                ].join(" ")}
                data-open={isOpen ? "true" : "false"}
              >
                <span>{item.label}</span>
                <span className={["transition-transform", isOpen ? "rotate-90" : ""].join(" ")}>
                  ›
                </span>
              </button>

              <div
                className={[
                  "grid overflow-hidden transition-[grid-template-rows] duration-200 ease-out",
                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                ].join(" ")}
              >
                <div className="min-h-0">
                  <div className="ml-3 mt-1 border-l border-border pl-3">
                    {item.items.map((child) => {
                      const active = isActivePath(pathname, child.href);
                      const disabled = child.disabled === true;

                      if (disabled) {
                        return (
                          <div
                            key={child.href}
                            className="mt-1 rounded-lg px-3 py-2 text-sm text-muted-foreground/70"
                            title="Próximamente"
                          >
                            {child.label}
                            <span className="ml-2 text-xs">(pronto)</span>
                          </div>
                        );
                      }

                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={onNavigate}
                          className={[
                            "mt-1 block rounded-lg px-3 py-2 text-sm transition-colors",
                            active
                              ? "bg-muted text-foreground font-medium"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground",
                          ].join(" ")}
                        >
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer / Accesos */}
      <div className="mt-auto pt-4">
        <div className="border-t border-border pt-4">
          <div className="px-1 text-xs font-medium text-muted-foreground">Accesos</div>

          <div className="mt-2 grid gap-2">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:opacity-90"
            >
              Ver web pública ↗
            </a>

            <Link
              href="/panel/web"
              onClick={onNavigate}
              className="inline-flex w-full items-center justify-center rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-foreground hover:bg-muted"
            >
              Editar web pública
            </Link>
          </div>

          <p className="mt-3 px-1 text-xs text-muted-foreground">
            Acceso directo para editar y comprobar cambios en la web.
          </p>
        </div>
      </div>
    </aside>
  );
}
 
 