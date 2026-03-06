// src/app/panel/web-control/publish/layout.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { redirect } from "next/navigation";
import { requireCapability } from "@/lib/auth/serverSession";

export default async function PublishLayout({ children }: { children: React.ReactNode }) {
  try {
    await requireCapability("CAN_PUBLISH_WEB");
  } catch {
    redirect("/panel/dashboard");
  }

  return <>{children}</>;
}    