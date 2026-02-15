 "use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { NAV, type NavItem } from "./nav";

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
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
    <aside className="flex h-full w-64 flex-col border-r border-zinc-200 bg-white p-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-50 ring-1 ring-zinc-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/logo-mark.svg"
              alt="Business Control Center"
              className="h-10 w-10"
              draggable={false}
            />
          </div>

          <div className="min-w-0">
            <div className="truncate text-sm font-semibold tracking-tight text-zinc-900">
              Business Control Center
            </div>
            <div className="text-xs text-zinc-500">Panel cliente</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
        {NAV.map((item: NavItem) => {
          if (item.type === "link") {
            const active = isActivePath(pathname, item.href);
            const disabled = item.disabled === true;

            if (disabled) {
              return (
                <div
                  key={item.href}
                  className="rounded-lg px-3 py-2 text-sm text-zinc-400"
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
                    ? "bg-zinc-100 text-zinc-900 font-medium"
                    : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900",
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
                    ? "text-zinc-400 cursor-not-allowed"
                    : groupHasActive
                      ? "text-zinc-900 font-medium"
                      : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900",
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
                  <div className="ml-3 mt-1 border-l border-zinc-200 pl-3">
                    {item.items.map((child) => {
                      const active = isActivePath(pathname, child.href);
                      const disabled = child.disabled === true;

                      if (disabled) {
                        return (
                          <div
                            key={child.href}
                            className="mt-1 rounded-lg px-3 py-2 text-sm text-zinc-400"
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
                              ? "bg-zinc-100 text-zinc-900 font-medium"
                              : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900",
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
        <div className="border-t border-zinc-200 pt-4">
          <div className="px-1 text-xs font-medium text-zinc-500">Accesos</div>

          <div className="mt-2 grid gap-2">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center rounded-lg bg-zinc-900 px-3 py-2 text-xs font-medium text-white hover:bg-zinc-800"
            >
              Ver web pública ↗
            </a>

            <Link
              href="/panel/web"
              onClick={onNavigate}
              className="inline-flex w-full items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-900 hover:bg-zinc-50"
            >
              Editar web pública
            </Link>
          </div>

          <p className="mt-3 px-1 text-xs text-zinc-500">
            Acceso directo para editar y comprobar cambios en la web.
          </p>
        </div>
      </div>
    </aside>
  );
}
 
