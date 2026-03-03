import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function PanelAppearanceRedirectPage() {
  redirect("/panel/web-control/brand");
}
