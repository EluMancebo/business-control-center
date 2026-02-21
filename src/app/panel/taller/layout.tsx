import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/serverSession";
import BrandScopeOverride from "@/components/brand/BrandScopeOverride";

export default async function TallerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await requireRole("admin");
  } catch {
    redirect("/panel/dashboard");
  }

  // Capa 1: Taller NO hereda marca del cliente.
  // Forzamos la marca del sistema (bcc) y modo estable.
  return (
    <>
      <BrandScopeOverride palette="bcc" mode="light" />
      {children}
    </>
  );
}