import Link from "next/link";

const nav = [
  { href: "/panel/dashboard", label: "Dashboard" },
  { href: "/panel/web", label: "Web pública" },
  // próximos:
  // { href: "/panel/marketing", label: "Marketing" },
];

export default function Sidebar({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  return (
    <aside className="flex h-full w-64 flex-col border-r border-zinc-200 bg-white p-4">
      <div className="mb-6">
        <div className="text-sm font-semibold tracking-tight text-zinc-900">
          Business Control Center
        </div>
        <div className="text-xs text-zinc-500">Panel cliente</div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className="rounded-lg px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="mt-6 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
        <div className="text-xs font-medium text-zinc-900">Acceso rápido</div>
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex w-full justify-center rounded-lg bg-zinc-900 px-3 py-2 text-xs font-medium text-white hover:bg-zinc-800"
        >
          Ver web pública ↗
        </a>
      </div>
    </aside>
  );
}
