interface AvatarProps {
  src?: string;
  alt: string;
  size?: number; // en px
  className?: string;
}

export default function Avatar({ src, alt, size = 36, className = "" }: AvatarProps) {
  const dimension = `${size}px`;

  if (!src) {
    return (
      <div
        style={{ width: dimension, height: dimension }}
        className={`rounded-full bg-surface flex items-center justify-center text-xs text-foreground/50 ${className}`}
      >
        {alt.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      style={{ width: dimension, height: dimension }}
      className={`rounded-full object-cover ${className}`}
    />
  );
}