"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/panel/web-control/hero", label: "Hero", desc: "Logo, fondo y textos del hero" },
  { href: "/panel/web-control/services", label: "Servicios", desc: "Listado de servicios (próximo)" },
  { href: "/panel/web-control/offers", label: "Ofertas", desc: "Promos y campañas (próximo)" },
  { href: "/panel/web-control/testimonials", label: "Testimonios", desc: "Social proof (próximo)" },
  { href: "/panel/web-control/hours", label: "Horario", desc: "Horarios y disponibilidad" },
  { href: "/panel/web-control/location", label: "Ubicación", desc: "Mapa, dirección y contacto" },
];

export default function WebControlIndexPage() {
  const pathname = usePathname();

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-border p-4 text-card-foreground sm:p-6 [background:color-mix(in_oklab,var(--background)_94%,var(--card)_6%)] [color:var(--card-foreground,var(--foreground))] dark:[background:var(--surface-2,var(--card))]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Web Control</h1>
            <p className="mt-1 text-sm [color:var(--text-subtle,var(--muted-foreground))]">
              Elige una sección para editar. (Studio abre editor+preview a pantalla completa)
            </p>
          </div>

          <div className="text-xs [color:var(--text-subtle,var(--muted-foreground))]">
            Ruta: <span className="font-mono">{pathname}</span>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        {ITEMS.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            className="rounded-xl border border-border p-4 text-card-foreground transition-colors [background:var(--card)] [color:var(--card-foreground,var(--foreground))] hover:[background:var(--surface-2,var(--muted))] dark:[background:var(--surface-2,var(--card))] dark:hover:[background:var(--surface-3,var(--muted))]"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold">{it.label}</div>
              <div className="text-xs [color:var(--link,var(--muted-foreground))]">Abrir →</div>
            </div>
            <div className="mt-2 text-xs [color:var(--text-subtle,var(--muted-foreground))]">{it.desc}</div>
          </Link>
        ))}
      </section>
    </div>
  );
}    
