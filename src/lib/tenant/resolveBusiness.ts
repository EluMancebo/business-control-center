import { Business } from "@/models/Business";

export async function resolveBusinessBySlug(slug: string) {
  const businessSlug = decodeURIComponent(String(slug || ""))
    .trim()
    .toLowerCase();

  if (!businessSlug) return null;

  const business = await Business.findOne({ slug: businessSlug }).lean();
  if (!business) return null;

  return {
    businessId: business._id,
    businessSlug: business.slug,
    businessName: business.name,
  };
}
