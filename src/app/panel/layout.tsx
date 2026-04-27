// src/app/panel/layout.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { redirect } from "next/navigation";
import PanelShell from "@/components/panel/PanelShell";
import { requireSession, type SessionPayload } from "@/lib/auth/serverSession";
import PanelContextOverlay from "@/components/panel/PanelContextOverlay";
import { getCapabilitiesForRole, type Capability } from "@/lib/auth/capabilities";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  let session: SessionPayload;

  try {
    session = await requireSession();
  } catch {
    redirect("/login?next=/panel/taller");
  }

  const role = session.role!;
  const isAdmin = role === "admin";
  const capabilities = Array.from(getCapabilitiesForRole(role)) as Capability[];

  return (
    <>
      <PanelContextOverlay />
      <PanelShell role={role} isAdmin={isAdmin} capabilities={capabilities} session={session}>
        {children}
      </PanelShell>
    </>
  );
}