import { useState } from "react";
import type { PostMedia } from "../../../types/post";

// Proporción cuando el post no tiene foco (formato cine)
const COLLAPSED_RATIO = 4 / 1;
// Límites al expandir: ni más vertical que 3:4 ni más ancha que el formato cine
const MIN_EXPANDED_RATIO = 3 / 4;
const MAX_EXPANDED_RATIO = 21 / 9;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

interface PostMediaFrameProps {
  media: PostMedia;
  alt: string;
  expanded: boolean;
}

export default function PostMediaFrame({ media, alt, expanded }: PostMediaFrameProps) {
  // Proporción real de la imagen: al principio la de los metadatos, y la medida al cargar
  const [loadedRatio, setLoadedRatio] = useState<number | null>(null);
  const declaredRatio = media.width && media.height ? media.width / media.height : null;
  const naturalRatio = loadedRatio ?? declaredRatio ?? 1;
  const expandedRatio = clamp(naturalRatio, MIN_EXPANDED_RATIO, MAX_EXPANDED_RATIO);

  return (
    <div
      style={{ aspectRatio: expanded ? expandedRatio : COLLAPSED_RATIO }}
      className="w-full max-h-[80vh] overflow-hidden bg-background transition-[aspect-ratio] duration-300 ease-out motion-reduce:transition-none"
    >
      <img
        src={media.url}
        alt={alt}
        onLoad={(e) => {
          const { naturalWidth, naturalHeight } = e.currentTarget;
          if (naturalWidth && naturalHeight) setLoadedRatio(naturalWidth / naturalHeight);
        }}
        className="h-full w-full object-cover"
      />
    </div>
  );
}