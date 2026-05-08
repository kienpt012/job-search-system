import { useEffect } from "react";

export default function useRevealOnScroll(deps = []) {
  useEffect(() => {
    const items = Array.from(document.querySelectorAll(".reveal"));
    if (!items.length) return undefined;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion || !("IntersectionObserver" in window)) {
      items.forEach((item) => item.classList.add("reveal-visible"));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("reveal-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.14,
        rootMargin: "0px 0px -48px 0px",
      }
    );

    items.forEach((item) => {
      if (!item.classList.contains("reveal-visible")) {
        observer.observe(item);
      }
    });

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
