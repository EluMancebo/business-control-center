// src/app/panel/web-control/brand/page.tsx
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/serverSession";
import BrandWebStudioClient from "./BrandWebStudioClient";

export const dynamic = "force-dynamic";

export default async function WebBrandPage() {
  let role: string | undefined;

  try {
    const s = await requireSession();
    role = s.role;
  } catch {
    redirect("/login?next=/panel/web-control/brand");
  }

  if (role === "admin") {
    redirect("/panel/taller/web-brand");
  }

  if (role !== "owner" && role !== "marketing") {
    redirect("/panel/dashboard");
  }

  return <BrandWebStudioClient />;
}  