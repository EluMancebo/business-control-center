//src/app/panel/settings/acces/page.tsx 
 "use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Role = "owner" | "marketing" | "staff" | "admin";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export default function AccessSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [notice, setNotice] = useState<string>("");

  const [users, setUsers] = useState<UserRow[]>([]);

  // Crear usuario
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"marketing" | "staff">("marketing");
  const [password, setPassword] = useState("");

  // Reset password (admin/owner)
  const [resetId, setResetId] = useState<string>("");
  const [resetPassword, setResetPassword] = useState("");

  // Mi cuenta (owner)
  const [meName, setMeName] = useState("");
  const [meEmail, setMeEmail] = useState("");
  const [meCurrentPassword, setMeCurrentPassword] = useState("");
  const [meNewPassword, setMeNewPassword] = useState("");

  const canSubmit = useMemo(() => {
    return name.trim().length >= 2 && email.includes("@") && password.length >= 8;
  }, [name, email, password]);

  async function loadUsers() {
    setError("");
    setNotice("");
    setLoading(true);
    try {
      const res = await fetch("/api/panel/users", { method: "GET" });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error || "Error cargando usuarios");
        setUsers([]);
        return;
      }

      const list: UserRow[] = Array.isArray(data?.users) ? data.users : [];
      setUsers(list);

      // Prefill "Mi cuenta" con el owner actual si aparece en la lista.
      // (En fase A suele haber un único owner.)
      const owner = list.find((u) => u.role === "owner") ?? null;
      if (owner) {
        setMeName(owner.name ?? "");
        setMeEmail(owner.email ?? "");
      }
    } catch {
      setError("Error de red cargando usuarios");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function onCreateUser() {
    setError("");
    setNotice("");
    try {
      const res = await fetch("/api/panel/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          role,
          password,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error || "No se pudo crear el usuario");
        return;
      }

      setName("");
      setEmail("");
      setPassword("");
      setNotice("Usuario creado correctamente.");
      await loadUsers();
    } catch {
      setError("Error de red creando usuario");
    }
  }

  async function onResetPassword() {
    if (!resetId || resetPassword.length < 8) {
      setError("Selecciona usuario y pon una contraseña (mín. 8 caracteres)");
      return;
    }

    setError("");
    setNotice("");
    try {
      const res = await fetch(`/api/panel/users/${encodeURIComponent(resetId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: resetPassword }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error || "No se pudo resetear la contraseña");
        return;
      }

      setResetId("");
      setResetPassword("");
      setNotice("Contraseña reseteada correctamente.");
      await loadUsers();
    } catch {
      setError("Error de red reseteando contraseña");
    }
  }

  // ✅ Owner: cambiar email/nombre
  async function onUpdateAccount() {
    setError("");
    setNotice("");

    const payload: { name?: string; email?: string } = {};
    if (meName.trim().length >= 2) payload.name = meName.trim();
    if (meEmail.trim().includes("@")) payload.email = meEmail.trim().toLowerCase();

    if (!payload.name && !payload.email) {
      setError("Introduce un nombre válido y/o un email válido.");
      return;
    }

    try {
      const res = await fetch("/api/panel/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error || "No se pudo actualizar la cuenta");
        return;
      }

      setNotice("Cuenta actualizada. Si cambiaste el email, úsalo en el próximo login.");
      await loadUsers();
    } catch {
      setError("Error de red actualizando cuenta");
    }
  }

  // ✅ Cualquier rol: cambiar contraseña propia
  async function onChangeMyPassword() {
    setError("");
    setNotice("");

    if (!meCurrentPassword) {
      setError("Falta la contraseña actual.");
      return;
    }
    if (meNewPassword.length < 8) {
      setError("La nueva contraseña debe tener mínimo 8 caracteres.");
      return;
    }

    try {
      const res = await fetch("/api/panel/account/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: meCurrentPassword,
          newPassword: meNewPassword,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error || "No se pudo cambiar la contraseña");
        return;
      }

      setMeCurrentPassword("");
      setMeNewPassword("");
      setNotice("Contraseña cambiada correctamente.");
    } catch {
      setError("Error de red cambiando contraseña");
    }
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-8">
      <header className="mb-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Contraseñas y accesos</h1>
            <p className="mt-1 text-sm [color:var(--text-subtle,var(--muted-foreground))]">
              Owner/Admin: gestiona usuarios del negocio. Owner: cambia también su email/login desde aquí.
            </p>
          </div>

          <Link
            id="access-back"
            href="/panel/settings"
            className="inline-flex items-center justify-center rounded-lg border border-border px-3 py-2 text-sm font-medium [background:var(--cta-secondary,var(--background))] [color:var(--cta-secondary-foreground,var(--foreground))] hover:[background:var(--cta-secondary-hover,var(--muted))]"
          >
            ← Volver
          </Link>
        </div>

        {error ? (
          <div className="mt-4 rounded-xl border border-border p-4 text-sm text-foreground [background:color-mix(in_oklab,var(--surface-3,var(--muted))_72%,transparent)]">
            <span className="font-medium">Error:</span> {error}
          </div>
        ) : null}

        {notice ? (
          <div className="mt-4 rounded-xl border border-border p-4 text-sm text-foreground [background:color-mix(in_oklab,var(--surface-3,var(--muted))_72%,transparent)]">
            <span className="font-medium">OK:</span> {notice}
          </div>
        ) : null}
      </header>

      <section className="grid gap-6">
        {/* ✅ Mi cuenta (Owner) */}
        <div className="rounded-2xl border border-border p-6 [background:var(--surface-2,var(--card))]">
          <h2 className="text-base font-semibold">Mi cuenta (Owner)</h2>
          <p className="mt-2 text-sm [color:var(--text-subtle,var(--muted-foreground))]">
            Cambia tu nombre/email (login) y tu contraseña. Para la demo, puedes poner un email y clave genéricos.
          </p>

          <div className="mt-4 grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-border p-4 [background:var(--surface-3,var(--background))]">
              <div className="text-sm font-semibold">Datos de acceso</div>

              <div className="mt-3 grid gap-3">
                <div>
                  <label
                    htmlFor="me-name"
                    className="text-xs font-medium [color:var(--text-subtle,var(--muted-foreground))]"
                  >
                    Nombre
                  </label>
                  <input
                    id="me-name"
                    value={meName}
                    onChange={(ev) => setMeName(ev.target.value)}
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm [background:var(--background)]"
                    placeholder="Nombre visible"
                  />
                </div>

                <div>
                  <label
                    htmlFor="me-email"
                    className="text-xs font-medium [color:var(--text-subtle,var(--muted-foreground))]"
                  >
                    Email (login)
                  </label>
                  <input
                    id="me-email"
                    value={meEmail}
                    onChange={(ev) => setMeEmail(ev.target.value)}
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm [background:var(--background)]"
                    placeholder="demo@bcc.local"
                  />
                </div>

                <button
                  type="button"
                  onClick={onUpdateAccount}
                  className="mt-1 inline-flex items-center justify-center rounded-lg border border-border px-4 py-2 text-sm font-semibold [background:var(--cta-secondary,var(--background))] [color:var(--cta-secondary-foreground,var(--foreground))] hover:[background:var(--cta-secondary-hover,var(--muted))]"
                >
                  Guardar nombre/email
                </button>

                <p className="text-xs [color:var(--text-subtle,var(--muted-foreground))]">
                  Si cambias el email, el próximo login será con ese email.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-border p-4 [background:var(--surface-3,var(--background))]">
              <div className="text-sm font-semibold">Cambiar contraseña</div>

              <div className="mt-3 grid gap-3">
                <div>
                  <label
                    htmlFor="me-current"
                    className="text-xs font-medium [color:var(--text-subtle,var(--muted-foreground))]"
                  >
                    Contraseña actual
                  </label>
                  <input
                    id="me-current"
                    type="password"
                    value={meCurrentPassword}
                    onChange={(ev) => setMeCurrentPassword(ev.target.value)}
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm [background:var(--background)]"
                    placeholder="tu contraseña actual"
                  />
                </div>

                <div>
                  <label
                    htmlFor="me-new"
                    className="text-xs font-medium [color:var(--text-subtle,var(--muted-foreground))]"
                  >
                    Nueva contraseña
                  </label>
                  <input
                    id="me-new"
                    type="password"
                    value={meNewPassword}
                    onChange={(ev) => setMeNewPassword(ev.target.value)}
                    className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm [background:var(--background)]"
                    placeholder="mín. 8 caracteres"
                  />
                </div>

                <button
                  type="button"
                  onClick={onChangeMyPassword}
                  className="mt-1 inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold [background:var(--cta-primary,var(--primary))] [color:var(--cta-primary-foreground,var(--primary-foreground))] hover:[background:var(--cta-primary-hover,var(--primary))]"
                >
                  Cambiar contraseña
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla usuarios */}
        <div className="rounded-2xl border border-border p-6 [background:var(--surface-2,var(--card))]">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-base font-semibold">Usuarios del negocio</h2>
            <button
              type="button"
              className="rounded-lg border border-border px-3 py-2 text-sm font-medium [background:var(--cta-secondary,var(--background))] [color:var(--cta-secondary-foreground,var(--foreground))] hover:[background:var(--cta-secondary-hover,var(--muted))]"
              onClick={loadUsers}
              disabled={loading}
            >
              Recargar
            </button>
          </div>

          <div className="mt-4 overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="[background:color-mix(in_oklab,var(--surface-3,var(--muted))_72%,transparent)] [color:var(--text-subtle,var(--muted-foreground))]">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Nombre</th>
                  <th className="px-3 py-2 text-left font-medium">Email</th>
                  <th className="px-3 py-2 text-left font-medium">Rol</th>
                  <th className="px-3 py-2 text-left font-medium">ID</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="px-3 py-4 [color:var(--text-subtle,var(--muted-foreground))]" colSpan={4}>
                      Cargando…
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td className="px-3 py-4 [color:var(--text-subtle,var(--muted-foreground))]" colSpan={4}>
                      No hay usuarios.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="border-t border-border">
                      <td className="px-3 py-2">{u.name}</td>
                      <td className="px-3 py-2">{u.email}</td>
                      <td className="px-3 py-2">
                        <span className="rounded-md px-2 py-0.5 text-xs [background:var(--accent-soft,var(--muted))] [color:var(--accent-soft-foreground,var(--foreground))]">
                          {u.role}
                        </span>
                      </td>
                      <td className="px-3 py-2 font-mono text-xs [color:var(--text-subtle,var(--muted-foreground))]">{u.id}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Crear / Reset */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-border p-6 [background:var(--surface-2,var(--card))]">
            <h2 className="text-base font-semibold">Crear usuario (Marketing / Staff)</h2>
            <p className="mt-2 text-sm [color:var(--text-subtle,var(--muted-foreground))]">
              El usuario queda ligado automáticamente al business del Owner (multi-tenant).
            </p>

            <div className="mt-4 grid gap-3">
              <div>
                <label
                  htmlFor="create-name"
                  className="text-xs font-medium [color:var(--text-subtle,var(--muted-foreground))]"
                >
                  Nombre
                </label>
                <input
                  id="create-name"
                  value={name}
                  onChange={(ev) => setName(ev.target.value)}
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm [background:var(--background)]"
                  placeholder="Ej: Ana Marketing"
                />
              </div>

              <div>
                <label
                  htmlFor="create-email"
                  className="text-xs font-medium [color:var(--text-subtle,var(--muted-foreground))]"
                >
                  Email
                </label>
                <input
                  id="create-email"
                  value={email}
                  onChange={(ev) => setEmail(ev.target.value)}
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm [background:var(--background)]"
                  placeholder="marketing@negocio.com"
                />
              </div>

              <div>
                <label
                  htmlFor="create-role"
                  className="text-xs font-medium [color:var(--text-subtle,var(--muted-foreground))]"
                >
                  Rol
                </label>
                <select
                  id="create-role"
                  value={role}
                  onChange={(ev) => setRole(ev.target.value as "marketing" | "staff")}
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm [background:var(--background)]"
                >
                  <option value="marketing">marketing</option>
                  <option value="staff">staff</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="create-password"
                  className="text-xs font-medium [color:var(--text-subtle,var(--muted-foreground))]"
                >
                  Contraseña
                </label>
                <input
                  id="create-password"
                  type="password"
                  value={password}
                  onChange={(ev) => setPassword(ev.target.value)}
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm [background:var(--background)]"
                  placeholder="mín. 8 caracteres"
                />
              </div>

              <button
                type="button"
                onClick={onCreateUser}
                disabled={!canSubmit}
                className="mt-2 inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50 [background:var(--cta-primary,var(--primary))] [color:var(--cta-primary-foreground,var(--primary-foreground))] hover:[background:var(--cta-primary-hover,var(--primary))]"
              >
                Crear usuario
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-border p-6 [background:var(--surface-2,var(--card))]">
            <h2 className="text-base font-semibold">Resetear contraseña (Owner/Admin)</h2>
            <p className="mt-2 text-sm [color:var(--text-subtle,var(--muted-foreground))]">
              Selecciona un usuario del negocio y asigna una nueva contraseña.
            </p>

            <div className="mt-4 grid gap-3">
              <div>
                <label
                  htmlFor="reset-user"
                  className="text-xs font-medium [color:var(--text-subtle,var(--muted-foreground))]"
                >
                  Usuario
                </label>
                <select
                  id="reset-user"
                  value={resetId}
                  onChange={(ev) => setResetId(ev.target.value)}
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm [background:var(--background)]"
                >
                  <option value="">— Selecciona —</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.email} ({u.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="reset-password"
                  className="text-xs font-medium [color:var(--text-subtle,var(--muted-foreground))]"
                >
                  Nueva contraseña
                </label>
                <input
                  id="reset-password"
                  type="password"
                  value={resetPassword}
                  onChange={(ev) => setResetPassword(ev.target.value)}
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm [background:var(--background)]"
                  placeholder="mín. 8 caracteres"
                />
              </div>

              <button
                type="button"
                onClick={onResetPassword}
                className="mt-2 inline-flex items-center justify-center rounded-lg border border-border px-4 py-2 text-sm font-semibold [background:var(--cta-secondary,var(--background))] [color:var(--cta-secondary-foreground,var(--foreground))] hover:[background:var(--cta-secondary-hover,var(--muted))]"
              >
                Resetear contraseña
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
} 
