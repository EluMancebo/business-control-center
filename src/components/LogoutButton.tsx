"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });

    router.replace("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="
        bg-black text-white px-4 py-2 rounded-full
        cursor-pointer
        hover:bg-gray-800
        hover:scale-105
        active:scale-95
        transition
      "
    >
      Salir
    </button>
  );
}
 