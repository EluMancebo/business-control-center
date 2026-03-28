// src/components/LogoutButton.tsx

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

function PowerIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
      <path
        d="M12 3v7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M8.5 5.5A8 8 0 1015.5 5.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    const ok = window.confirm("¿Quieres cerrar sesión y salir del programa?");
    if (!ok) return;

    try {
      setLoading(true);
      await fetch("/api/auth/logout", { method: "POST" });
      router.replace("/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-full border border-border px-4 py-2",
        "bg-primary text-primary-foreground shadow-sm transition-[background-color,transform,box-shadow,opacity] duration-200 ease-out",
        "hover:opacity-90 hover:-translate-y-px active:translate-y-0",
        "focus-visible:outline-none focus-visible:ring-2 [--tw-ring-color:var(--ring)]",
        "disabled:cursor-not-allowed disabled:opacity-70",
      ].join(" ")}
      aria-label="Cerrar sesión"
      title="Cerrar sesión"
    >
      <PowerIcon />
      <span>{loading ? "Saliendo..." : "Salir"}</span>
    </button>
  );
}

 
