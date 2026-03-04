// src/app/panel/taller/layout.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/serverSession";
import BrandHydrator from "@/components/brand/BrandHydrator";
import PanelContextOverlay from "@/components/panel/PanelContextOverlay";

export default async function TallerLayout({ children }: { children: React.ReactNode }) {
  try {
    await requireRole("admin");
  } catch {
    redirect("/panel/dashboard");
  }

  return (
    <>
      <BrandHydrator scope="system" />
      <PanelContextOverlay />
      {children}
    </>
  );
}  