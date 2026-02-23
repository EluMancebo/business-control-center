"use client";

import { usePathname } from "next/navigation";
import FooterSignature from "./FooterSignature";

function isPublicSlugPath(pathname: string) {
  // coincide con "/algo" pero NO con "/panel/..." ni "/login" ni "/api" etc.
  // Esto evita que el footer global aparezca en la web pública del cliente.
  if (!pathname) return false;
  if (pathname.startsWith("/panel")) return false;
  if (pathname.startsWith("/login")) return false;
  if (pathname.startsWith("/api")) return false;

  // "/{slug}" -> 1 segmento
  const parts = pathname.split("/").filter(Boolean);
  return parts.length === 1;
}

export default function FooterSignatureGate() {
  const pathname = usePathname();

  if (isPublicSlugPath(pathname)) return null;
  return <FooterSignature />;
} 
