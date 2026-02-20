  import { redirect } from "next/navigation";
import PanelShell from "@/components/panel/PanelShell";
import { requireSession } from "@/lib/auth/serverSession";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let role: string | undefined;

  try {
    const session = await requireSession();
    role = session.role;
  } catch {
    redirect("/login?next=/panel/dashboard");
  }

  return <PanelShell role={role}>{children}</PanelShell>;
}
