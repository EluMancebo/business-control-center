 import LogoutButton from "../LogoutButton";

export default function Topbar() {
  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-zinc-900">
            Panel de control
          </div>
          <div className="text-xs text-zinc-500">
            Gestiona tu negocio y tu web pública
          </div>
        </div>

        <div className="flex items-center gap-2">
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
   