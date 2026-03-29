// src/app/panel/taller/layout.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/serverSession";

export default async function TallerLayout({ children }: { children: React.ReactNode }) {
  try {
    await requireRole("admin");
  } catch {
    redirect("/panel/dashboard");
  }

  return (
    <div className="min-h-full bg-background text-foreground [background:var(--background)] dark:[background:var(--surface-2,var(--background))]">
      {children}
    </div>
  );
}
