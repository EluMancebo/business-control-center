"use client";
import Image from "next/image";
import AnimatedSignature from "./AnimatedSignature";
export default function FooterSignature() {
  return (
 <footer className="mt-auto w-full bg-slate-100 text-slate-900 border-t border-slate-200">
      <div className="mx-auto w-full max-w-5xl px-4 py-1">
        <div className="mx-auto w-full max-w-130">
          
          <div className="footer-panel rounded-2xl overflow-hidden">
            <div className="footer-panel-content flex flex-col items-center justify-center px-6 py-4 text-center">
              <p className="mb-0.5 mt-8 translate-y-2 -rotate-6 translate-x-3 sm:translate-x-0 text-base font-semibold text-slate-900 [font-family:var(--font-satisfy)]"> Created by </p>
              <div className="flex items-end justify-center gap-4">
                
              <div className="footer-silueta-box -translate-y-12 translate-x-6 shrink-0">
                  <Image src="/footer/silueta.png" alt="Silueta Elu"
                    fill  sizes="72px" priority
                    className="object-contain opacity-85 grayscale"/> </div>
                <div className="scale-[0.82] origin-center -translate-y-6">
                  <AnimatedSignature />
                             </div></div>
              <p className="mt-1 -translate-y-8 text-xs font-semibold text-slate-900">
     © {new Date().getFullYear()} Elu Mancebo. Todos los derechos reservados.</p>
            </div> </div> </div> </div>  
    </footer>
  );
}    