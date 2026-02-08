 import Link from "next/link";

const nav = [
  { href: "/panel/dashboard", label: "Dashboard" },
  { href: "/panel/web", label: "Web pública" },
  // futuros:
  // { href: "/panel/campaigns", label: "Campañas" },
  // { href: "/panel/leads", label: "Leads" },
];

export default function Sidebar() {
  return (
    <aside className="hidden w-64 flex-col border-r border-zinc-200 bg-white p-4 sm:flex">
      <div className="mb-6">
        <div className="text-sm font-semibold tracking-tight text-zinc-900">
          Business Control Center
        </div>
        <div className="text-xs text-zinc-500">Panel cliente</div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-lg px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="mt-6 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
        <div className="text-xs font-medium text-zinc-900">Estado</div>
        <div className="mt-1 text-xs text-zinc-600">
          Diseño del panel en progreso
        </div>
      </div>
    </aside>
  );
}
   