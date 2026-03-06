// src/app/panel/web-control/layout.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { redirect } from "next/navigation";
import { requireCapability } from "@/lib/auth/serverSession";

export default async function WebControlLayout({ children }: { children: React.ReactNode }) {
  try {
    await requireCapability("CAN_EDIT_WEB");
  } catch {
    redirect("/panel/dashboard");
  }

  return <>{children}</>;
}    