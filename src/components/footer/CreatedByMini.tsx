// src/components/footer/CreatedByMini.tsx
"use client";

import Image from "next/image";
import AnimatedSignature from "./AnimatedSignature";
import styles from "./FooterSignature.module.css";

export default function CreatedByMini() {
  return (
    <div className={styles.heroSignature}>
      <div className={`${styles.createdByHero} ${styles.createdByMini}`}>
        Created <span>by</span>
      </div>

      <div className={styles.heroSilueta}>
        <Image
          src="/footer/silueta.png"
          alt="Silueta Elu"
          fill
          sizes="36px"
          className="object-contain opacity-80 grayscale"
          priority={false}
        />
      </div>

      <div className={styles.heroSigMini}>
        <AnimatedSignature />
      </div>
    </div>
  );
}
