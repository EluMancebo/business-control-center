// src/app/panel/taller/brand/page.tsx
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/serverSession";
import BrandEditor from "@/components/panel/brand/BrandEditor";

export const dynamic = "force-dynamic";

export default async function TallerBrandPage() {
  try {
    await requireRole("admin");
  } catch {
    redirect("/panel/dashboard");
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <BrandEditor scope={"system" as const} />
    </div>
  );
}    