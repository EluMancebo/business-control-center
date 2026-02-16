// src/components/footer/FooterSignature.tsx
"use client";

import Image from "next/image";
import AnimatedSignature from "./AnimatedSignature";
import styles from "./FooterSignature.module.css";

export default function FooterSignature() {
  return (
    <footer className="mt-auto w-full border-t border-border bg-muted text-foreground">
      <div className="mx-auto w-full max-w-5xl px-4 py-1">
        <div className="mx-auto w-full max-w-130">
          <div className="footer-panel overflow-hidden rounded-2xl">
            <div className="footer-panel-content flex flex-col items-center justify-center px-6 py-4 text-center">
              {/* Wrapper relativo SOLO para posicionar Created by */}
              <div className={`${styles.createdByWrap} mt-8`}>
                <h5 className={styles.createdBy}>
                  Created
                  <br />
                  <span>by</span>
                </h5>

                <div className="flex items-end justify-center gap-4">
                  <div className="footer-silueta-box relative -translate-y-12 translate-x-6 shrink-0 h-18 w-18">
                    <Image
                      src="/footer/silueta.png"
                      alt="Silueta Elu"
                      fill
                      sizes="72px"
                      priority
                      className="object-contain opacity-85 grayscale"
                    />
                  </div>

                  <div className="origin-center scale-[0.82] -translate-y-6">
                    <AnimatedSignature />
                  </div>
                </div>
              </div>

              <p className="mt-1 -translate-y-8 text-xs font-semibold text-foreground">
                © {new Date().getFullYear()} Elu Mancebo. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
