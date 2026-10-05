import { useState } from "react";

interface RatingControlProps {
  currentUserRating?: number;
  onRate: (score: number) => void;
}

export default function RatingControl({ currentUserRating, onRate }: RatingControlProps) {
  const hasRated = currentUserRating !== undefined;
  const [localValue, setLocalValue] = useState(currentUserRating ?? 5.5);
  const [touched, setTouched] = useState(hasRated);

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
      <span className="text-sm font-medium text-primary w-8 text-right">
        {touched ? localValue.toFixed(1) : "—"}
      </span>
    </div>
  );
}