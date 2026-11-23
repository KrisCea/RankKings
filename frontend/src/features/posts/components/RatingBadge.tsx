import { Star } from "lucide-react";

interface RatingBadgeProps {
  averageRating: number;
  ratingsCount: number;
}

export default function RatingBadge({ averageRating, ratingsCount }: RatingBadgeProps) {
  return (
    <div className="flex items-center gap-1 text-sm text-foreground/70">
      <Star size={16} className="text-primary" fill="currentColor" />
      <span className="font-medium text-foreground">{averageRating.toFixed(1)}</span>
      <span className="text-xs text-foreground/50">({ratingsCount})</span>
    </div>
  );
}