// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import BrandHydrator from "@/components/brand/BrandHydrator";
import FooterSignature from "@/components/footer/FooterSignature";

export const metadata: Metadata = {
  title: "Business Control Center",
  description: "El centro de mando para tu negocio local",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="min-h-screen antialiased">
        <BrandHydrator />
        <main className="min-h-screen">{children}</main>
        <FooterSignature />
      </body>
    </html>
  );
}

 
