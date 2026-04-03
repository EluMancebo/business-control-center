"use client";

import { useEffect, useRef, useState } from "react";
import PanelButton from "@/components/panel/ui/PanelButton";

type BackToTopProps = {
  threshold?: number;
  className?: string;
  scrollContainerId?: string;
};

export default function BackToTop({
  threshold = 320,
  className,
  scrollContainerId,
}: BackToTopProps) {
  const [isVisible, setIsVisible] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const resolveScrollContainer = () => {
      if (scrollContainerId) {
        return document.getElementById(scrollContainerId);
      }

      let node = rootRef.current?.parentElement ?? null;
      while (node) {
        if (node.classList.contains("bcc-scrollbar")) {
          return node;
        }
        node = node.parentElement;
      }

      return null;
    };

    const scrollContainer = resolveScrollContainer();

    const onScroll = () => {
      const offset = scrollContainer ? scrollContainer.scrollTop : window.scrollY;
      setIsVisible(offset > threshold);
    };

    onScroll();
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", onScroll, { passive: true });
      return () => {
        scrollContainer.removeEventListener("scroll", onScroll);
      };
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [scrollContainerId, threshold]);

  function scrollToTop() {
    const scrollContainer = scrollContainerId
      ? document.getElementById(scrollContainerId)
      : (() => {
          let node = rootRef.current?.parentElement ?? null;
          while (node) {
            if (node.classList.contains("bcc-scrollbar")) {
              return node;
            }
            node = node.parentElement;
          }
          return null;
        })();

    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div
      ref={rootRef}
      className={[
        "pointer-events-none fixed bottom-4 right-4 z-40 sm:bottom-5 sm:right-5",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <PanelButton
        type="button"
        aria-label="Volver arriba"
        title="Volver arriba"
        onClick={scrollToTop}
        className={[
          "h-12 w-12 rounded-full p-0",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "[background:var(--cta-primary,var(--primary))] [color:var(--cta-primary-foreground,var(--primary-foreground))]",
          "shadow-[var(--elevation-base,var(--panel-shadow-1))] hover:shadow-[var(--elevation-interactive,var(--panel-shadow-2))]",
          "hover:[background:var(--cta-primary-hover,var(--primary))]",
          "transition-[opacity,transform,box-shadow,background-color] duration-180",
          "hover:-translate-y-0.5",
          isVisible
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-1 opacity-0",
        ].join(" ")}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-7 w-7"
          aria-hidden="true"
        >
          <path
            d="M5.25 15.75L12 9L18.75 15.75"
            stroke="currentColor"
            strokeWidth="3.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </PanelButton>
    </div>
  );
}
