// src/components/brand/DynamicLogo.tsx
import type { HTMLAttributes } from "react";
import Image from "next/image";
type LogoSize = 28 | 32 | 36 | 40 | 48;

type DynamicLogoProps = {
  size?: LogoSize;
  animated?: boolean;
  label?: string;
} & HTMLAttributes<HTMLDivElement>;

function sizeClass(size: LogoSize) {
  switch (size) {
    case 28:
      return "h-7 w-7";
    case 32:
      return "h-8 w-8";
    case 36:
      return "h-9 w-9";
    case 40:
      return "h-10 w-10";
    case 48:
      return "h-12 w-12";
    default:
      return "h-9 w-9";
  }
}
export default function DynamicLogo({
  size = 36,
  animated = true,
  label = "Business Control Center",
  className = "",
  ...rest
}: DynamicLogoProps) {
  const box = sizeClass(size);
  return (
    <div
      {...rest}
      className={`relative inline-flex ${box} items-center justify-center ${className}`}
      aria-label={label}
      title={label}
    >
      {/* Logo mark real */}
      <Image
        src="/brand/logo-mark.svg"
        alt={label}
        width={size}
        height={size}
        className={`relative ${animated ? "animate-[float_5s_ease-in-out_infinite]" : ""}`}
        draggable={false}
        priority={false}
      />
    </div>
  );
}
