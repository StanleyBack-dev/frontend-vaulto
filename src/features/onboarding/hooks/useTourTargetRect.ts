import { useEffect, useState } from "react";

// Orçamento de tentativas enquanto aguarda a página (lazy-loaded) montar o
// elemento alvo do passo atual antes de desistir e cair no card centralizado.
const MAX_MEASURE_ATTEMPTS = 180;

interface TourTargetRectResult {
  rect: DOMRect | null;
  isSearching: boolean;
}

export function useTourTargetRect(selector: string | null): TourTargetRectResult {
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [isSearching, setIsSearching] = useState(Boolean(selector));

  useEffect(() => {
    if (!selector) {
      setRect(null);
      setIsSearching(false);
      return;
    }

    let frameId = 0;
    let attempts = 0;
    let cancelled = false;

    setRect(null);
    setIsSearching(true);

    function measure() {
      if (cancelled) return;

      const element = document.querySelector(selector as string);

      if (element) {
        setRect(element.getBoundingClientRect());
        setIsSearching(false);
        return;
      }

      attempts += 1;

      if (attempts >= MAX_MEASURE_ATTEMPTS) {
        setRect(null);
        setIsSearching(false);
        return;
      }

      frameId = requestAnimationFrame(measure);
    }

    measure();

    function handleReflow() {
      const element = document.querySelector(selector as string);
      if (element) {
        setRect(element.getBoundingClientRect());
      }
    }

    window.addEventListener("resize", handleReflow);
    window.addEventListener("scroll", handleReflow, true);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleReflow);
      window.removeEventListener("scroll", handleReflow, true);
    };
  }, [selector]);

  return { rect, isSearching };
}
