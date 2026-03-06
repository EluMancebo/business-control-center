export const dynamic = "force-dynamic";
export const revalidate = 0;

import { redirect } from "next/navigation";
import { requireCapability } from "@/lib/auth/serverSession";

export default async function LeadsLayout({ children }: { children: React.ReactNode }) {
  try {
    await requireCapability("CAN_VIEW_ASSIGNED_LEADS");
  } catch {
    redirect("/panel/dashboard");
  }
  return <>{children}</>;
}    
