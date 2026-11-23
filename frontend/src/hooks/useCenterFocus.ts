import { useEffect, useLayoutEffect, useRef, useState } from "react";

// Debe ser algo mayor que la duración de la transición de tamaño (duration-300 en el CSS)
const SETTLE_MS = 400;

function findCenterId(container: HTMLElement): string | null {
  const centerY = window.innerHeight / 2;
  const cards = Array.from(container.querySelectorAll<HTMLElement>("[data-focus-id]"));

  const match = cards.find((card) => {
    const rect = card.getBoundingClientRect();
    return rect.top <= centerY && rect.bottom >= centerY;
  });

  return match?.dataset.focusId ?? null;
}

function documentTop(element: HTMLElement): number {
  return element.getBoundingClientRect().top + window.scrollY;
}

export function useCenterFocus(ids: string[], active = true) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null);

  const focusedRef = useRef<string | null>(null);
  const anchorTopRef = useRef<number | null>(null);
  const idsKey = ids.join("|");

  // Detecta qué elemento cruza el centro de la ventana mientras se hace scroll
  useEffect(() => {
    if (!active) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      const container = containerRef.current;
      if (!container) return;

      // Si el centro cae en el hueco entre dos tarjetas, se mantiene el foco actual
      const nextId = findCenterId(container);
      if (nextId === null || nextId === focusedRef.current) return;

      // Antes de cambiar el foco se guarda dónde está la tarjeta que lo recibe
      const card = container.querySelector<HTMLElement>(
        `[data-focus-id="${CSS.escape(nextId)}"]`
      );
      anchorTopRef.current = card ? documentTop(card) : null;

      focusedRef.current = nextId;
      setFocusedId(nextId);
    };

    const schedule = () => {
      if (frame === 0) frame = requestAnimationFrame(update);
    };

    schedule(); // al montar y cada vez que cambia la lista
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [idsKey, active]);

  // Mientras las tarjetas se redimensionan, mantiene quieta en pantalla a la que gana el foco.
  // Solo compensa los desplazamientos del layout: el scroll del usuario no se toca.
  useLayoutEffect(() => {
    const container = containerRef.current;
    const startTop = anchorTopRef.current;
    if (!container || focusedId === null || startTop === null) return;

    const target = container.querySelector<HTMLElement>(
      `[data-focus-id="${CSS.escape(focusedId)}"]`
    );
    if (!target) return;

    let lastTop = startTop;
    let frame = 0;
    const startedAt = performance.now();

    const compensate = () => {
      const top = documentTop(target);
      const shift = top - lastTop;
      if (Math.abs(shift) >= 0.5) window.scrollBy(0, shift);
      lastTop = top;

      if (performance.now() - startedAt < SETTLE_MS) {
        frame = requestAnimationFrame(compensate);
      }
    };

    compensate();
    return () => cancelAnimationFrame(frame);
  }, [focusedId]);

  return { containerRef, focusedId };
}