import LogoutButton from "../LogoutButton";

export default function Topbar({
  onOpenMenu,
}: {
  onOpenMenu?: () => void;
}) {
  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
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
            <div className="text-sm font-semibold text-zinc-900">
              Panel de control
            </div>
            <div className="text-xs text-zinc-500">
              Gestiona tu negocio y tu web pública
            </div>
          </div>
        </div>

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
