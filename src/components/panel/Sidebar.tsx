"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

type NavItem =
  | { type: "link"; label: string; href: string }
  | { type: "group"; label: string; items: { label: string; href: string }[] };

const NAV: NavItem[] = [
  { type: "link", label: "Dashboard", href: "/panel/dashboard" },
  { type: "link", label: "Web pública", href: "/panel/web" },
  {
    type: "group",
    label: "Marketing",
    items: [
      { label: "Web", href: "/panel/marketing/web" },
      { label: "Campañas", href: "/panel/marketing/campaigns" },
    ],
  },
];

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const defaultOpenGroups = useMemo(() => {
    const open = new Set<string>();
    for (const item of NAV) {
      if (item.type === "group") {
        const hasActiveChild = item.items.some((x) => isActive(x.href));
        if (hasActiveChild) open.add(item.label);
      }
    }
    return open;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const [openGroups, setOpenGroups] = useState<Set<string>>(defaultOpenGroups);

  return (
    <aside className="flex h-full w-64 flex-col border-r border-zinc-200 bg-white p-4">
      {/* Header */}
      <div className="mb-6">
        <div className="text-sm font-semibold tracking-tight text-zinc-900">
          Business Control Center
        </div>
        <div className="text-xs text-zinc-500">Panel cliente</div>
      </div>

      {/* Navegación */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
        {NAV.map((item) => {
          if (item.type === "link") {
            const active = isActive(item.href);
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

          const isOpen = openGroups.has(item.label) === true;
          const groupHasActive = item.items.some((x) => isActive(x.href));

          return (
            <div key={item.label} className="mt-2">
              <button
                type="button"
                onClick={() => {
                  setOpenGroups((prev) => {
                    const next = new Set(prev);
                    if (next.has(item.label)) next.delete(item.label);
                    else next.add(item.label);
                    return next;
                  });
                }}
                className={[
                  "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                  groupHasActive
                    ? "text-zinc-900 font-medium"
                    : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900",
                ].join(" ")}
                data-open={isOpen ? "true" : "false"}
              >
                <span>{item.label}</span>
                <span
                  className={[
                    "transition-transform",
                    isOpen ? "rotate-90" : "",
                  ].join(" ")}
                >
                  ›
                </span>
              </button>

              {/* Panel colapsable animado (SIN aria-hidden, SIN aria-expanded) */}
              <div
                className={[
                  "grid overflow-hidden transition-[grid-template-rows] duration-200 ease-out",
                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                ].join(" ")}
              >
                <div className="min-h-0">
                  <div className="ml-3 mt-1 border-l border-zinc-200 pl-3">
                    {item.items.map((child) => {
                      const active = isActive(child.href);
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
    <div className="px-1 text-xs font-medium text-zinc-500">
      Accesos
    </div>

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
