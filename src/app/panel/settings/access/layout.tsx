// src/app/panel/settings/access/layout.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { redirect } from "next/navigation";
import { requireCapability } from "@/lib/auth/serverSession";

export default async function AccessSettingsLayout({ children }: { children: React.ReactNode }) {
  try {
    await requireCapability("CAN_MANAGE_USERS");
  } catch {
    redirect("/panel/settings");
  }

  return <>{children}</>;
}    