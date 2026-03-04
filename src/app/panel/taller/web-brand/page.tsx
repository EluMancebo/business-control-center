// src/app/panel/taller/web-brand/page.tsx
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/serverSession";
import { dbConnect } from "@/lib/db";
import { Business } from "@/models/Business";
import WebBrandStudioClient from "./WebBrandStudioClient";

export const dynamic = "force-dynamic";

type BizItem = { slug: string; name: string };

export default async function TallerWebBrandPage() {
  try {
    await requireRole("admin");
  } catch {
    redirect("/panel/dashboard");
  }

  await dbConnect();

  const docs = (await Business.find({}, { name: 1, slug: 1 })
    .sort({ createdAt: -1 })
    .limit(200)
    .lean()) as Array<{ name?: string; slug: string }>;

  const businesses: BizItem[] = docs.map((b) => ({
    slug: b.slug,
    name: b.name?.trim() ? b.name : b.slug,
  }));

  return <WebBrandStudioClient businesses={businesses} />;
} 
