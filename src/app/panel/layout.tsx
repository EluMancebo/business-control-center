import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();

  
  const token = cookieStore.get(process.env.COOKIE_NAME ?? "token")?.value ?? null;

 
  if (!token) {
    redirect("/login?next=/panel/dashboard");
  }

  
  return <>{children}</>;
}



