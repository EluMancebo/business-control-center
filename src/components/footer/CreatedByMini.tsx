"use client";

import Image from "next/image";
import AnimatedSignature from "./AnimatedSignature";
import styles from "./FooterSignature.module.css";

export default function CreatedByMini() {
  return (
    <div className="flex items-center justify-end gap-3 text-white/70">
      {/* Texto Created by (tu estilo) */}
      <div className="text-right leading-none">
        <div className={`${styles.createdBy} ${styles.createdByMini}`}>
          Created <span>by</span>
        </div>
      </div>

      {/* Silueta mini */}
      <div className="relative h-10 w-10 shrink-0">
        <Image
          src="/footer/silueta.png"
          alt="Silueta Elu"
          fill
          sizes="40px"
          className="object-contain opacity-75 grayscale"
        />
      </div>

      {/* Firma animada mini */}
      <div className="origin-left scale-[0.38] opacity-85">
        <AnimatedSignature />
      </div>
    </div>
  );
}  