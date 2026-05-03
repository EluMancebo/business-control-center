export const dynamic = "force-dynamic";
export const revalidate = 0;

import { redirect } from "next/navigation";
import { requireCapability } from "@/lib/auth/serverSession";

export default async function AppointmentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await requireCapability("CAN_MANAGE_APPOINTMENTS");
  } catch {
    redirect("/panel/dashboard");
  }

  return <>{children}</>;
}
