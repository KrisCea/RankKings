import ReviewCard from "./ReviewCard";
import type { RankableItem } from "../../../types/rankableItem";
import type { Review } from "../../../types/comment";

interface ReviewListProps {
  reviews: Review[];
  item?: RankableItem;
  isLoading: boolean;
  emptyMessage: string;
  errorMessage?: string;
  onToggleLike: (reviewId: string) => void;
}

export default function ReviewList({
  reviews,
  item,
  isLoading,
  emptyMessage,
  errorMessage,
  onToggleLike,
}: ReviewListProps) {
  if (errorMessage) {
    return <p role="alert" className="py-8 text-center text-sm text-red-500">{errorMessage}</p>;
  }

  if (isLoading) {
    return <p role="status" className="py-8 text-center text-sm text-foreground/50">Cargando reseñas…</p>;
  }

  if (reviews.length === 0) {
    return <p className="py-8 text-center text-sm text-foreground/50">{emptyMessage}</p>;
  }

  return (
    <div className="mt-4">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} item={item} onToggleLike={onToggleLike} />
      ))}
    </div>
  );
}
