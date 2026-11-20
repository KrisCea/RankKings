import { Heart, Star } from "lucide-react";
import { Link } from "react-router-dom";
import Avatar from "../../../components/ui/Avatar";
import UserHoverCard from "../../users/components/UserHoverCard";
import type { RankableItem } from "../../../types/rankableItem";
import type { Review } from "../../../types/comment";
import PostMediaFrame from "./PostMediaFrame";

interface ReviewCardProps {
  review: Review;
  item?: RankableItem;
  onToggleLike: (reviewId: string) => void;
}

export default function ReviewCard({ review, item, onToggleLike }: ReviewCardProps) {
  return (
    <article className="mb-3 rounded-xl border border-foreground/10 bg-surface p-4">
      <div className="flex items-center gap-3">
        <UserHoverCard username={review.author.username}>
          <Avatar src={review.author.avatarUrl} alt={review.author.username} size={36} />
        </UserHoverCard>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">
            @{review.author.username}
          </p>
          <p className="text-xs text-foreground/50">
            {new Date(review.createdAt).toLocaleDateString()}
          </p>
        </div>
        {typeof review.authorScore === "number" && (
          <span className="ml-auto flex items-center gap-1 text-sm font-semibold text-primary">
            <Star size={15} fill="currentColor" />
            {review.authorScore.toFixed(1)}
          </span>
        )}
      </div>

      {item ? (
        <Link to={`/item/${item.id}`} className="mt-3 block text-xs text-primary hover:underline">
          Reseña de {item.title}
        </Link>
      ) : (
        <Link to={`/post/${review.postId}`} className="mt-3 block text-xs text-primary hover:underline">
          Ver obra reseñada
        </Link>
      )}

      <p className="mt-2 whitespace-pre-wrap text-sm text-foreground/80">{review.text}</p>
      {review.media?.map((media) => (
        <div key={media.id} className="mt-3">
          <PostMediaFrame media={media} alt={`Contenido de la reseña de ${review.author.username}`} expanded />
        </div>
      ))}
      <button
        type="button"
        onClick={() => onToggleLike(review.id)}
        aria-label={review.likedByCurrentUser ? "Quitar me gusta" : "Dar me gusta"}
        className={`mt-3 flex items-center gap-1 text-xs transition-colors ${
          review.likedByCurrentUser ? "text-primary" : "text-foreground/50 hover:text-primary"
        }`}
      >
        <Heart size={14} fill={review.likedByCurrentUser ? "currentColor" : "none"} />
        {review.likesCount}
      </button>
    </article>
  );
}
