import { useEffect, useState } from "react";

interface RatingControlProps {
  currentUserRating?: number;
  onRate: (score: number) => void;
  onUnrate: () => void;
}

export default function RatingControl({
  currentUserRating,
  onRate,
  onUnrate,
}: RatingControlProps) {
  const hasRated = currentUserRating !== undefined;
  const [localValue, setLocalValue] = useState(currentUserRating ?? 5.5);
  const [touched, setTouched] = useState(hasRated);

  // Si el post se actualiza desde afuera (ej: tras quitar el rating), sincroniza el control
  useEffect(() => {
    setLocalValue(currentUserRating ?? 5.5);
    setTouched(currentUserRating !== undefined);
  }, [currentUserRating]);

  function handleReset() {
    if (!touched) return;
    setTouched(false);
    setLocalValue(5.5);
    onUnrate();
  }

  return (
    <div className="flex items-center gap-2 w-full max-w-[180px]">
      <input
        type="range"
        min={1}
        max={10}
        step={0.5}
        value={localValue}
        onChange={(e) => {
          setLocalValue(parseFloat(e.target.value));
          setTouched(true);
        }}
        onMouseUp={() => onRate(localValue)}
        onTouchEnd={() => onRate(localValue)}
        className={`flex-1 accent-primary ${!touched ? "opacity-40" : ""}`}
        aria-label="Puntuar"
      />
      <button
        type="button"
        onClick={handleReset}
        disabled={!touched}
        title={touched ? "Quitar puntuación" : undefined}
        className={`text-sm font-medium w-8 text-right text-primary ${
          touched ? "cursor-pointer hover:opacity-70" : "cursor-default"
        }`}
      >
        {touched ? localValue.toFixed(1) : "—"}
      </button>
    </div>
  );
}