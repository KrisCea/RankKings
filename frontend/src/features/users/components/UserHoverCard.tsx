import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import UserPreviewCard from "./UserPreviewCard";

interface UserHoverCardProps {
  username: string;
  children: ReactNode;
}

interface Position {
  left: number;
  top?: number;
  bottom?: number;
}

const CARD_WIDTH = 256; // w-64
const CARD_ESTIMATED_HEIGHT = 240;
const MARGIN = 8;

export default function UserHoverCard({ username, children }: UserHoverCardProps) {
  const [position, setPosition] = useState<Position | null>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function computePosition(): Position | null {
    const el = triggerRef.current;
    if (!el) return null;

    const rect = el.getBoundingClientRect();

    // Mantiene la tarjeta dentro del ancho de la pantalla
    const left = Math.min(
      Math.max(rect.left, MARGIN),
      window.innerWidth - CARD_WIDTH - MARGIN
    );

    // Si hay espacio abajo, la abre hacia abajo; si no, hacia arriba
    const spaceBelow = window.innerHeight - rect.bottom;
    if (spaceBelow >= CARD_ESTIMATED_HEIGHT + MARGIN) {
      return { left, top: rect.bottom + MARGIN };
    }
    return { left, bottom: window.innerHeight - rect.top + MARGIN };
  }

  function scheduleOpen() {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setPosition(computePosition()), 400);
  }

  function scheduleClose() {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setPosition(null), 200);
  }

  function cancelTimeout() {
    clearTimeout(timeoutRef.current);
  }

  // Cierra la vista previa si el usuario hace scroll o cambia el tamaño de la ventana
  // (la posición fixed quedaría desalineada del avatar)
  useEffect(() => {
    if (!position) return;

    const close = () => setPosition(null);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);

    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [position]);

  // Limpia el timeout al desmontar
  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  return (
    <>
      <span
        ref={triggerRef}
        className="inline-block"
        onMouseEnter={scheduleOpen}
        onMouseLeave={scheduleClose}
      >
        <Link to={`/profile/${username}`} className="inline-block">
          {children}
        </Link>
      </span>

      {position &&
        createPortal(
          <div
            style={{
              position: "fixed",
              left: position.left,
              top: position.top,
              bottom: position.bottom,
              zIndex: 60,
            }}
            onMouseEnter={cancelTimeout}
            onMouseLeave={scheduleClose}
          >
            <UserPreviewCard username={username} />
          </div>,
          document.body
        )}
    </>
  );
}