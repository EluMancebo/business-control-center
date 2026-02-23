// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import BrandHydrator from "@/components/brand/BrandHydrator";
import HeroHydrator from "@/lib/web/hero/HeroHydrator";
import { Satisfy } from "next/font/google";

const satisfy = Satisfy({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-satisfy",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Business Control Center",
  description: "El centro de mando para tu negocio local",
  icons: {
    icon: "/brand/LogoFaviconCaballerosBarberia.png",
    apple: "/brand/LogoFaviconCaballerosBarberia.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${satisfy.variable} min-h-screen bg-background text-foreground antialiased`}>
        <BrandHydrator />
        <HeroHydrator />
        {children}
      </body>
    </html>
  );
}
