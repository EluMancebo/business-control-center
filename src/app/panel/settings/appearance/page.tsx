// src/app/panel/settings/appearance/page.tsx
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/serverSession";
import BrandEditor from "@/components/panel/brand/BrandEditor";

export const dynamic = "force-dynamic";

export default async function AppearancePage() {
  const session = await requireSession().catch(() => {
    redirect("/login?next=/panel/settings/appearance");
  });

  const appearanceScope = session.role === "admin" ? ("studio" as const) : ("panel" as const);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <BrandEditor scope={appearanceScope} />
    </div>
  );
}
